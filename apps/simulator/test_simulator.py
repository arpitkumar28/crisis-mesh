"""
Tests for CrisisMesh IoT Simulator
Tests URL parsing, TLS configuration, and authentication
"""

import pytest

def test_simulator_import():
    """Test that the simulator module can be imported"""
    try:
        import main
        assert main is not None
    except ImportError as e:
        pytest.fail(f"Failed to import main module: {e}")

def test_mqtt_url_parsing():
    """Test MQTT URL parsing for mqtt:// scheme"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(mqtt_broker_url="mqtt://broker.example.com:1883")
    assert config.protocol == "mqtt"
    assert config.host == "broker.example.com"
    assert config.port == 1883
    assert config.tls_enabled is False

def test_mqtts_url_parsing():
    """Test MQTT URL parsing for mqtts:// scheme"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(mqtt_broker_url="mqtts://broker.example.com:8883")
    assert config.protocol == "mqtts"
    assert config.host == "broker.example.com"
    assert config.port == 8883
    assert config.tls_enabled is True

def test_mqtts_default_port():
    """Test mqtts:// uses default port 8883 when not specified"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(mqtt_broker_url="mqtts://broker.example.com")
    assert config.protocol == "mqtts"
    assert config.host == "broker.example.com"
    assert config.port == 8883
    assert config.tls_enabled is True

def test_mqtt_default_port():
    """Test mqtt:// uses default port 1883 when not specified"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(mqtt_broker_url="mqtt://broker.example.com")
    assert config.protocol == "mqtt"
    assert config.host == "broker.example.com"
    assert config.port == 1883
    assert config.tls_enabled is False

def test_mqtt_broker_url_preferred():
    """Test MQTT_BROKER_URL is preferred over MQTT_BROKER"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(
        mqtt_broker_url="mqtts://url-broker.com:8883",
        mqtt_broker="mqtt://legacy-broker.com:1883"
    )
    assert config.protocol == "mqtts"
    assert config.host == "url-broker.com"
    assert config.port == 8883

def test_mqtt_broker_fallback():
    """Test MQTT_BROKER is used when MQTT_BROKER_URL is not provided"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(
        mqtt_broker="mqtt://legacy-broker.com:1883"
    )
    assert config.protocol == "mqtt"
    assert config.host == "legacy-broker.com"
    assert config.port == 1883

def test_default_config():
    """Test default configuration falls back to localhost"""
    from main import SimulatorConfig
    
    config = SimulatorConfig()
    assert config.protocol == "mqtt"
    assert config.host == "localhost"
    assert config.port == 1883
    assert config.tls_enabled is False

def test_username_password_config():
    """Test username and password configuration"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(
        mqtt_broker_url="mqtt://broker.example.com",
        mqtt_username="testuser",
        mqtt_password="testpass"
    )
    assert config.mqtt_username == "testuser"
    assert config.mqtt_password == "testpass"

def test_port_override():
    """Test explicit port override"""
    from main import SimulatorConfig
    
    config = SimulatorConfig(
        mqtt_broker_url="mqtt://broker.example.com",
        mqtt_port=9000
    )
    assert config.port == 9000

def test_simulator_unique_client_id():
    """Test simulator generates unique client ID"""
    from main import CrisisMeshSimulator, SimulatorConfig
    
    config = SimulatorConfig()
    simulator1 = CrisisMeshSimulator(config)
    simulator2 = CrisisMeshSimulator(config)
    
    assert simulator1.client_id != simulator2.client_id
    assert simulator1.client_id.startswith("crisis-mesh-simulator-")
    assert simulator2.client_id.startswith("crisis-mesh-simulator-")

def test_simulator_class():
    """Test that CrisisMeshSimulator can be instantiated"""
    from main import CrisisMeshSimulator, SimulatorConfig
    
    config = SimulatorConfig()
    simulator = CrisisMeshSimulator(config)
    assert simulator is not None
    assert simulator.config == config
    assert simulator.running is False
    assert simulator.client_id is not None

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
