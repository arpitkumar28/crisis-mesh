import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../providers/incident_provider.dart';
import '../../../../providers/alert_provider.dart';

class ResponderDashboardScreen extends ConsumerWidget {
  const ResponderDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final incidentsAsync = ref.watch(incidentsProvider);
    final alertsAsync = ref.watch(alertsProvider);
    final incidentStats = ref.watch(incidentStatsProvider);
    final alertStats = ref.watch(alertStatsProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(incidentsProvider);
        ref.invalidate(alertsProvider);
        ref.invalidate(incidentStatsProvider);
        ref.invalidate(alertStatsProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(user?.name ?? 'Responder'),
            const SizedBox(height: 24),
            _buildStatusToggle(),
            const SizedBox(height: 24),
            _buildStatsGrid(incidentStats, alertStats, incidentsAsync, alertsAsync),
            const SizedBox(height: 24),
            _buildQuickActions(context),
            const SizedBox(height: 24),
            _buildRecentIncidentsHeader(),
            const SizedBox(height: 12),
            incidentsAsync.when(
              data: (incidents) => incidents.isEmpty
                  ? const Center(child: Text('No incidents assigned'))
                  : Column(
                      children: incidents.take(3).map((incident) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildIncidentCard(
                            title: incident['type'] ?? 'Incident',
                            location: incident['location_name'] ?? 'Unknown location',
                            severity: incident['severity'] ?? 'MEDIUM',
                            time: 'Live', // You could parse timestamp here
                            color: _getSeverityColor(incident['severity']),
                          ),
                        );
                      }).toList(),
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(String? severity) {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return Colors.red;
      case 'HIGH':
        return Colors.orange;
      case 'MEDIUM':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  Widget _buildHeader(String name) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, $name 👋',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const Text(
              'Stay safe, save lives.',
              style: TextStyle(color: Color(0xFF65728A)),
            ),
          ],
        ),
        const CircleAvatar(
          radius: 24,
          backgroundColor: Color(0xFFE4EAF4),
          child: Icon(Icons.person, color: Color(0xFF0757E8)),
        ),
      ],
    );
  }

  Widget _buildStatusToggle() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F7EF),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: const BoxDecoration(
              color: Color(0xFF09A86B),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'On Duty',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF09A86B),
              ),
            ),
          ),
          Switch(
            value: true,
            onChanged: (v) {},
            activeThumbColor: const Color(0xFF09A86B),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(
    AsyncValue<dynamic> incidentStats,
    AsyncValue<dynamic> alertStats,
    AsyncValue<List<dynamic>> incidents,
    AsyncValue<List<dynamic>> alerts,
  ) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          'Assigned to Me',
          incidents.maybeWhen(data: (d) => d.length.toString(), orElse: () => '...'),
          Icons.assignment_outlined,
          const Color(0xFF0757E8),
        ),
        _buildStatCard(
          'Active Incidents',
          incidentStats.maybeWhen(data: (d) => (d is Map ? (d['ACTIVE'] ?? 0).toString() : '0'), orElse: () => '...'),
          Icons.local_fire_department_outlined,
          Colors.orange,
        ),
        _buildStatCard(
          'Nearby Teams',
          '5',
          Icons.group_outlined,
          Colors.purple,
        ),
        _buildStatCard(
          'Active Alerts',
          alerts.maybeWhen(data: (d) => d.length.toString(), orElse: () => '...'),
          Icons.warning_amber_rounded,
          Colors.red,
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String count, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                count,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF102043),
                ),
              ),
              Icon(icon, color: color, size: 20),
            ],
          ),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF65728A),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF102043),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildActionButton(Icons.sos, 'SOS', Colors.red),
            _buildActionButton(Icons.report_problem, 'Report', Colors.orange),
            _buildActionButton(Icons.map, 'Map', Colors.blue),
            _buildActionButton(Icons.inventory_2, 'Resources', Colors.green),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton(IconData icon, String label, Color color) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildRecentIncidentsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'Assigned Incidents',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF102043),
          ),
        ),
        TextButton(
          onPressed: () {},
          child: const Text('View All'),
        ),
      ],
    );
  }

  Widget _buildIncidentCard({
    required String title,
    required String location,
    required String severity,
    required String time,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.emergency_outlined, color: Colors.blue),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF102043),
                      ),
                    ),
                    Text(
                      severity,
                      style: TextStyle(
                        color: color,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  location,
                  style: const TextStyle(color: Color(0xFF65728A), fontSize: 13),
                ),
                const SizedBox(height: 4),
                Text(
                  time,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
        ],
      ),
    );
  }
}
