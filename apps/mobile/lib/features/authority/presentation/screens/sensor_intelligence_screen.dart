import 'package:flutter/material.dart';

class SensorIntelligenceScreen extends StatelessWidget {
  const SensorIntelligenceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sensor Intelligence'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildOverallHealth(),
            const SizedBox(height: 24),
            const Text(
              'Active Sensors',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            _buildSensorCategory('Water Level Sensors', '12 Active', Colors.blue),
            _buildSensorCategory('Rainfall Gauges', '8 Active', Colors.cyan),
            _buildSensorCategory('Soil Sensors', '15 Active', Colors.brown),
            _buildSensorCategory('Air Quality', '6 Active', Colors.green),
            const SizedBox(height: 24),
            const Text(
              'Critical Readings',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            _buildCriticalReading(
              sensor: 'WL-JPR-05',
              parameter: 'Water Level',
              value: '9.4m',
              threshold: '8.5m',
              status: 'CRITICAL',
            ),
            _buildCriticalReading(
              sensor: 'RF-JPR-02',
              parameter: 'Rainfall',
              value: '42mm/h',
              threshold: '30mm/h',
              status: 'ALERT',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOverallHealth() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F7EF),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Row(
        children: [
          Icon(Icons.check_circle, color: Color(0xFF09A86B), size: 40),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Network Healthy',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF09A86B)),
                ),
                Text(
                  '125/130 sensors reporting correctly.',
                  style: TextStyle(color: Color(0xFF09A86B), fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSensorCategory(String label, String status, Color color) {
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
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(Icons.sensors, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043))),
          ),
          Text(status, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right, color: Color(0xFF65728A), size: 16),
        ],
      ),
    );
  }

  Widget _buildCriticalReading({
    required String sensor,
    required String parameter,
    required String value,
    required String threshold,
    required String status,
  }) {
    final color = status == 'CRITICAL' ? Colors.red : Colors.orange;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(sensor, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF65728A))),
                const SizedBox(height: 4),
                Text(parameter, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
              Text('Threshold: $threshold', style: const TextStyle(fontSize: 10, color: Color(0xFF65728A))),
            ],
          ),
        ],
      ),
    );
  }
}
