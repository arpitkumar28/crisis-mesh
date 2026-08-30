import 'package:flutter/material.dart';

class AlertApprovalScreen extends StatelessWidget {
  const AlertApprovalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alert Approval'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.withValues(alpha: 0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.pending_actions, color: Colors.orange),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Pending Review: Requested by Operator Amit Verma',
                      style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Alert Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 16),
            _buildDetailField('Type', 'Flood Warning'),
            _buildDetailField('Severity', 'CRITICAL', isCritical: true),
            _buildDetailField('Target Areas', 'Jaipur District, Sector 5, Sector 8'),
            _buildDetailField('Message', 'Heavy rainfall expected. Residents in low lying areas are advised to move to higher ground immediately. Emergency shelters are open at Community Hall.'),
            const SizedBox(height: 24),
            const Text(
              'Impact Prediction',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFD),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Column(
                children: [
                  _ImpactRow(label: 'Population at Risk', value: '45,000+'),
                  Divider(height: 20),
                  _ImpactRow(label: 'Infrastructure Risk', value: 'High'),
                  Divider(height: 20),
                  _ImpactRow(label: 'Confidence Level', value: '87%'),
                ],
              ),
            ),
            const SizedBox(height: 40),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF09A86B),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      elevation: 0,
                    ),
                    child: const Text('Approve & Broadcast', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailField(String label, String value, {bool isCritical = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A), fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isCritical ? Colors.red : const Color(0xFF102043),
            ),
          ),
        ],
      ),
    );
  }
}

class _ImpactRow extends StatelessWidget {
  final String label;
  final String value;

  const _ImpactRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF65728A))),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043))),
      ],
    );
  }
}
