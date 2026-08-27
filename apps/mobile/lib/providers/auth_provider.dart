import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';

class User {
  final String id;
  final String email;
  final String name;
  final String role;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final roles = json['roles'];
    return User(
      id: '${json['id'] ?? ''}',
      email: '${json['email'] ?? ''}',
      name: '${json['name'] ?? json['email'] ?? 'Operator'}',
      role: roles is List && roles.isNotEmpty ? '${roles.first}' : '${json['role'] ?? 'Operator'}',
    );
  }
}

class AuthState {
  final User? user;
  final String? token;
  final bool isAuthenticated;

  AuthState({
    this.user,
    this.token,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    User? user,
    String? token,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._api, this._webSocket, this._storage) : super(AuthState());

  final ApiService _api;
  final WebSocketService _webSocket;
  final FlutterSecureStorage _storage;
  static const _tokenKey = 'crisis_mesh_access_token';

  Future<void> restoreSession() async {
    final token = await _storage.read(key: _tokenKey);
    if (token == null || token.isEmpty) return;
    try {
      _api.setAuthToken(token);
      final response = await _api.getCurrentUser();
      final body = response.data;
      final rawUser = body is Map<String, dynamic> ? body['data'] : null;
      if (rawUser is! Map) throw StateError('Invalid user response');
      final user = User.fromJson(Map<String, dynamic>.from(rawUser));
      state = AuthState(user: user, token: token, isAuthenticated: true);
      _webSocket.connect(token);
    } catch (_) {
      await clearSession();
    }
  }

  Future<void> setAuth(User user, String token) async {
    await _storage.write(key: _tokenKey, value: token);
    _api.setAuthToken(token);
    state = AuthState(
      user: user,
      token: token,
      isAuthenticated: true,
    );
    _webSocket.connect(token);
  }

  Future<void> clearSession() async {
    await _storage.delete(key: _tokenKey);
    _api.clearAuthToken();
    _webSocket.disconnect();
    state = AuthState();
  }

  Future<void> logout() async {
    try {
      if (state.isAuthenticated) await _api.logout();
    } catch (_) {
      // Local credentials must still be removed when the server is unavailable.
    } finally {
      await clearSession();
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(crisisApi, crisisWebSocket, const FlutterSecureStorage());
});
