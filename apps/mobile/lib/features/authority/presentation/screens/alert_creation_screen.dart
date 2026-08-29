import 'package:flutter/material.dart';

class AlertCreationScreen extends StatefulWidget {
  const AlertCreationScreen({super.key});

  @override
  State<AlertCreationScreen> createState() => _AlertCreationScreenState();
}

class _AlertCreationScreenState extends State<AlertCreationScreen> {
  String _severity = 'High';
  String _type = 'Flood';
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Alert'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Alert Type',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _type,
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFFF8FAFD),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: ['Flood', 'Fire', 'Thunderstorm', 'Earthquake', 'Other']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                  .toList(),
              onChanged: (val) => setState(() => _type = val!),
            ),
            const SizedBox(height: 24),
            const Text(
              'Severity Level',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            Row(
              children: ['Low', 'Medium', 'High', 'Critical'].map((s) {
                final isSelected = _severity == s;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _severity = s),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? _getSeverityColor(s) : Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isSelected ? _getSeverityColor(s) : const Color(0xFFE4EAF4)),
                      ),
                      child: Center(
                        child: Text(
                          s,
                          style: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF65728A),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            const Text(
              'Alert Title',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: 'e.g., Immediate Evacuation - Sector 5',
                fillColor: const Color(0xFFF8FAFD),
                filled: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Message',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _messageController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Enter detailed alert message for public...',
                fillColor: const Color(0xFFF8FAFD),
                filled: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Target Areas',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFD),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE4EAF4)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.map_outlined, color: Color(0xFF0757E8)),
                  SizedBox(width: 12),
                  Text('Select areas on map', style: TextStyle(color: Color(0xFF0757E8), fontWeight: FontWeight.bold)),
                  Spacer(),
                  Icon(Icons.chevron_right, color: Color(0xFF65728A)),
                ],
              ),
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
                child: const Text('Submit for Approval', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(String s) {
    switch (s) {
      case 'Low':
        return Colors.green;
      case 'Medium':
        return Colors.blue;
      case 'High':
        return Colors.orange;
      case 'Critical':
        return Colors.red;
      default:
        return const Color(0xFF0757E8);
    }
  }
}
