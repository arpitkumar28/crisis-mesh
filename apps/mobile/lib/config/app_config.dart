/// Runtime endpoints shared by the citizen, responder, and authority apps.
///
/// Override these at build time, for example:
/// `flutter run --dart-define=CRISISMESH_API_URL=https://api.example.com`
/// No credentials belong in a mobile build-time define.
class AppConfig {
  AppConfig._();

  static const apiOrigin = String.fromEnvironment(
    'CRISISMESH_API_URL',
    defaultValue: '',
  );

  static const webSocketOrigin = String.fromEnvironment(
    'CRISISMESH_WS_URL',
    defaultValue: '',
  );

  static String get apiBaseUrl => '${_requiredOrigin(apiOrigin)}/api/';

  static String get socketUrl =>
      _requiredOrigin(webSocketOrigin);

  static String _requiredOrigin(String origin) {
    final normalizedOrigin = origin.trim().replaceFirst(RegExp(r'/+$'), '');
    if (normalizedOrigin.isEmpty) {
      throw StateError(
        'CRISISMESH_API_URL and CRISISMESH_WS_URL must be provided at build time',
      );
    }
    return normalizedOrigin;
  }
}
