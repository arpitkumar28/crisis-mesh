import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

final dashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final response = await crisisApi.getDashboardOverview();
  return crisisApi.dataFrom(response) as Map<String, dynamic>;
});

final dashboardNotifierProvider = StateNotifierProvider<DashboardNotifier, AsyncValue<Map<String, dynamic>>>((ref) {
  return DashboardNotifier();
});

class DashboardNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  DashboardNotifier() : super(const AsyncValue.loading());

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    try {
      final response = await crisisApi.getDashboardOverview();
      final data = crisisApi.dataFrom(response) as Map<String, dynamic>;
      state = AsyncValue.data(data);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
