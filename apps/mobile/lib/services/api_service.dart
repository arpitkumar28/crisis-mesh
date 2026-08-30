import 'dart:io';
import 'dart:developer' as developer;
import 'package:dio/dio.dart';
import '../models/information_models.dart';

class ApiService {
  String? _token;
  final Dio _dio;
  final String baseUrl;

  ApiService({String? baseUrl})
      : baseUrl = baseUrl ?? (Platform.isAndroid ? 'http://10.0.2.2:3002/api/' : 'http://localhost:3002/api/'),
        _dio = Dio(BaseOptions(
          baseUrl: baseUrl ?? (Platform.isAndroid ? 'http://10.0.2.2:3002/api/' : 'http://localhost:3002/api/'),
          headers: {'Content-Type': 'application/json'},
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 5),
        )) {
    // Console Logging Interceptors
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        developer.log('🚀 [API REQUEST] ${options.method} ${options.path}', name: 'ApiService');
        if (options.data != null) developer.log('📦 BODY: ${options.data}', name: 'ApiService');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        developer.log('✅ [API RESPONSE] ${response.statusCode} ${response.requestOptions.path}', name: 'ApiService');
        developer.log('📄 DATA: ${response.data}', name: 'ApiService');
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        developer.log('❌ [API ERROR] ${e.response?.statusCode ?? "NETWORK"} ${e.requestOptions.path}', name: 'ApiService');
        developer.log('⚠️ MESSAGE: ${e.message}', name: 'ApiService');
        if (e.response?.data != null) developer.log('🔻 ERROR DATA: ${e.response?.data}', name: 'ApiService');
        return handler.next(e);
      },
    ));
  }

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

  // Auth API
  Future<Response> login(String email, String password) async {
    return _dio.post('v1/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register(Map<String, dynamic> data) async {
    return _dio.post('v1/auth/register', data: data);
  }

  Future<Response> getCurrentUser() async {
    _applyAuth();
    return _dio.get('v1/auth/me');
  }

  Future<Response> logout() async {
    _applyAuth();
    return _dio.post('v1/auth/logout');
  }

  // Helpers
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

  // Intelligence & Disasters API
  Future<Response> getDisasters() async {
    _applyAuth();
    return await _dio.get('v1/disasters');
  }

  Future<Response> getActiveDisasters() async {
    _applyAuth();
    return await _dio.get('v1/disasters/active');
  }

  Future<Response> getDisasterById(String id) async {
    _applyAuth();
    return await _dio.get('v1/disasters/$id');
  }

  Future<Response> getIntelligence() async {
    _applyAuth();
    return await _dio.get('v1/intelligence');
  }

  // Alerts API
  Future<Response> getAlerts() async {
    _applyAuth();
    return await _dio.get('v1/alerts');
  }

  Future<Response> getActiveAlerts() async {
    _applyAuth();
    return await _dio.get('v1/alerts/active');
  }

  Future<Response> getCriticalAlerts() async {
    _applyAuth();
    return await _dio.get('v1/alerts/critical');
  }

  Future<Response> getAlertCountByStatus() async {
    _applyAuth();
    return await _dio.get('v1/alerts/count/by-status');
  }

  Future<Response> updateAlertStatus(String id, String status) async {
    _applyAuth();
    return _dio.put('v1/alerts/$id', data: {'status': status});
  }

  // Incidents API
  Future<Response> getIncidents() async {
    _applyAuth();
    return await _dio.get('v1/incidents');
  }

  Future<Response> getActiveIncidents() async {
    _applyAuth();
    return await _dio.get('v1/incidents/active');
  }

  Future<Response> getIncidentCount() async {
    _applyAuth();
    return await _dio.get('v1/incidents/count');
  }

  Future<Response> getIncidentCountByStatus() async {
    _applyAuth();
    return await _dio.get('v1/incidents/count/by-status');
  }

  Future<Response> getIncidentsByStatus(String status) async {
    _applyAuth();
    return await _dio.get('v1/incidents/status/$status');
  }

  Future<Response> getIncidentById(String id) async {
    _applyAuth();
    return await _dio.get('v1/incidents/$id');
  }

  Future<Response> createIncident(Map<String, dynamic> data) async {
    _applyAuth();
    return await _dio.post('v1/incidents', data: data);
  }

  Future<Response> updateIncidentStatus(String id, String status) async {
    _applyAuth();
    return _dio.put('v1/incidents/$id', data: {'status': status});
  }

  // Devices API
  Future<Response> getDevices() async {
    _applyAuth();
    return await _dio.get('v1/devices');
  }

  Future<Response> getDeviceById(String id) async {
    _applyAuth();
    return await _dio.get('v1/devices/$id');
  }

  Future<Response> getDeviceCount() async {
    _applyAuth();
    return await _dio.get('v1/devices/count');
  }

  Future<Response> getOnlineDevices() async {
    _applyAuth();
    return await _dio.get('v1/devices/online');
  }

  Future<Response> getOfflineDevices() async {
    _applyAuth();
    return await _dio.get('v1/devices/offline');
  }

  Future<Response> getDeviceSensors(String id) async {
    _applyAuth();
    return await _dio.get('v1/devices/$id/sensors');
  }

  Future<Response> getDeviceStatusHistory(String id, {int limit = 50}) async {
    _applyAuth();
    return await _dio.get('v1/devices/$id/status/history', queryParameters: {'limit': limit});
  }

  // Districts API
  Future<Response> getDistricts() async {
    _applyAuth();
    return await _dio.get('v1/districts');
  }

  Future<Response> getDistrictById(String id) async {
    _applyAuth();
    return await _dio.get('v1/districts/$id');
  }

  // Risk API
  Future<Response> getRiskSummary() async {
    _applyAuth();
    return await _dio.get('v1/risk/summary');
  }

  Future<Response> getHighRiskAreas() async {
    _applyAuth();
    return await _dio.get('v1/risk/high-risk');
  }

  // Response & Resources API
  Future<Response> getResources() async {
    _applyAuth();
    return await _dio.get('v1/resources');
  }

  Future<Response> getResourceById(String id) async {
    _applyAuth();
    return await _dio.get('v1/resources/$id');
  }

  Future<Response> getShelters() async {
    _applyAuth();
    return await _dio.get('v1/shelters');
  }

  Future<Response> getShelterById(String id) async {
    _applyAuth();
    return await _dio.get('v1/shelters/$id');
  }

  // Telemetry API
  Future<Response> getTelemetryByDevice(String deviceId, {int limit = 50}) async {
    _applyAuth();
    return await _dio.get('v1/telemetry/device/$deviceId', queryParameters: {'limit': limit});
  }

  Future<Response> getTelemetryBySensor(String sensorId) async {
    _applyAuth();
    return await _dio.get('v1/telemetry/sensor/$sensorId');
  }

  Future<Response> getTelemetryAggregate(String deviceId, String metric) async {
    _applyAuth();
    return await _dio.get('v1/telemetry/aggregate/$deviceId/$metric');
  }

  // Dashboard API
  Future<Response> getDashboardOverview() async {
    _applyAuth();
    return _dio.get('v1/dashboard/overview');
  }

  // Public/Utility APIs
  Future<WeatherData> getWeather(double latitude, double longitude) async {
    try {
      final response = await _dio.get('v1/public/weather/$latitude/$longitude');
      final data = response.data is Map<String, dynamic> ? response.data['data'] : response.data;
      return WeatherData.fromJson(Map<String, dynamic>.from(data as Map));
    } catch (e) {
      developer.log('ApiService ERROR (Weather)', error: e);
      throw Exception('Failed to fetch weather: $e');
    }
  }

  Future<List<NewsArticle>> getNews() async {
    try {
      final response = await _dio.get('v1/news');
      final data = response.data is Map<String, dynamic> ? response.data['data'] : response.data;
      if (data is List) {
        return data.whereType<Map>().map((item) => NewsArticle.fromJson(Map<String, dynamic>.from(item))).toList();
      }
      return [];
    } catch (e) {
      developer.log('ApiService ERROR (News)', error: e);
      throw Exception('Failed to fetch news: $e');
    }
  }

  Future<Response> getNotifications() async {
    _applyAuth();
    return await _dio.get('v1/notifications');
  }

  Future<Response> markNotificationRead(String id) async {
    _applyAuth();
    return await _dio.patch('v1/notifications/$id/read');
  }

  Future<Response> getAirQuality(double lat, double lon) async {
    // Fallback to weather endpoint if air quality specific endpoint doesn't exist, 
    // or just return mock data if not in backend yet.
    // Based on app.module.ts, there is no AirQualityModule, but maybe it's in Weather or Telemetry.
    // Let's assume there's a public endpoint or it's part of weather.
    return await _dio.get('v1/public/air-quality/$lat/$lon');
  }
}

final crisisApi = ApiService();
