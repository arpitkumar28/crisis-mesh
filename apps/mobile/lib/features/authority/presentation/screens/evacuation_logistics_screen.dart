import 'package:flutter/material.dart';

class EvacuationLogisticsScreen extends StatelessWidget {
  const EvacuationLogisticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Evacuation & Logistics'),
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
              'AI Risk Analysis',
              style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Jaipur District',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                _buildLogisticsStat('125', 'Safe Zones', Colors.green),
                const SizedBox(width: 16),
                _buildLogisticsStat('115', 'Evacuation Pts', Colors.blue),
              ],
            ),
            const SizedBox(height: 32),
            _buildLogisticsItem(Icons.umbrella_outlined, 'Rainfall', '42 mm/h', 'High', Colors.blue),
            _buildLogisticsItem(Icons.water_drop_outlined, 'Water Level', '86m', 'High', Colors.red),
            _buildLogisticsItem(Icons.thermostat_outlined, 'Soil Moisture', '78%', 'High', Colors.orange),
            _buildLogisticsItem(Icons.sensors_outlined, 'Sensors Online', '92%', 'Good', Colors.green),
            const SizedBox(height: 32),
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
                child: const Text('View Full Report', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogisticsStat(String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFD),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE4EAF4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A), fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildLogisticsItem(IconData icon, String label, String value, String status, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Color(0xFF102043))),
          ),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
          const SizedBox(width: 12),
          Text(status, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
