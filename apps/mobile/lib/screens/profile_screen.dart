import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SizedBox(height: 12),
        CircleAvatar(radius: 38, backgroundColor: const Color(0xFFE5EEFF), child: Text((user?.name ?? 'U').substring(0, 1).toUpperCase(), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: Color(0xFF0757E8)))),
        const SizedBox(height: 16),
        Center(child: Text(user?.name ?? 'User', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700, color: const Color(0xFF102043)))),
        Center(child: Text(user?.email ?? '', style: const TextStyle(color: Color(0xFF65728A)))),
        const SizedBox(height: 20),
        Card(child: ListTile(leading: const CircleAvatar(backgroundColor: Color(0xFFE8F0FF), child: Icon(Icons.badge_outlined, color: Color(0xFF0757E8))), title: const Text('Role', style: TextStyle(fontWeight: FontWeight.w700)), subtitle: Text(user?.role ?? 'Unknown'))),
        const Card(child: ListTile(leading: CircleAvatar(backgroundColor: Color(0xFFE8F7EF), child: Icon(Icons.verified_user_outlined, color: Color(0xFF159B55))), title: Text('Account', style: TextStyle(fontWeight: FontWeight.w700)), subtitle: Text('Authenticated with CrisisMesh API'))),
        const SizedBox(height: 20),
        FilledButton.icon(
          onPressed: () async {
            await ref.read(authProvider.notifier).logout();
            if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
          },
          icon: const Icon(Icons.logout),
          label: const Text('Log out'),
        ),
      ],
    );
  }
}
