import 'package:flutter/material.dart';

class ResourceTrackingScreen extends StatelessWidget {
  const ResourceTrackingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tracked Resources', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('INC-2048', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildResourceItem(
            name: 'Rescue Boat',
            id: 'RB-042',
            status: 'In Transit',
            distance: '0.8 km',
            icon: Icons.directions_boat,
            color: Colors.blue,
          ),
          _buildResourceItem(
            name: 'Ambulance',
            id: 'AMB-102',
            status: 'On Site',
            distance: '0.0 km',
            icon: Icons.medical_services,
            color: Colors.red,
          ),
          _buildResourceItem(
            name: 'Medical Kit',
            id: 'MK-55',
            status: 'Dispatched',
            distance: '2.5 km',
            icon: Icons.medication,
            color: Colors.green,
          ),
        ],
      ),
    );
  }

  Widget _buildResourceItem({
    required String name,
    required String id,
    required String status,
    required String distance,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  id,
                  style: const TextStyle(fontSize: 12, color: Color(0xFF65728A)),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                status,
                style: TextStyle(
                  color: status == 'On Site' ? Colors.green : Colors.orange,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                distance,
                style: const TextStyle(fontSize: 12, color: Color(0xFF65728A)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
