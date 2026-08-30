import 'package:flutter/material.dart';
import '../services/app_messenger.dart';

class OTPVerificationScreen extends StatefulWidget {
  const OTPVerificationScreen({super.key});

  @override
  State<OTPVerificationScreen> createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends State<OTPVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _verify() {
    String otp = _controllers.map((c) => c.text).join();
    if (otp.length < 4) {
      AppMessenger.error(context, 'Please enter the full OTP');
      return;
    }
    
    // In a real app, call API to verify OTP
    AppMessenger.success(context, 'Verification successful');
    
    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    if (args != null && args['flow'] == 'forgot_password') {
      Navigator.pushReplacementNamed(context, '/new-password');
    } else {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    final contact = args?['email'] ?? args?['phone'] ?? '+91 98765 43210';

    return Scaffold(
      appBar: AppBar(title: const Text('Verify Number')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 40),
            const Text(
              'Verify Your Number',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Enter 4-digit code sent to\n$contact',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF65728A)),
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(4, (index) {
                return SizedBox(
                  width: 60,
                  height: 60,
                  child: TextField(
                    controller: _controllers[index],
                    focusNode: _focusNodes[index],
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    maxLength: 1,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      counterText: '',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onChanged: (value) {
                      if (value.isNotEmpty && index < 3) {
                        _focusNodes[index + 1].requestFocus();
                      } else if (value.isEmpty && index > 0) {
                        _focusNodes[index - 1].requestFocus();
                      }
                      
                      String currentOtp = _controllers.map((c) => c.text).join();
                      if (currentOtp.length == 4) _verify();
                    },
                  ),
                );
              }),
            ),
            const SizedBox(height: 40),
            TextButton(
              onPressed: () => AppMessenger.info(context, 'New code sent'),
              child: const Text('Resend Code in 00:55', style: TextStyle(color: Color(0xFF65728A))),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: _verify,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0757E8),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Verify'),
            ),
          ],
        ),
      ),
    );
  }
}
