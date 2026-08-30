import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/incident_provider.dart';

class IncidentDetailsScreen extends ConsumerWidget {
  final String incidentId;
  const IncidentDetailsScreen({super.key, required this.incidentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final incidentAsync = ref.watch(incidentDetailProvider(incidentId));

    return Scaffold(
      appBar: AppBar(title: const Text('Incident Details')),
      body: incidentAsync.when(
        data: (incident) {
          if (incident == null) return const Center(child: Text('Incident not found'));
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      incident['type'] ?? 'Incident',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
                    ),
                    _SeverityBadge(severity: incident['severity'] ?? 'MEDIUM'),
                  ],
                ),
                const SizedBox(height: 8),
                Text('ID: ${incident['id']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 24),
                const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(incident['description'] ?? 'No description provided.'),
                const SizedBox(height: 24),
                const Text('Location', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(incident['location']?['address'] ?? 'Jaipur, Rajasthan'),
                const SizedBox(height: 24),
                const Text('Status Timeline', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _StatusTimelineItem(
                  status: 'Reported',
                  time: '10:30 AM',
                  isCompleted: true,
                ),
                _StatusTimelineItem(
                  status: incident['status'] ?? 'Processing',
                  time: '10:45 AM',
                  isCompleted: incident['status'] != 'REPORTED',
                  isActive: true,
                ),
                const SizedBox(height: 32),
                if (incident['status'] == 'REPORTED')
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFD92835),
                        side: const BorderSide(color: Color(0xFFD92835)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('CANCEL REPORT'),
                    ),
                  ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class _SeverityBadge extends StatelessWidget {
  final String severity;
  const _SeverityBadge({required this.severity});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (severity.toUpperCase()) {
      case 'CRITICAL': color = const Color(0xFFD92835); break;
      case 'HIGH': color = Colors.orange; break;
      case 'MEDIUM': color = Colors.amber; break;
      default: color = Colors.green;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
      child: Text(severity, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
    );
  }
}

class _StatusTimelineItem extends StatelessWidget {
  final String status;
  final String time;
  final bool isCompleted;
  final bool isActive;

  const _StatusTimelineItem({required this.status, required this.time, this.isCompleted = false, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(
            isCompleted ? Icons.check_circle : (isActive ? Icons.radio_button_checked : Icons.radio_button_off),
            color: isCompleted ? Colors.green : (isActive ? const Color(0xFF0757E8) : Colors.grey),
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(status, style: TextStyle(fontWeight: isActive ? FontWeight.bold : FontWeight.normal)),
          const Spacer(),
          Text(time, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }
}
