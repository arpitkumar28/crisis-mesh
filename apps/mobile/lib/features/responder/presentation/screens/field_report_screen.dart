import 'package:flutter/material.dart';

class FieldReportScreen extends StatefulWidget {
  const FieldReportScreen({super.key});

  @override
  State<FieldReportScreen> createState() => _FieldReportScreenState();
}

class _FieldReportScreenState extends State<FieldReportScreen> {
  String _status = 'In Progress';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Field Report', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
              'Update Status',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _status,
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFFF8FAFD),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: ['In Progress', 'Controlled', 'Resolved', 'Needs Backup']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                  .toList(),
              onChanged: (val) => setState(() => _status = val!),
            ),
            const SizedBox(height: 24),
            const Text(
              'Notes',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            TextField(
              maxLines: 6,
              decoration: InputDecoration(
                hintText: 'Enter your update...',
                fillColor: const Color(0xFFF8FAFD),
                filled: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Add Photos / Videos',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildAddMedia(Icons.camera_alt, 'Camera'),
                const SizedBox(width: 12),
                _buildAddMedia(Icons.photo_library, 'Gallery'),
              ],
            ),
            const SizedBox(height: 40),
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
                child: const Text('Submit Report', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddMedia(IconData icon, String label) {
    return Expanded(
      child: Container(
        height: 100,
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFD),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE4EAF4), style: BorderStyle.solid),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: const Color(0xFF0757E8)),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
      ),
    );
  }
}
