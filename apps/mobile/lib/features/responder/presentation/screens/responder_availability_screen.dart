import 'package:flutter/material.dart';

class ResponderAvailabilityScreen extends StatefulWidget {
  const ResponderAvailabilityScreen({super.key});

  @override
  State<ResponderAvailabilityScreen> createState() => _ResponderAvailabilityScreenState();
}

class _ResponderAvailabilityScreenState extends State<ResponderAvailabilityScreen> {
  bool _isOnDuty = true;
  final String _currentShift = 'Morning (08:00 AM - 04:00 PM)';
  String _status = 'Available';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shift / Availability'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusCard(),
            const SizedBox(height: 24),
            const Text(
              'Shift Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            _buildShiftInfo(),
            const SizedBox(height: 24),
            const Text(
              'Change Status',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            _buildStatusSelector(),
            const SizedBox(height: 24),
            const Text(
              'Notes',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            TextField(
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Enter note (optional)...',
                fillColor: const Color(0xFFF8FAFD),
                filled: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Update Incident Status', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _isOnDuty ? const Color(0xFFE8F7EF) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Current Status',
                style: TextStyle(color: Color(0xFF65728A), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 4),
              Text(
                _isOnDuty ? 'On Duty' : 'Off Duty',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: _isOnDuty ? const Color(0xFF09A86B) : const Color(0xFF65728A),
                ),
              ),
            ],
          ),
          Switch(
            value: _isOnDuty,
            onChanged: (val) => setState(() => _isOnDuty = val),
            activeThumbColor: const Color(0xFF09A86B),
          ),
        ],
      ),
    );
  }

  Widget _buildShiftInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        children: [
          _buildInfoRow('Shift', '08:00 AM - 04:00 PM', Icons.schedule),
          const Divider(height: 24),
          _buildInfoRow('District', 'Jaipur Central', Icons.location_city),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF0757E8)),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(color: Color(0xFF65728A))),
        const Spacer(),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043))),
      ],
    );
  }

  Widget _buildStatusSelector() {
    final statuses = ['Available', 'Busy', 'Off Duty'];
    return Row(
      children: statuses.map((s) {
        final isSelected = _status == s;
        return Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _status = s),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF0757E8) : Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isSelected ? const Color(0xFF0757E8) : const Color(0xFFE4EAF4)),
              ),
              child: Center(
                child: Text(
                  s,
                  style: TextStyle(
                    color: isSelected ? Colors.white : const Color(0xFF65728A),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
