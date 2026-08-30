import 'package:flutter/material.dart';

class ChecklistsScreen extends StatefulWidget {
  const ChecklistsScreen({super.key});

  @override
  State<ChecklistsScreen> createState() => _ChecklistsScreenState();
}

class _ChecklistsScreenState extends State<ChecklistsScreen> {
  final List<Map<String, dynamic>> _items = [
    {'title': 'Water (3 liters per person)', 'checked': false},
    {'title': 'Non-perishable food', 'checked': true},
    {'title': 'First Aid Kit', 'checked': false},
    {'title': 'Flashlight & batteries', 'checked': false},
    {'title': 'Whistle', 'checked': false},
    {'title': 'Local maps', 'checked': false},
    {'title': 'Personal medications', 'checked': false},
    {'title': 'Extra cash', 'checked': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Checklist')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];
                return CheckboxListTile(
                  title: Text(item['title']),
                  value: item['checked'],
                  onChanged: (val) => setState(() => _items[index]['checked'] = val),
                  controlAffinity: ListTileControlAffinity.trailing,
                  activeColor: const Color(0xFF0757E8),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add),
                  label: const Text('Add Custom Item'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0757E8),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 56),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Save Progress', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
