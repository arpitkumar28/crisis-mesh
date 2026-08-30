import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import '../providers/auth_provider.dart';
import '../services/app_messenger.dart';

class BiometricLoginScreen extends ConsumerStatefulWidget {
  const BiometricLoginScreen({super.key});

  @override
  ConsumerState<BiometricLoginScreen> createState() => _BiometricLoginScreenState();
}

class _BiometricLoginScreenState extends ConsumerState<BiometricLoginScreen> {
  final LocalAuthentication auth = LocalAuthentication();
  bool _isAuthenticating = false;

  Future<void> _authenticate() async {
    bool authenticated = false;
    try {
      setState(() {
        _isAuthenticating = true;
      });
      
      final bool canAuthenticateWithBiometrics = await auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await auth.isDeviceSupported();

      if (!canAuthenticate) {
        if (mounted) {
          AppMessenger.warning(context, 'Biometric authentication not available on this device.');
          Navigator.pushReplacementNamed(context, '/login');
        }
        return;
      }

      authenticated = await auth.authenticate(
        localizedReason: 'Please authenticate to access CrisisMesh',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
    } on PlatformException catch (e) {
      if (mounted) AppMessenger.error(context, 'Authentication error: ${e.message}');
      return;
    } finally {
      if (mounted) {
        setState(() {
          _isAuthenticating = false;
        });
      }
    }

    if (authenticated && mounted) {
      AppMessenger.success(context, 'Authenticated successfully');
      await ref.read(authProvider.notifier).restoreSession();
      if (mounted) {
        if (ref.read(authProvider).isAuthenticated) {
          Navigator.pushReplacementNamed(context, '/home');
        } else {
          AppMessenger.info(context, 'No active session found. Please login.');
          Navigator.pushReplacementNamed(context, '/login');
        }
      }
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _authenticate();
    });
  }

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
              const Icon(Icons.fingerprint, size: 80, color: Color(0xFF0757E8)),
              const SizedBox(height: 24),
              const Text(
                'Biometric Login',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF102043)),
              ),
              const SizedBox(height: 8),
              const Text(
                'Use fingerprint to login faster & securely',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF65728A)),
              ),
              const Spacer(),
              GestureDetector(
                onTap: _isAuthenticating ? null : _authenticate,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0757E8).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: _isAuthenticating 
                    ? const CircularProgressIndicator()
                    : const Icon(Icons.touch_app, size: 64, color: Color(0xFF0757E8)),
                ),
              ),
              const SizedBox(height: 24),
              const Text('Touch the fingerprint sensor', style: TextStyle(color: Colors.grey)),
              const Spacer(),
              TextButton(
                onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                child: const Text('Use PIN instead', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
