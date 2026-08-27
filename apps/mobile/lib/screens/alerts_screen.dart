import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});
  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  final _api = crisisApi;
  late Future<List<dynamic>> _alerts;
  StreamSubscription<SocketEvent>? _eventsSubscription;

  @override
  void initState() {
    super.initState();
    _alerts = _load();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if ((event.name == 'alert.created' || event.name == 'alert.updated') && mounted) setState(() => _alerts = _load());
    });
  }

  @override
  void dispose() { _eventsSubscription?.cancel(); super.dispose(); }

  Future<List<dynamic>> _load() async {
    final response = await _api.getAlerts();
    return _api.recordsFrom(response);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _alerts,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) return Center(child: TextButton(onPressed: () => setState(() => _alerts = _load()), child: const Text('Alerts unavailable. Retry')));
        final items = snapshot.data ?? [];
        if (items.isEmpty) return const Center(child: Text('No alerts reported'));
        return RefreshIndicator(
          onRefresh: () async => setState(() => _alerts = _load()),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) return const Padding(padding: EdgeInsets.only(bottom: 14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Alerts Center', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w700, color: Color(0xFF102043))), SizedBox(height: 4), Text('Live warnings from the CrisisMesh network', style: TextStyle(color: Color(0xFF65728A)))]));
              final item = items[index - 1] as Map<String, dynamic>;
              final critical = item['severity'] == 'CRITICAL';
              return Card(color: critical ? const Color(0xFFFFF0F1) : Colors.white, child: ListTile(contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), leading: CircleAvatar(backgroundColor: critical ? const Color(0xFFFFDFE1) : const Color(0xFFFFF0DB), child: Icon(critical ? Icons.warning_rounded : Icons.info_outline, color: critical ? const Color(0xFFD92835) : const Color(0xFFF27C1B))), title: Text('${item['title'] ?? item['type'] ?? 'Alert'}', style: const TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF102043))), subtitle: Text('${item['description'] ?? 'No description'}\n${item['severity'] ?? 'UNKNOWN'} · ${item['status'] ?? 'ACTIVE'}'), isThreeLine: true));
            },
          ),
        );
      },
    );
  }
}
