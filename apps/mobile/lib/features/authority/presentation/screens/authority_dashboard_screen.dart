import 'package:flutter/material.dart';

class AuthorityDashboardScreen extends StatelessWidget {
  const AuthorityDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 24),
          _buildLiveStatusOverview(),
          const SizedBox(height: 24),
          const Text(
            'Critical Alerts',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
          ),
          const SizedBox(height: 12),
          _buildAlertCard(
            title: 'Flash Flood Warning',
            location: 'Jaipur District',
            severity: 'CRITICAL',
            time: '5 mins ago',
          ),
          const SizedBox(height: 24),
          const Text(
            'Resource Overview',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
          ),
          const SizedBox(height: 12),
          _buildResourceStats(),
          const SizedBox(height: 24),
          _buildActionButtons(context),
        ],
      ),
    );
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

  Widget _buildLiveStatusOverview() {
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
              _buildStatItem('Active Incidents', '12', Colors.red),
              _buildStatItem('High Risk Zones', '4', Colors.orange),
              _buildStatItem('Responders', '86', Colors.blue),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Alerts Sent', '124', Colors.purple),
              _buildStatItem('Shelters', '8', Colors.green),
              _buildStatItem('Evacuated', '1.2k', Colors.teal),
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
          style: const TextStyle(fontSize: 12, color: Color(0xFF65728A), fontWeight: FontWeight.w500),
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
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEFF0),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.red.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_rounded, color: Colors.red, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF102043)),
                ),
                Text('$location · $time', style: const TextStyle(color: Color(0xFF65728A), fontSize: 13)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              elevation: 0,
            ),
            child: const Text('Broadcast'),
          ),
        ],
      ),
    );
  }

  Widget _buildResourceStats() {
    return Row(
      children: [
        Expanded(child: _buildSimpleStatCard('Vehicles', '32', Icons.local_shipping, Colors.blue)),
        const SizedBox(width: 12),
        Expanded(child: _buildSimpleStatCard('Personnel', '145', Icons.people, Colors.green)),
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
        _buildActionTile(Icons.add_alert, 'Create Alert', const Color(0xFF0757E8)),
        _buildActionTile(Icons.map, 'Live Situation', Colors.green),
        _buildActionTile(Icons.analytics, 'Reports', Colors.purple),
        _buildActionTile(Icons.settings, 'Settings', Colors.grey),
      ],
    );
  }

  Widget _buildActionTile(IconData icon, String label, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
