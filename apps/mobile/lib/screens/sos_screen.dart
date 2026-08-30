import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/app_messenger.dart';
import 'sos_tracking_screen.dart';

class SOSScreen extends StatefulWidget {
  const SOSScreen({super.key});

  @override
  State<SOSScreen> createState() => _SOSScreenState();
}

class _SOSScreenState extends State<SOSScreen> {
  bool _isSending = false;
  double _countdown = 3.0;
  bool _timerStarted = false;

  void _startSOS() {
    setState(() => _timerStarted = true);
    Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted || !_timerStarted) return false;
      setState(() => _countdown -= 0.1);
      if (_countdown <= 0) {
        _triggerSOS();
        return false;
      }
      return true;
    });
  }

  Future<void> _triggerSOS() async {
    setState(() {
      _isSending = true;
      _timerStarted = false;
    });

    try {
      final response = await crisisApi.createIncident({
        'title': 'SOS EMERGENCY SIGNAL',
        'description': 'User triggered SOS emergency button.',
        'type': 'MEDICAL',
        'severity': 'CRITICAL',
        'is_sos': true,
      });

      if (mounted && response.data['success'] == true) {
        final incidentId = response.data['data']['id'];
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => SOSTrackingScreen(incidentId: incidentId)),
        );
      }
    } catch (e) {
      if (mounted) {
        AppMessenger.error(context, 'Failed to send SOS. Please call emergency services directly.');
        setState(() => _isSending = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFD92835),
      body: SafeArea(
        child: Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            gradient: RadialGradient(
              center: Alignment.center,
              radius: 0.8,
              colors: [Color(0xFFF23D4B), Color(0xFFD92835)],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              const Text(
                'EMERGENCY',
                style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 4),
              ),
              const Text(
                'SOS',
                style: TextStyle(color: Colors.white, fontSize: 48, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 60),
              
              if (!_timerStarted && !_isSending)
                GestureDetector(
                  onTap: _startSOS,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Animated outer rings
                      Container(
                        width: 240,
                        height: 240,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                      ),
                      Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 30, spreadRadius: 5),
                          ],
                        ),
                        child: const Center(
                          child: Icon(Icons.touch_app_rounded, color: Color(0xFFD92835), size: 80),
                        ),
                      ),
                    ],
                  ),
                ),

              if (_timerStarted)
                Column(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 220,
                          height: 220,
                          child: CircularProgressIndicator(
                            value: _countdown / 3.0,
                            strokeWidth: 8,
                            color: Colors.white,
                            backgroundColor: Colors.white.withValues(alpha: 0.2),
                          ),
                        ),
                        Text(
                          _countdown.ceil().toString(),
                          style: const TextStyle(color: Colors.white, fontSize: 80, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 48),
                    const Text(
                      'Alerting responders in...',
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ],
                ),

              if (_isSending)
                const Column(
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 24),
                    Text('Connecting to Command Center...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),

              const Spacer(),
              if (_timerStarted)
                Padding(
                  padding: const EdgeInsets.only(bottom: 40),
                  child: TextButton(
                    onPressed: () => setState(() {
                      _timerStarted = false;
                      _countdown = 3.0;
                    }),
                    style: TextButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.2),
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    ),
                    child: const Text('CANCEL ALERT', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                )
              else
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 40, vertical: 40),
                  child: Text(
                    'Tap and hold to send\nemergency alert\n\nYour location will be\nshared instantly.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white70, fontSize: 14, height: 1.5),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
