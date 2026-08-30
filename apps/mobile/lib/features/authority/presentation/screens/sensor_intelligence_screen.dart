import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../services/api_service.dart';
import '../../../../services/websocket_service.dart';

class SensorIntelligenceScreen extends ConsumerStatefulWidget {
  const SensorIntelligenceScreen({super.key});

  @override
  ConsumerState<SensorIntelligenceScreen> createState() =>
      _SensorIntelligenceScreenState();
}

class _SensorIntelligenceScreenState
    extends ConsumerState<SensorIntelligenceScreen> {
  final _api = crisisApi;
  late Future<Map<String, dynamic>> _dashboardData;
  StreamSubscription<SocketEvent>? _eventsSubscription;

  @override
  void initState() {
    super.initState();
    _dashboardData = _load();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if (event.name == 'telemetry.updated' && mounted) {
        setState(() => _dashboardData = _load());
      }
    });
  }

  @override
  void dispose() {
    _eventsSubscription?.cancel();
    super.dispose();
  }

  Future<Map<String, dynamic>> _load() async {
    final response = await _api.getDashboardOverview();
    return Map<String, dynamic>.from(response.data);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FD),
      appBar: AppBar(
        title: const Text('Sensor Intelligence',
            style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF102043),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => setState(() => _dashboardData = _load()),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _dashboardData,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(child: Text('Error loading intelligence data'));
          }

          final data = snapshot.data?['data'] ?? {};
          final metrics = data['metrics'] ?? {};
          final telemetry = data['telemetry'] as List? ?? [];

          final totalDevices = metrics['total_devices'] ?? 0;
          final onlineDevices = metrics['online_devices'] ?? 0;
          final healthPercent = totalDevices > 0
              ? (onlineDevices / totalDevices * 100).toInt()
              : 0;

          return RefreshIndicator(
            onRefresh: () async => setState(() => _dashboardData = _load()),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildOverallHealth(
                      onlineDevices, totalDevices, healthPercent),
                  const SizedBox(height: 24),
                  const Text(
                    'Recent Telemetry',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF102043)),
                  ),
                  const SizedBox(height: 12),
                  if (telemetry.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Center(
                          child: Text('No recent telemetry received',
                              style: TextStyle(color: Colors.grey))),
                    ),
                  ...telemetry.take(10).map((t) => _buildTelemetryReading(t)),
                  const SizedBox(height: 24),
                  const Text(
                    'Network Metrics',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF102043)),
                  ),
                  const SizedBox(height: 12),
                  _buildMetricRow('Critical Alerts',
                      '${metrics['critical_alerts'] ?? 0}', Colors.red),
                  _buildMetricRow('Active Alerts',
                      '${metrics['active_alerts'] ?? 0}', Colors.orange),
                  _buildMetricRow('Open Incidents',
                      '${metrics['open_incidents'] ?? 0}', Colors.blue),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildOverallHealth(int online, int total, int percent) {
    final isHealthy = percent > 90;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isHealthy ? const Color(0xFFE8F7EF) : const Color(0xFFFFEFF0),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color:
                isHealthy ? const Color(0xFFD1F0DE) : const Color(0xFFFBD5D8)),
      ),
      child: Row(
        children: [
          Icon(isHealthy ? Icons.check_circle : Icons.warning_rounded,
              color:
                  isHealthy ? const Color(0xFF09A86B) : const Color(0xFFD92835),
              size: 40),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isHealthy ? 'Network Healthy' : 'Network Issues Detected',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isHealthy
                          ? const Color(0xFF09A86B)
                          : const Color(0xFFD92835)),
                ),
                Text(
                  '$online/$total sensors reporting correctly ($percent%).',
                  style: TextStyle(
                      color: isHealthy
                          ? const Color(0xFF09A86B).withValues(alpha: 0.8)
                          : const Color(0xFFD92835).withValues(alpha: 0.8),
                      fontSize: 13,
                      fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryReading(Map<String, dynamic> t) {
    final metric = t['metric'] ?? 'Unknown';
    final value = t['value']?.toString() ?? '0';
    final unit = t['unit'] ?? '';
    final deviceName = t['device_name'] ??
        'Sensor ${t['device_id']?.toString().substring(0, 4)}';
    final quality = t['quality_flag'] ?? 'GOOD';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF0F3F8),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.show_chart,
                color: Color(0xFF0757E8), size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(deviceName.toUpperCase(),
                    style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF65728A))),
                const SizedBox(height: 2),
                Text(metric,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF102043),
                        fontSize: 15)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('$value$unit',
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0757E8))),
              Text(quality,
                  style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: quality == 'GOOD' ? Colors.green : Colors.orange)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricRow(String label, String value, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(
                  fontWeight: FontWeight.w600, color: Color(0xFF102043))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20)),
            child: Text(value,
                style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
