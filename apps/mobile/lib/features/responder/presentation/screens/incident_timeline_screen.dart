import 'package:flutter/material.dart';

class IncidentTimelineScreen extends StatelessWidget {
  const IncidentTimelineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('INC-2048', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Incident Timeline', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          _buildTimelineItem(
            time: '11:45 AM',
            title: 'In Progress',
            description: 'Team Alpha is currently managing the evacuation.',
            isLast: false,
            isCompleted: false,
            isActive: true,
          ),
          _buildTimelineItem(
            time: '11:30 AM',
            title: 'Reached Location',
            description: 'Team Alpha has arrived at the incident site.',
            isLast: false,
            isCompleted: true,
          ),
          _buildTimelineItem(
            time: '11:15 AM',
            title: 'Team En-Route',
            description: 'Responder Amit Verma is navigating to the site.',
            isLast: false,
            isCompleted: true,
          ),
          _buildTimelineItem(
            time: '11:05 AM',
            title: 'Plan Assigned',
            description: 'Disaster management plan DM-V2 initiated.',
            isLast: false,
            isCompleted: true,
          ),
          _buildTimelineItem(
            time: '11:00 AM',
            title: 'Verified',
            description: 'Incident verified by Authority.',
            isLast: false,
            isCompleted: true,
          ),
          _buildTimelineItem(
            time: '10:55 AM',
            title: 'Incident Reported',
            description: 'Reported by Community Member.',
            isLast: true,
            isCompleted: true,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem({
    required String time,
    required String title,
    required String description,
    required bool isLast,
    required bool isCompleted,
    bool isActive = false,
  }) {
    return IntrinsicHeight(
      child: Row(
        children: [
          SizedBox(
            width: 70,
            child: Text(
              time,
              style: TextStyle(
                color: isActive ? const Color(0xFF0757E8) : const Color(0xFF65728A),
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
            ),
          ),
          Column(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive
                      ? Colors.white
                      : (isCompleted ? const Color(0xFF09A86B) : Colors.grey[300]),
                  border: isActive
                      ? Border.all(color: const Color(0xFF0757E8), width: 4)
                      : null,
                ),
                child: isCompleted && !isActive
                    ? const Icon(Icons.check, size: 10, color: Colors.white)
                    : null,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: isCompleted ? const Color(0xFF09A86B) : Colors.grey[300],
                  ),
                ),
            ],
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: isActive ? const Color(0xFF0757E8) : const Color(0xFF102043),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: const TextStyle(
                      color: Color(0xFF65728A),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
