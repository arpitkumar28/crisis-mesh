import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/incident_provider.dart';

class SOSTrackingScreen extends ConsumerWidget {
  final String incidentId;
  const SOSTrackingScreen({super.key, required this.incidentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final incidentAsync = ref.watch(incidentDetailProvider(incidentId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Tracking'),
        backgroundColor: const Color(0xFFD92835),
        foregroundColor: Colors.white,
      ),
      body: incidentAsync.when(
        data: (incident) => _buildContent(context, incident),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error tracking SOS: $e')),
      ),
    );
  }

  Widget _buildContent(BuildContext context, Map<String, dynamic>? incident) {
    if (incident == null) return const Center(child: Text('Incident not found'));

    return Column(
      children: [
        Container(
          height: 250,
          width: double.infinity,
          color: Colors.grey[200],
          child: const Center(
            child: Icon(Icons.map, size: 50, color: Colors.grey),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Emergency Alert Sent', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(20)),
                      child: Text(
                        incident['status'] ?? 'PENDING',
                        style: const TextStyle(color: Color(0xFFD92835), fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('Help is on the way. Please stay where you are.', style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 32),
                _StatusStep(
                  title: 'Signal Received',
                  subtitle: 'Emergency services have been notified.',
                  isActive: true,
                  isCompleted: true,
                ),
                _StatusStep(
                  title: 'Responder Dispatched',
                  subtitle: 'A team is heading to your location.',
                  isActive: incident['status'] != 'REPORTED',
                  isCompleted: incident['status'] == 'ASSIGNED' || incident['status'] == 'IN_PROGRESS',
                ),
                _StatusStep(
                  title: 'Arrival',
                  subtitle: 'Estimated time: 5-10 mins',
                  isActive: incident['status'] == 'IN_PROGRESS',
                  isCompleted: incident['status'] == 'RESOLVED',
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFD92835),
                      side: const BorderSide(color: Color(0xFFD92835)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('CANCEL ALERT', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StatusStep extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isActive;
  final bool isCompleted;

  const _StatusStep({required this.title, required this.subtitle, required this.isActive, required this.isCompleted});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCompleted ? Colors.green : (isActive ? const Color(0xFFD92835) : Colors.grey[300]),
                ),
                child: isCompleted ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
              ),
              Container(width: 2, height: 40, color: Colors.grey[200]),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isActive ? Colors.black : Colors.grey)),
                Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
