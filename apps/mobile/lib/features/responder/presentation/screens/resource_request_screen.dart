import 'package:flutter/material.dart';

class ResourceRequestScreen extends StatefulWidget {
  const ResourceRequestScreen({super.key});

  @override
  State<ResourceRequestScreen> createState() => _ResourceRequestScreenState();
}

class _ResourceRequestScreenState extends State<ResourceRequestScreen> {
  final Map<String, bool> _resources = {
    'Rescue Boat': false,
    'Ambulance': false,
    'Medical Kit': true,
    'Water Pump': false,
    'Generator': false,
    'Rope': false,
    'Other': false,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Request Resources', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('INC-2048', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Required Resources',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const SizedBox(height: 16),
            ..._resources.keys.map((resource) {
              return CheckboxListTile(
                value: _resources[resource],
                onChanged: (val) => setState(() => _resources[resource] = val ?? false),
                title: Text(resource),
                controlAffinity: ListTileControlAffinity.trailing,
                contentPadding: EdgeInsets.zero,
                activeColor: const Color(0xFF0757E8),
              );
            }),
            const SizedBox(height: 24),
            const Text(
              'Additional Notes',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Enter details about the resource requirement...',
                fillColor: const Color(0xFFF8FAFD),
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE4EAF4)),
                ),
              ),
            ),
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
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Send Request',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
