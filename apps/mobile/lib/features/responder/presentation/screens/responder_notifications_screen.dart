import 'package:flutter/material.dart';

class ResponderNotificationsScreen extends StatelessWidget {
  const ResponderNotificationsScreen({super.key});

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
      body: Column(
        children: [
          _buildFilterTabs(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                _buildNotificationItem(
                  title: 'New incident assigned',
                  body: 'You have been assigned to INC-2048 - Flood Emergency.',
                  time: '2 mins ago',
                  type: 'incident',
                  isUnread: true,
                ),
                _buildNotificationItem(
                  title: 'Resource Arrived',
                  body: 'Rescue Boat RB-042 has reached your location.',
                  time: '15 mins ago',
                  type: 'resource',
                  isUnread: true,
                ),
                _buildNotificationItem(
                  title: 'Evacuation Update',
                  body: 'Community Hall shelter reached 80% capacity.',
                  time: '1 hour ago',
                  type: 'evacuation',
                  isUnread: false,
                ),
                _buildNotificationItem(
                  title: 'Weather Alert',
                  body: 'Heavy rainfall expected in next 2 hours.',
                  time: '3 hours ago',
                  type: 'weather',
                  isUnread: false,
                ),
                _buildNotificationItem(
                  title: 'System Update',
                  body: 'Offline data synced successfully.',
                  time: '5 hours ago',
                  type: 'system',
                  isUnread: false,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildTab('All', true),
          _buildTab('Alerts', false),
          _buildTab('Incidents', false),
          _buildTab('System', false),
        ],
      ),
    );
  }

  Widget _buildTab(String label, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(right: 8, top: 8, bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF0757E8) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isActive ? const Color(0xFF0757E8) : const Color(0xFFE4EAF4)),
      ),
      child: Center(
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : const Color(0xFF65728A),
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationItem({
    required String title,
    required String body,
    required String time,
    required String type,
    required bool isUnread,
  }) {
    IconData icon;
    Color color;

    switch (type) {
      case 'incident':
        icon = Icons.assignment_late;
        color = Colors.red;
        break;
      case 'resource':
        icon = Icons.local_shipping;
        color = Colors.blue;
        break;
      case 'evacuation':
        icon = Icons.groups;
        color = Colors.orange;
        break;
      case 'weather':
        icon = Icons.wb_sunny;
        color = Colors.amber;
        break;
      default:
        icon = Icons.notifications;
        color = const Color(0xFF0757E8);
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isUnread ? const Color(0xFFF0F4FF) : Colors.transparent,
        border: const Border(bottom: BorderSide(color: Color(0xFFE4EAF4))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
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
                      title,
                      style: TextStyle(
                        fontWeight: isUnread ? FontWeight.bold : FontWeight.w600,
                        color: const Color(0xFF102043),
                      ),
                    ),
                    Text(
                      time,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF65728A)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  body,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.4),
                ),
              ],
            ),
          ),
          if (isUnread)
            Container(
              margin: const EdgeInsets.only(left: 8, top: 4),
              width: 8,
              height: 8,
              decoration: const BoxDecoration(color: Color(0xFF0757E8), shape: BoxShape.circle),
            ),
        ],
      ),
    );
  }
}
