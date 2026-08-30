import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class NavigationScreen extends StatelessWidget {
  const NavigationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            options: const MapOptions(
              initialCenter: LatLng(26.9124, 75.7873),
              initialZoom: 16,
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
                      const LatLng(26.9184, 75.7803),
                      const LatLng(26.9154, 75.7833),
                      const LatLng(26.9124, 75.7873),
                    ],
                    strokeWidth: 8,
                    color: const Color(0xFF0757E8),
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
                ],
              ),
            ],
          ),
          
          // Guidance Overlay
          Positioned(
            top: 60,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0757E8),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                  )
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.turn_right, color: Colors.white, size: 48),
                  SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '200 m',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Turn right onto Ajmer Road',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Bottom Info
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                  )
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildNavStat('8 min', 'Time'),
                      _buildNavStat('2.1 km', 'Distance'),
                      _buildNavStat('11:53', 'Arrival'),
                    ],
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Exit Navigation', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF102043),
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF65728A),
          ),
        ),
      ],
    );
  }
}
