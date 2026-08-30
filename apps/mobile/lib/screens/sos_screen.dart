import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
      // In production, this would capture GPS coordinates first
      final response = await crisisApi.createIncident({
        'title': 'SOS EMERGENCY SIGNAL',
        'description': 'User triggered SOS emergency button.',
        'type': 'MEDICAL', // Default for SOS if not specified
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
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.sos, size: 120, color: Colors.white),
              const SizedBox(height: 24),
              const Text(
                'SOS Emergency',
                style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Tap to send emergency alert',
                style: TextStyle(color: Colors.white70, fontSize: 16),
              ),
              const SizedBox(height: 60),
              if (!_timerStarted && !_isSending)
                GestureDetector(
                  onTap: _startSOS,
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20, spreadRadius: 5),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'SOS',
                        style: TextStyle(color: Color(0xFFD92835), fontSize: 48, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                ),
              if (_timerStarted)
                Column(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 200,
                          height: 200,
                          child: CircularProgressIndicator(
                            value: _countdown / 3.0,
                            strokeWidth: 10,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          _countdown.ceil().toString(),
                          style: const TextStyle(color: Colors.white, fontSize: 72, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),
                    TextButton(
                      onPressed: () => setState(() {
                        _timerStarted = false;
                        _countdown = 3.0;
                      }),
                      child: const Text('CANCEL', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              if (_isSending)
                const Column(
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 20),
                    Text('Sending Emergency Signal...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              const SizedBox(height: 60),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  'Your location and identity will be sent to the emergency response team.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
