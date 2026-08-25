# CrisisMesh Architecture

## Overview

CrisisMesh is a production-grade, modular disaster intelligence platform. This document describes the high-level architecture and design decisions.

---

## System Architecture

### Layered View

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│  ┌──────────────────┐    ┌──────────────────┐  │
│  │   Next.js Web    │    │ Flutter Mobile   │  │
│  │   (Responsive)   │    │ (Multi-Role)     │  │
│  └──────────────────┘    └──────────────────┘  │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│           API Gateway Layer                      │
│     NestJS Backend @ localhost:3001              │
│  ┌─────────────────────────────────────────┐   │
│  │  REST API (v1)  | WebSocket | MQTT      │   │
│  └──────────────────┬──────────────────────┘   │
└────────────────────┼──────────────────────────┘
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐   ┌─────────▼──────┐
│   Supabase      │   │  MQTT Broker   │
│  (Auth + Data)  │   │  (Event Bus)   │
└────────────────┘    └────────────────┘
         │                     │
    ┌────▼────┐         ┌──────▼──────┐
    │ PostgreSQL │       │ IoT Sources │
    │ + PostGIS │       │  + Simulator│
    └──────────┘        └─────────────┘

┌─────────────────────────────────────────────────┐
│         Independent Services Layer               │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  Simulator   │      │  AI Service  │        │
│  │  (Python)    │      │  (Python)    │        │
│  └──────────────┘      └──────────────┘        │
└─────────────────────────────────────────────────┘
```

---

## Service Boundaries

### NestJS API (`services/api/`)

**Responsibility**: Core business logic orchestration

**Responsibilities**:
- Handle client requests (REST)
- Real-time communication (WebSocket)
- MQTT bridge (publish/subscribe)
- Authentication & Authorization
- Request validation
- Error handling
- Logging

**Key Modules** (to be implemented):
- `auth/` - Authentication, JWT, Supabase integration
- `users/` - User management, roles, profiles
- `devices/` - IoT device registry, metadata
- `telemetry/` - Sensor data ingestion, aggregation
- `alerts/` - Alert generation, management
- `incidents/` - Incident lifecycle management
- `risk/` - Risk calculation, prediction API calls
- `simulation/` - Simulator integration

**API Versioning**:
- All endpoints prefixed with `/api/v1/`
- Future versions: `/api/v2/`, etc.

**Health Endpoint**:
- `GET /api/v1/health` - Returns service status

---

### Supabase (`External Service`)

**Responsibility**: Data persistence, authentication, authorization

**Components**:
- **PostgreSQL** - Relational data store
- **PostGIS** - Geospatial queries
- **Auth** - User authentication, OAuth
- **RLS** - Row-level security policies
- **Storage** - File storage (images, documents)

**Why Supabase?**
- Managed PostgreSQL (no ops burden)
- Built-in authentication
- Real-time subscriptions (if needed)
- Row-level security (authorization at DB level)
- Familiar SQL (PostGIS for geospatial)

---

### MQTT Broker (`infrastructure/mqtt/`)

**Responsibility**: Asynchronous event routing

**Topics**:
```
sensor/+/telemetry      # Sensor data streams
device/+/status         # Device online/offline
alert/+/issued          # Alert events
incident/+/update       # Incident updates
weather/alert           # Weather alerts
```

**Why MQTT?**
- Publish-subscribe pattern (loosely coupled)
- Lightweight (IoT-friendly)
- QoS levels (reliability options)
- Will messages (device disconnect detection)
- Bridgeable to future hardware (ESP32/LoRa)

---

### Python Simulator (`apps/simulator/`)

**Responsibility**: Virtual IoT mesh network

**Design Philosophy**:
- Simulate future ESP32/LoRa hardware behavior
- Not a dashboard simulator - generates real telemetry
- Publishes to MQTT with same contracts as hardware
- Implements failure scenarios
- Hardware-replaceable interface

**Architecture**:
```
SensorSource (abstract)
    ├── SimulatorSensorSource
    └── FutureHardwareSensorSource (Phase 3+)

MeshNode
    ├── Sensor
    ├── MQTT Client
    └── Mesh Router

Scenario
    ├── Temperature Rise
    ├── Flooding
    └── Custom Scenarios
```

---

### Python AI Service (`services/ai/`)

**Responsibility**: Risk prediction and inference

**Components**:
- Model loading and management
- Feature engineering
- Risk prediction
- Model versioning
- API exposure (REST endpoint)

**Why Independent?**
- Models can be updated independently
- Python-specific libraries (scikit-learn, XGBoost)
- Scales independently
- Can be replaced/upgraded without API changes

---

## Data Flow

### Telemetry Ingestion

```
IoT Device/Simulator
    │
    └──> MQTT Broker (sensor/+/telemetry)
            │
            └──> NestJS API (MQTT listener)
                    │
                    ├──> Validate & Transform
                    │
                    ├──> Store to Supabase (telemetry table)
                    │
                    ├──> Publish to Connected Clients (WebSocket)
                    │
                    └──> Trigger AI Service (risk prediction)
                            │
                            └──> Return risk score
                                    │
                                    └──> Store/Alert if threshold
```

### Alert Generation

```
Risk Engine / Manual Input
    │
    └──> NestJS API
            │
            ├──> Validate alert
            │
            ├──> Store to Supabase (alerts table)
            │
            ├──> Publish MQTT (alert/+/issued)
            │
            ├──> Send WebSocket to connected clients
            │
            └──> Trigger notifications (Phase 12)
```

### User Request

```
Client (Web/Mobile)
    │
    └──> NestJS API (/api/v1/...)
            │
            ├──> Authenticate (JWT/Supabase Auth)
            │
            ├──> Check Authorization (RLS/Guards)
            │
            ├──> Query Supabase
            │
            ├──> Transform response
            │
            └──> Return to Client
```

---

## Authentication & Authorization

### Strategy

**Authentication**: Supabase Auth + JWT
- Clients receive JWT from Supabase Auth
- Attach JWT to API requests
- NestJS verifies JWT signature

**Authorization**: Dual layer
- **NestJS Guards**: Role-based (RBAC)
- **Supabase RLS**: Row-level security (RBAC)

### Roles (PHASE 2)

```
User Roles:
├── CITIZEN - Can report, view local alerts
├── RESPONDER - Can view incidents, coordinate
├── AUTHORITY - Can issue alerts, manage regions
└── ADMIN - Full system access
```

---

## API Design Principles

### REST Endpoints

**Convention**:
- Resources: `/api/v1/{resource}`
- Operations: `GET`, `POST`, `PUT`, `DELETE`
- Pagination: `?page=1&limit=20`
- Filtering: `?status=active`
- Sorting: `?sort=-created_at`

**Example**:
```
GET /api/v1/alerts?status=active&sort=-created_at
POST /api/v1/incidents
GET /api/v1/devices/:id
PUT /api/v1/alerts/:id
DELETE /api/v1/incidents/:id
```

### Error Handling

All errors return consistent JSON:

```json
{
  "error": true,
  "message": "User not found",
  "statusCode": 404,
  "timestamp": "2026-08-25T10:30:00Z"
}
```

### WebSocket Events (PHASE 4)

Real-time updates for connected clients:

```
telemetry:received
alert:issued
incident:updated
device:online
device:offline
user:location
```

---

## Database Design

### Schema Approach

**Phase 1**: Minimal schema (migrations setup only)

**Phase 2**: Full schema including:
- users
- devices
- telemetry
- alerts
- incidents
- locations (PostGIS)
- roles & permissions

### Migrations

**Tool**: Supabase migrations (SQL)

**Location**: `supabase/migrations/`

**Format**:
```
001_create_users_table.sql
002_create_devices_table.sql
...
```

---

## Modularity & Dependencies

### Key Principles

1. **Loose Coupling**: Services communicate via well-defined APIs
2. **High Cohesion**: Related logic grouped in modules
3. **Single Responsibility**: Each module has one reason to change
4. **Testability**: Dependencies can be mocked

### Dependency Graph

```
Clients
  ↓
API (depends on: Config, Auth, Supabase client, MQTT client)
  ├─→ Supabase (external)
  ├─→ MQTT Broker (external)
  └─→ AI Service (external)

Simulator (depends on: MQTT client, API client)
  ↓
MQTT Broker

AI Service (depends on: MQTT client, API client, ML libraries)
```

**No circular dependencies allowed.**

---

## Scalability Considerations

### Current Phase (Development)

- Single-instance deployment
- Docker Compose for local dev
- SQLite for optional offline testing

### Future (PHASE 16+)

- Kubernetes orchestration
- Horizontal scaling (API, Simulator, AI)
- Database read replicas
- Message queue (RabbitMQ if needed)
- Caching layer (Redis)

---

## Security Design

### Defense in Depth

1. **Client → API**: HTTPS (TLS 1.3+)
2. **API → Supabase**: JWT + environment secrets
3. **API → MQTT**: Username/password (future: mTLS)
4. **Data at Rest**: Supabase encryption
5. **Data in Transit**: TLS everywhere

### Secrets Management

- Never commit `.env` files
- Use `.env.example` template
- Rotate secrets regularly
- Audit secret access

---

## Testing Strategy

### Test Pyramid

```
    /\
   /  \  E2E Tests (API + Supabase)
  /────\
 /      \  Integration Tests
/────────\
/          \ Unit Tests
/────────────\
```

### Testing Levels

1. **Unit Tests**: Individual functions, mocked dependencies
2. **Integration Tests**: Service interactions (API + DB)
3. **E2E Tests**: Full workflows (client → API → DB)

---

## Deployment Phases

### PHASE 1 (Current)
- ✅ Repository structure
- ✅ Environment setup
- ✅ Docker foundation
- ⏳ Individual application setup

### PHASE 2-16
- Progressive feature implementation
- Deployment pipeline setup
- Production hardening

### PHASE 17
- SIH competition demo
- Production release

---

## Architectural Decisions (ADR)

### ADR-001: NestJS as Primary Backend

**Decision**: Use NestJS (TypeScript) as the primary backend framework

**Rationale**:
- Type safety (TypeScript)
- Modular architecture (Modules, Services, Controllers)
- Strong ecosystem (decorators, guards, interceptors)
- Easy to test
- Scalable

**Alternatives Rejected**:
- FastAPI: Python-only, not suitable for full-stack
- Express: Too minimal, no structure
- Django: Overkill for microservices
- Spring Boot: Java adds complexity

---

### ADR-002: Python Simulator (Not Mock Data)

**Decision**: Build a production-grade simulator that generates real telemetry

**Rationale**:
- Prepares for real ESP32/LoRa hardware integration
- Simulator must speak same MQTT protocol as hardware
- Can test full pipeline without physical devices
- Future hardware can drop-in replace simulator

**Not Rejected**: Postman/Insomnia mock APIs
- Mocks don't test real message flows
- Mocks don't expose protocol issues early

---

### ADR-003: Supabase (Managed PostgreSQL)

**Decision**: Use Supabase as primary database platform

**Rationale**:
- Managed PostgreSQL (no DevOps burden)
- Built-in authentication (Supabase Auth)
- Row-level security (authorization at DB level)
- PostGIS for geospatial queries
- Real-time subscriptions (optional, future)
- Familiar to most developers (SQL)

**Alternatives Rejected**:
- Firebase: Lacks PostGIS, row-level security more complex
- Self-hosted PostgreSQL: Requires DevOps/maintenance
- DynamoDB: No SQL, complex geospatial queries
- MongoDB: Wrong data model (relational + GIS needed)

---

### ADR-004: MQTT for IoT Communication

**Decision**: Use MQTT 3.1.1 as primary IoT protocol

**Rationale**:
- Publish-subscribe (decouples publishers/subscribers)
- Lightweight (IoT-friendly)
- QoS levels (reliability options: 0, 1, 2)
- Bridgeable (future LoRa mesh can bridge to MQTT)
- Well-established ecosystem

**Alternatives Rejected**:
- HTTP/REST: Inefficient for sensor streams, higher latency
- CoAP: Less ecosystem support, not suitable for backend
- AMQP: Overkill for IoT, higher resource usage

---

## Next Steps

1. ✅ Establish repository structure
2. ⏳ Implement NestJS foundation
3. ⏳ Implement Next.js foundation
4. ⏳ Implement Flutter foundation
5. ⏳ Implement Simulator foundation
6. ⏳ Implement AI Service foundation
7. ⏳ Establish shared types
8. ⏳ Docker verification
9. ⏳ Complete testing foundation
10. ✅ Documentation

---

**Document Status**: PHASE 1  
**Last Updated**: 2026-08-25  
**Maintainer**: Project Team
