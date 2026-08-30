import 'package:flutter/material.dart';

class MFAVerificationScreen extends StatefulWidget {
  const MFAVerificationScreen({super.key});

  @override
  State<MFAVerificationScreen> createState() => _MFAVerificationScreenState();
}

class _MFAVerificationScreenState extends State<MFAVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, leading: const BackButton(color: Colors.black)),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Text(
              'Verify It\'s You',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Enter the 6-digit code from your authenticator app',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF65728A), fontSize: 14),
            ),
            const SizedBox(height: 48),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(6, (index) => _buildCodeField(index)),
            ),
            const SizedBox(height: 32),
            TextButton(
              onPressed: () {},
              child: const Text('Didn\'t receive code? Resend in 30s', style: TextStyle(color: Color(0xFF65728A))),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0757E8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('Verify & Continue', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {},
              child: const Text('Use Backup Code', style: TextStyle(color: Color(0xFF0757E8), fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCodeField(int index) {
    return SizedBox(
      width: 45,
      child: TextField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        decoration: InputDecoration(
          counterText: "",
          enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.grey.shade300, width: 2)),
          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF0757E8), width: 2)),
        ),
        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        onChanged: (value) {
          if (value.isNotEmpty && index < 5) {
            _focusNodes[index + 1].requestFocus();
          }
        },
      ),
    );
  }
}
