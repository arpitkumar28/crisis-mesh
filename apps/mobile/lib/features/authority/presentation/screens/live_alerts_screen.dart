import 'package:flutter/material.dart';

class LiveAlertsScreen extends StatelessWidget {
  const LiveAlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Alerts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_alert, color: Color(0xFF0757E8)),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterBar(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildAlertItem(
                  title: 'Heavy Rainfall Warning',
                  location: 'Jaipur District',
                  severity: 'HIGH',
                  status: 'ACTIVE',
                  time: '10 mins ago',
                  type: 'Weather',
                ),
                _buildAlertItem(
                  title: 'Flood Alert - Sector 5',
                  location: 'Mansarovar, Jaipur',
                  severity: 'CRITICAL',
                  status: 'ACTIVE',
                  time: '25 mins ago',
                  type: 'Flood',
                ),
                _buildAlertItem(
                  title: 'Thunderstorm Warning',
                  location: 'Tonk Road Area',
                  severity: 'MEDIUM',
                  status: 'EXPIRED',
                  time: '2 hours ago',
                  type: 'Weather',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE4EAF4))),
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildFilterChip('All Alerts', true),
          _buildFilterChip('Critical', false),
          _buildFilterChip('Weather', false),
          _buildFilterChip('Geological', false),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF0757E8).withValues(alpha: 0.1) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isActive ? const Color(0xFF0757E8) : const Color(0xFFE4EAF4)),
      ),
      child: Center(
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? const Color(0xFF0757E8) : const Color(0xFF65728A),
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildAlertItem({
    required String title,
    required String location,
    required String severity,
    required String status,
    required String time,
    required String type,
  }) {
    Color severityColor;
    switch (severity) {
      case 'CRITICAL':
        severityColor = Colors.red;
        break;
      case 'HIGH':
        severityColor = Colors.orange;
        break;
      default:
        severityColor = Colors.blue;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: severityColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  severity,
                  style: TextStyle(color: severityColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              Text(time, style: const TextStyle(fontSize: 12, color: Color(0xFF65728A))),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFF65728A)),
              const SizedBox(width: 4),
              Text(location, style: const TextStyle(color: Color(0xFF65728A), fontSize: 13)),
            ],
          ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Status: $status',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: status == 'ACTIVE' ? Colors.green : Colors.grey,
                  fontSize: 12,
                ),
              ),
              Row(
                children: [
                  TextButton(onPressed: () {}, child: const Text('View Details')),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0757E8),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    child: const Text('Broadcast'),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
