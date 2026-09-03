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
  String _activeFilter = 'All';

  @override
  void initState() {
    super.initState();
    _alerts = _load();
    _eventsSubscription = crisisWebSocket.events.listen((event) {
      if ((event.name == 'alert.created' || event.name == 'alert.updated') && mounted) {
        setState(() => _alerts = _load());
      }
    });
  }

  @override
  void dispose() {
    _eventsSubscription?.cancel();
    super.dispose();
  }

  Future<List<dynamic>> _load() async {
    final response = await _api.getAlerts();
    return _api.recordsFrom(response);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Live Alerts'),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Color(0xFF102043)),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterTabs(),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: _alerts,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: TextButton(onPressed: () => setState(() => _alerts = _load()), child: const Text('Alerts unavailable. Retry')));
                }
                final items = snapshot.data ?? [];
                final filteredItems = _filterAlerts(items);

                if (filteredItems.isEmpty) {
                  return const Center(child: Text('No active alerts in this category', style: TextStyle(color: Color(0xFF65728A))));
                }

                return RefreshIndicator(
                  onRefresh: () async => setState(() => _alerts = _load()),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: filteredItems.length,
                    itemBuilder: (context, index) {
                      final item = filteredItems[index] as Map<String, dynamic>;
                      return _buildAlertCard(item);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildTab('All', 'All'),
            const SizedBox(width: 8),
            _buildTab('Critical', 'CRITICAL'),
            const SizedBox(width: 8),
            _buildTab('High', 'HIGH'),
            const SizedBox(width: 8),
            _buildTab('Medium', 'MEDIUM'),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String label, String value) {
    final active = _activeFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF0757E8) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active ? const Color(0xFF0757E8) : const Color(0xFFE4EAF4),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : const Color(0xFF65728A),
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  List<dynamic> _filterAlerts(List<dynamic> items) {
    if (_activeFilter == 'All') return items;
    return items.where((item) => item['severity'] == _activeFilter).toList();
  }

  Widget _buildAlertCard(Map<String, dynamic> item) {
    final severity = item['severity']?.toString().toUpperCase() ?? 'MEDIUM';
    final isCritical = severity == 'CRITICAL';
    final color = isCritical ? Colors.red : (severity == 'HIGH' ? Colors.orange : Colors.blue);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCritical ? Icons.warning_rounded : Icons.info_outline,
              color: color,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      severity,
                      style: TextStyle(
                        color: color,
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                    const Text('12m ago', style: TextStyle(color: Color(0xFF65728A), fontSize: 10)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item['title'] ?? item['type'] ?? 'Alert',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF102043),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item['description'] ?? 'No details provided.',
                  style: const TextStyle(color: Color(0xFF65728A), fontSize: 13),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
