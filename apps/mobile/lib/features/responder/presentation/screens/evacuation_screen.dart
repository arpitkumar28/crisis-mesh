import 'package:flutter/material.dart';

class EvacuationScreen extends StatelessWidget {
  const EvacuationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Evacuation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('INC-2048', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatSummary(),
            const SizedBox(height: 24),
            _buildSectionTitle('Evacuation Point'),
            const SizedBox(height: 12),
            _buildLocationCard(),
            const SizedBox(height: 24),
            _buildSectionTitle('Current Status'),
            const SizedBox(height: 12),
            _buildProgressSection(),
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
                    child: const Text('View Evacuation List'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
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
                child: const Text('Mark Evacuation Point', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatSummary() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Column(
        children: [
          Text(
            'Evacuated',
            style: TextStyle(color: Color(0xFF65728A), fontWeight: FontWeight.w500),
          ),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '356',
                style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
              ),
              SizedBox(width: 8),
              Text(
                'of 1,200',
                style: TextStyle(fontSize: 18, color: Color(0xFF65728A)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
    );
  }

  Widget _buildLocationCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: const Row(
        children: [
          CircleAvatar(
            backgroundColor: Color(0xFFE8F7EF),
            child: Icon(Icons.location_on, color: Color(0xFF09A86B)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Community Hall', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('Sector 5, Mansarovar', style: TextStyle(color: Color(0xFF65728A), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressSection() {
    return Column(
      children: [
        _buildProgressItem('Zone A', 0.8, '180 / 225'),
        const SizedBox(height: 16),
        _buildProgressItem('Zone B', 0.4, '96 / 240'),
        const SizedBox(height: 16),
        _buildProgressItem('Zone C', 0.2, '80 / 400'),
      ],
    );
  }

  Widget _buildProgressItem(String zone, double progress, String count) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(zone, style: const TextStyle(fontWeight: FontWeight.w600)),
            Text(count, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: const Color(0xFFE4EAF4),
          color: const Color(0xFF0757E8),
          borderRadius: BorderRadius.circular(4),
          minHeight: 8,
        ),
      ],
    );
  }
}
