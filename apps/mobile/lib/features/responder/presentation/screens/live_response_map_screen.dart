import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class LiveResponseMapScreen extends StatelessWidget {
  const LiveResponseMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Response Map'),
        actions: [
          IconButton(icon: const Icon(Icons.layers_outlined), onPressed: () {}),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            options: const MapOptions(
              initialCenter: LatLng(26.9124, 75.7873),
              initialZoom: 14,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.crisismesh.mobile',
              ),
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: [
                      const LatLng(26.9224, 75.7773),
                      const LatLng(26.9184, 75.7803),
                      const LatLng(26.9154, 75.7833),
                      const LatLng(26.9124, 75.7873),
                    ],
                    strokeWidth: 5,
                    color: const Color(0xFF0757E8),
                  ),
                ],
              ),
              const MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(26.9224, 75.7773),
                    width: 40,
                    height: 40,
                    child: Icon(Icons.navigation, color: Color(0xFF0757E8), size: 30),
                  ),
                  Marker(
                    point: LatLng(26.9124, 75.7873),
                    width: 40,
                    height: 40,
                    child: Icon(Icons.location_on, color: Colors.red, size: 35),
                  ),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 20,
            left: 16,
            right: 16,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.blue.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.timer, color: Color(0xFF0757E8), size: 20),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('ETA: 8 mins', style: TextStyle(fontWeight: FontWeight.bold)),
                              Text('2.1 km away · Via Ajmer Road', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0757E8),
                            foregroundColor: Colors.white,
                            elevation: 0,
                          ),
                          child: const Text('Navigate'),
                        ),
                      ],
                    ),
                    const Divider(height: 24),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _MapAction(icon: Icons.group, label: 'Teams'),
                        _MapAction(icon: Icons.inventory_2, label: 'Resources'),
                        _MapAction(icon: Icons.warning, label: 'Hazards'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const Positioned(
            top: 16,
            right: 16,
            child: Column(
              children: [
                _MapToolButton(icon: Icons.my_location),
                SizedBox(height: 8),
                _MapToolButton(icon: Icons.add),
                SizedBox(height: 8),
                _MapToolButton(icon: Icons.remove),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MapAction extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MapAction({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF65728A)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF65728A))),
      ],
    );
  }
}

class _MapToolButton extends StatelessWidget {
  final IconData icon;

  const _MapToolButton({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
          )
        ],
      ),
      child: IconButton(
        icon: Icon(icon, color: const Color(0xFF102043)),
        onPressed: () {},
      ),
    );
  }
}
