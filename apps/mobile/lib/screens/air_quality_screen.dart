import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

class AirQualityScreen extends ConsumerStatefulWidget {
  const AirQualityScreen({super.key});

  @override
  ConsumerState<AirQualityScreen> createState() => _AirQualityScreenState();
}

class _AirQualityScreenState extends ConsumerState<AirQualityScreen> {
  late Future<Map<String, dynamic>> _aqiFuture;

  @override
  void initState() {
    super.initState();
    _aqiFuture = _fetchAQI();
  }

  Future<Map<String, dynamic>> _fetchAQI() async {
    // Current coordinates for Jaipur (example from weather screen)
    final response = await crisisApi.getAirQuality(26.9124, 75.7873);
    final data = response.data is Map<String, dynamic> ? response.data['data'] : response.data;
    return Map<String, dynamic>.from(data as Map);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Air Quality Index')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _aqiFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));
          
          final data = snapshot.data!;
          final aqi = data['aqi'] ?? 68;
          final status = data['status'] ?? 'Moderate';
          final color = _getAQIColor(aqi);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text('Jaipur, Rajasthan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 40),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 200,
                      height: 200,
                      child: CircularProgressIndicator(
                        value: aqi / 500,
                        strokeWidth: 15,
                        color: color,
                        backgroundColor: color.withValues(alpha: 0.1),
                      ),
                    ),
                    Column(
                      children: [
                        Text('$aqi', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: color)),
                        Text(status, style: TextStyle(fontSize: 18, color: color, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 40),
                const Align(alignment: Alignment.centerLeft, child: Text('Pollutants', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                const SizedBox(height: 16),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  childAspectRatio: 2.5,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  children: [
                    _PollutantCard(label: 'PM2.5', value: '${data['pm25'] ?? 24}', unit: 'µg/m³'),
                    _PollutantCard(label: 'PM10', value: '${data['pm10'] ?? 52}', unit: 'µg/m³'),
                    _PollutantCard(label: 'CO', value: '${data['co'] ?? 0.6}', unit: 'ppm'),
                    _PollutantCard(label: 'NO2', value: '${data['no2'] ?? 15}', unit: 'ppb'),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Color _getAQIColor(int aqi) {
    if (aqi <= 50) return Colors.green;
    if (aqi <= 100) return Colors.yellow[700]!;
    if (aqi <= 150) return Colors.orange;
    if (aqi <= 200) return Colors.red;
    if (aqi <= 300) return Colors.purple;
    return Colors.brown;
  }
}

class _PollutantCard extends StatelessWidget {
  final String label;
  final String value;
  final String unit;

  const _PollutantCard({required this.label, required this.value, required this.unit});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFD), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE4EAF4))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          Row(
            children: [
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(width: 4),
              Text(unit, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}
