import 'package:flutter/material.dart';

class PrivacyPermissionsScreen extends StatefulWidget {
  const PrivacyPermissionsScreen({super.key});

  @override
  State<PrivacyPermissionsScreen> createState() => _PrivacyPermissionsScreenState();
}

class _PrivacyPermissionsScreenState extends State<PrivacyPermissionsScreen> {
  bool _location = true;
  bool _notifications = true;
  bool _camera = false;
  bool _microphone = false;
  bool _storage = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Permissions'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: const BackButton(color: Color(0xFF102043)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            _buildPermissionTile('Location Access', 'Required for real-time SOS tracking', _location, (val) => setState(() => _location = val)),
            _buildPermissionTile('Notifications', 'Get alerts about critical incidents', _notifications, (val) => setState(() => _notifications = val)),
            _buildPermissionTile('Camera', 'Used for reporting incidents with photos', _camera, (val) => setState(() => _camera = val)),
            _buildPermissionTile('Microphone', 'Used for voice reports and SOS', _microphone, (val) => setState(() => _microphone = val)),
            _buildPermissionTile('Storage', 'Access files for offline maps', _storage, (val) => setState(() => _storage = val)),
            const Spacer(),
            const Text(
              'We respect your privacy. Data is encrypted.',
              style: TextStyle(color: Color(0xFF65728A), fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {},
              child: const Text('View Privacy Policy', style: TextStyle(color: Color(0xFF0757E8), fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPermissionTile(String title, String subtitle, bool value, Function(bool) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043))),
                Text(subtitle, style: const TextStyle(color: Color(0xFF65728A), fontSize: 11)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: const Color(0xFF0757E8),
          ),
        ],
      ),
    );
  }
}
