import 'package:flutter/material.dart';

class OfflineSyncScreen extends StatelessWidget {
  const OfflineSyncScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Offline Mode & Sync'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const SizedBox(height: 40),
            const Icon(Icons.cloud_off_outlined, size: 80, color: Color(0xFF65728A)),
            const SizedBox(height: 24),
            const Text(
              'You are offline',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            const Text(
              'Data will sync automatically\nwhen connection is back.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF65728A), fontSize: 16),
            ),
            const SizedBox(height: 48),
            _buildSyncStatusCard(),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0757E8),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Sync Now', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncStatusCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Pending Sync',
            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043)),
          ),
          const SizedBox(height: 16),
          _buildSyncItem('Reports', '2', Icons.description_outlined),
          const Divider(height: 24),
          _buildSyncItem('Photos', '5', Icons.photo_outlined),
          const Divider(height: 24),
          _buildSyncItem('System', 'Updated', Icons.sync_outlined, isDone: true),
        ],
      ),
    );
  }

  Widget _buildSyncItem(String label, String value, IconData icon, {bool isDone = false}) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF65728A)),
        const SizedBox(width: 12),
        Expanded(
          child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isDone ? Colors.green : const Color(0xFF0757E8),
          ),
        ),
        const SizedBox(width: 8),
        Icon(
          isDone ? Icons.check_circle : Icons.pending,
          size: 16,
          color: isDone ? Colors.green : const Color(0xFF0757E8),
        ),
      ],
    );
  }
}
