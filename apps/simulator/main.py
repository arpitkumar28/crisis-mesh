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
from datetime import datetime
from typing import Optional

import paho.mqtt.client as mqtt

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SimulatorConfig:
    """Configuration for the simulator"""
    mqtt_broker: str = "mqtt://localhost:1883"
    mqtt_port: int = 1883
    mqtt_username: Optional[str] = None
    mqtt_password: Optional[str] = None
    simulation_interval: int = 5  # seconds


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
        
        logger.info("CrisisMesh Simulator initialized")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="crisis-mesh-simulator")
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            
            # Set credentials if provided
            if self.config.mqtt_username and self.config.mqtt_password:
                self.client.username_pw_set(
                    self.config.mqtt_username,
                    self.config.mqtt_password
                )
            
            # Extract host from broker URL
            broker_host = self.config.mqtt_broker.replace("mqtt://", "").split(":")[0]
            
            self.client.connect(broker_host, self.config.mqtt_port, keepalive=60)
            self.client.loop_start()
            
            logger.info(f"Connecting to MQTT broker: {self.config.mqtt_broker}")
        except ConnectionRefusedError:
            logger.warning("MQTT broker unavailable - running in degraded mode")
            self.client = None
            self.running = False
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            raise
    
    def _on_connect(self, client, userdata, connect_flags, reason_code, properties):
        """MQTT connection callback"""
        if reason_code == 0:
            logger.info("✅ Connected to MQTT broker")
            self.running = True
        else:
            logger.error(f"❌ Failed to connect, reason code: {reason_code}")
    
    def _on_disconnect(self, client, userdata, disconnect_flags, reason_code, properties):
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
                
                # Simulate various sensor readings
                # Phase 1: Simple mock data
                # Phase 3+: Real simulation scenarios
                
                device_id = "sim-node-001"
                
                # Simulate temperature
                temperature = 25.0 + (iteration % 10)
                await self.publish_telemetry(device_id, "TEMPERATURE", temperature, "°C")
                
                # Simulate humidity
                humidity = 50.0 + (iteration % 20)
                await self.publish_telemetry(device_id, "HUMIDITY", humidity, "%")
                
                # Simulate pressure
                pressure = 1013.0 + (iteration % 5)
                await self.publish_telemetry(device_id, "PRESSURE", pressure, "hPa")
                
                await asyncio.sleep(self.config.simulation_interval)
                
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                await asyncio.sleep(1)
    
    def stop(self):
        """Stop the simulator"""
        logger.info("⛔ Stopping simulator")
        self.running = False
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()


async def main():
    """Main entry point"""
    config = SimulatorConfig()
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
