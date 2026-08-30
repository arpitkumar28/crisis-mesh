import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

class SheltersScreen extends ConsumerStatefulWidget {
  const SheltersScreen({super.key});

  @override
  ConsumerState<SheltersScreen> createState() => _SheltersScreenState();
}

class _SheltersScreenState extends ConsumerState<SheltersScreen> {
  late Future<List<Map<String, dynamic>>> _sheltersFuture;

  @override
  void initState() {
    super.initState();
    _sheltersFuture = _fetchShelters();
  }

  Future<List<Map<String, dynamic>>> _fetchShelters() async {
    final response = await crisisApi.getShelters();
    return crisisApi.recordsFrom(response);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FC),
      appBar: AppBar(title: const Text('Nearby Shelters')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _sheltersFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));
          
          final shelters = snapshot.data ?? [];
          if (shelters.isEmpty) return const Center(child: Text('No shelters found nearby'));

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: shelters.length,
            itemBuilder: (context, index) {
              final shelter = shelters[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                            child: const Icon(Icons.home_work_outlined, color: Colors.blue),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(shelter['name'] ?? 'Emergency Shelter', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                Text(shelter['address'] ?? 'Unknown address', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.green[50], borderRadius: BorderRadius.circular(4)),
                            child: Text(
                              '${shelter['capacity_status'] ?? 'Available'}',
                              style: TextStyle(color: Colors.green[700], fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _ShelterInfo(icon: Icons.people_outline, label: 'Capacity', value: '${shelter['capacity'] ?? 0}'),
                          _ShelterInfo(icon: Icons.near_me_outlined, label: 'Distance', value: '2.4 km'),
                          ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0757E8),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Navigate'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _ShelterInfo extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ShelterInfo({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: Colors.grey),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
