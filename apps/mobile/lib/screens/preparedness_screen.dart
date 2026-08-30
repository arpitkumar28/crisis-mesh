import 'package:flutter/material.dart';

class PreparednessScreen extends StatelessWidget {
  const PreparednessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Disaster Preparedness')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Be Prepared',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
          ),
          const SizedBox(height: 8),
          const Text(
            'Create your emergency plan and stay ready for any situation.',
            style: TextStyle(color: Color(0xFF65728A)),
          ),
          const SizedBox(height: 24),
          _PreparednessItem(
            title: 'Emergency Kit',
            subtitle: 'Essential items for survival',
            icon: Icons.backpack_outlined,
            onTap: () => Navigator.pushNamed(context, '/checklists'),
          ),
          _PreparednessItem(
            title: 'Family Plan',
            subtitle: 'Communication and meeting points',
            icon: Icons.family_restroom_outlined,
            onTap: () {},
          ),
          _PreparednessItem(
            title: 'Important Documents',
            subtitle: 'Keep your records safe',
            icon: Icons.description_outlined,
            onTap: () {},
          ),
          _PreparednessItem(
            title: 'Practice Drills',
            subtitle: 'Train for emergencies',
            icon: Icons.run_circle_outlined,
            onTap: () {},
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF0757E8).withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF0757E8).withOpacity(0.1)),
            ),
            child: Column(
              children: [
                const Icon(Icons.verified_user_outlined, size: 48, color: Color(0xFF0757E8)),
                const SizedBox(height: 16),
                const Text(
                  'Your Readiness Score',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Complete all tasks to reach 100%',
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 20),
                LinearProgressIndicator(
                  value: 0.25,
                  backgroundColor: Colors.white,
                  color: const Color(0xFF0757E8),
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 8),
                const Text('25% Complete', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PreparednessItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _PreparednessItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF0757E8)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
