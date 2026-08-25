# MQTT Architecture

## Overview

MQTT (Message Queuing Telemetry Transport) is the lightweight messaging protocol used for real-time IoT communication in CrisisMesh. This document describes the intended MQTT architecture and current implementation status.

## Current Status (Phase 1)

### ✅ Implemented
- **MQTT Broker**: Eclipse Mosquitto 2 running in Docker Compose
- **Python Simulator**: MQTT client that publishes mock telemetry data
- **Topic Convention**: Defined in shared-types package
- **Basic Configuration**: MQTT broker configuration and network setup

### ⏳ Not Yet Implemented (Phase 3/4)
- **NestJS MQTT Consumer**: Backend does not currently consume MQTT telemetry
- **Real-time Data Processing**: No real-time telemetry ingestion pipeline
- **WebSocket Integration**: No live updates to web/mobile clients
- **Device Management**: No real MQTT-based device communication

## MQTT Broker Configuration

### Broker Details
- **Software**: Eclipse Mosquitto 2
- **Port**: 1883 (MQTT), 9001 (WebSocket)
- **Location**: Docker Compose service `mqtt`
- **Configuration**: `infrastructure/mqtt/mosquitto.conf`

### Current Configuration
```yaml
mqtt:
  image: eclipse-mosquitto:2
  ports:
    - "1883:1883"   # MQTT protocol
    - "9001:9001"   # MQTT over WebSocket
  volumes:
    - ./infrastructure/mqtt/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro
    - mosquitto_data:/mosquitto/data
    - mosquitto_logs:/mosquitto/log
```

## Topic Naming Convention

### Standard Topics (defined in shared-types)
```typescript
sensor/+/telemetry          // Sensor telemetry data
device/+/status             // Device status updates
alert/+/issued              // Alert notifications
incident/+/update           // Incident updates
weather/alert               // Weather alerts
```

### Current Implementation (Python Simulator)
The Python simulator publishes to:
```
sensor/{device_id}/telemetry
```

Example topic: `sensor/sim-node-001/telemetry`

### Payload Structure (Telemetry)
```json
{
  "device_id": "sim-node-001",
  "metric": "TEMPERATURE",
  "value": 25.5,
  "unit": "°C",
  "timestamp": "2026-08-26T10:30:00Z",
  "quality_flag": 1
}
```

## Architecture Flow

### Phase 1 Current State
```
Python Simulator → MQTT Broker → (No consumers yet)
```

### Phase 3/4 Intended State
```
IoT Devices/Simulator → MQTT Broker → NestJS Telemetry Module → Database
                                                              ↓
                                                    WebSocket → Web/Mobile Clients
```

## Component Responsibilities

### MQTT Broker (Phase 1 ✅)
- Message routing and delivery
- Quality of Service (QoS) levels
- Persistent message storage
- Client connection management

### Python Simulator (Phase 1 ✅)
- Generate mock sensor data
- Publish to MQTT topics
- Simulate mesh network behavior
- Hardware-replaceable design

### NestJS Telemetry Module (Phase 3/4 ⏳)
- Subscribe to MQTT telemetry topics
- Validate and normalize incoming data
- Store telemetry in database
- Trigger real-time alerts based on thresholds
- Publish processed data via WebSockets

### NestJS Device Module (Phase 3/4 ⏳)
- Subscribe to device status topics
- Update device registry in real-time
- Monitor device health
- Handle device authentication

## Phase 3/4 Implementation Plan

### NestJS MQTT Integration
1. Install MQTT adapter for NestJS
2. Create MQTT subscriber service
3. Implement telemetry data validation
4. Add database persistence layer
5. Set up real-time WebSocket broadcasting
6. Implement threshold-based alerting
7. Add error handling and retry logic

### Data Flow Implementation
```typescript
// Pseudo-code for Phase 3/4 implementation
@MessagePattern('sensor/+/telemetry')
async handleTelemetry(@Payload() data: TelemetryData) {
  // Validate data
  // Store in database
  // Check thresholds
  // Trigger alerts if needed
  // Broadcast via WebSocket
}
```

## Security Considerations

### Current Status (Phase 1)
- Basic MQTT broker configuration
- No authentication enabled (development mode)
- No encryption (development mode)

### Phase 2+ Security Requirements
- MQTT authentication (username/password)
- TLS/SSL encryption for production
- Client certificate authentication
- Access control lists (ACL)
- Topic-level authorization

## Performance Considerations

### QoS Levels
- **QoS 0**: At most once (fire and forget) - suitable for high-frequency telemetry
- **QoS 1**: At least once (acknowledged delivery) - default for critical data
- **QoS 2**: Exactly once (assured delivery) - for critical alerts

### Message Retention
- Configure message retention policies
- Implement message expiry for time-sensitive data
- Balance between persistence and performance

## Testing Strategy

### Phase 1 Testing
- ✅ Simulator publishes to MQTT broker
- ✅ Topic naming convention verified
- ✅ Payload structure matches shared-types

### Phase 3/4 Testing
- NestJS MQTT subscriber integration tests
- End-to-end telemetry flow tests
- Performance tests under load
- Error handling and recovery tests

## Known Limitations

### Current Limitations (Phase 1)
- No backend MQTT consumption
- No real-time data processing
- No data persistence from MQTT
- No device authentication
- No message encryption

### Planned Improvements (Phase 3/4)
- Full NestJS MQTT integration
- Real-time data processing pipeline
- Database persistence with time-series optimization
- Device authentication and authorization
- Production security with TLS

## References

- [MQTT Specification](http://mqtt.org/)
- [Eclipse Mosquitto Documentation](https://mosquitto.org/documentation/)
- [Shared Types Package](../../packages/shared-types/src/index.ts)
- [Python Simulator](../../apps/simulator/main.py)
