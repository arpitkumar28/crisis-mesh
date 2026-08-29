import 'package:flutter/material.dart';

class IncidentDetailsScreen extends StatelessWidget {
  final String incidentId;
  
  const IncidentDetailsScreen({super.key, this.incidentId = 'INC-2048'});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(incidentId),
        actions: [
          IconButton(icon: const Icon(Icons.share_outlined), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusHeader(),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Incident Information'),
                  const SizedBox(height: 12),
                  _buildDetailRow('Type', 'Flood', Icons.water_drop, Colors.blue),
                  _buildDetailRow('Severity', 'High', Icons.priority_high, Colors.red),
                  _buildDetailRow('Location', 'Jaipur, Rajasthan', Icons.location_on, Colors.grey),
                  _buildDetailRow('Reported', '15 Aug 2026, 10:30 AM', Icons.access_time, Colors.grey),
                  const Divider(height: 32),
                  _buildSectionTitle('Description'),
                  const SizedBox(height: 8),
                  const Text(
                    'Heavy rainfall caused water logging in low-lying areas of Jaipur. Multiple people are reported trapped in their homes. Water level is rising rapidly.',
                    style: TextStyle(height: 1.5, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 24),
                  _buildSectionTitle('Response Team'),
                  const SizedBox(height: 12),
                  _buildTeamCard(),
                  const SizedBox(height: 24),
                  _buildImpactStats(),
                  const SizedBox(height: 32),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: const BorderSide(color: Color(0xFF0757E8)),
                          ),
                          child: const Text('View on Map'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0757E8),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            elevation: 0,
                          ),
                          child: const Text('Start Navigation'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () {},
                      style: TextButton.styleFrom(foregroundColor: Colors.red),
                      child: const Text('Report Issue / Request Backup'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      color: Colors.orange.withOpacity(0.1),
      child: const Row(
        children: [
          Icon(Icons.sync, color: Colors.orange, size: 20),
          SizedBox(width: 8),
          Text(
            'Status: In Progress',
            style: TextStyle(
              color: Colors.orange,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: Color(0xFF102043),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon, Color iconColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
              Text(value, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF102043))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTeamCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            backgroundColor: Color(0xFFE4EAF4),
            child: Icon(Icons.group, color: Color(0xFF0757E8)),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Team Alpha', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('4 Members · Leading Response', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
              ],
            ),
          ),
          TextButton(onPressed: () {}, child: const Text('View')),
        ],
      ),
    );
  }

  Widget _buildImpactStats() {
    return Row(
      children: [
        _buildStatItem('Affected People', '120+', Icons.people_outline),
        const SizedBox(width: 16),
        _buildStatItem('Urgency', 'Critical', Icons.speed),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFD),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: const Color(0xFF65728A)),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
            Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
      ),
    );
  }
}
