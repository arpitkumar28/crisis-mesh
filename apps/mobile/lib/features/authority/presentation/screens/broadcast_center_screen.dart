import 'package:flutter/material.dart';

class BroadcastCenterScreen extends StatelessWidget {
  const BroadcastCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Broadcast Center'),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Broadcast Message',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const SizedBox(height: 24),
            _buildStatCard('Active Responders', '86', Icons.people_outline, Colors.blue),
            const SizedBox(height: 32),
            const Text(
              'Channels',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildChannelIcon(Icons.sms_outlined, 'SMS'),
                _buildChannelIcon(Icons.notifications_active_outlined, 'Push'),
                _buildChannelIcon(Icons.message_outlined, 'WhatsApp'),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              'Message',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Heavy rainfall expected in low lying areas. Residents are advised to stay indoors and follow safety instructions.',
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                fillColor: const Color(0xFFF8FAFD),
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE4EAF4)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE4EAF4)),
                ),
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0757E8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('Send Broadcast',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () {},
              child: const Center(
                child: Text(
                  'View All Sent Messages',
                  style: TextStyle(color: Color(0xFF0757E8), fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF102043),
                ),
              ),
              Text(
                label,
                style: const TextStyle(color: Color(0xFF65728A), fontSize: 13),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChannelIcon(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFD),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE4EAF4)),
          ),
          child: Icon(icon, color: const Color(0xFF102043)),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Color(0xFF65728A)),
        ),
      ],
    );
  }
}
