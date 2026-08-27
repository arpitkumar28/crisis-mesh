import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';

class IncidentsScreen extends StatefulWidget {
  const IncidentsScreen({super.key});
  @override
  State<IncidentsScreen> createState() => _IncidentsScreenState();
}

class _IncidentsScreenState extends State<IncidentsScreen> {
  final _api = crisisApi;
  late Future<List<dynamic>> _incidents;
  StreamSubscription<SocketEvent>? _eventsSubscription;

  @override
  void initState() {
    super.initState();
    _incidents = _load();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if ((event.name == 'incident.created' || event.name == 'incident.updated' || event.name == 'incident.status_changed') && mounted) setState(() => _incidents = _load());
    });
  }

  @override
  void dispose() { _eventsSubscription?.cancel(); super.dispose(); }

  Future<List<dynamic>> _load() async {
    final response = await _api.getIncidents();
    return _api.recordsFrom(response);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _incidents,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) return Center(child: TextButton(onPressed: () => setState(() => _incidents = _load()), child: const Text('Incidents are unavailable. Retry')));
        final items = snapshot.data ?? [];
        if (items.isEmpty) return const Center(child: Text('No incidents reported'));
        return ListView.builder(padding: const EdgeInsets.all(16), itemCount: items.length + 1, itemBuilder: (context, index) { if (index == 0) return const Padding(padding: EdgeInsets.only(bottom: 14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Active Incidents', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w700, color: Color(0xFF102043))), SizedBox(height: 4), Text('Track and manage field response', style: TextStyle(color: Color(0xFF65728A)))])); final item = items[index - 1] as Map<String, dynamic>; return Card(child: ListTile(contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), leading: const CircleAvatar(backgroundColor: Color(0xFFFFEEE7), child: Icon(Icons.report_outlined, color: Color(0xFFF15B2A))), title: Text('${item['title'] ?? item['type'] ?? 'Incident'}', style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF102043))), subtitle: Text('${item['description'] ?? 'No description'}\n${item['severity'] ?? 'UNKNOWN'} · ${item['status'] ?? 'REPORTED'}'), isThreeLine: true)); });
      },
    );
  }
}
