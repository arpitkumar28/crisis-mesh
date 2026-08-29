import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import 'dart:async';

class AlertNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  AlertNotifier(this._api, this._ws) : super(const AsyncValue.loading()) {
    _init();
  }

  final ApiService _api;
  final WebSocketService _ws;
  StreamSubscription? _subscription;

  Future<void> _init() async {
    await refresh();
    _subscription = _ws.events.listen((event) {
      if (event.name.startsWith('alert.')) {
        refresh();
      }
    });
  }

  Future<void> refresh() async {
    // Keep current data while loading if possible, or just show loading
    // state = AsyncValue.loading(); 
    try {
      final response = await _api.getActiveAlerts();
      final data = _api.recordsFrom(response);
      state = AsyncValue.data(data);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

final alertsProvider = StateNotifierProvider<AlertNotifier, AsyncValue<List<Map<String, dynamic>>>>((ref) {
  return AlertNotifier(crisisApi, crisisWebSocket);
});

final criticalAlertsProvider = FutureProvider((ref) async {
  final response = await crisisApi.getCriticalAlerts();
  return crisisApi.recordsFrom(response);
});

final alertStatsProvider = FutureProvider((ref) async {
  final response = await crisisApi.getAlertCountByStatus();
  return crisisApi.dataFrom(response);
});
