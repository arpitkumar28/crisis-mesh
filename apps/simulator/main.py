"""
CrisisMesh IoT Simulator

A production-grade simulator that generates real telemetry data and publishes
through MQTT, simulating ESP32/LoRa mesh network behavior.

This is NOT a mock dashboard - it feeds the same backend pipeline that
future hardware will use.

Metrics published are restricted to the backend's actual SensorMetric enum
(services/api/src/entities/sensor.entity.ts): TEMPERATURE, HUMIDITY,
PRESSURE, RAINFALL, WIND_SPEED, WATER_LEVEL, SEISMIC, AIR_QUALITY. Do not
add a metric name here without confirming the backend enum accepts it.
"""

import argparse
import asyncio
import json
import logging
import random
import signal
import ssl
import uuid
from datetime import datetime
from typing import Optional
from enum import Enum
from urllib.parse import urlparse
import certifi

import paho.mqtt.client as mqtt

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DisasterScenario(Enum):
    """Disaster simulation scenarios"""
    NORMAL = "normal"
    FLOODING = "flooding"
    FIRE = "fire"
    EARTHQUAKE = "earthquake"
    HEATWAVE = "heatwave"


# Accepted aliases for scenario names, both on the CLI and via
# SIMULATION_SCENARIO, so "flood" and "flooding" both work.
_SCENARIO_ALIASES = {
    "FLOOD": DisasterScenario.FLOODING,
}


def resolve_scenario(name: str) -> DisasterScenario:
    """Resolve a scenario name (case-insensitive, with aliases) to a DisasterScenario."""
    key = name.strip().upper()
    if key in _SCENARIO_ALIASES:
        return _SCENARIO_ALIASES[key]
    return DisasterScenario[key]


class SimulatorConfig:
    """Configuration for the simulator"""
    def __init__(
        self,
        mqtt_broker_url: Optional[str] = None,
        mqtt_broker: Optional[str] = None,
        mqtt_port: Optional[int] = None,
        mqtt_username: Optional[str] = None,
        mqtt_password: Optional[str] = None,
        simulation_interval: int = 5,
        scenario: DisasterScenario = DisasterScenario.NORMAL,
        num_devices: int = 5,
        deterministic: bool = False,
        seed: Optional[int] = None,
        max_iterations: Optional[int] = None,
    ):
        # Prefer MQTT_BROKER_URL over MQTT_BROKER
        broker_url = mqtt_broker_url or mqtt_broker or "mqtt://localhost:1883"

        # Parse the broker URL
        parsed = urlparse(broker_url)

        self.mqtt_broker_url = broker_url
        self.protocol = parsed.scheme  # mqtt or mqtts
        self.host = parsed.hostname or "localhost"
        self.port = parsed.port or (8883 if self.protocol == "mqtts" else 1883)

        # Override port if explicitly provided
        if mqtt_port is not None:
            self.port = mqtt_port

        self.mqtt_username = mqtt_username
        self.mqtt_password = mqtt_password
        self.simulation_interval = simulation_interval
        self.scenario = scenario
        self.num_devices = num_devices

        # Deterministic mode: seed the RNG so scenario values are
        # reproducible run-to-run (used by tests and demos).
        self.deterministic = deterministic
        self.seed = seed if seed is not None else 42

        # Bounded run mode: stop after N iterations of the main loop
        # instead of running forever. None = unbounded (production default).
        self.max_iterations = max_iterations

        # TLS configuration
        self.tls_enabled = (self.protocol == "mqtts")


class CrisisMeshSimulator:
    """
    CrisisMesh IoT Simulator

    Generates virtual sensor data and publishes through MQTT.
    Designed to be hardware-replaceable.
    """

    def __init__(self, config: SimulatorConfig = None):
        """Initialize simulator"""
        self.config = config or SimulatorConfig()
        self.client: Optional[mqtt.Client] = None
        self.running = False
        self.devices = [f"sim-node-{i:03d}" for i in range(1, self.config.num_devices + 1)]
        self.scenario = self.config.scenario
        # Generate unique client ID to avoid conflict with backend
        self.client_id = f"crisis-mesh-simulator-{uuid.uuid4().hex[:8]}"

        if self.config.deterministic:
            self._rng = random.Random(self.config.seed)
        else:
            self._rng = random

        logger.info(f"CrisisMesh Simulator initialized with {len(self.devices)} devices")
        logger.info(f"Scenario: {self.scenario.value}")

    def connect(self):
        """Connect to MQTT broker"""
        try:
            if hasattr(mqtt, "CallbackAPIVersion"):
                self.client = mqtt.Client(
                    mqtt.CallbackAPIVersion.VERSION2,
                    client_id=self.client_id,
                )
            else:
                self.client = mqtt.Client(client_id=self.client_id)
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect

            # Enable automatic reconnection with backoff in the background
            # network loop (loop_start()), so a broker blip doesn't require
            # restarting the process.
            self.client.reconnect_delay_set(min_delay=1, max_delay=30)

            # Set credentials if provided
            username_configured = False
            if self.config.mqtt_username and self.config.mqtt_password:
                self.client.username_pw_set(
                    self.config.mqtt_username,
                    self.config.mqtt_password
                )
                username_configured = True

            # Configure TLS for mqtts://
            if self.config.tls_enabled:
                # Use certifi CA bundle for reliable certificate verification
                self.client.tls_set(
                    ca_certs=certifi.where(),
                    certfile=None,
                    keyfile=None,
                    cert_reqs=ssl.CERT_REQUIRED,
                    tls_version=ssl.PROTOCOL_TLS_CLIENT,
                )
                self.client.tls_insecure_set(False)  # Ensure certificate verification is enabled

            # Log connection details (safe, no passwords)
            logger.info("Connecting to MQTT broker:")
            logger.info(f"  - Host: {self.config.host}")
            logger.info(f"  - Port: {self.config.port}")
            logger.info(f"  - Protocol: {self.config.protocol}")
            logger.info(f"  - TLS enabled: {self.config.tls_enabled}")
            logger.info(f"  - Username configured: {username_configured}")
            logger.info(f"  - Client ID: {self.client_id}")

            self.client.connect(self.config.host, self.config.port, keepalive=60)
            self.client.loop_start()
            self.running = True

        except ConnectionRefusedError:
            logger.warning("MQTT broker unavailable - running in degraded mode")
            self.client = None
            self.running = False
        except (OSError, ssl.SSLError) as e:
            logger.warning(f"MQTT broker unreachable ({e}) - running in degraded mode")
            self.client = None
            self.running = False
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            raise

    def _on_connect(self, client, userdata, connect_flags, reason_code, properties=None):
        """MQTT connection callback"""
        if reason_code == 0:
            logger.info("✅ Connected to MQTT broker")
            self.running = True
        else:
            logger.error(f"❌ Failed to connect, reason code: {reason_code}")

    def _on_disconnect(self, client, userdata, disconnect_flags, reason_code=None, properties=None):
        """MQTT disconnection callback"""
        logger.warning(f"Disconnected from MQTT broker (code: {reason_code})")
        self.running = False

    def _check_publish_result(self, info, description: str) -> bool:
        """Log and report whether a publish() call actually succeeded."""
        rc = getattr(info, "rc", mqtt.MQTT_ERR_SUCCESS)
        if rc != mqtt.MQTT_ERR_SUCCESS:
            logger.warning(
                f"Publish failed for {description}: rc={rc} ({mqtt.error_string(rc)})"
            )
            return False
        return True

    async def publish_telemetry(self, device_id: str, metric: str, value: float, unit: str = ""):
        """Publish sensor telemetry"""
        if not self.running or self.client is None:
            logger.warning("MQTT client not connected, cannot publish")
            return

        topic = f"sensor/{device_id}/telemetry"
        payload = {
            "device_id": device_id,
            "metric": metric,
            "value": value,
            "unit": unit,
            "timestamp": datetime.utcnow().isoformat(),
            "quality_flag": 1
        }

        try:
            info = self.client.publish(topic, json.dumps(payload), qos=1)
            if self._check_publish_result(info, topic):
                logger.debug(f"📤 Published to {topic}: {metric}={value}{unit}")
        except Exception as e:
            logger.error(f"Failed to publish telemetry: {e}")

    async def run(self):
        """Run simulator simulation loop"""
        logger.info("🚀 Starting simulator")

        iteration = 0
        while self.running:
            try:
                iteration += 1

                # Simulate each device
                for device_id in self.devices:
                    # Publish device status periodically
                    if iteration % 10 == 0:
                        await self.publish_device_status(device_id)

                    # Generate scenario-based telemetry
                    telemetry_data = self.generate_scenario_telemetry(device_id, iteration)

                    for metric, value, unit in telemetry_data:
                        await self.publish_telemetry(device_id, metric, value, unit)

                if self.config.max_iterations is not None and iteration >= self.config.max_iterations:
                    logger.info(f"Reached max_iterations={self.config.max_iterations}, stopping")
                    break

                await asyncio.sleep(self.config.simulation_interval)

            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                await asyncio.sleep(1)

    def generate_scenario_telemetry(self, device_id: str, iteration: int):
        """Generate telemetry based on current disaster scenario.

        Only metrics recognized by the backend's SensorMetric enum are
        emitted (TEMPERATURE, HUMIDITY, PRESSURE, RAINFALL, WIND_SPEED,
        WATER_LEVEL, SEISMIC, AIR_QUALITY).
        """
        telemetry = []
        rng = self._rng

        if self.scenario == DisasterScenario.NORMAL:
            # Normal conditions
            telemetry.append(("TEMPERATURE", round(25.0 + rng.uniform(-2, 2), 2), "°C"))
            telemetry.append(("HUMIDITY", round(50.0 + rng.uniform(-10, 10), 2), "%"))
            telemetry.append(("PRESSURE", round(1013.0 + rng.uniform(-5, 5), 2), "hPa"))

        elif self.scenario == DisasterScenario.FLOODING:
            # Rising water levels, heavy rainfall, high humidity
            water_level = round(2.0 + (iteration % 50) * 0.1 + rng.uniform(0, 0.5), 2)
            rainfall = round(20.0 + (iteration % 30) * 1.5 + rng.uniform(0, 10), 2)
            telemetry.append(("WATER_LEVEL", water_level, "m"))
            telemetry.append(("RAINFALL", rainfall, "mm"))
            telemetry.append(("HUMIDITY", round(85.0 + rng.uniform(-5, 10), 2), "%"))
            telemetry.append(("TEMPERATURE", round(22.0 + rng.uniform(-2, 2), 2), "°C"))

        elif self.scenario == DisasterScenario.FIRE:
            # High temperature, low humidity, smoke (AQI proxy), gusty wind
            temperature = round(35.0 + (iteration % 30) * 0.5 + rng.uniform(0, 5), 2)
            wind_speed = round(15.0 + (iteration % 20) * 0.8 + rng.uniform(0, 10), 2)
            telemetry.append(("TEMPERATURE", temperature, "°C"))
            telemetry.append(("HUMIDITY", round(20.0 + rng.uniform(-5, 5), 2), "%"))
            telemetry.append(("AIR_QUALITY", round(150 + rng.uniform(0, 50), 2), "AQI"))
            telemetry.append(("WIND_SPEED", wind_speed, "km/h"))

        elif self.scenario == DisasterScenario.EARTHQUAKE:
            # Seismic activity
            magnitude = round(3.0 + rng.uniform(0, 5), 2)
            telemetry.append(("SEISMIC", magnitude, "Richter"))
            telemetry.append(("TEMPERATURE", round(25.0 + rng.uniform(-2, 2), 2), "°C"))
            telemetry.append(("PRESSURE", round(1013.0 + rng.uniform(-10, 10), 2), "hPa"))

        elif self.scenario == DisasterScenario.HEATWAVE:
            # Extreme temperatures, low humidity (heat index driver)
            temperature = round(40.0 + (iteration % 20) * 0.3 + rng.uniform(0, 3), 2)
            telemetry.append(("TEMPERATURE", temperature, "°C"))
            telemetry.append(("HUMIDITY", round(30.0 + rng.uniform(-5, 10), 2), "%"))
            telemetry.append(("AIR_QUALITY", round(80 + rng.uniform(0, 30), 2), "AQI"))

        return telemetry

    async def publish_device_status(self, device_id: str, status: str = "ONLINE"):
        """Publish device status to MQTT"""
        if self.client is None:
            return

        topic = f"device/{device_id}/status"
        payload = {
            "device_id": device_id,
            "status": status,
            "battery_level": self._rng.randint(70, 100),
            "signal_strength": self._rng.randint(50, 100),
            "timestamp": datetime.utcnow().isoformat(),
        }

        try:
            info = self.client.publish(topic, json.dumps(payload), qos=1)
            if self._check_publish_result(info, topic):
                logger.debug(f"📤 Published device status ({status}) for {device_id}")
        except Exception as e:
            logger.error(f"Failed to publish device status: {e}")

    async def publish_all_offline(self):
        """Publish an OFFLINE status for every device (used on graceful shutdown)."""
        if self.client is None:
            return
        for device_id in self.devices:
            await self.publish_device_status(device_id, status="OFFLINE")

    async def stop(self):
        """Stop the simulator, announcing devices as offline first."""
        logger.info("⛔ Stopping simulator")
        was_running = self.running
        if was_running:
            await self.publish_all_offline()
        self.running = False
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="crisismesh-simulator",
        description="CrisisMesh IoT device simulator — publishes real MQTT telemetry.",
    )
    parser.add_argument(
        "--scenario",
        default=None,
        help="Simulation scenario: normal, flood, fire, earthquake, heatwave "
             "(default: $SIMULATION_SCENARIO or normal)",
    )
    parser.add_argument("--device-count", type=int, default=None, help="Number of simulated devices")
    parser.add_argument("--interval", type=float, default=None, help="Seconds between publish cycles")
    parser.add_argument("--broker-url", default=None, help="MQTT broker URL (mqtt:// or mqtts://)")
    parser.add_argument("--username", default=None, help="MQTT username")
    parser.add_argument("--password", default=None, help="MQTT password")
    parser.add_argument(
        "--deterministic",
        action="store_true",
        help="Seed the RNG for reproducible telemetry values (useful for tests/demos)",
    )
    parser.add_argument("--seed", type=int, default=None, help="RNG seed used with --deterministic")
    parser.add_argument(
        "--max-iterations",
        type=int,
        default=None,
        help="Stop after N publish cycles instead of running forever (used by tests)",
    )
    return parser


def build_config_from_env_and_args(args: Optional[argparse.Namespace] = None) -> SimulatorConfig:
    """Build a SimulatorConfig, with CLI args taking precedence over environment variables."""
    import os

    args = args or argparse.Namespace()

    scenario_str = getattr(args, "scenario", None) or os.getenv("SIMULATION_SCENARIO", "normal")
    try:
        scenario = resolve_scenario(scenario_str)
    except KeyError:
        logger.warning(f"Invalid scenario '{scenario_str}', defaulting to NORMAL")
        scenario = DisasterScenario.NORMAL

    num_devices = getattr(args, "device_count", None)
    if num_devices is None:
        num_devices = int(os.getenv("NUM_DEVICES", "5"))

    interval = getattr(args, "interval", None)
    if interval is None:
        interval = int(os.getenv("SIMULATION_INTERVAL", "5"))

    deterministic = getattr(args, "deterministic", False) or os.getenv("DETERMINISTIC", "").lower() in ("1", "true", "yes")
    seed_arg = getattr(args, "seed", None)
    seed = seed_arg if seed_arg is not None else (int(os.getenv("SIMULATION_SEED")) if os.getenv("SIMULATION_SEED") else None)

    max_iterations = getattr(args, "max_iterations", None)
    if max_iterations is None and os.getenv("MAX_ITERATIONS"):
        max_iterations = int(os.getenv("MAX_ITERATIONS"))

    return SimulatorConfig(
        mqtt_broker_url=getattr(args, "broker_url", None) or os.getenv("MQTT_BROKER_URL"),
        mqtt_broker=os.getenv("MQTT_BROKER"),
        mqtt_username=getattr(args, "username", None) or os.getenv("MQTT_USERNAME"),
        mqtt_password=getattr(args, "password", None) or os.getenv("MQTT_PASSWORD"),
        simulation_interval=interval,
        scenario=scenario,
        num_devices=num_devices,
        deterministic=deterministic,
        seed=seed,
        max_iterations=max_iterations,
    )


async def main():
    """Main entry point"""
    parser = build_arg_parser()
    args = parser.parse_args()
    config = build_config_from_env_and_args(args)

    simulator = CrisisMeshSimulator(config)

    loop = asyncio.get_event_loop()
    stop_event = asyncio.Event()

    def _request_shutdown():
        logger.info("Shutdown signal received")
        stop_event.set()

    for sig in (signal.SIGTERM, signal.SIGINT):
        try:
            loop.add_signal_handler(sig, _request_shutdown)
        except NotImplementedError:
            # add_signal_handler is not supported on some platforms (e.g. Windows)
            pass

    try:
        simulator.connect()
        # If MQTT is unavailable, still run the simulation loop
        if not simulator.running:
            logger.info("Running in offline mode - no MQTT connection")
            simulator.running = True  # Allow simulation to run without MQTT

        run_task = asyncio.ensure_future(simulator.run())
        shutdown_task = asyncio.ensure_future(stop_event.wait())
        done, pending = await asyncio.wait(
            {run_task, shutdown_task}, return_when=asyncio.FIRST_COMPLETED
        )
        for task in pending:
            task.cancel()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    finally:
        await simulator.stop()


if __name__ == "__main__":
    asyncio.run(main())
