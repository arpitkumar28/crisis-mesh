import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../services/api_service.dart';
import '../../../../services/websocket_service.dart';
import 'alert_creation_screen.dart';
import 'live_situation_screen.dart';
import 'sensor_intelligence_screen.dart';

class AuthorityDashboardScreen extends ConsumerStatefulWidget {
  const AuthorityDashboardScreen({super.key});

  @override
  ConsumerState<AuthorityDashboardScreen> createState() => _AuthorityDashboardScreenState();
}

class _AuthorityDashboardScreenState extends ConsumerState<AuthorityDashboardScreen> {
  final _api = crisisApi;
  late Future<Map<String, dynamic>> _dashboardData;
  StreamSubscription<SocketEvent>? _eventsSubscription;

  @override
  void initState() {
    super.initState();
    _dashboardData = _load();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if (mounted) {
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
    return RefreshIndicator(
      onRefresh: () async => setState(() => _dashboardData = _load()),
      child: FutureBuilder<Map<String, dynamic>>(
        future: _dashboardData,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(child: Text('Error loading dashboard'));
          }

          final data = snapshot.data?['data'] ?? {};
          final metrics = data['metrics'] ?? {};
          final alerts = data['alerts'] as List? ?? [];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                _buildLiveStatusOverview(metrics),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text(
                      'Critical Alerts',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
                    ),
                    if (alerts.length > 5)
                      TextButton(
                        onPressed: () {},
                        child: const Text('View All'),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (alerts.isEmpty)
                  const Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No active alerts', style: TextStyle(color: Colors.grey)))),
                ...alerts.take(3).map((alert) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _buildAlertCard(
                    title: alert['title'] ?? 'Alert',
                    location: alert['location']?['name'] ?? 'Unknown Location',
                    severity: alert['severity'] ?? 'UNKNOWN',
                    time: _formatTime(alert['issued_at']),
                  ),
                )),
                const SizedBox(height: 24),
                const Text(
                  'Resource Overview',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
                ),
                const SizedBox(height: 12),
                _buildResourceStats(metrics),
                const SizedBox(height: 24),
                _buildActionButtons(context),
              ],
            ),
          );
        },
      ),
    );
  }

  String _formatTime(String? timestamp) {
    if (timestamp == null) return 'N/A';
    try {
      final date = DateTime.parse(timestamp);
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 60) return '${diff.inMinutes} mins ago';
      if (diff.inHours < 24) return '${diff.inHours} hours ago';
      return '${diff.inDays} days ago';
    } catch (_) {
      return 'N/A';
    }
  }

  Widget _buildHeader() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Authority Dashboard',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF102043),
          ),
        ),
        Text(
          'District Command & Control Center',
          style: TextStyle(color: Color(0xFF65728A)),
        ),
      ],
    );
  }

  Widget _buildLiveStatusOverview(Map metrics) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Active Incidents', '${metrics['open_incidents'] ?? 0}', Colors.red),
              _buildStatItem('Critical Alerts', '${metrics['critical_alerts'] ?? 0}', Colors.orange),
              _buildStatItem('Online Devices', '${metrics['online_devices'] ?? 0}', Colors.blue),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 10, color: Color(0xFF65728A), fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildAlertCard({
    required String title,
    required String location,
    required String severity,
    required String time,
  }) {
    final isCritical = severity == 'CRITICAL';
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCritical ? const Color(0xFFFFEFF0) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isCritical ? Colors.red.withValues(alpha: 0.2) : const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Icon(Icons.warning_rounded, color: isCritical ? Colors.red : Colors.orange, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF102043)),
                ),
                Text('$location · $time', style: const TextStyle(color: Color(0xFF65728A), fontSize: 13)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: isCritical ? Colors.red : const Color(0xFF0757E8),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              elevation: 0,
            ),
            child: const Text('View'),
          ),
        ],
      ),
    );
  }

  Widget _buildResourceStats(Map metrics) {
    return Row(
      children: [
        Expanded(child: _buildSimpleStatCard('Devices', '${metrics['total_devices'] ?? 0}', Icons.sensors, Colors.blue)),
        const SizedBox(width: 12),
        Expanded(child: _buildSimpleStatCard('Active Alerts', '${metrics['active_alerts'] ?? 0}', Icons.notifications_active, Colors.orange)),
      ],
    );
  }

  Widget _buildSimpleStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 2.5,
      children: [
        _buildActionTile(context, Icons.add_alert, 'Create Alert', const Color(0xFF0757E8), () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const AlertCreationScreen()));
        }),
        _buildActionTile(context, Icons.map, 'Live Situation', Colors.green, () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveSituationScreen()));
        }),
        _buildActionTile(context, Icons.analytics, 'Sensors', Colors.purple, () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const SensorIntelligenceScreen()));
        }),
        _buildActionTile(context, Icons.settings, 'Settings', Colors.grey, () {}),
      ],
    );
  }

  Widget _buildActionTile(BuildContext context, IconData icon, String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.1)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
