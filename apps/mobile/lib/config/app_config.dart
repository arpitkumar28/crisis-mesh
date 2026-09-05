/// Runtime endpoints shared by the citizen, responder, and authority apps.
///
/// Override these at build time, for example:
/// `flutter run --dart-define=CRISISMESH_API_URL=https://api.example.com`
/// No credentials belong in a mobile build-time define.
class AppConfig {
  AppConfig._();

  // For Android emulator: 10.0.2.2:3002
  // For iOS simulator: localhost:3002
  // For physical device: your-machine-ip:3002
  static const apiOrigin = String.fromEnvironment(
    'CRISISMESH_API_URL',
    defaultValue: 'http://10.0.2.2:3002',
  );

  static const webSocketOrigin = String.fromEnvironment(
    'CRISISMESH_WS_URL',
    defaultValue: 'http://10.0.2.2:3002',
  );

  static String get apiBaseUrl =>
      '${apiOrigin.replaceFirst(RegExp(r'/+$'), '')}/api/';

  static String get socketUrl =>
      webSocketOrigin.replaceFirst(RegExp(r'/+$'), '');
}
