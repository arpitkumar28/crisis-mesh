/// Runtime endpoints shared by the citizen, responder, and authority apps.
///
/// Override these at build time, for example:
/// `flutter run --dart-define=CRISISMESH_API_URL=https://api.example.com`
/// No credentials belong in a mobile build-time define.
class AppConfig {
  AppConfig._();

  static const apiOrigin = String.fromEnvironment(
    'CRISISMESH_API_URL',
    defaultValue: 'https://crisis-mesh-api.onrender.com',
  );

  static const webSocketOrigin = String.fromEnvironment(
    'CRISISMESH_WS_URL',
    defaultValue: apiOrigin,
  );

  static String get apiBaseUrl =>
      '${apiOrigin.replaceFirst(RegExp(r'/+$'), '')}/api/';

  static String get socketUrl =>
      webSocketOrigin.replaceFirst(RegExp(r'/+$'), '');
}
