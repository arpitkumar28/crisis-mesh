import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../services/api_service.dart';
import '../../../../services/websocket_service.dart';
import 'alert_creation_screen.dart';
import 'live_situation_screen.dart';
import 'live_alerts_screen.dart';
import 'district_intelligence_screen.dart';
import 'resource_deployment_screen.dart';
import 'broadcast_center_screen.dart';
import '../../../../screens/incidents_screen.dart';

class AuthorityDashboardScreen extends ConsumerStatefulWidget {
  const AuthorityDashboardScreen({super.key});

  @override
  ConsumerState<AuthorityDashboardScreen> createState() =>
      _AuthorityDashboardScreenState();
}

class _AuthorityDashboardScreenState
    extends ConsumerState<AuthorityDashboardScreen> {
  int _currentIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const DashboardHome(),
      const DistrictIntelligenceScreen(),
      const LiveAlertsScreen(),
      const ResourceDeploymentScreen(), // Office tab
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF0757E8),
          unselectedItemColor: const Color(0xFF65728A),
          currentIndex: _currentIndex,
          elevation: 0,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.grid_view_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.analytics_outlined),
              label: 'Analytics',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.notifications_none_rounded),
              label: 'Alerts',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.business_center_outlined),
              label: 'Office',
            ),
          ],
        ),
      ),
    );
  }
}

class DashboardHome extends ConsumerStatefulWidget {
  const DashboardHome({super.key});

  @override
  ConsumerState<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends ConsumerState<DashboardHome> {
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
    try {
      final response = await _api.getDashboardOverview();
      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      return {
        'data': {
          'metrics': {
            'open_incidents': 12,
            'critical_alerts': 4,
          },
          'alerts': []
        }
      };
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async => setState(() => _dashboardData = _load()),
        child: FutureBuilder<Map<String, dynamic>>(
          future: _dashboardData,
          builder: (context, snapshot) {
            final data = snapshot.data?['data'] ?? {};
            final metrics = data['metrics'] ?? {};
            
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildBrandHeader(),
                  const SizedBox(height: 24),
                  _buildProfileHeader(),
                  const SizedBox(height: 24),
                  _buildStatsGrid(metrics),
                  const SizedBox(height: 32),
                  const Text(
                    'Quick Actions',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF102043),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildQuickActions(context),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildBrandHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Image.asset('assets/brand/crisismesh-icon.png', width: 28, height: 28),
            const SizedBox(width: 8),
            const Text(
              'CRISIS',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const Text(
              'MESH',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0757E8),
              ),
            ),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.notifications_none_rounded, color: Color(0xFF102043)),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildProfileHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, District Admin',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.location_on, size: 14, color: Colors.grey),
                SizedBox(width: 4),
                Text(
                  'Jaipur, Rajasthan',
                  style: TextStyle(color: Colors.grey, fontSize: 13),
                ),
              ],
            ),
          ],
        ),
        Text(
          '24 Aug 2023',
          style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildStatsGrid(Map metrics) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.5,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      children: [
        _buildStatCard('Active Incidents', '${metrics['open_incidents'] ?? 12}', true),
        _buildStatCard('High Risk', '${metrics['critical_alerts'] ?? 4}', true),
        _buildStatCard('Affected People', '5,234', false),
        _buildStatCard('Responders', '86', false),
        _buildStatCard('Shelters', '15', false),
        _buildStatCard('Alerts Today', '7', false),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, bool showTrend) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF65728A),
              fontWeight: FontWeight.w500,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF102043),
                ),
              ),
              if (showTrend)
                const Icon(Icons.north_east, size: 16, color: Colors.red),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildActionButton(context, Icons.add_alert_rounded, 'Alert', Colors.red, () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const AlertCreationScreen()));
        }),
        _buildActionButton(context, Icons.warning_amber_rounded, 'Incidents', Colors.orange, () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const IncidentsScreen()));
        }),
        _buildActionButton(context, Icons.map_outlined, 'Map', Colors.blue, () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveSituationScreen()));
        }),
        _buildActionButton(context, Icons.campaign_outlined, 'Broadcast', Colors.purple, () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const BroadcastCenterScreen()));
        }),
      ],
    );
  }

  Widget _buildActionButton(BuildContext context, IconData icon, String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Color(0xFF102043),
            ),
          ),
        ],
      ),
    );
  }
}
