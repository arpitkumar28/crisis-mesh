import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class LiveSituationScreen extends StatelessWidget {
  const LiveSituationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Column(
          children: [
            const Text(
              'Live Situation',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF102043),
              ),
            ),
            Text(
              'Rajasthan',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ],
        ),
        backgroundColor: Colors.white.withValues(alpha: 0.9),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF102043)),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Color(0xFF102043)),
            onPressed: () {},
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            options: const MapOptions(
              initialCenter: LatLng(26.9124, 75.7873),
              initialZoom: 12,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.crisismesh.mobile',
              ),
              CircleLayer(
                circles: [
                  CircleMarker(
                    point: const LatLng(26.9124, 75.7873),
                    color: Colors.red.withValues(alpha: 0.2),
                    borderStrokeWidth: 2,
                    borderColor: Colors.red.withValues(alpha: 0.5),
                    useRadiusInMeter: true,
                    radius: 1000,
                  ),
                  CircleMarker(
                    point: const LatLng(26.9300, 75.8000),
                    color: Colors.orange.withValues(alpha: 0.2),
                    borderStrokeWidth: 2,
                    borderColor: Colors.orange.withValues(alpha: 0.5),
                    useRadiusInMeter: true,
                    radius: 800,
                  ),
                ],
              ),
              const MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(26.9124, 75.7873),
                    width: 40,
                    height: 40,
                    child: Icon(Icons.location_on, color: Colors.red, size: 40),
                  ),
                  Marker(
                    point: LatLng(26.9300, 75.8000),
                    width: 40,
                    height: 40,
                    child: Icon(Icons.location_on, color: Colors.orange, size: 40),
                  ),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 24,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _LegendItem(color: Colors.red, label: 'Critical'),
                  _LegendItem(color: Colors.orange, label: 'Medium'),
                  _LegendItem(color: Colors.blue, label: 'Low'),
                  _LegendItem(color: Colors.green, label: 'Safe'),
                ],
              ),
            ),
          ),
          const Positioned(
            bottom: 100,
            right: 20,
            child: Column(
              children: [
                _MapButton(icon: Icons.add),
                SizedBox(height: 8),
                _MapButton(icon: Icons.remove),
                SizedBox(height: 16),
                _MapButton(icon: Icons.my_location, color: Color(0xFF0757E8)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}

class _MapButton extends StatelessWidget {
  final IconData icon;
  final Color? color;

  const _MapButton({required this.icon, this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4),
        ],
      ),
      child: Icon(icon, color: color ?? const Color(0xFF102043), size: 20),
    );
  }
}
