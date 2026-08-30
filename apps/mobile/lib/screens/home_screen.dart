import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/alert_provider.dart';
import '../providers/incident_provider.dart';
import 'alerts_screen.dart';
import 'map_screen.dart';
import 'profile_screen.dart';
import 'report_incident_screen.dart';
import 'sos_screen.dart';
import 'weather_screen.dart';
import 'shelters_screen.dart';

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
    SOSScreen(), 
    AlertsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: IndexedStack(
        index: _index,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        height: 90,
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.grid_view_outlined, Icons.grid_view_rounded, 'Home'),
                _buildNavItem(1, Icons.map_outlined, Icons.map_rounded, 'Map'),
                const SizedBox(width: 60),
                _buildNavItem(3, Icons.notifications_none_rounded, Icons.notifications_rounded, 'Alerts'),
                _buildNavItem(4, Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
              ],
            ),
            Positioned(
              top: 5,
              child: GestureDetector(
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SOSScreen())),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: const Color(0xFFD92835),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFD92835).withValues(alpha: 0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text('SOS', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900)),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text('SOS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD92835))),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, IconData activeIcon, String label) {
    final isSelected = _index == index;
    final color = isSelected ? const Color(0xFF0757E8) : const Color(0xFF65728A);
    return InkWell(
      onTap: () => setState(() => _index = index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(isSelected ? activeIcon : icon, color: color, size: 24),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
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
    final criticalAlerts = ref.watch(criticalAlertsProvider);

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(criticalAlertsProvider);
          ref.invalidate(incidentsProvider);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context, user?.name ?? 'Amit'),
              const SizedBox(height: 24),
              
              // Risk Status Gradient Card
              criticalAlerts.when(
                data: (alerts) {
                  if (alerts.isEmpty) return _buildSafeStatusCard();
                  final topAlert = alerts.first;
                  return _buildRiskCard(
                    title: topAlert['title'] ?? 'High Flood Risk',
                    location: topAlert['location'] ?? 'Jaipur, Rajasthan',
                    severity: topAlert['severity'] ?? 'CRITICAL',
                  );
                },
                loading: () => Container(height: 160, decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(16))),
                error: (_, __) => _buildSafeStatusCard(),
              ),
              
              const SizedBox(height: 32),
              const Text('Quick Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
              const SizedBox(height: 16),
              _buildQuickActions(context),
              
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Updates Near You', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
                  TextButton(onPressed: () {}, child: const Text('View Map')),
                ],
              ),
              _buildRecentActivity(ref),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String name) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Image.asset('assets/brand/crisismesh-icon.png', width: 24, height: 24),
                const SizedBox(width: 8),
                const Text('CRISIS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
                const Text('MESH', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0757E8))),
              ],
            ),
            const SizedBox(height: 12),
            Text('Hello, $name 👋', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
            const Text('Stay safe, stay updated', style: TextStyle(color: Color(0xFF65728A), fontSize: 13)),
          ],
        ),
        Stack(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFD), shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE4EAF4))),
              child: const Icon(Icons.notifications_none_rounded, color: Color(0xFF102043)),
            ),
            Positioned(right: 4, top: 4, child: Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle))),
          ],
        ),
      ],
    );
  }

  Widget _buildSafeStatusCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F7EF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFD1F0DE)),
      ),
      child: const Row(
        children: [
          Icon(Icons.check_circle_rounded, color: Color(0xFF09A86B), size: 40),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('You are currently safe', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF09A86B))),
                Text('No critical alerts in your vicinity.', style: TextStyle(color: Color(0xFF09A86B), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskCard({required String title, required String location, required String severity}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0757E8),
        borderRadius: BorderRadius.circular(20),
        image: const DecorationImage(image: AssetImage('assets/dashboard/risk_bg.png'), fit: BoxFit.cover, opacity: 0.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                child: Text(severity, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 24),
            ],
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on, color: Colors.white70, size: 14),
              const SizedBox(width: 4),
              Text(location, style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF0757E8),
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: const Text('Get Safety Instructions', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildActionItem(context, Icons.report_problem_rounded, 'Report', Colors.orange, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportIncidentScreen()))),
        _buildActionItem(context, Icons.home_repair_service_rounded, 'Shelters', Colors.teal, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SheltersScreen()))),
        _buildActionItem(context, Icons.cloud_rounded, 'Weather', Colors.blue, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WeatherScreen()))),
        _buildActionItem(context, Icons.info_outline_rounded, 'First Aid', Colors.purple, () {}),
      ],
    );
  }

  Widget _buildActionItem(BuildContext context, IconData icon, String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF102043))),
        ],
      ),
    );
  }

  Widget _buildRecentActivity(WidgetRef ref) {
    final incidents = ref.watch(incidentsProvider);
    return incidents.when(
      data: (data) => Column(
        children: data.take(3).map((i) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: const Color(0xFFF8FAFD), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE4EAF4))),
          child: Row(
            children: [
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), shape: BoxShape.circle), child: const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 20)),
              const SizedBox(width: 16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(i['type'] ?? 'Incident', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043))),
                Text(i['title'] ?? 'Response in progress', style: const TextStyle(fontSize: 12, color: Color(0xFF65728A)), maxLines: 1, overflow: TextOverflow.ellipsis),
              ])),
              const Icon(Icons.chevron_right, color: Color(0xFFDCE3F0)),
            ],
          ),
        )).toList(),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const Text('Unable to load updates'),
    );
  }
}
