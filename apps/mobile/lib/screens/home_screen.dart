import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'alerts_screen.dart';
import 'incidents_screen.dart';
import 'devices_screen.dart';
import 'map_screen.dart';
import 'profile_screen.dart';

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

  Future<void> _logout() async {
    await ref.read(authProvider.notifier).logout();
    if (mounted) Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(children: [Icon(Icons.shield_outlined, color: Color(0xFF0757E8)), SizedBox(width: 7), Text('CRISISMESH', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: .4))]),
        actions: [
          PopupMenuButton<String>(onSelected: (value) { if (value == 'incidents') Navigator.of(context).push(MaterialPageRoute(builder: (_) => Scaffold(appBar: AppBar(title: const Text('Incidents')), body: const IncidentsScreen()))); if (value == 'logout') _logout(); }, itemBuilder: (context) => const [PopupMenuItem(value: 'incidents', child: Text('Incidents')), PopupMenuItem(value: 'logout', child: Text('Log out'))]),
        ],
      ),
      body: _screens[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (index) => setState(() => _index = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.map_outlined), label: 'Map'),
          NavigationDestination(icon: Icon(Icons.warning_outlined), label: 'Alerts'),
          NavigationDestination(icon: Icon(Icons.sensors_outlined), label: 'Devices'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
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
    return FutureBuilder<dynamic>(
      future: crisisApi.getActiveAlerts(),
      builder: (context, snapshot) {
        final data = snapshot.data?.data['data'];
        final alerts = data is List ? data : <dynamic>[];
        final critical = alerts.where((item) => item['severity'] == 'CRITICAL').length;
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hello, ${user?.name ?? 'Operator'}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700, color: const Color(0xFF102043))),
              const SizedBox(height: 4),
              const Text('Your live disaster situation overview', style: TextStyle(color: Color(0xFF65728A))),
              const SizedBox(height: 20),
              Card(
                color: critical > 0 ? const Color(0xFFFFEFF0) : const Color(0xFFE8F7EF),
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Icon(critical > 0 ? Icons.warning_rounded : Icons.check_circle, color: critical > 0 ? const Color(0xFFD92835) : const Color(0xFF159B55), size: 32),
                      const SizedBox(width: 12),
                      Expanded(child: Text(critical > 0 ? '$critical critical alert(s) require attention' : 'CURRENT SAFETY\nSAFE · No critical alerts', style: const TextStyle(fontWeight: FontWeight.bold))),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text('Priority alerts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
              const SizedBox(height: 8),
              if (alerts.isEmpty) const Text('No active alerts reported'),
              ...alerts.take(3).map((item) => ListTile(contentPadding: EdgeInsets.zero, leading: const Icon(Icons.warning, color: Colors.red), title: Text('${item['title'] ?? item['type'] ?? 'Alert'}'), subtitle: Text('${item['severity'] ?? 'UNKNOWN'} · ${item['status'] ?? 'ACTIVE'}'))),
              const SizedBox(height: 16),
              const Text('Emergency actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
              Row(children: [Expanded(child: OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.sos), label: const Text('SOS'))), const SizedBox(width: 12), Expanded(child: OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.report), label: const Text('Report')))]),
            ],
          ),
        );
      },
    );
  }
}
