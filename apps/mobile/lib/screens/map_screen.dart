import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});
  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  late Future<List<Marker>> _markers;
  StreamSubscription<SocketEvent>? _eventsSubscription;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _markers = _loadMarkers();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if (event.name == 'device.updated' || 
          event.name == 'alert.created' || 
          event.name == 'incident.created') {
        if (mounted) setState(() => _markers = _loadMarkers());
      }
    });
  }

  @override
  void dispose() {
    _eventsSubscription?.cancel();
    super.dispose();
  }

  Future<List<Marker>> _loadMarkers() async {
    final responses = await Future.wait([
      crisisApi.getDevices(),
      crisisApi.getAlerts(),
      crisisApi.getIncidents()
    ]);
    
    final markers = <Marker>[];
    for (var group = 0; group < responses.length; group++) {
      final records = crisisApi.recordsFrom(responses[group]);
      for (final raw in records) {
        final location = raw['location'] is Map ? raw['location'] as Map : const {};
        final lat = num.tryParse('${raw['latitude'] ?? raw['lat'] ?? location['latitude'] ?? location['lat'] ?? ''}');
        final lng = num.tryParse('${raw['longitude'] ?? raw['lng'] ?? location['longitude'] ?? location['lng'] ?? ''}');
        
        if (lat == null || lng == null) continue;

        Color color;
        IconData icon;
        if (group == 0) { // Devices/Sensors
          color = Colors.green;
          icon = Icons.sensors;
        } else if (group == 1) { // Alerts
          color = Colors.orange;
          icon = Icons.warning_rounded;
        } else { // Incidents
          color = Colors.red;
          icon = Icons.error_rounded;
        }

        markers.add(
          Marker(
            point: LatLng(lat.toDouble(), lng.toDouble()),
            width: 40,
            height: 40,
            child: Container(
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: color, width: 2),
              ),
              child: Icon(icon, size: 20, color: color),
            ),
          ),
        );
      }
    }
    return markers;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          FutureBuilder<List<Marker>>(
            future: _markers,
            builder: (context, snapshot) => FlutterMap(
              mapController: _mapController,
              options: const MapOptions(
                initialCenter: LatLng(26.9124, 75.7873), // Jaipur
                initialZoom: 12,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.crisismesh.mobile',
                ),
                if (snapshot.hasData) MarkerLayer(markers: snapshot.data!),
              ],
            ),
          ),
          
          // Header / Search Bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search, color: Color(0xFF65728A)),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'Search safe zones, shelters...',
                            style: TextStyle(color: Color(0xFF65728A), fontSize: 14),
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 24,
                          color: const Color(0xFFE4EAF4),
                          margin: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                        const Icon(Icons.mic_none_rounded, color: Color(0xFF0757E8)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('All', true),
                        _buildFilterChip('Shelters', false),
                        _buildFilterChip('Incidents', false),
                        _buildFilterChip('Safe Zones', false),
                        _buildFilterChip('Hospitals', false),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Legend Overlay
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, -4)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Live Situation',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF102043)),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildLegendItem(Colors.red, 'Incidents'),
                      _buildLegendItem(Colors.orange, 'Alerts'),
                      _buildLegendItem(Colors.green, 'Safe Zones'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Map Controls
          Positioned(
            right: 16,
            bottom: 140,
            child: Column(
              children: [
                _buildMapFab(Icons.add, () => _mapController.move(_mapController.camera.center, _mapController.camera.zoom + 1)),
                const SizedBox(height: 8),
                _buildMapFab(Icons.remove, () => _mapController.move(_mapController.camera.center, _mapController.camera.zoom - 1)),
                const SizedBox(height: 16),
                _buildMapFab(Icons.my_location, () {}, color: const Color(0xFF0757E8)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: active ? const Color(0xFF0757E8) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: active ? const Color(0xFF0757E8) : const Color(0xFFE4EAF4)),
        boxShadow: active ? null : [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)],
      ),
      child: Text(
        label,
        style: TextStyle(
          color: active ? Colors.white : const Color(0xFF65728A),
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A), fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildMapFab(IconData icon, VoidCallback onTap, {Color? color}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)],
        ),
        child: Icon(icon, color: color ?? const Color(0xFF102043), size: 20),
      ),
    );
  }
}
