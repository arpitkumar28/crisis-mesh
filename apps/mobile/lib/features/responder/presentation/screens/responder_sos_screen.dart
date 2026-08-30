import 'package:flutter/material.dart';

class ResponderSOSScreen extends StatefulWidget {
  const ResponderSOSScreen({super.key});

  @override
  State<ResponderSOSScreen> createState() => _ResponderSOSScreenState();
}

class _ResponderSOSScreenState extends State<ResponderSOSScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFD92835),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white, size: 28),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'EMERGENCY',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w900,
                letterSpacing: 4,
              ),
            ),
            const Text(
              'SOS',
              style: TextStyle(
                color: Colors.white,
                fontSize: 80,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 60),
            ScaleTransition(
              scale: _animation,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.2),
                ),
                child: Center(
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.touch_app,
                        size: 60,
                        color: Color(0xFFD92835),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 60),
            const Text(
              'Tap and hold to send\nemergency SOS',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Your location will be\nshared immediately',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
