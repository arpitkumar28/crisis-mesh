import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class EmergencyContactsScreen extends StatelessWidget {
  const EmergencyContactsScreen({super.key});

  final List<Map<String, String>> contacts = const [
    {'name': 'National Emergency', 'number': '112', 'icon': 'emergency'},
    {'name': 'Police', 'number': '100', 'icon': 'local_police'},
    {'name': 'Fire Station', 'number': '101', 'icon': 'fire_truck'},
    {'name': 'Ambulance', 'number': '102', 'icon': 'medical_services'},
    {'name': 'Disaster Management', 'number': '108', 'icon': 'warning'},
    {'name': 'Women Helpline', 'number': '1091', 'icon': 'woman'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Contacts')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: contacts.length,
        itemBuilder: (context, index) {
          final contact = contacts[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: const Color(0xFFFFEFF0),
                child: Icon(_getIcon(contact['icon']!), color: const Color(0xFFD92835)),
              ),
              title: Text(contact['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(contact['number']!),
              trailing: IconButton(
                onPressed: () => _callNumber(contact['number']!),
                icon: const Icon(Icons.call, color: Colors.green),
              ),
              onTap: () => _callNumber(contact['number']!),
            ),
          );
        },
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton.icon(
          onPressed: () => _callNumber('112'),
          icon: const Icon(Icons.emergency_share, color: Colors.white),
          label: const Text('Call Emergency (112)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFD92835),
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 60),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
    );
  }

  IconData _getIcon(String name) {
    switch (name) {
      case 'local_police': return Icons.local_police;
      case 'fire_truck': return Icons.fire_truck;
      case 'medical_services': return Icons.medical_services;
      case 'warning': return Icons.warning;
      case 'woman': return Icons.woman;
      default: return Icons.emergency;
    }
  }

  Future<void> _callNumber(String number) async {
    final Uri launchUri = Uri(scheme: 'tel', path: number);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }
}
