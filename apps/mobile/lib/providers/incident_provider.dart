import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import 'dart:async';

class IncidentNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  IncidentNotifier(this._api, this._ws) : super(const AsyncValue.loading()) {
    _init();
  }

  final ApiService _api;
  final WebSocketService _ws;
  StreamSubscription? _subscription;

  Future<void> _init() async {
    await refresh();
    _subscription = _ws.events.listen((event) {
      if (event.name.startsWith('incident.')) {
        refresh();
      }
    });
  }

  Future<void> refresh() async {
    try {
      final response = await _api.getActiveIncidents();
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

final incidentsProvider = StateNotifierProvider<IncidentNotifier, AsyncValue<List<Map<String, dynamic>>>>((ref) {
  return IncidentNotifier(crisisApi, crisisWebSocket);
});

final incidentStatsProvider = FutureProvider((ref) async {
  final response = await crisisApi.getIncidentCountByStatus();
  return crisisApi.dataFrom(response);
});

final incidentDetailProvider = FutureProvider.family<Map<String, dynamic>?, String>((ref, id) async {
  // Listen to socket events to refresh this provider if the incident changes
  final ws = crisisWebSocket;
  final subscription = ws.events.listen((event) {
    if (event.name.startsWith('incident.') && event.data['id'] == id) {
       ref.invalidateSelf();
    }
  });

  ref.onDispose(() => subscription.cancel());

  final response = await crisisApi.getIncidentById(id);
  return crisisApi.dataFrom(response);
});
