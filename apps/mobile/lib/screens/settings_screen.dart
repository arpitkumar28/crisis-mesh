import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _pushNotifications = true;
  bool _locationSharing = true;
  String _units = 'Metric (°C, km)';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          _buildSectionHeader('General'),
          _buildLanguageTile(context),
          ListTile(
            title: const Text('Units'),
            subtitle: Text(_units),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showUnitsDialog(),
          ),
          _buildSectionHeader('Notifications'),
          SwitchListTile(
            title: const Text('Push Notifications'),
            subtitle: const Text('Receive alerts and updates'),
            value: _pushNotifications,
            onChanged: (val) => setState(() => _pushNotifications = val),
            activeColor: const Color(0xFF0757E8),
          ),
          _buildSectionHeader('Privacy & Storage'),
          SwitchListTile(
            title: const Text('Location Sharing'),
            subtitle: const Text('Share location during emergencies'),
            value: _locationSharing,
            onChanged: (val) => setState(() => _locationSharing = val),
            activeColor: const Color(0xFF0757E8),
          ),
          ListTile(
            title: const Text('Clear Cache'),
            subtitle: const Text('Free up storage space'),
            trailing: const Icon(Icons.delete_outline),
            onTap: () {},
          ),
          _buildSectionHeader('Security'),
          ListTile(
            title: const Text('Biometric Login'),
            subtitle: const Text('Use fingerprint or face ID'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Change Password'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.pushNamed(context, '/forgot-password'),
          ),
          const SizedBox(height: 32),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton(
              onPressed: () async {
                await ref.read(authProvider.notifier).logout();
                if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Logout', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 32),
          const Center(child: Text('Version 1.0.0 (Build 12)', style: TextStyle(color: Colors.grey, fontSize: 12))),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
      ),
    );
  }

  Widget _buildLanguageTile(BuildContext context) {
    return ListTile(
      title: const Text('App Language'),
      subtitle: const Text('English'),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => Navigator.pushNamed(context, '/language'),
    );
  }

  void _showUnitsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Units'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('Metric (°C, km)'),
              value: 'Metric (°C, km)',
              groupValue: _units,
              onChanged: (val) {
                setState(() => _units = val!);
                Navigator.pop(context);
              },
            ),
            RadioListTile<String>(
              title: const Text('Imperial (°F, miles)'),
              value: 'Imperial (°F, miles)',
              groupValue: _units,
              onChanged: (val) {
                setState(() => _units = val!);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
