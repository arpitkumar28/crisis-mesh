import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../providers/auth_provider.dart';
import '../../../../providers/incident_provider.dart';
import 'assigned_incidents_screen.dart';
import 'live_response_map_screen.dart';
import 'resource_tracking_screen.dart';
import 'responder_notifications_screen.dart';
import 'responder_availability_screen.dart';
import 'team_members_screen.dart';

class ResponderDashboardScreen extends ConsumerStatefulWidget {
  const ResponderDashboardScreen({super.key});

  @override
  ConsumerState<ResponderDashboardScreen> createState() => _ResponderDashboardScreenState();
}

class _ResponderDashboardScreenState extends ConsumerState<ResponderDashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(incidentsProvider);
            ref.invalidate(incidentStatsProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context),
                const SizedBox(height: 24),
                _buildDutyToggle(),
                const SizedBox(height: 24),
                _buildStatsGrid(),
                const SizedBox(height: 32),
                const Text(
                  'Quick Actions',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
                ),
                const SizedBox(height: 16),
                _buildQuickActions(context),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Assigned Incidents',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
                    ),
                    TextButton(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AssignedIncidentsScreen())),
                      child: const Text('View All'),
                    ),
                  ],
                ),
                _buildIncidentsList(),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(border: Border(top: BorderSide(color: Colors.grey.shade200))),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF0757E8),
          unselectedItemColor: const Color(0xFF65728A),
          currentIndex: _currentIndex,
          elevation: 0,
          onTap: (index) {
            setState(() => _currentIndex = index);
            if (index == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveResponseMapScreen()));
            if (index == 4) Navigator.push(context, MaterialPageRoute(builder: (_) => const ResponderAvailabilityScreen()));
          },
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.list_alt_rounded), label: 'Tasks'),
            BottomNavigationBarItem(icon: Icon(Icons.map_outlined), label: 'Map'),
            BottomNavigationBarItem(icon: Icon(Icons.notifications_none_rounded), label: 'Alerts'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), label: 'Office'),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final user = ref.watch(authProvider).user;
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
            Text(
              'Hello, ${user?.name ?? 'Amit'} 👋',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const Text('Stay safe, save lives.', style: TextStyle(color: Color(0xFF65728A), fontSize: 13)),
          ],
        ),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ResponderNotificationsScreen())),
          child: const CircleAvatar(
            radius: 24,
            backgroundColor: Color(0xFFF0F3F8),
            child: Icon(Icons.person, color: Color(0xFF0757E8)),
          ),
        ),
      ],
    );
  }

  Widget _buildDutyToggle() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F7EF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD1F0DE)),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(color: Color(0xFF09A86B), shape: BoxShape.circle),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'On Duty',
              style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF09A86B), fontSize: 14),
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

  Widget _buildStatsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.6,
      children: [
        _buildStatCard('Assigned to me', '2', Icons.assignment_outlined, const Color(0xFF0757E8)),
        _buildStatCard('High Priority', '1', Icons.error_outline_rounded, Colors.red),
        _buildStatCard('Nearby Teams', '5', Icons.group_outlined, Colors.purple),
        _buildStatCard('Active Incidents', '8', Icons.local_fire_department_outlined, Colors.orange),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
              Icon(icon, color: color, size: 20),
            ],
          ),
          Text(title, style: const TextStyle(fontSize: 11, color: Color(0xFF65728A), fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildActionItem(Icons.sos, 'SOS', Colors.red, () {}),
        _buildActionItem(Icons.group, 'Teams', Colors.purple, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TeamMembersScreen()))),
        _buildActionItem(Icons.map_outlined, 'Map', Colors.blue, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LiveResponseMapScreen()))),
        _buildActionItem(Icons.inventory_2_outlined, 'Resources', Colors.green, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ResourceTrackingScreen()))),
      ],
    );
  }

  Widget _buildActionItem(IconData icon, String label, Color color, VoidCallback onTap) {
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

  Widget _buildIncidentsList() {
    return Column(
      children: [
        _buildIncidentItem('INC-3048', 'Flood', 'Jaipur, Rajasthan', 'High', '4.2 km away', Colors.red),
        _buildIncidentItem('INC-2897', 'Fire', 'Mansarovar, Jaipur', 'Medium', '8.5 km away', Colors.orange),
      ],
    );
  }

  Widget _buildIncidentItem(String id, String type, String location, String severity, String dist, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(Icons.warning_amber_rounded, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(id, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF65728A), fontSize: 12)),
                    Text(severity, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 10)),
                  ],
                ),
                Text(type, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF102043))),
                Text(location, style: const TextStyle(fontSize: 13, color: Color(0xFF65728A))),
                Text(dist, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Color(0xFFDCE3F0)),
        ],
      ),
    );
  }
}
