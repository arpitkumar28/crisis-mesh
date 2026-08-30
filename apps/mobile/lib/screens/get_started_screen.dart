import 'package:flutter/material.dart';

class GetStartedScreen extends StatelessWidget {
  const GetStartedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shield, size: 48, color: Color(0xFF0757E8)),
                  SizedBox(width: 12),
                  Text(
                    'CRISIS',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF102043),
                    ),
                  ),
                  Text(
                    'MESH',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0757E8),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                'Let\'s Get Started',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF102043),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Choose how you want to continue',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF65728A)),
              ),
              const Spacer(),
              _RoleButton(
                title: 'Continue as Citizen',
                icon: Icons.person_outline,
                onPressed: () => Navigator.pushNamed(context, '/login', arguments: 'CITIZEN'),
              ),
              const SizedBox(height: 16),
              _RoleButton(
                title: 'Continue as Responder',
                icon: Icons.emergency_outlined,
                onPressed: () => Navigator.pushNamed(context, '/login', arguments: 'RESPONDER'),
              ),
              const SizedBox(height: 16),
              _RoleButton(
                title: 'Continue as Authority',
                icon: Icons.admin_panel_settings_outlined,
                onPressed: () => Navigator.pushNamed(context, '/login', arguments: 'AUTHORITY'),
              ),
              const SizedBox(height: 32),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: const Text('Don\'t have an account? Create one'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onPressed;

  const _RoleButton({
    required this.title,
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon),
        label: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF102043),
          elevation: 0,
          side: const BorderSide(color: Color(0xFFDCE3F0)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
