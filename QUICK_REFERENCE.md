# CrisisMesh Quick Reference - PHASE 1

## Quick Start

### 1. Setup
```bash
cd /Users/arpit/Downloads/work/SIH/crisis-mesh
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start All Services (Docker)
```bash
docker-compose up --build
```

### 3. Verify Health
```bash
# Health endpoint
curl http://localhost:3001/api/v1/health

# MQTT broker
docker-compose ps mqtt

# AI Service
curl http://localhost:5000/health
```

---

## Service Ports

| Service | Port | Endpoint |
|---------|------|----------|
| NestJS API | 3001 | http://localhost:3001/api/v1/* |
| Next.js Web | 3000 | http://localhost:3000 |
| MQTT Broker | 1883 | mqtt://localhost:1883 |
| MQTT WebSocket | 9001 | ws://localhost:9001 |
| AI Service | 5000 | http://localhost:5000 |
| Flutter | 5555 | (mobile device) |

---

## Development Commands

### NestJS Backend
```bash
cd services/api

# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test

# Build for production
npm run build

# Run linter
npm run lint
```

### Next.js Web
```bash
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

### Flutter Mobile
```bash
cd apps/mobile

# Get dependencies
flutter pub get

# Run on device/emulator
flutter run

# Run tests
flutter test

# Build APK
flutter build apk
```

### Python Simulator
```bash
cd apps/simulator

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run simulator
python main.py

# Run tests
pytest
```

### Python AI Service
```bash
cd services/ai

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run service
python main.py

# Run tests
pytest
```

---

## File Locations

### Configuration
- Environment variables: `.env` (never commit)
- Environment template: `.env.example`
- Docker setup: `docker-compose.yml`

### Source Code
- NestJS backend: `services/api/src/`
- Next.js web: `apps/web/src/app/`
- Flutter mobile: `apps/mobile/lib/`
- Python simulator: `apps/simulator/main.py`
- Python AI: `services/ai/main.py`
- Shared types: `packages/shared-types/src/`

### Configuration
- API config: `services/api/src/config/`
- MQTT config: `infrastructure/mqtt/mosquitto.conf`

### Documentation
- Architecture: `docs/architecture/README.md`
- Development: `docs/development/README.md`
- Database: `supabase/migrations/README.md`
- Phase 1 Report: `PHASE1_REPORT.md`

---

## API Examples

### Health Check
```bash
curl -X GET http://localhost:3001/api/v1/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-08-25T17:54:00Z",
  "uptime": 123,
  "environment": "development",
  "version": "0.0.1",
  "services": {
    "api": "healthy"
  }
}
```

### AI Service Health
```bash
curl -X GET http://localhost:5000/health
```

### Publish MQTT Message
```bash
mosquitto_pub -h localhost -t "sensor/node1/telemetry" \
  -m '{"device_id":"node1","metric":"TEMPERATURE","value":25.5,"unit":"°C","timestamp":"2026-08-25T17:54:00Z","quality_flag":1}'
```

### Subscribe to MQTT Topic
```bash
mosquitto_sub -h localhost -t "sensor/+/telemetry"
```

---

## MQTT Topics

```
sensor/+/telemetry          # Sensor telemetry data
device/+/status             # Device online/offline status
alert/+/issued              # Alert events
incident/+/update           # Incident updates
weather/alert               # Weather alerts
```

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process
lsof -i :3001

# Kill it
kill -9 <PID>
```

### npm Install Issues
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues
```bash
# Clean rebuild
docker-compose down -v
docker-compose up --build

# View logs
docker-compose logs -f api
docker-compose logs -f mqtt
```

### MQTT Connection Issues
```bash
# Check MQTT broker
docker-compose exec mqtt /bin/sh -c \
  "mosquitto_sub -h localhost -t '$SYS/broker/uptime'"

# Restart MQTT
docker-compose restart mqtt
```

---

## Important URLs

- **Project Root**: `/Users/arpit/Downloads/work/SIH/crisis-mesh`
- **API Documentation**: Start in `docs/api/` (Phase 2)
- **Database Docs**: Start in `docs/database/` (Phase 2)
- **Architecture Decision**: `docs/architecture/README.md`

---

## Phase 1 Completion

- [x] Repository structure
- [x] All applications initialized
- [x] Docker configured
- [x] Documentation created
- [x] Health check implemented
- [x] Testing foundation
- [x] Security foundation

## Next Phase (Phase 2)

Coming next:
- Database schema and migrations
- Supabase integration
- Authentication implementation
- RLS policies
- User management endpoints

---

**Status**: ✅ PHASE 1 Complete  
**Date**: 2026-08-25  
**Next**: PHASE 2 - Database + Auth + RBAC
