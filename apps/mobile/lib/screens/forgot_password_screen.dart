import 'package:flutter/material.dart';
import '../services/app_messenger.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();

  void _sendResetLink() {
    if (_emailController.text.isEmpty) {
      AppMessenger.error(context, 'Please enter your email');
      return;
    }
    // Mock sending reset link
    AppMessenger.success(context, 'Reset link sent to ${_emailController.text}');
    Navigator.pushNamed(context, '/otp', arguments: {'email': _emailController.text, 'flow': 'forgot_password'});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.lock_reset, size: 80, color: Color(0xFF0757E8)),
            const SizedBox(height: 24),
            const Text(
              'Forgot Password?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Enter your registered email or mobile number to receive a reset link.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email / Mobile',
                prefixIcon: Icon(Icons.email_outlined),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _sendResetLink,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0757E8),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Send Reset Link'),
            ),
          ],
        ),
      ),
    );
  }
}
