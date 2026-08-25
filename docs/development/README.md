# CrisisMesh Development Guide

Guide for developers contributing to CrisisMesh.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Git Workflow](#git-workflow)

## Prerequisites

### Required
- Node.js 18+
- npm or yarn
- Python 3.10+
- Docker & Docker Compose
- Git

### Recommended
- VS Code with extensions:
  - ESLint
  - Prettier
  - Python
  - Flutter
  - Thunder Client or Postman
  - Docker

## Local Setup

### 1. Clone Repository

```bash
git clone <repo-url>
cd crisis-mesh
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Development Services (Docker)

```bash
docker-compose up --build
```

Or run services individually.

## Development Workflow

### Adding a New Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement the feature**
   - Follow code standards
   - Write tests
   - Update documentation

3. **Test thoroughly**
   ```bash
   # NestJS
   cd services/api && npm test
   
   # Next.js
   cd apps/web && npm run typecheck
   
   # Flutter
   cd apps/mobile && flutter test
   
   # Python
   cd apps/simulator && pytest
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add device provisioning API"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Standards

### TypeScript

- Use strict mode
- Prefer interfaces over types
- Add JSDoc comments for public APIs
- Follow naming conventions:
  - Classes: PascalCase
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case or PascalCase

### Python

- Follow PEP 8
- Use type hints
- Document classes and functions
- Use logging appropriately
- Run formatters before commit:
  ```bash
  black .
  isort .
  flake8 .
  ```

### Flutter/Dart

- Follow Dart style guide
- Use meaningful variable names
- Document public APIs
- Keep widgets small and focused

## Testing

### NestJS

```bash
cd services/api

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

### Next.js

```bash
cd apps/web

# Type check
npm run typecheck

# Build verify
npm run build

# Lint
npm run lint
```

### Flutter

```bash
cd apps/mobile

# Run all tests
flutter test

# Coverage
flutter test --coverage

# Analyze
flutter analyze
```

### Python

```bash
cd apps/simulator

# Run tests
pytest

# With coverage
pytest --cov

# Type check
mypy .
```

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-changed` - Refactoring
- `docs/what-changed` - Documentation
- `chore/what-changed` - Chores

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Examples:
- `feat(auth): add JWT token refresh`
- `fix(api): handle null telemetry values`
- `docs(readme): update setup instructions`
- `refactor(health): simplify health check logic`

### Pull Requests

- Use descriptive titles
- Include relevant issue/ticket numbers
- Add description of changes
- Request review from relevant team members
- Ensure all checks pass before merging

## Development Tips

### Local Database

For local development, you can optionally run PostgreSQL:

```bash
# Using Docker
docker run -d \
  --name crisis-mesh-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=crisis_mesh \
  -p 5432:5432 \
  postgis/postgis:15-3
```

### MQTT Testing

Use MQTT clients to test message flows:

```bash
# Subscribe to a topic
mosquitto_sub -h localhost -t "sensor/+/telemetry"

# Publish a message
mosquitto_pub -h localhost -t "sensor/node1/telemetry" -m '{"temp": 25}'
```

### API Testing

Use REST Client extension or Postman:

```
GET http://localhost:3001/api/v1/health
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

### Node Modules Issues

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Clean rebuild
docker-compose down -v
docker-compose up --build
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Flutter Documentation](https://flutter.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [MQTT Documentation](https://mqtt.org/mqtt-specification)

---

**Last Updated**: 2026-08-25
