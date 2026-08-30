import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/alert_provider.dart';
import '../providers/incident_provider.dart';
import '../services/api_service.dart';
import 'alerts_screen.dart';
import 'incidents_screen.dart';
import 'devices_screen.dart';
import 'map_screen.dart';
import 'profile_screen.dart';
import 'report_incident_screen.dart';
import 'sos_screen.dart';
import 'shelters_screen.dart';
import 'weather_screen.dart';
import 'air_quality_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _index = 0;
  final _screens = const [
    DashboardTab(),
    MapScreen(),
    AlertsScreen(),
    DevicesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (index) => setState(() => _index = index),
        backgroundColor: Colors.white,
        elevation: 8,
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.grid_view_outlined),
              selectedIcon: Icon(Icons.grid_view_rounded),
              label: 'Home'),
          NavigationDestination(
              icon: Icon(Icons.map_outlined),
              selectedIcon: Icon(Icons.map_rounded),
              label: 'Map'),
          NavigationDestination(
              icon: Icon(Icons.notifications_none_rounded),
              selectedIcon: Icon(Icons.notifications_rounded),
              label: 'Alerts'),
          NavigationDestination(
              icon: Icon(Icons.sensors_outlined),
              selectedIcon: Icon(Icons.sensors_rounded),
              label: 'Sensors'),
          NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile'),
        ],
      ),
    );
  }
}

class DashboardTab extends ConsumerWidget {
  const DashboardTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final alertStats = ref.watch(alertStatsProvider);
    final incidentStats = ref.watch(incidentStatsProvider);
    final criticalAlerts = ref.watch(criticalAlertsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FC),
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/brand/crisismesh-icon.png',
                width: 32, height: 32),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hello, ${user?.name ?? 'Amit'}',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold)),
                const Text('Stay safe, stay updated',
                    style: TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
              onPressed: () {},
              icon: const Icon(Icons.notifications_none_rounded)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.search)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(alertStatsProvider);
          ref.invalidate(incidentStatsProvider);
          ref.invalidate(criticalAlertsProvider);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Risk Status Card
              criticalAlerts.when(
                data: (alerts) {
                  if (alerts.isEmpty) return const SizedBox.shrink();
                  final topAlert = alerts.first;
                  return _RiskCard(
                    title: topAlert['title'] ?? 'High Flood Risk',
                    location: topAlert['location'] ?? 'Patna, Bihar',
                    severity: topAlert['severity'] ?? 'CRITICAL',
                  );
                },
                loading: () => const _RiskCardSkeleton(),
                error: (_, __) => const SizedBox.shrink(),
              ),
              const SizedBox(height: 24),

              const Text('Quick Actions',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 4,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                children: [
                  _QuickAction(
                      icon: Icons.list_alt_rounded,
                      label: 'Incidents',
                      color: Colors.blue,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const IncidentsScreen()))),
                  _QuickAction(
                      icon: Icons.sos_rounded,
                      label: 'SOS',
                      color: Colors.red,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const SOSScreen()))),
                  _QuickAction(
                      icon: Icons.report_problem_outlined,
                      label: 'Report',
                      color: Colors.orange,
                      onTap: () =>
                          Navigator.pushNamed(context, '/report-incident')),
                  _QuickAction(
                      icon: Icons.warning_amber_rounded,
                      label: 'Alerts',
                      color: Colors.amber,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const AlertsScreen()))),
                  _QuickAction(
                      icon: Icons.home_repair_service_outlined,
                      label: 'Shelters',
                      color: Colors.teal,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const SheltersScreen()))),
                  _QuickAction(
                      icon: Icons.cloud_outlined,
                      label: 'Weather',
                      color: Colors.lightBlue,
                      onTap: () => Navigator.pushNamed(context, '/weather')),
                  _QuickAction(
                      icon: Icons.air_rounded,
                      label: 'AQI',
                      color: Colors.green,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const AirQualityScreen()))),
                  _QuickAction(
                      icon: Icons.more_horiz_rounded,
                      label: 'More',
                      color: Colors.grey,
                      onTap: () {}),
                ],
              ),

              const SizedBox(height: 24),
              const Text('Live Status',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                      child: _StatusMiniCard(
                          label: 'Incidents',
                          value: '${incidentStats.value?['total'] ?? 0}',
                          color: Colors.blue)),
                  const SizedBox(width: 12),
                  Expanded(
                      child: _StatusMiniCard(
                          label: 'Alerts',
                          value: '${alertStats.value?['total'] ?? 0}',
                          color: Colors.orange)),
                  const SizedBox(width: 12),
                  Expanded(
                      child: _StatusMiniCard(
                          label: 'Sensors', value: '124', color: Colors.green)),
                ],
              ),

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Active Incidents',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  TextButton(onPressed: () {}, child: const Text('View All')),
                ],
              ),
              ref.watch(incidentsProvider).when(
                    data: (incidents) {
                      if (incidents.isEmpty)
                        return const Center(child: Text('No active incidents'));
                      return Column(
                        children: incidents
                            .take(3)
                            .map(
                                (incident) => _IncidentCard(incident: incident))
                            .toList(),
                      );
                    },
                    loading: () =>
                        const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Text('Error: $e'),
                  ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RiskCard extends StatelessWidget {
  final String title;
  final String location;
  final String severity;

  const _RiskCard(
      {required this.title, required this.location, required this.severity});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0757E8),
        borderRadius: BorderRadius.circular(16),
        image: const DecorationImage(
          image: AssetImage('assets/dashboard/risk_bg.png'),
          fit: BoxFit.cover,
          opacity: 0.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4)),
                child: Text(severity,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold)),
              ),
              const Icon(Icons.info_outline, color: Colors.white, size: 20),
            ],
          ),
          const SizedBox(height: 12),
          Text(title,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on, color: Colors.white70, size: 14),
              const SizedBox(width: 4),
              Text(location,
                  style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF0757E8),
              minimumSize: const Size(double.infinity, 44),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('View Details',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

class _RiskCardSkeleton extends StatelessWidget {
  const _RiskCardSkeleton();
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
          color: Colors.grey[300], borderRadius: BorderRadius.circular(16)),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 4),
          Text(label,
              style:
                  const TextStyle(fontSize: 10, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _StatusMiniCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatusMiniCard(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE4EAF4))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value,
              style: TextStyle(
                  fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _IncidentCard extends StatelessWidget {
  final Map<String, dynamic> incident;

  const _IncidentCard({required this.incident});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.warning_amber_rounded, color: Colors.red),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(incident['type'] ?? 'Incident',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text(incident['status'] ?? 'Active',
                          style: const TextStyle(
                              fontSize: 10,
                              color: Colors.green,
                              fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(incident['title'] ?? 'No Title',
                      style: const TextStyle(
                          fontSize: 12, color: Color(0xFF102043))),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time,
                          size: 10, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text('2 hours ago',
                          style: const TextStyle(
                              fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
