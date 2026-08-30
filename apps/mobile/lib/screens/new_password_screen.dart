import 'package:flutter/material.dart';
import '../services/app_messenger.dart';

class NewPasswordScreen extends StatefulWidget {
  const NewPasswordScreen({super.key});

  @override
  State<NewPasswordScreen> createState() => _NewPasswordScreenState();
}

class _NewPasswordScreenState extends State<NewPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscure = true;

  void _updatePassword() {
    if (_passwordController.text.isEmpty) {
      AppMessenger.error(context, 'Please enter new password');
      return;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      AppMessenger.error(context, 'Passwords do not match');
      return;
    }
    
    // API call would go here
    AppMessenger.success(context, 'Password updated successfully');
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Password')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Create New Password',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Your new password must be different from previous passwords.',
              style: TextStyle(color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _passwordController,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: 'New Password',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _confirmPasswordController,
              obscureText: _obscure,
              decoration: const InputDecoration(
                labelText: 'Confirm Password',
                prefixIcon: Icon(Icons.lock_outline),
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _updatePassword,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0757E8),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Update Password'),
            ),
          ],
        ),
      ),
    );
  }
}
