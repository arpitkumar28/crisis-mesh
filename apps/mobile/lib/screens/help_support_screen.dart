import 'package:flutter/material.dart';
import '../services/app_messenger.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'How can we help?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 24),
            TextField(
              decoration: InputDecoration(
                hintText: 'Search help articles...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 32),
            _SupportAction(
              icon: Icons.question_answer_outlined,
              title: 'FAQs',
              subtitle: 'Common questions and answers',
              onTap: () {},
            ),
            _SupportAction(
              icon: Icons.report_problem_outlined,
              title: 'Report a Problem',
              subtitle: 'Found a bug or technical issue?',
              onTap: () {},
            ),
            _SupportAction(
              icon: Icons.chat_outlined,
              title: 'Chat with Support',
              subtitle: 'Get real-time assistance',
              onTap: () => AppMessenger.info(context, 'Chat support currently offline'),
            ),
            _SupportAction(
              icon: Icons.call_outlined,
              title: 'Call Support',
              subtitle: 'Speak with our team',
              onTap: () => AppMessenger.info(context, 'Calling support line...'),
            ),
            const SizedBox(height: 40),
            const Text('App Feedback', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                title: const Text('Rate Us'),
                subtitle: const Row(
                  children: [
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star_half, color: Colors.amber, size: 16),
                  ],
                ),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SupportAction extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SupportAction({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
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
