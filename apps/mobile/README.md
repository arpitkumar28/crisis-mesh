# CrisisMesh mobile

The Flutter app uses the same NestJS API and Socket.IO service as the web app.
Release builds point to the deployed CrisisMesh API by default.

## Run against another environment

```bash
flutter run \
  --dart-define=CRISISMESH_API_URL=https://your-api.example.com \
  --dart-define=CRISISMESH_WS_URL=https://your-api.example.com
```

Use an origin only: do not append `/api` or `/api/v1`. The app adds `/api/`
itself and uses `/ws` for Socket.IO. Never pass database URLs, JWT secrets, or
provider keys through `--dart-define`.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
