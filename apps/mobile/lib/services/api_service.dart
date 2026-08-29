import 'dart:io';
import 'package:dio/dio.dart';
import '../models/information_models.dart';

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

  Map<String, dynamic>? dataFrom(Response response) {
    final body = response.data;
    if (body is Map<String, dynamic> && body['data'] is Map) {
      return Map<String, dynamic>.from(body['data']);
    }
    return null;
  }

  // Alerts API
  Future<Response> getAlerts() async {
    _applyAuth();
    return await _dio.get('/v1/alerts');
  }

  Future<Response> getActiveAlerts() async {
    _applyAuth();
    return await _dio.get('/v1/alerts/active');
  }

  Future<Response> getCriticalAlerts() async {
    _applyAuth();
    return await _dio.get('/v1/alerts/critical');
  }

  Future<Response> getAlertById(String id) async {
    _applyAuth();
    return await _dio.get('/v1/alerts/$id');
  }

  Future<Response> createAlert(Map<String, dynamic> data) async {
    _applyAuth();
    return await _dio.post('/v1/alerts', data: data);
  }

  Future<Response> updateAlert(String id, Map<String, dynamic> data) async {
    _applyAuth();
    return _dio.put('/v1/alerts/$id', data: data);
  }

  Future<Response> getAlertCountByStatus() async {
    _applyAuth();
    return await _dio.get('/v1/alerts/count/by-status');
  }

  Future<Response> getAlertSources() async {
    _applyAuth();
    return await _dio.get('/v1/alerts/sources');
  }

  Future<Response> getAlertTypes() async {
    _applyAuth();
    return await _dio.get('/v1/alerts/types');
  }

  Future<Response> getFilteredAlerts(Map<String, dynamic> params) async {
    _applyAuth();
    return await _dio.get('/v1/alerts/filter', queryParameters: params);
  }

  // Incidents API
  Future<Response> getIncidents() async {
    _applyAuth();
    return await _dio.get('/v1/incidents');
  }

  Future<Response> getActiveIncidents() async {
    _applyAuth();
    return await _dio.get('/v1/incidents/active');
  }

  Future<Response> getIncidentById(String id) async {
    _applyAuth();
    return await _dio.get('/v1/incidents/$id');
  }

  Future<Response> createIncident(Map<String, dynamic> data) async {
    _applyAuth();
    return await _dio.post('/v1/incidents', data: data);
  }

  Future<Response> updateIncident(String id, Map<String, dynamic> data) async {
    _applyAuth();
    return _dio.put('/v1/incidents/$id', data: data);
  }

  Future<Response> getIncidentCountByStatus() async {
    _applyAuth();
    return await _dio.get('/v1/incidents/count/by-status');
  }

  // Devices API
  Future<Response> getDevices() async {
    _applyAuth();
    return await _dio.get('/v1/devices');
  }

  Future<Response> getOnlineDevices() async {
    _applyAuth();
    return await _dio.get('/v1/devices/status/ONLINE');
  }

  // Response & Resources API
  Future<Response> getResources() async {
    _applyAuth();
    return _dio.get('/v1/resources');
  }

  Future<Response> getResourceById(String id) async {
    _applyAuth();
    return _dio.get('/v1/resources/$id');
  }

  Future<Response> getShelters() async {
    _applyAuth();
    return _dio.get('/v1/shelters');
  }

  Future<Response> getShelterById(String id) async {
    _applyAuth();
    return _dio.get('/v1/shelters/$id');
  }

  // Other APIs
  Future<Response> getDashboardOverview() async {
    _applyAuth();
    return _dio.get('/v1/dashboard/overview');
  }

  Future<WeatherData> getWeather(double latitude, double longitude) async {
    try {
      final response = await _dio.get(
        '/v1/public/weather/$latitude/$longitude',
      );
      final data = response.data is Map<String, dynamic>
          ? response.data['data']
          : response.data;
      return WeatherData.fromJson(Map<String, dynamic>.from(data as Map));
    } catch (e) {
      throw Exception('Failed to fetch weather: $e');
    }
  }

  Future<List<NewsArticle>> getNews() async {
    try {
      final response = await _dio.get('/v1/news');
      final data = response.data is Map<String, dynamic>
          ? response.data['data']
          : response.data;
      if (data is List) {
        return data
            .whereType<Map>()
            .map((item) => NewsArticle.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch news: $e');
    }
  }

  Future<Response> getNotifications() async {
    _applyAuth();
    return _dio.get('/v1/notifications');
  }
}

final crisisApi = ApiService();
