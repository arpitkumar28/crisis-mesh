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
  @override
  void initState() {
    super.initState();
    _markers = _loadMarkers();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if (event.name == 'device.updated' || event.name == 'device.status_changed' || event.name == 'alert.created' || event.name == 'incident.created') {
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
    final responses = await Future.wait([crisisApi.getDevices(), crisisApi.getAlerts(), crisisApi.getIncidents()]);
    final markers = <Marker>[];
    for (var group = 0; group < responses.length; group++) {
      final records = crisisApi.recordsFrom(responses[group]);
      for (final raw in records) {
        final location = raw['location'] is Map ? raw['location'] as Map : const {};
        final lat = num.tryParse('${raw['latitude'] ?? raw['lat'] ?? location['latitude'] ?? location['lat'] ?? ''}');
        final lng = num.tryParse('${raw['longitude'] ?? raw['lng'] ?? location['longitude'] ?? location['lng'] ?? ''}');
        if (lat == null || lng == null || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
        final color = group == 0 ? const Color(0xFF159B55) : group == 1 ? const Color(0xFFD92835) : const Color(0xFFF27C1B);
        markers.add(Marker(point: LatLng(lat.toDouble(), lng.toDouble()), width: 38, height: 38, child: Icon(Icons.location_on, size: 36, color: color)));
      }
    }
    return markers;
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<List<Marker>>(
    future: _markers,
    builder: (context, snapshot) => Stack(children: [
      FlutterMap(options: const MapOptions(initialCenter: LatLng(20.5937, 78.9629), initialZoom: 5), children: [
        TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', userAgentPackageName: 'com.crisismesh.mobile'),
        if (snapshot.hasData) MarkerLayer(markers: snapshot.data!),
        const RichAttributionWidget(attributions: [TextSourceAttribution('OpenStreetMap contributors')]),
      ]),
      Positioned(top: 16, left: 16, right: 16, child: Card(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12), child: Row(children: [const Icon(Icons.map_outlined, color: Color(0xFF0757E8)), const SizedBox(width: 10), const Expanded(child: Text('Live disaster map', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF102043)))), if (snapshot.connectionState == ConnectionState.waiting) const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)), IconButton(onPressed: () => setState(() => _markers = _loadMarkers()), icon: const Icon(Icons.refresh))])))),
      if (snapshot.hasError) Positioned(bottom: 20, left: 16, right: 16, child: Card(child: Padding(padding: const EdgeInsets.all(12), child: Text('Map data is unavailable. Retry when the API is restored.', style: TextStyle(color: Colors.red.shade700))))),
    ]),
  );
}
