import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class LiveSituationScreen extends StatelessWidget {
  const LiveSituationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Situation'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            options: const MapOptions(
              initialCenter: LatLng(26.9124, 75.7873),
              initialZoom: 11,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.crisismesh.mobile',
              ),
              // Simulating heatmaps or large incident clusters
              CircleLayer(
                circles: [
                  CircleMarker(
                    point: const LatLng(26.9124, 75.7873),
                    color: Colors.red.withValues(alpha: 0.3),
                    borderStrokeWidth: 2,
                    borderColor: Colors.red,
                    useRadiusInMeter: true,
                    radius: 2000,
                  ),
                  CircleMarker(
                    point: const LatLng(26.8500, 75.8200),
                    color: Colors.orange.withValues(alpha: 0.3),
                    borderStrokeWidth: 2,
                    borderColor: Colors.orange,
                    useRadiusInMeter: true,
                    radius: 1500,
                  ),
                ],
              ),
              const MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(26.9124, 75.7873),
                    width: 40,
                    height: 40,
                    child: Icon(Icons.warning, color: Colors.red, size: 30),
                  ),
                  Marker(
                    point: LatLng(26.8500, 75.8200),
                    width: 40,
                    height: 40,
                    child: Icon(Icons.local_fire_department, color: Colors.orange, size: 30),
                  ),
                ],
              ),
            ],
          ),
          _buildSummaryOverlay(),
          _buildMapControls(),
        ],
      ),
    );
  }

  Widget _buildSummaryOverlay() {
    return Positioned(
      top: 16,
      left: 16,
      right: 16,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10),
          ],
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _SummaryItem(label: 'Incidents', value: '12', color: Colors.red),
            _SummaryItem(label: 'Affected', value: '3.2k', color: Colors.orange),
            _SummaryItem(label: 'Responders', value: '45', color: Colors.blue),
            _SummaryItem(label: 'Critical', value: '4', color: Colors.purple),
          ],
        ),
      ),
    );
  }

  Widget _buildMapControls() {
    return Positioned(
      bottom: 100,
      right: 16,
      child: Column(
        children: [
          _MapFab(icon: Icons.layers, onPressed: () {}),
          const SizedBox(height: 8),
          _MapFab(icon: Icons.my_location, onPressed: () {}),
        ],
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _SummaryItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF65728A))),
      ],
    );
  }
}

class _MapFab extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _MapFab({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.small(
      heroTag: null,
      onPressed: onPressed,
      backgroundColor: Colors.white,
      child: Icon(icon, color: const Color(0xFF102043)),
    );
  }
}
