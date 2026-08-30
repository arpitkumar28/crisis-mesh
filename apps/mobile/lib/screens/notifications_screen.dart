import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  late Future<List<Map<String, dynamic>>> _notificationsFuture;

  @override
  void initState() {
    super.initState();
    _notificationsFuture = _fetchNotifications();
  }

  Future<List<Map<String, dynamic>>> _fetchNotifications() async {
    final response = await crisisApi.getNotifications();
    return crisisApi.recordsFrom(response);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('Mark all as read'),
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _notificationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));

          final notifications = snapshot.data ?? [];
          if (notifications.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No notifications yet', style: TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: notifications.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final notification = notifications[index];
              final isRead = notification['read_at'] != null;
              
              return Card(
                color: isRead ? Colors.white : const Color(0xFFF0F7FF),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getIconColor(notification['type']),
                    child: Icon(_getIcon(notification['type']), color: Colors.white, size: 20),
                  ),
                  title: Text(
                    notification['title'] ?? 'Notification',
                    style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(notification['message'] ?? ''),
                      const SizedBox(height: 4),
                      Text(
                        '2 hours ago', // In real app, parse created_at
                        style: const TextStyle(fontSize: 10, color: Colors.grey),
                      ),
                    ],
                  ),
                  onTap: () {
                    if (!isRead) {
                      crisisApi.markNotificationRead(notification['id']);
                      setState(() {
                        _notificationsFuture = _fetchNotifications();
                      });
                    }
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }

  IconData _getIcon(String? type) {
    switch (type) {
      case 'ALERT': return Icons.warning_amber_rounded;
      case 'INCIDENT': return Icons.report_problem_outlined;
      case 'SYSTEM': return Icons.settings_suggest_outlined;
      default: return Icons.notifications_outlined;
    }
  }

  Color _getIconColor(String? type) {
    switch (type) {
      case 'ALERT': return Colors.red;
      case 'INCIDENT': return Colors.orange;
      case 'SYSTEM': return Colors.blue;
      default: return Colors.grey;
    }
  }
}
