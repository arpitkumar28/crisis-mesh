import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class IncidentDetailsScreen extends ConsumerWidget {
  final String incidentId;
  const IncidentDetailsScreen({super.key, required this.incidentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Incident Status'),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: const BackButton(color: Color(0xFF102043)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'INC-3048',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF102043),
                      ),
                    ),
                    Text(
                      'Jaipur, Rajasthan',
                      style: TextStyle(color: Color(0xFF65728A), fontSize: 13),
                    ),
                  ],
                ),
                _buildSmallBadge('Flood', Colors.red),
              ],
            ),
            const SizedBox(height: 32),
            Center(
              child: Column(
                children: [
                  const Text(
                    'Response Progress',
                    style: TextStyle(color: Color(0xFF65728A), fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 130,
                        height: 130,
                        child: CircularProgressIndicator(
                          value: 0.65,
                          strokeWidth: 10,
                          backgroundColor: const Color(0xFFF0F3F8),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0757E8)),
                        ),
                      ),
                      const Column(
                        children: [
                          Text(
                            '65%',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF102043),
                            ),
                          ),
                          Text(
                            'Active',
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF09A86B),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            const Text(
              'Timeline',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 20),
            _buildTimelineStep('Incident Reported', '09:20 AM', 'Verified by AI', true),
            _buildTimelineStep('Team Dispatched', '09:45 AM', 'NDRF Unit 4', true),
            _buildTimelineStep('In Progress', '10:15 AM', 'Relief operations', true, isActive: true),
            _buildTimelineStep('Resolution', 'Pending', 'Awaiting safety check', false),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFD),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE4EAF4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Safety Instructions',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF102043)),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Help is on the way. Please stay at your current location and keep your phone charged. Avoid contact with flood water.',
                    style: TextStyle(color: Color(0xFF65728A), fontSize: 13, height: 1.5),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.call, size: 18),
                    label: const Text('Contact Assigned Unit'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0757E8),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 44),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildTimelineStep(String label, String time, String subtitle, bool isCompleted, {bool isActive = false}) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Column(
            children: [
              Container(
                width: 14,
                height: 14,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCompleted ? const Color(0xFF09A86B) : Colors.white,
                  border: Border.all(
                    color: isCompleted ? const Color(0xFF09A86B) : const Color(0xFFDCE3F0),
                    width: 2,
                  ),
                ),
                child: isCompleted
                    ? const Icon(Icons.check, color: Colors.white, size: 8)
                    : null,
              ),
              Expanded(
                child: Container(
                  width: 2,
                  color: const Color(0xFFF0F3F8),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                          color: isActive ? const Color(0xFF0757E8) : const Color(0xFF102043),
                        ),
                      ),
                      Text(
                        time,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF65728A)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
