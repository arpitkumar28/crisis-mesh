"""
CrisisMesh IoT Simulator

A production-grade simulator that generates real telemetry data and publishes
through MQTT, simulating ESP32/LoRa mesh network behavior.

This is NOT a mock dashboard - it feeds the same backend pipeline that
future hardware will use.
"""

import asyncio
import json
import logging
import os
import random
import ssl
from datetime import datetime
from typing import Optional
from enum import Enum
from urllib.parse import urlparse

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


class SimulatorConfig:
    """Configuration for the simulator"""
    def __init__(
        self,
        mqtt_broker: str = "mqtt://localhost:1883",
        mqtt_port: int = 1883,
        mqtt_username: Optional[str] = None,
        mqtt_password: Optional[str] = None,
        simulation_interval: int = 5,
        scenario: DisasterScenario = DisasterScenario.NORMAL,
        num_devices: int = 5,
    ):
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.mqtt_username = mqtt_username
        self.mqtt_password = mqtt_password
        self.simulation_interval = simulation_interval
        self.scenario = scenario
        self.num_devices = num_devices


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
        
        logger.info(f"CrisisMesh Simulator initialized with {len(self.devices)} devices")
        logger.info(f"Scenario: {self.scenario.value}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            if hasattr(mqtt, "CallbackAPIVersion"):
                self.client = mqtt.Client(
                    mqtt.CallbackAPIVersion.VERSION2,
                    client_id="crisis-mesh-simulator",
                )
            else:
                self.client = mqtt.Client(client_id="crisis-mesh-simulator")
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            
            # Set credentials if provided
            if self.config.mqtt_username and self.config.mqtt_password:
                self.client.username_pw_set(
                    self.config.mqtt_username,
                    self.config.mqtt_password
                )
            
            parsed_broker = urlparse(self.config.mqtt_broker)
            if parsed_broker.scheme not in ("mqtt", "mqtts") or not parsed_broker.hostname:
                raise ValueError("MQTT broker URL must use mqtt:// or mqtts:// and include a hostname")

            is_tls = parsed_broker.scheme == "mqtts"
            if is_tls:
                # Use the system CA store and require a valid server certificate.
                self.client.tls_set(cert_reqs=ssl.CERT_REQUIRED)
                self.client.tls_insecure_set(False)

            broker_port = parsed_broker.port or (8883 if is_tls else self.config.mqtt_port)
            self.client.connect(parsed_broker.hostname, broker_port, keepalive=60)
            self.client.loop_start()
            self.running = True
            
            logger.info(f"Connecting to MQTT broker: {self.config.mqtt_broker}")
        except ConnectionRefusedError:
            logger.warning("MQTT broker unavailable - running in degraded mode")
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
            self.client.publish(topic, json.dumps(payload), qos=1)
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
                
                await asyncio.sleep(self.config.simulation_interval)
                
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                await asyncio.sleep(1)
    
    def generate_scenario_telemetry(self, device_id: str, iteration: int):
        """Generate telemetry based on current disaster scenario"""
        telemetry = []
        
        if self.scenario == DisasterScenario.NORMAL:
            # Normal conditions
            telemetry.append(("TEMPERATURE", 25.0 + random.uniform(-2, 2), "°C"))
            telemetry.append(("HUMIDITY", 50.0 + random.uniform(-10, 10), "%"))
            telemetry.append(("PRESSURE", 1013.0 + random.uniform(-5, 5), "hPa"))
            
        elif self.scenario == DisasterScenario.FLOODING:
            # Rising water levels, high humidity
            water_level = 2.0 + (iteration % 50) * 0.1 + random.uniform(0, 0.5)
            telemetry.append(("WATER_LEVEL", water_level, "m"))
            telemetry.append(("HUMIDITY", 85.0 + random.uniform(-5, 10), "%"))
            telemetry.append(("TEMPERATURE", 22.0 + random.uniform(-2, 2), "°C"))
            
        elif self.scenario == DisasterScenario.FIRE:
            # High temperature, low humidity, smoke
            temperature = 35.0 + (iteration % 30) * 0.5 + random.uniform(0, 5)
            telemetry.append(("TEMPERATURE", temperature, "°C"))
            telemetry.append(("HUMIDITY", 20.0 + random.uniform(-5, 5), "%"))
            telemetry.append(("AIR_QUALITY", 150 + random.uniform(0, 50), "AQI"))
            
        elif self.scenario == DisasterScenario.EARTHQUAKE:
            # Seismic activity
            magnitude = 3.0 + random.uniform(0, 5)
            telemetry.append(("SEISMIC", magnitude, "Richter"))
            telemetry.append(("TEMPERATURE", 25.0 + random.uniform(-2, 2), "°C"))
            telemetry.append(("PRESSURE", 1013.0 + random.uniform(-10, 10), "hPa"))
            
        elif self.scenario == DisasterScenario.HEATWAVE:
            # Extreme temperatures
            temperature = 40.0 + (iteration % 20) * 0.3 + random.uniform(0, 3)
            telemetry.append(("TEMPERATURE", temperature, "°C"))
            telemetry.append(("HUMIDITY", 30.0 + random.uniform(-5, 10), "%"))
            telemetry.append(("AIR_QUALITY", 80 + random.uniform(0, 30), "AQI"))
        
        return telemetry
    
    async def publish_device_status(self, device_id: str):
        """Publish device status to MQTT"""
        if not self.running or self.client is None:
            return
        
        topic = f"device/{device_id}/status"
        payload = {
            "device_id": device_id,
            "status": "ONLINE",
            "battery_level": random.randint(70, 100),
            "signal_strength": random.randint(50, 100),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        try:
            self.client.publish(topic, json.dumps(payload), qos=1)
            logger.debug(f"📤 Published device status for {device_id}")
        except Exception as e:
            logger.error(f"Failed to publish device status: {e}")
    
    def stop(self):
        """Stop the simulator"""
        logger.info("⛔ Stopping simulator")
        self.running = False
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()


async def main():
    """Main entry point"""
    
    # Get scenario from environment variable
    scenario_str = os.getenv("SIMULATION_SCENARIO", "normal").upper()
    try:
        scenario = DisasterScenario[scenario_str]
    except KeyError:
        logger.warning(f"Invalid scenario '{scenario_str}', defaulting to NORMAL")
        scenario = DisasterScenario.NORMAL
    
    # Get number of devices from environment variable
    num_devices = int(os.getenv("NUM_DEVICES", "5"))
    
    config = SimulatorConfig(
        mqtt_broker=os.getenv(
            "MQTT_BROKER_URL",
            os.getenv("MQTT_BROKER", "mqtt://localhost:1883"),
        ),
        mqtt_username=os.getenv("MQTT_USERNAME"),
        mqtt_password=os.getenv("MQTT_PASSWORD"),
        scenario=scenario,
        num_devices=num_devices,
    )
    
    simulator = CrisisMeshSimulator(config)
    
    try:
        simulator.connect()
        # If MQTT is unavailable, still run the simulation loop
        if not simulator.running:
            logger.info("Running in offline mode - no MQTT connection")
            simulator.running = True  # Allow simulation to run without MQTT
        await simulator.run()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    finally:
        simulator.stop()


if __name__ == "__main__":
    asyncio.run(main())
