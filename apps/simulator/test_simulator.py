"""
Tests for CrisisMesh IoT Simulator
Tests URL parsing, TLS configuration, and authentication
"""

import argparse
import asyncio
import json
import logging
from unittest.mock import MagicMock, patch

import pytest

# Metrics the backend's SensorMetric enum actually accepts
# (services/api/src/entities/sensor.entity.ts). Any metric name the
# simulator emits must be a member of this set.
BACKEND_SENSOR_METRICS = {
    "TEMPERATURE",
    "HUMIDITY",
    "PRESSURE",
    "RAINFALL",
    "WIND_SPEED",
    "WATER_LEVEL",
    "SEISMIC",
    "AIR_QUALITY",
}

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

class TestScenarioResolution:
    def test_flood_alias_resolves_to_flooding(self):
        from main import resolve_scenario, DisasterScenario
        assert resolve_scenario("flood") == DisasterScenario.FLOODING
        assert resolve_scenario("FLOOD") == DisasterScenario.FLOODING

    def test_full_name_still_works(self):
        from main import resolve_scenario, DisasterScenario
        assert resolve_scenario("flooding") == DisasterScenario.FLOODING
        assert resolve_scenario("NORMAL") == DisasterScenario.NORMAL
        assert resolve_scenario("fire") == DisasterScenario.FIRE
        assert resolve_scenario("earthquake") == DisasterScenario.EARTHQUAKE
        assert resolve_scenario("heatwave") == DisasterScenario.HEATWAVE

    def test_unknown_scenario_raises_keyerror(self):
        from main import resolve_scenario
        with pytest.raises(KeyError):
            resolve_scenario("tornado")


class TestScenarioTelemetryMetrics:
    """Every scenario must only emit metrics the backend's SensorMetric enum accepts."""

    def _make_simulator(self, scenario):
        from main import CrisisMeshSimulator, SimulatorConfig
        config = SimulatorConfig(scenario=scenario, deterministic=True, seed=1)
        return CrisisMeshSimulator(config)

    @pytest.mark.parametrize("scenario_name", ["NORMAL", "FLOODING", "FIRE", "EARTHQUAKE", "HEATWAVE"])
    def test_scenario_metrics_are_backend_supported(self, scenario_name):
        from main import DisasterScenario
        simulator = self._make_simulator(DisasterScenario[scenario_name])
        telemetry = simulator.generate_scenario_telemetry("sim-node-001", iteration=1)
        assert len(telemetry) > 0
        for metric, value, unit in telemetry:
            assert metric in BACKEND_SENSOR_METRICS, f"{metric} is not a valid backend SensorMetric"
            assert isinstance(value, (int, float))
            assert isinstance(unit, str)

    def test_flood_scenario_includes_rainfall_and_water_level(self):
        from main import DisasterScenario
        simulator = self._make_simulator(DisasterScenario.FLOODING)
        telemetry = simulator.generate_scenario_telemetry("sim-node-001", iteration=1)
        metrics = {m for m, v, u in telemetry}
        assert "RAINFALL" in metrics
        assert "WATER_LEVEL" in metrics
        assert "HUMIDITY" in metrics

    def test_fire_scenario_includes_temperature_and_wind(self):
        from main import DisasterScenario
        simulator = self._make_simulator(DisasterScenario.FIRE)
        telemetry = simulator.generate_scenario_telemetry("sim-node-001", iteration=1)
        metrics = {m for m, v, u in telemetry}
        assert "TEMPERATURE" in metrics
        assert "WIND_SPEED" in metrics
        assert "AIR_QUALITY" in metrics

    def test_earthquake_scenario_includes_seismic(self):
        from main import DisasterScenario
        simulator = self._make_simulator(DisasterScenario.EARTHQUAKE)
        telemetry = simulator.generate_scenario_telemetry("sim-node-001", iteration=1)
        metrics = {m for m, v, u in telemetry}
        assert "SEISMIC" in metrics

    def test_heatwave_scenario_includes_temperature_and_humidity(self):
        from main import DisasterScenario
        simulator = self._make_simulator(DisasterScenario.HEATWAVE)
        telemetry = simulator.generate_scenario_telemetry("sim-node-001", iteration=1)
        metrics = {m for m, v, u in telemetry}
        assert "TEMPERATURE" in metrics
        assert "HUMIDITY" in metrics

    def test_scenario_values_are_realistic_not_impossible(self):
        """Sanity bounds so we never publish physically impossible values."""
        from main import DisasterScenario
        for scenario_name, bounds in {
            "NORMAL": {"TEMPERATURE": (-10, 45), "HUMIDITY": (0, 100)},
            "FIRE": {"TEMPERATURE": (0, 80), "AIR_QUALITY": (0, 500)},
            "HEATWAVE": {"TEMPERATURE": (0, 60), "HUMIDITY": (0, 100)},
            "EARTHQUAKE": {"SEISMIC": (0, 10)},
            "FLOODING": {"WATER_LEVEL": (0, 20), "HUMIDITY": (0, 100)},
        }.items():
            simulator = self._make_simulator(DisasterScenario[scenario_name])
            telemetry = simulator.generate_scenario_telemetry("sim-node-001", iteration=25)
            values = {m: v for m, v, u in telemetry}
            for metric, (low, high) in bounds.items():
                assert low <= values[metric] <= high, f"{scenario_name}.{metric}={values[metric]} out of [{low},{high}]"


class TestDeterministicMode:
    def test_same_seed_produces_same_sequence(self):
        from main import CrisisMeshSimulator, SimulatorConfig, DisasterScenario
        config_a = SimulatorConfig(scenario=DisasterScenario.FIRE, deterministic=True, seed=7)
        config_b = SimulatorConfig(scenario=DisasterScenario.FIRE, deterministic=True, seed=7)
        sim_a = CrisisMeshSimulator(config_a)
        sim_b = CrisisMeshSimulator(config_b)

        seq_a = [sim_a.generate_scenario_telemetry("sim-node-001", i) for i in range(5)]
        seq_b = [sim_b.generate_scenario_telemetry("sim-node-001", i) for i in range(5)]
        assert seq_a == seq_b

    def test_different_seeds_produce_different_sequences(self):
        from main import CrisisMeshSimulator, SimulatorConfig, DisasterScenario
        config_a = SimulatorConfig(scenario=DisasterScenario.FIRE, deterministic=True, seed=1)
        config_b = SimulatorConfig(scenario=DisasterScenario.FIRE, deterministic=True, seed=2)
        sim_a = CrisisMeshSimulator(config_a)
        sim_b = CrisisMeshSimulator(config_b)

        seq_a = [sim_a.generate_scenario_telemetry("sim-node-001", i) for i in range(5)]
        seq_b = [sim_b.generate_scenario_telemetry("sim-node-001", i) for i in range(5)]
        assert seq_a != seq_b

    def test_non_deterministic_mode_uses_global_random(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        import random as random_module
        config = SimulatorConfig(deterministic=False)
        simulator = CrisisMeshSimulator(config)
        assert simulator._rng is random_module


class TestTopicsAndPayloads:
    @pytest.mark.asyncio
    async def test_telemetry_topic_and_payload_shape(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        simulator = CrisisMeshSimulator(SimulatorConfig())
        simulator.running = True
        simulator.client = MagicMock()
        simulator.client.publish.return_value = MagicMock(rc=0)

        await simulator.publish_telemetry("sim-node-001", "TEMPERATURE", 25.5, "°C")

        simulator.client.publish.assert_called_once()
        topic, payload_json = simulator.client.publish.call_args[0][:2]
        assert topic == "sensor/sim-node-001/telemetry"
        payload = json.loads(payload_json)
        assert payload["device_id"] == "sim-node-001"
        assert payload["metric"] == "TEMPERATURE"
        assert payload["value"] == 25.5
        assert payload["unit"] == "°C"
        assert "timestamp" in payload
        assert payload["quality_flag"] == 1
        # timestamp must be a valid ISO-8601 string
        from datetime import datetime as dt
        dt.fromisoformat(payload["timestamp"])

    @pytest.mark.asyncio
    async def test_device_status_topic_and_payload_shape(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        simulator = CrisisMeshSimulator(SimulatorConfig())
        simulator.running = True
        simulator.client = MagicMock()
        simulator.client.publish.return_value = MagicMock(rc=0)

        await simulator.publish_device_status("sim-node-001")

        topic, payload_json = simulator.client.publish.call_args[0][:2]
        assert topic == "device/sim-node-001/status"
        payload = json.loads(payload_json)
        assert payload["device_id"] == "sim-node-001"
        assert payload["status"] == "ONLINE"
        assert 0 <= payload["battery_level"] <= 100
        assert 0 <= payload["signal_strength"] <= 100

    @pytest.mark.asyncio
    async def test_no_publish_when_not_running(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        simulator = CrisisMeshSimulator(SimulatorConfig())
        simulator.running = False
        simulator.client = MagicMock()

        await simulator.publish_telemetry("sim-node-001", "TEMPERATURE", 25.5, "°C")

        simulator.client.publish.assert_not_called()


class TestGracefulShutdown:
    @pytest.mark.asyncio
    async def test_stop_publishes_offline_status_for_every_device(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        config = SimulatorConfig(num_devices=3)
        simulator = CrisisMeshSimulator(config)
        simulator.running = True
        simulator.client = MagicMock()
        simulator.client.publish.return_value = MagicMock(rc=0)

        await simulator.stop()

        assert simulator.running is False
        offline_calls = [
            call for call in simulator.client.publish.call_args_list
            if json.loads(call[0][1])["status"] == "OFFLINE"
        ]
        assert len(offline_calls) == 3
        simulator.client.loop_stop.assert_called_once()
        simulator.client.disconnect.assert_called_once()

    @pytest.mark.asyncio
    async def test_stop_is_safe_when_broker_never_connected(self):
        """Simulator started in degraded/offline mode (no client) must not crash on stop()."""
        from main import CrisisMeshSimulator, SimulatorConfig
        simulator = CrisisMeshSimulator(SimulatorConfig())
        simulator.client = None
        simulator.running = True

        await simulator.stop()  # must not raise
        assert simulator.running is False

    @pytest.mark.asyncio
    async def test_stop_does_not_publish_when_already_stopped(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        simulator = CrisisMeshSimulator(SimulatorConfig(num_devices=2))
        simulator.running = False
        simulator.client = MagicMock()

        await simulator.stop()

        simulator.client.publish.assert_not_called()


class TestPublishFailureHandling:
    @pytest.mark.asyncio
    async def test_publish_telemetry_logs_warning_on_broker_rejection(self, caplog):
        from main import CrisisMeshSimulator, SimulatorConfig
        simulator = CrisisMeshSimulator(SimulatorConfig())
        simulator.running = True
        simulator.client = MagicMock()
        simulator.client.publish.return_value = MagicMock(rc=1)  # MQTT_ERR_NOMEM-ish failure

        with caplog.at_level(logging.WARNING):
            await simulator.publish_telemetry("sim-node-001", "TEMPERATURE", 25.5, "°C")

        assert any("Publish failed" in record.message for record in caplog.records)

    @pytest.mark.asyncio
    async def test_publish_telemetry_survives_client_exception(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        simulator = CrisisMeshSimulator(SimulatorConfig())
        simulator.running = True
        simulator.client = MagicMock()
        simulator.client.publish.side_effect = RuntimeError("network gone")

        # must not raise
        await simulator.publish_telemetry("sim-node-001", "TEMPERATURE", 25.5, "°C")


class TestReconnectConfiguration:
    def test_connect_configures_automatic_reconnect(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        with patch("main.mqtt.Client") as MockClient:
            mock_instance = MockClient.return_value
            simulator = CrisisMeshSimulator(SimulatorConfig(mqtt_broker_url="mqtt://localhost:1883"))
            simulator.connect()
            mock_instance.reconnect_delay_set.assert_called_once()

    def test_connect_never_logs_password(self, caplog):
        from main import CrisisMeshSimulator, SimulatorConfig
        with patch("main.mqtt.Client") as MockClient:
            MockClient.return_value = MagicMock()
            config = SimulatorConfig(
                mqtt_broker_url="mqtt://localhost:1883",
                mqtt_username="produser",
                mqtt_password="super-secret-password",
            )
            simulator = CrisisMeshSimulator(config)
            with caplog.at_level(logging.INFO):
                simulator.connect()

            for record in caplog.records:
                assert "super-secret-password" not in record.message

    def test_connect_handles_broker_unreachable_without_raising(self):
        from main import CrisisMeshSimulator, SimulatorConfig
        with patch("main.mqtt.Client") as MockClient:
            mock_instance = MockClient.return_value
            mock_instance.connect.side_effect = ConnectionRefusedError()
            simulator = CrisisMeshSimulator(SimulatorConfig())

            simulator.connect()  # must not raise

            assert simulator.running is False
            assert simulator.client is None


class TestBoundedRunLoop:
    @pytest.mark.asyncio
    async def test_run_stops_after_max_iterations(self):
        """Automated tests must never hang on an unbounded simulation loop."""
        from main import CrisisMeshSimulator, SimulatorConfig
        config = SimulatorConfig(num_devices=1, simulation_interval=0, max_iterations=3)
        simulator = CrisisMeshSimulator(config)
        simulator.running = True
        simulator.client = MagicMock()
        simulator.client.publish.return_value = MagicMock(rc=0)

        await asyncio.wait_for(simulator.run(), timeout=5)

        assert simulator.running is True  # run() exits the loop but doesn't call stop() itself


class TestCliAndConfigPrecedence:
    def test_cli_scenario_overrides_env(self, monkeypatch):
        from main import build_arg_parser, build_config_from_env_and_args, DisasterScenario
        monkeypatch.setenv("SIMULATION_SCENARIO", "NORMAL")
        parser = build_arg_parser()
        args = parser.parse_args(["--scenario", "flood"])
        config = build_config_from_env_and_args(args)
        assert config.scenario == DisasterScenario.FLOODING

    def test_env_used_when_no_cli_scenario(self, monkeypatch):
        from main import build_arg_parser, build_config_from_env_and_args, DisasterScenario
        monkeypatch.setenv("SIMULATION_SCENARIO", "fire")
        parser = build_arg_parser()
        args = parser.parse_args([])
        config = build_config_from_env_and_args(args)
        assert config.scenario == DisasterScenario.FIRE

    def test_cli_device_count_and_interval(self):
        from main import build_arg_parser, build_config_from_env_and_args
        parser = build_arg_parser()
        args = parser.parse_args(["--device-count", "12", "--interval", "2.5"])
        config = build_config_from_env_and_args(args)
        assert config.num_devices == 12
        assert config.simulation_interval == 2.5

    def test_cli_deterministic_and_seed(self):
        from main import build_arg_parser, build_config_from_env_and_args
        parser = build_arg_parser()
        args = parser.parse_args(["--deterministic", "--seed", "99"])
        config = build_config_from_env_and_args(args)
        assert config.deterministic is True
        assert config.seed == 99

    def test_cli_max_iterations(self):
        from main import build_arg_parser, build_config_from_env_and_args
        parser = build_arg_parser()
        args = parser.parse_args(["--max-iterations", "5"])
        config = build_config_from_env_and_args(args)
        assert config.max_iterations == 5

    def test_cli_broker_credentials(self):
        from main import build_arg_parser, build_config_from_env_and_args
        parser = build_arg_parser()
        args = parser.parse_args([
            "--broker-url", "mqtts://broker.example.com:8883",
            "--username", "u",
            "--password", "p",
        ])
        config = build_config_from_env_and_args(args)
        assert config.mqtt_broker_url == "mqtts://broker.example.com:8883"
        assert config.mqtt_username == "u"
        assert config.mqtt_password == "p"
        assert config.tls_enabled is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
