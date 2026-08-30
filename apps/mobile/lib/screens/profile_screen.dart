import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FD),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF102043)),
          onPressed: () {},
        ),
        title: const Column(
          children: [
            Text('My Profile',
                style: TextStyle(
                    color: Color(0xFF102043),
                    fontSize: 18,
                    fontWeight: FontWeight.bold)),
            Text('Citizen',
                style: TextStyle(color: Color(0xFF65728A), fontSize: 12)),
          ],
        ),
        centerTitle: true,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_rounded,
                    color: Color(0xFF102043)),
                onPressed: () {},
              ),
              Positioned(
                right: 12,
                top: 12,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 14,
                    minHeight: 14,
                  ),
                  child: const Text(
                    '3',
                    style: TextStyle(color: Colors.white, fontSize: 8),
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // User Profile Card
            _buildUserProfileCard(user),
            const SizedBox(height: 24),

            // Stats Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem('7', 'Incidents\nReported', Icons.report_gmailerrorred_rounded, Colors.red),
                _buildStatItem('5', 'Resolved\nIncidents', Icons.check_circle_outline_rounded, Colors.green),
                _buildStatItem('12', 'Alerts\nReceived', Icons.notifications_none_rounded, Colors.orange),
                _buildStatItem('3', 'Safety Drills\nCompleted', Icons.verified_user_outlined, Colors.purple),
                _buildStatItem('120', 'Help Points\nEarned', Icons.favorite_border_rounded, Colors.blue),
              ],
            ),
            const SizedBox(height: 24),

            // Personal Information
            _buildSection(
              title: 'Personal Information',
              actionLabel: 'Edit',
              onActionTap: () {},
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          children: [
                            _buildInfoField(Icons.person_outline, 'Full Name', user?.name ?? 'Amit Kumar'),
                            _buildInfoField(Icons.calendar_today_outlined, 'Date of Birth', '15 May 1998'),
                            _buildInfoField(Icons.person_outline, 'Gender', 'Male'),
                            _buildInfoField(Icons.home_outlined, 'Address', 'Plot No. 45, Malviya Nagar,\nJaipur, Rajasthan - 302017'),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            _buildInfoField(Icons.phone_outlined, 'Phone Number', user?.phone ?? '+91 98765 43210'),
                            _buildInfoField(Icons.email_outlined, 'Email Address', user?.email ?? 'amit.kumar@email.com'),
                            _buildInfoField(Icons.bloodtype_outlined, 'Blood Group', 'O+', iconColor: Colors.red),
                            _buildInfoField(Icons.emergency_outlined, 'Emergency Contact', 'Rakesh Kumar (Brother)\n+91 87654 32109'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Account & Security
            _buildSection(
              title: 'Account & Security',
              actionLabel: 'Manage',
              onActionTap: () {},
              child: Column(
                children: [
                  _buildListTile(Icons.lock_outline, 'Change Password', showArrow: true),
                  _buildListTile(Icons.fingerprint, 'Biometric & Security', trailingText: 'Enabled', showArrow: true),
                  _buildListTile(Icons.shield_outlined, 'Two-Factor Authentication', trailingText: 'Enabled', showArrow: true),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Your Activity
            _buildSection(
              title: 'Your Activity',
              actionLabel: 'View All',
              onActionTap: () {},
              child: Row(
                children: [
                  Expanded(child: _buildActivityCard(Icons.description_outlined, 'Reports Submitted', '7', Colors.blue)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildActivityCard(Icons.sos, 'SOS Alerts Triggered', '2', Colors.red)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildActivityCard(Icons.access_time, 'Last Active', 'Today, 09:20 AM', Colors.green, isWide: true)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // General Menu
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE4EAF4)),
              ),
              child: Column(
                children: [
                  _buildListTile(Icons.location_on_outlined, 'Saved Locations', showArrow: true),
                  _buildListTile(Icons.download_for_offline_outlined, 'Downloaded Resources', showArrow: true),
                  _buildListTile(Icons.chat_bubble_outline_rounded, 'Feedback & Suggestions', showArrow: true),
                  _buildListTile(Icons.headset_mic_outlined, 'Help & Support', showArrow: true),
                  _buildListTile(Icons.info_outline, 'About CrisisMesh', trailingText: 'v2.1.0', showArrow: true),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
                },
                icon: const Icon(Icons.logout_rounded, color: Colors.red),
                label: const Text('Logout',
                    style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFE4EAF4)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildUserProfileCard(user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFFE8F0FF), Colors.white.withValues(alpha: 0.9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 45,
                    backgroundColor: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: CircleAvatar(
                        radius: 40,
                        backgroundColor: const Color(0xFFD0E2FF),
                        child: Icon(Icons.person, size: 50, color: Colors.blue.shade700),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: const Icon(Icons.edit, size: 14, color: Colors.blue),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Amit Kumar',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _buildBadge('Citizen', const Color(0xFF0757E8)),
                        const SizedBox(width: 8),
                        _buildBadge('Verified', const Color(0xFF09A86B), icon: Icons.check_circle),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Column(
                  children: [
                    _buildCompactInfo(Icons.phone_android, '+91 98765 43210'),
                    _buildCompactInfo(Icons.email_outlined, 'amit.kumar@email.com'),
                    _buildCompactInfo(Icons.location_on_outlined, 'Jaipur, Rajasthan, India'),
                  ],
                ),
              ),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Member Since', style: TextStyle(color: Color(0xFF65728A), fontSize: 10)),
                  Text('12 Aug 2024', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  SizedBox(height: 8),
                  Text('Profile ID', style: TextStyle(color: Color(0xFF65728A), fontSize: 10)),
                  Text('CITZ-2024-00125', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(String label, Color color, {IconData? icon}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) Icon(icon, size: 12, color: color),
          if (icon != null) const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildCompactInfo(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 14, color: const Color(0xFF65728A)),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontSize: 12, color: Color(0xFF102043))),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 8, color: Color(0xFF65728A))),
      ],
    );
  }

  Widget _buildSection({required String title, required String actionLabel, required VoidCallback onActionTap, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF102043))),
              TextButton(
                onPressed: onActionTap,
                child: Text(actionLabel, style: const TextStyle(color: Color(0xFF0757E8), fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }

  Widget _buildInfoField(IconData icon, String label, String value, {Color? iconColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: iconColor ?? const Color(0xFF0757E8)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Color(0xFF65728A), fontSize: 10)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12, color: Color(0xFF102043))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListTile(IconData icon, String title, {String? trailingText, bool showArrow = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF0757E8)),
          const SizedBox(width: 16),
          Expanded(child: Text(title, style: const TextStyle(fontSize: 14, color: Color(0xFF102043)))),
          if (trailingText != null)
            Text(trailingText, style: const TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.w500)),
          if (showArrow)
            const Icon(Icons.chevron_right, size: 18, color: Color(0xFFDCE3F0)),
        ],
      ),
    );
  }

  Widget _buildActivityCard(IconData icon, String label, String value, Color color, {bool isWide = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFD),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE4EAF4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 8),
              if (!isWide) Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14))),
            ],
          ),
          const SizedBox(height: 8),
          if (isWide) Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          Text(label, style: const TextStyle(fontSize: 8, color: Color(0xFF65728A))),
        ],
      ),
    );
  }
}
