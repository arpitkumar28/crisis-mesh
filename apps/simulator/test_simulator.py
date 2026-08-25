"""
Basic startup test for CrisisMesh IoT Simulator
Tests that the simulator can be imported and basic configuration works
"""

import sys
import pytest

def test_simulator_import():
    """Test that the simulator module can be imported"""
    try:
        import main
        assert main is not None
    except ImportError as e:
        pytest.fail(f"Failed to import main module: {e}")

def test_simulator_config():
    """Test that SimulatorConfig can be instantiated"""
    from main import SimulatorConfig
    
    config = SimulatorConfig()
    assert config.mqtt_broker == "mqtt://localhost:1883"
    assert config.mqtt_port == 1883
    assert config.simulation_interval == 5

def test_simulator_class():
    """Test that CrisisMeshSimulator can be instantiated"""
    from main import CrisisMeshSimulator, SimulatorConfig
    
    config = SimulatorConfig()
    simulator = CrisisMeshSimulator(config)
    assert simulator is not None
    assert simulator.config == config
    assert simulator.running is False

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
