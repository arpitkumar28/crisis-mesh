import 'package:flutter/material.dart';

class DistrictIntelligenceScreen extends StatelessWidget {
  const DistrictIntelligenceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('District Intelligence'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildDistrictSelector(),
          const SizedBox(height: 24),
          _buildRiskSummary(),
          const SizedBox(height: 24),
          const Text(
            'Environmental Intelligence',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
          ),
          const SizedBox(height: 12),
          _buildIntelligenceGrid(),
          const SizedBox(height: 24),
          _buildRiskTrendCard(),
          const SizedBox(height: 24),
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
              child: const Text('View Full Report', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDistrictSelector() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: const Row(
        children: [
          Icon(Icons.location_city, color: Color(0xFF0757E8)),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Jaipur District', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('Rajasthan, India', style: TextStyle(color: Color(0xFF65728A), fontSize: 12)),
              ],
            ),
          ),
          Icon(Icons.keyboard_arrow_down, color: Color(0xFF65728A)),
        ],
      ),
    );
  }

  Widget _buildRiskSummary() {
    return Row(
      children: [
        _buildSummaryBox('Overall Risk', 'MEDIUM', Colors.orange),
        const SizedBox(width: 12),
        _buildSummaryBox('Active Threats', '3', Colors.red),
      ],
    );
  }

  Widget _buildSummaryBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildIntelligenceGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _buildIntelCard('Rainfall', '42mm', 'High', Icons.umbrella, Colors.blue),
        _buildIntelCard('Water Level', '9.2m', 'Normal', Icons.water, Colors.cyan),
        _buildIntelCard('Soil Moisture', '64%', 'Alert', Icons.landscape, Colors.brown),
        _buildIntelCard('Sensors Active', '124/130', 'Good', Icons.sensors, Colors.green),
      ],
    );
  }

  Widget _buildIntelCard(String label, String value, String status, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(status, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRiskTrendCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Risk Trend (24h)', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          SizedBox(
            height: 100,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(7, (index) {
                final heights = [40.0, 60.0, 45.0, 80.0, 70.0, 90.0, 85.0];
                return Container(
                  width: 30,
                  height: heights[index],
                  decoration: BoxDecoration(
                    color: heights[index] > 75 ? Colors.red : Colors.blue,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 8),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('08:00', style: TextStyle(fontSize: 10, color: Color(0xFF65728A))),
              Text('12:00', style: TextStyle(fontSize: 10, color: Color(0xFF65728A))),
              Text('16:00', style: TextStyle(fontSize: 10, color: Color(0xFF65728A))),
              Text('20:00', style: TextStyle(fontSize: 10, color: Color(0xFF65728A))),
            ],
          ),
        ],
      ),
    );
  }
}
