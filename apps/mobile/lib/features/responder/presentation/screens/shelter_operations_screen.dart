import 'package:flutter/material.dart';

class ShelterOperationsScreen extends StatelessWidget {
  const ShelterOperationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Shelter Operations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Community Hall', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCapacityCard(),
            const SizedBox(height: 24),
            _buildSectionTitle('Demographics'),
            const SizedBox(height: 12),
            _buildDemographicsGrid(),
            const SizedBox(height: 24),
            _buildSectionTitle('Available Resources'),
            const SizedBox(height: 12),
            _buildResourceList(),
            const SizedBox(height: 32),
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
                child: const Text('Manage Shelter', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCapacityCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Column(
        children: [
          Text(
            'Shelter Capacity',
            style: TextStyle(color: Color(0xFF65728A), fontWeight: FontWeight.w500),
          ),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '300',
                style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
              ),
              SizedBox(width: 8),
              Text(
                'of 500',
                style: TextStyle(fontSize: 18, color: Color(0xFF65728A)),
              ),
            ],
          ),
          SizedBox(height: 12),
          LinearProgressIndicator(
            value: 0.6,
            backgroundColor: Color(0xFFE4EAF4),
            color: Color(0xFF09A86B),
            minHeight: 8,
            borderRadius: BorderRadius.all(Radius.circular(4)),
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

  Widget _buildDemographicsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 2,
      children: [
        _buildDemoCard('Adults', '178', Icons.person),
        _buildDemoCard('Children', '122', Icons.child_care),
      ],
    );
  }

  Widget _buildDemoCard(String label, String count, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF0757E8)),
          const SizedBox(width: 12),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(count, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResourceList() {
    return Column(
      children: [
        _buildResourceItem('Water Tanks', '4/5', Colors.blue),
        _buildResourceItem('Food Packs', '200/500', Colors.orange),
        _buildResourceItem('Blankets', '150/300', Colors.purple),
      ],
    );
  }

  Widget _buildResourceItem(String name, String status, Color color) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(Icons.inventory_2, color: color, size: 20),
      ),
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.w500)),
      trailing: Text(status, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043))),
    );
  }
}
