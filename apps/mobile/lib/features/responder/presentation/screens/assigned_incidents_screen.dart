import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../providers/incident_provider.dart';

class AssignedIncidentsScreen extends ConsumerWidget {
  const AssignedIncidentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final incidentsAsync = ref.watch(incidentsProvider);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Assigned Incidents'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Active'),
              Tab(text: 'Completed'),
              Tab(text: 'All'),
            ],
            labelColor: Color(0xFF0757E8),
            indicatorColor: Color(0xFF0757E8),
          ),
        ),
        body: incidentsAsync.when(
          data: (incidents) => TabBarView(
            children: [
              _buildIncidentList(incidents.where((i) => i['status'] != 'RESOLVED').toList()),
              _buildIncidentList(incidents.where((i) => i['status'] == 'RESOLVED').toList()),
              _buildIncidentList(incidents),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
        ),
      ),
    );
  }

  Widget _buildIncidentList(List<Map<String, dynamic>> incidents) {
    if (incidents.isEmpty) {
      return const Center(child: Text('No incidents found'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: incidents.length,
      itemBuilder: (context, index) {
        final incident = incidents[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _buildIncidentItem(
            id: incident['id']?.toString().substring(0, 8).toUpperCase() ?? 'INC-XXXX',
            type: incident['type'] ?? 'Incident',
            location: incident['location_name'] ?? 'Unknown Location',
            severity: incident['severity'] ?? 'MEDIUM',
            status: incident['status'] ?? 'UNKNOWN',
            time: 'Just now', // Ideally parse updated_at
            description: incident['description'] ?? 'No description provided.',
          ),
        );
      },
    );
  }

  Widget _buildIncidentItem({
    required String id,
    required String type,
    required String location,
    required String severity,
    required String status,
    required String time,
    required String description,
  }) {
    Color severityColor;
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        severityColor = Colors.red;
        break;
      case 'MEDIUM':
        severityColor = Colors.orange;
        break;
      default:
        severityColor = Colors.blue;
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  id,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF65728A),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: severityColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    severity,
                    style: TextStyle(
                      color: severityColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              type,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF65728A)),
                const SizedBox(width: 4),
                Text(location, style: const TextStyle(color: Color(0xFF65728A))),
              ],
            ),
            const Divider(height: 24),
            Text(
              description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Color(0xFF102043)),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Status', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
                    Text(
                      status,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0757E8),
                      ),
                    ),
                  ],
                ),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0757E8),
                    foregroundColor: Colors.white,
                    elevation: 0,
                  ),
                  child: const Text('View Details'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
