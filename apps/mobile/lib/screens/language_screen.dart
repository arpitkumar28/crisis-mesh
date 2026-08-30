import 'package:flutter/material.dart';
import '../services/app_messenger.dart';

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  String _selectedLanguage = 'English';

  final List<Map<String, String>> _languages = [
    {'name': 'English', 'native': 'English'},
    {'name': 'Hindi', 'native': 'हिन्दी'},
    {'name': 'Marathi', 'native': 'मराठी'},
    {'name': 'Gujarati', 'native': 'ગુજરાતી'},
    {'name': 'Bengali', 'native': 'বাংলা'},
    {'name': 'Tamil', 'native': 'தமிழ்'},
    {'name': 'Kannada', 'native': 'ಕನ್ನಡ'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Select Language')),
      body: Column(
        children: [
          Expanded(
            child: ListView.separated(
              itemCount: _languages.length,
              separatorBuilder: (context, index) => const Divider(height: 1, indent: 16, endIndent: 16),
              itemBuilder: (context, index) {
                final lang = _languages[index];
                final isSelected = _selectedLanguage == lang['name'];
                return ListTile(
                  title: Text(lang['name']!),
                  subtitle: Text(lang['native']!),
                  trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF0757E8)) : null,
                  onTap: () => setState(() => _selectedLanguage = lang['name']!),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  AppMessenger.success(context, 'Language updated to $_selectedLanguage');
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0757E8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Save Language', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
