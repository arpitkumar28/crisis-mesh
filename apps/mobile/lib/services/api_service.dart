import 'dart:io';
import 'package:dio/dio.dart';

class ApiService {
  String? _token;
  final Dio _dio;
  final String baseUrl;

  ApiService({String? baseUrl})
      : baseUrl = baseUrl ?? (Platform.isAndroid ? 'http://10.0.2.2:3001' : 'http://localhost:3001'),
        _dio = Dio(BaseOptions(
          baseUrl: baseUrl ?? (Platform.isAndroid ? 'http://10.0.2.2:3001' : 'http://localhost:3001'),
          headers: {'Content-Type': 'application/json'},
        ));

  void setAuthToken(String token) {
    _token = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearAuthToken() {
    _token = null;
    _dio.options.headers.remove('Authorization');
  }

  String? get authToken => _token;

  void _applyAuth() {
    if (_token != null) _dio.options.headers['Authorization'] = 'Bearer $_token';
  }

  Future<Response> login(String email, String password) async {
    return _dio.post('/v1/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> getCurrentUser() async {
    _applyAuth();
    return _dio.get('/v1/auth/me');
  }

  Future<Response> logout() async {
    _applyAuth();
    return _dio.post('/v1/auth/logout');
  }

  List<Map<String, dynamic>> recordsFrom(Response response) {
    final body = response.data;
    final data = body is Map<String, dynamic> ? body['data'] : null;
    if (data is! List) return const [];
    return data.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
  }

  Future<Response> getAlerts() async {
    _applyAuth();
    return await _dio.get('/v1/alerts');
  }

  Future<Response> getActiveAlerts() async {
    _applyAuth();
    return await _dio.get('/v1/alerts/active');
  }

  Future<Response> getIncidents() async {
    _applyAuth();
    return await _dio.get('/v1/incidents');
  }

  Future<Response> getActiveIncidents() async {
    _applyAuth();
    return await _dio.get('/v1/incidents/active');
  }

  Future<Response> getDevices() async {
    _applyAuth();
    return await _dio.get('/v1/devices');
  }

  Future<Response> getOnlineDevices() async {
    _applyAuth();
    return await _dio.get('/v1/devices/status/ONLINE');
  }

  Future<Response> updateAlert(String id, Map<String, dynamic> data) async {
    _applyAuth();
    return _dio.put('/v1/alerts/$id', data: data);
  }

  Future<Response> updateIncident(String id, Map<String, dynamic> data) async {
    _applyAuth();
    return _dio.put('/v1/incidents/$id', data: data);
  }
}

final crisisApi = ApiService();
