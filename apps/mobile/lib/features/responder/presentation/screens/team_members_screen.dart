import 'package:flutter/material.dart';

class TeamMembersScreen extends StatelessWidget {
  const TeamMembersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Team Alpha', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('4 Members', style: TextStyle(fontSize: 12, color: Color(0xFF65728A))),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.add_link), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          _buildIncidentContext(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildMemberTile(
                  name: 'Amit Verma',
                  role: 'Team Lead',
                  status: 'Active',
                  isMe: true,
                ),
                _buildMemberTile(
                  name: 'Rohit Sharma',
                  role: 'Driver',
                  status: 'Active',
                ),
                _buildMemberTile(
                  name: 'Neha Yadav',
                  role: 'Medical Officer',
                  status: 'On Break',
                ),
                _buildMemberTile(
                  name: 'Vikram Singh',
                  role: 'Rescuer',
                  status: 'Offline',
                ),
              ],
            ),
          ),
          _buildBottomAction(),
        ],
      ),
    );
  }

  Widget _buildIncidentContext() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: const Color(0xFFF8FAFD),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Color(0xFF0757E8), size: 20),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'Incident Report: INC-2048 - Flood Emergency',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: Color(0xFF102043),
              ),
            ),
          ),
          TextButton(onPressed: () {}, child: const Text('View')),
        ],
      ),
    );
  }

  Widget _buildMemberTile({
    required String name,
    required String role,
    required String status,
    bool isMe = false,
  }) {
    Color statusColor;
    switch (status) {
      case 'Active':
        statusColor = Colors.green;
        break;
      case 'On Break':
        statusColor = Colors.orange;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0xFFF0F4FF),
            child: Text(
              name.substring(0, 1),
              style: const TextStyle(
                color: Color(0xFF0757E8),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    if (isMe)
                      Container(
                        margin: const EdgeInsets.only(left: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE4EAF4),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'YOU',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
                Text(role, style: const TextStyle(color: Color(0xFF65728A), fontSize: 13)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    status,
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.call_outlined, size: 20, color: Color(0xFF0757E8)),
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomAction() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SizedBox(
        width: double.infinity,
        height: 50,
        child: ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0757E8),
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('Chat with Team', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
