import 'package:flutter/material.dart';

class AlertCreationScreen extends StatefulWidget {
  const AlertCreationScreen({super.key});

  @override
  State<AlertCreationScreen> createState() => _AlertCreationScreenState();
}

class _AlertCreationScreenState extends State<AlertCreationScreen> {
  String _severity = 'High';
  String _type = 'Flood Warning';
  final _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Alert Creation'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Alert Type',
              style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFD),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE4EAF4)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _type,
                  isExpanded: true,
                  items: ['Flood Warning', 'Fire Alert', 'Heavy Rainfall', 'Earthquake']
                      .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                      .toList(),
                  onChanged: (val) => setState(() => _type = val!),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Severity',
              style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFD),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE4EAF4)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _severity,
                  isExpanded: true,
                  items: ['Low', 'Medium', 'High', 'Critical']
                      .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                      .toList(),
                  onChanged: (val) => setState(() => _severity = val!),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Area',
              style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFD),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE4EAF4)),
              ),
              child: const Row(
                children: [
                  Text('Jaipur District', style: TextStyle(color: Color(0xFF102043))),
                  Spacer(),
                  Icon(Icons.keyboard_arrow_down, color: Color(0xFF65728A)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Message',
              style: TextStyle(fontSize: 14, color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _messageController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Heavy rainfall expected in low lying areas. People are advised to stay indoors and move to safer places.',
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                fillColor: const Color(0xFFF8FAFD),
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE4EAF4)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE4EAF4)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Valid Till', style: TextStyle(color: Color(0xFF65728A), fontSize: 13)),
                Text('26 Aug 2023, 10:00 PM', style: TextStyle(color: Colors.grey.shade400, fontSize: 13)),
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
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('Submit Report',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
