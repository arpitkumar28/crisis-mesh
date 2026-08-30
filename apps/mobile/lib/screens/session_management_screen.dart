import 'package:flutter/material.dart';

class SessionManagementScreen extends StatelessWidget {
  const SessionManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Active Sessions'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: const BackButton(color: Color(0xFF102043)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'This Device',
              style: TextStyle(fontSize: 14, color: Color(0xFF65728A), fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),
            _buildSessionItem(
              icon: Icons.phone_android_rounded,
              name: 'iPhone 14 Pro',
              location: 'Jaipur, Rajasthan',
              status: 'Active',
              isCurrent: true,
            ),
            const SizedBox(height: 32),
            const Text(
              'Other Sessions',
              style: TextStyle(fontSize: 14, color: Color(0xFF65728A), fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),
            _buildSessionItem(
              icon: Icons.laptop_mac_rounded,
              name: 'Chrome on Windows',
              location: 'Patna, Bihar',
              status: '2h ago',
            ),
            const SizedBox(height: 12),
            _buildSessionItem(
              icon: Icons.phone_android_rounded,
              name: 'Android Device',
              location: 'Delhi, India',
              status: '1d ago',
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0757E8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('Logout All Other Sessions', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSessionItem({
    required IconData icon,
    required String name,
    required String location,
    required String status,
    bool isCurrent = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF102043), size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043))),
                Text(location, style: const TextStyle(color: Color(0xFF65728A), fontSize: 12)),
              ],
            ),
          ),
          Text(
            status,
            style: TextStyle(
              color: isCurrent ? Colors.green : const Color(0xFF65728A),
              fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
