import 'package:flutter/material.dart';

class SensorIntelligenceScreen extends StatelessWidget {
  const SensorIntelligenceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('AI Risk Analysis'),
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
              'Jaipur District',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF65728A),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                _buildBigStat('125', 'Active Sensors', Colors.green),
                const SizedBox(width: 16),
                _buildBigStat('115', 'High Risk Points', Colors.red),
              ],
            ),
            const SizedBox(height: 32),
            _buildIntelligenceRow(Icons.umbrella_outlined, 'Rainfall', '42 mm/h', 'High', Colors.blue),
            _buildIntelligenceRow(Icons.water_drop_outlined, 'Water Level', '86m', 'High', Colors.red),
            _buildIntelligenceRow(Icons.thermostat_outlined, 'Temperature', '31°C', 'Normal', Colors.orange),
            _buildIntelligenceRow(Icons.water_outlined, 'Humidity', '84%', 'High', Colors.blue),
            const SizedBox(height: 32),
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
                child: const Text('Manage Sensors',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBigStat(String value, String label, Color color) {
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
            Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF65728A),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIntelligenceRow(IconData icon, String label, String value, String status, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Color(0xFF102043),
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF102043),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            status,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
