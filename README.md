# CrisisMesh

**AI-powered disaster intelligence, early-warning, environmental monitoring, and resilient emergency response platform.**

CrisisMesh connects environmental data, virtual/real IoT sensor networks, AI risk prediction, government disaster information, GIS, emergency alerts, responders, authorities, and citizens into one resilient platform.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Repository Structure](#repository-structure)
5. [Current Phase](#current-phase)
6. [Prerequisites](#prerequisites)
7. [Environment Setup](#environment-setup)
8. [Running Locally](#running-locally)
9. [Running Tests](#running-tests)
10. [Development Guide](#development-guide)

---

## Project Overview

### Core Objective

CrisisMesh integrates multiple data sources and response channels into a unified platform:

- **Environmental Monitoring**: Real-time sensor data from IoT mesh networks
- **Risk Prediction**: AI-driven early warning for disasters
- **Government Integration**: Official disaster alerts and directives
- **GIS Intelligence**: Geographic data and visualization
- **Emergency Response**: Responder coordination and dispatch
- **Citizen Engagement**: Public alerts and community reporting
- **Resilience**: Offline-first, decentralized mesh capabilities

### Key Design Principles

- **Production-Grade**: Enterprise-level architecture and security
- **Modular**: Independent services with clear contracts
- **Hardware-Replaceable**: Simulator designed to mirror future ESP32/LoRa hardware
- **Secure**: Authentication, authorization, and encryption from foundation
- **Testable**: Automated tests at all layers
- **Scalable**: Microservices ready for distributed deployment

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Clients                              │
│  ┌──────────────┐        ┌──────────────┐              │
│  │   Next.js    │        │   Flutter    │              │
│  │   Web App    │        │  Mobile Apps │              │
│  └──────────────┘        └──────────────┘              │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             └───────────┬───────────┘
                         │
         ┌───────────────▼────────────────┐
         │      NestJS Backend API        │
         │  (/api/v1/* endpoints)         │
         │                                │
         │  ├─ REST API                   │
         │  ├─ WebSocket                  │
         │  └─ MQTT Integration           │
         └───────────────┬────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
    ┌────▼────────┐          ┌───────────▼─────┐
    │  Supabase   │          │  MQTT Broker    │
    │             │          │                 │
    │ - Auth      │          │ - IoT Messages  │
    │ - Database  │          │ - Events        │
    │ - Storage   │          │ - Telemetry     │
    │ - RLS       │          │                 │
    └─────────────┘          └────────┬────────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
         ┌─────────▼──────┐  ┌────────▼────────┐  ┌────▼─────────┐
         │   Simulator    │  │  AI Service     │  │  Future IoT  │
         │  (Python)      │  │  (Python)       │  │  Hardware    │
         │                │  │                 │  │ (ESP32/LoRa) │
         │ - Virtual Mesh │  │ - Risk Modeling │  │              │
         │ - Sensor Sims  │  │ - Prediction    │  │              │
         │ - Scenarios    │  │ - Inference     │  │              │
         └────────────────┘  └─────────────────┘  └──────────────┘
```

### Service Responsibilities

| Service | Purpose | Tech |
|---------|---------|------|
| **NestJS API** | Main backend, REST/WebSocket, orchestration | TypeScript |
| **Supabase** | Authentication, database, storage, RLS | PostgreSQL + PostGIS |
| **MQTT Broker** | IoT message routing, event streaming | MQTT 3.1.1 |
| **Simulator** | Virtual IoT mesh, scenario testing | Python + asyncio |
| **AI Service** | Risk prediction, model inference | Python + scikit-learn |
| **Next.js Web** | Desktop platform UI | TypeScript + React |
| **Flutter Mobile** | Citizen/responder/authority apps | Dart |

---

## Technology Stack

### **Locked Stack** (Do not change without approval)

#### Web
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- Leaflet

#### Mobile
- Flutter / Dart
- Riverpod
- GoRouter
- Dio
- flutter_map
- SQLite / flutter_secure_storage

#### Backend
- **NestJS** (primary backend)
- TypeScript

#### Database
- Supabase (managed)
- PostgreSQL
- PostGIS (geospatial)

#### Authentication
- Supabase Auth
- PostgreSQL Row Level Security (RLS)

#### IoT
- MQTT 3.1.1

#### AI/ML
- Python 3.10+
- scikit-learn
- XGBoost (where appropriate)
- ONNX (model serialization)

#### Infrastructure
- Docker / Docker Compose
- GitHub / GitHub Actions

---

## Repository Structure

```
crisis-mesh/
│
├── apps/
│   ├── web/                          # Next.js web platform
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.js
│   │
│   ├── mobile/                       # Flutter mobile apps
│   │   ├── lib/
│   │   │   ├── app/
│   │   │   ├── core/
│   │   │   └── features/
│   │   ├── pubspec.yaml
│   │   └── test/
│   │
│   └── simulator/                    # Python IoT simulator
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── services/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   ├── health/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── devices/
│   │   │   ├── telemetry/
│   │   │   ├── alerts/
│   │   │   ├── incidents/
│   │   │   ├── risk/
│   │   │   └── simulation/
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── ai/                           # Python AI service
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   └── shared-types/                 # Shared TypeScript types
│       ├── src/
│       │   ├── enums/
│       │   ├── events/
│       │   ├── devices/
│       │   ├── alerts/
│       │   └── incidents/
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/
│   ├── docker/                       # Docker configurations
│   ├── mqtt/                         # MQTT broker config
│   │   └── mosquitto.conf
│   └── kubernetes/                   # (future phase)
│
├── supabase/
│   ├── migrations/                   # Database migrations
│   └── seed/                         # Seed data
│
├── docs/
│   ├── README.md                     # Documentation index
│   ├── architecture/                 # Architecture decisions
│   ├── api/                          # API documentation
│   ├── database/                     # Database schema docs
│   └── development/                  # Development guide
│
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── docker-compose.yml                # Development docker setup
├── README.md                         # This file
└── package.json                      # Root package (optional)
```

---

## Current Phase

### ✅ PHASE 1 — Project Foundation (Current)

**Status**: Implementing

**Deliverables**:
- [x] Repository structure
- [x] Environment configuration
- [x] Docker foundation
- [ ] Next.js application foundation
- [ ] NestJS backend foundation with health endpoint
- [ ] Flutter application foundation
- [ ] Python simulator skeleton
- [ ] Python AI service skeleton
- [ ] Shared types foundation
- [ ] Basic documentation
- [ ] Testing foundation
- [ ] Build/typecheck verification

### Upcoming Phases

| Phase | Focus | Est. Delivery |
|-------|-------|---|
| PHASE 2 | Supabase + Database + Auth + RBAC | TBD |
| PHASE 3 | IoT Simulator + MQTT + Virtual Mesh | TBD |
| PHASE 4 | Live Telemetry Pipeline | TBD |
| PHASE 5 | AI + Risk Engine | TBD |
| PHASE 6 | Government Data Integration | TBD |
| ... | ... | ... |
| PHASE 17 | SIH Demo + Final Deployment | TBD |

---

## Prerequisites

### Required

- **Node.js** 18+ (for web and API)
- **npm** or **yarn**
- **Docker** & **Docker Compose**
- **Python** 3.10+ (for simulator and AI)
- **Git**
- **Flutter** 3.0+ (for mobile development)
- **Dart** (bundled with Flutter)

### Recommended

- **PostgreSQL** 14+ (for local development - optional, usually via Supabase)
- **VS Code** with extensions
- **Postman** or **REST Client** for API testing

### Installation

#### macOS

```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Python
brew install python@3.11

# Install Docker Desktop
brew install --cask docker

# Install Flutter
brew install flutter
```

#### Linux / Windows

Refer to official documentation:
- [Node.js](https://nodejs.org/)
- [Python](https://www.python.org/downloads/)
- [Docker](https://docs.docker.com/get-docker/)
- [Flutter](https://flutter.dev/docs/get-started/install)

---

## Environment Setup

### 1. Clone and Enter Repository

```bash
cd /Users/arpit/Downloads/work/SIH/crisis-mesh
```

### 2. Copy Environment Template

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` with your actual values:

```bash
# Supabase (required for production)
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

# Database (for local development, optional)
DATABASE_URL=postgresql://user:password@localhost:5432/crisis_mesh

# JWT (generate a strong secret)
JWT_SECRET=your-secret-key-here

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883

# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Install Root Dependencies (Optional)

```bash
npm install
```

---

## Running Locally

### Option A: Using Docker Compose (Recommended)

```bash
# Start all services (MQTT, API, Simulator, AI)
docker-compose up --build

# Check service health
curl http://localhost:3001/api/v1/health
curl http://localhost:5000/health

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Option B: Running Services Individually

#### Run NestJS Backend

```bash
cd services/api
npm install
npm run start:dev
# Endpoint: http://localhost:3001/api/v1/health
```

#### Run Next.js Web

```bash
cd apps/web
npm install
npm run dev
# Endpoint: http://localhost:3000
```

#### Run Flutter Mobile

```bash
cd apps/mobile
flutter pub get
flutter run -d chrome    # or your target device
```

#### Run Python Simulator

```bash
cd apps/simulator
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### Run Python AI Service

```bash
cd services/ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

---

## Running Tests

### NestJS Backend

```bash
cd services/api

# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Next.js Web

```bash
cd apps/web

# Type check
npm run typecheck

# Build verify
npm run build
```

### Flutter Mobile

```bash
cd apps/mobile

# Run tests
flutter test

# Generate coverage
flutter test --coverage
```

### Python Services

```bash
cd apps/simulator
python -m pytest

cd services/ai
python -m pytest
```

---

## Development Guide

### API Development

- API documentation: [docs/api/README.md](docs/api/README.md)
- Health endpoint: `GET /api/v1/health`
- All endpoints are under `/api/v1/*`
- Authentication required for protected endpoints

### Database Development

- Migrations: `supabase/migrations/`
- Seed data: `supabase/seed/`
- Schema docs: [docs/database/README.md](docs/database/README.md)

### Simulator Development

- Simulator docs: [docs/simulator/README.md](docs/simulator/README.md)
- MQTT protocol: [infrastructure/mqtt/README.md](infrastructure/mqtt/README.md)

### AI Development

- Model docs: [docs/ai/README.md](docs/ai/README.md)
- Training: Not required for PHASE 1

---

## Important Rules

🔒 **Security**
- Never commit `.env` files
- Never hardcode secrets
- All environment variables use the `.env.example` template

📦 **Dependencies**
- Do not introduce dependencies without justification
- Keep production dependencies minimal
- Use peer dependencies where appropriate

🏗️ **Architecture**
- Follow modular structure
- Keep services independent
- Use API versioning (`/api/v1/`)
- Do not create duplicate functionality

✅ **Quality**
- Test before marking as complete
- Verify builds succeed
- Check TypeScript compilation
- Document architectural decisions

---

## Troubleshooting

### Docker Issues

```bash
# Clean rebuild
docker-compose down -v
docker-compose up --build

# Check service health
docker-compose ps
```

### Port Conflicts

If ports are already in use, modify `docker-compose.yml`:

```yaml
services:
  api:
    ports:
      - "3002:3001"  # Map to different port
```

### MQTT Connection

Ensure MQTT broker is running:

```bash
docker-compose ps mqtt
docker-compose logs mqtt
```

---

## Support

For issues or questions:

1. Check existing documentation in `/docs`
2. Review Phase 1 implementation notes
3. Consult the team

---

## License

[To be determined]

---

**Last Updated**: 2026-08-25  
**Current Phase**: PHASE 1 — Project Foundation
