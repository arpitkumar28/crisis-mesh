import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';

class DevicesScreen extends StatefulWidget {
  const DevicesScreen({super.key});
  @override
  State<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends State<DevicesScreen> {
  final _api = crisisApi;
  late Future<List<dynamic>> _devices;
  StreamSubscription<SocketEvent>? _eventsSubscription;

  @override
  void initState() {
    super.initState();
    _devices = _load();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if ((event.name == 'device.updated' || event.name == 'device.status_changed' || event.name == 'telemetry.updated') && mounted) setState(() => _devices = _load());
    });
  }

  @override
  void dispose() { _eventsSubscription?.cancel(); super.dispose(); }

  Future<List<dynamic>> _load() async {
    final response = await _api.getDevices();
    return _api.recordsFrom(response);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _devices,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) return Center(child: TextButton(onPressed: () => setState(() => _devices = _load()), child: const Text('Devices are unavailable. Retry')));
        final items = snapshot.data ?? [];
        if (items.isEmpty) return const Center(child: Text('No devices registered'));
        return ListView.builder(
          padding: const EdgeInsets.all(16), itemCount: items.length + 1,
          itemBuilder: (context, index) {
            if (index == 0) return const Padding(padding: EdgeInsets.only(bottom: 14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Sensor Network', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w700, color: Color(0xFF102043))), SizedBox(height: 4), Text('Operational status of field devices', style: TextStyle(color: Color(0xFF65728A)))]));
            final item = items[index - 1] as Map<String, dynamic>;
            final online = item['status'] == 'ONLINE';
            return Card(child: ListTile(contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), leading: CircleAvatar(backgroundColor: online ? const Color(0xFFE6F8EF) : const Color(0xFFF0F3F8), child: Icon(Icons.sensors, color: online ? const Color(0xFF159B55) : Colors.grey)), title: Text('${item['name'] ?? item['serial_number'] ?? 'Device'}', style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF102043))), subtitle: Text('${item['type'] ?? 'Sensor'} · ${item['status'] ?? 'UNKNOWN'}'), trailing: item['battery_level'] == null ? null : Text('${item['battery_level']}%', style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF0757E8)))));
          },
        );
      },
    );
  }
}
