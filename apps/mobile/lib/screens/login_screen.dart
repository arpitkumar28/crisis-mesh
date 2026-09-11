import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/app_messenger.dart';
import 'home_screen.dart';

const _navy = Color(0xFFF6F8FC);
const _panel = Colors.white;
const _cyan = Color(0xFF0757E8);
const _blue = Color(0xFF0757E8);
const _ink = Color(0xFF102043);
const _muted = Color(0xFF65728A);
const _field = Color(0xFFF8FAFD);

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordFocusNode = FocusNode();
  final _apiService = crisisApi;
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _rememberMe = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(authProvider.notifier).restoreSession();
      if (mounted && ref.read(authProvider).isAuthenticated) {
        _openHome();
      }
    });
  }

  Future<void> _login() async {
    if (_isLoading || !(_formKey.currentState?.validate() ?? false)) return;
    FocusManager.instance.primaryFocus?.unfocus();
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      final body = response.data;
      final data = body is Map ? body['data'] : null;
      if (body is! Map || body['success'] != true || data is! Map) {
        throw const FormatException('Invalid authentication response');
      }

      final userData = data['user'];
      final token = data['access_token'];
      if (userData is! Map || token is! String || token.isEmpty) {
        throw const FormatException('Invalid authentication response');
      }

      final user = User.fromJson(Map<String, dynamic>.from(userData));
      await ref.read(authProvider.notifier).setAuth(
            user,
            token,
            persist: _rememberMe,
          );
      if (mounted) {
        AppMessenger.success(context, 'Welcome back, ${user.name}');
        _openHome();
      }
    } on DioException catch (error) {
      if (mounted) setState(() => _errorMessage = _friendlyError(error));
    } on FormatException {
      if (mounted) {
        setState(() => _errorMessage = 'Something went wrong. Please try again.');
      }
    } catch (_) {
      if (mounted) {
        setState(() => _errorMessage = 'Something went wrong. Please try again.');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _friendlyError(DioException error) {
    final status = error.response?.statusCode;
    if (status == 401 || status == 403) return 'Email or password is incorrect.';
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return 'Unable to connect to CrisisMesh. Please check your connection.';
    }
    if (status != null && status >= 500) {
      return 'Something went wrong. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }

  void _openHome() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _navy,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(painter: _CommandGridPainter()),
            ),
            LayoutBuilder(
              builder: (context, constraints) {
                final compact = constraints.maxHeight < 720;
                return SingleChildScrollView(
                  keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                  padding: EdgeInsets.fromLTRB(22, compact ? 24 : 42, 22, 28),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 460),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            _buildBranding(compact),
                            SizedBox(height: compact ? 24 : 34),
                            _buildLoginCard(),
                            const SizedBox(height: 22),
                            _buildRegistrationPrompt(),
                            const SizedBox(height: 18),
                            Center(
                              child: Text(
                                'CrisisMesh command network',
                                style: TextStyle(
                                  color: _muted.withValues(alpha: 0.62),
                                  fontSize: 11,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBranding(bool compact) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _ink,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: _cyan.withValues(alpha: 0.2),
                    blurRadius: 24,
                  ),
                ],
              ),
              child: Image.asset(
                'assets/brand/crisismesh-icon.png',
                width: compact ? 38 : 46,
                height: compact ? 38 : 46,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'CRISIS',
              style: TextStyle(
                color: _ink,
                fontSize: 27,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            const Text(
              'MESH',
              style: TextStyle(
                color: _cyan,
                fontSize: 27,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text(
          'Environmental Intelligence.\nFaster Emergency Response.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: _ink,
            fontSize: 20,
            height: 1.25,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Monitor risks, receive localized alerts,\nand respond faster when every second matters.',
          textAlign: TextAlign.center,
          style: TextStyle(color: _muted, fontSize: 12, height: 1.45),
        ),
      ],
    );
  }

  Widget _buildLoginCard() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
      decoration: BoxDecoration(
        color: _panel,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE4EAF4)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.22),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Welcome back',
            style: TextStyle(
              color: _ink,
              fontSize: 25,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Sign in to continue to CrisisMesh',
            style: TextStyle(color: _muted, fontSize: 14),
          ),
          if (_errorMessage != null) ...[
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF5E2027).withValues(alpha: 0.72),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFF7B81).withValues(alpha: 0.65)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.error_outline, color: Color(0xFFFF9A9F), size: 20),
                  const SizedBox(width: 9),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Color(0xFFFFD6D8), fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          _buildField(
            controller: _emailController,
            label: 'Email address',
            hint: 'Enter your email',
            icon: Icons.mail_outline,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            onFieldSubmitted: (_) => _passwordFocusNode.requestFocus(),
            validator: (value) {
              final email = value?.trim() ?? '';
              if (email.isEmpty) return 'Please enter your email address.';
              if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
                return 'Please enter a valid email address.';
              }
              return null;
            },
          ),
          const SizedBox(height: 14),
          _buildField(
            controller: _passwordController,
            focusNode: _passwordFocusNode,
            label: 'Password',
            hint: 'Enter your password',
            icon: Icons.lock_outline,
            obscureText: _obscurePassword,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _login(),
            suffix: IconButton(
              tooltip: _obscurePassword ? 'Show password' : 'Hide password',
              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              icon: Icon(
                _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                color: _muted,
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please enter your password.';
              if (value.length < 8) return 'Password must be at least 8 characters.';
              return null;
            },
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              SizedBox(
                width: 42,
                height: 42,
                child: Checkbox(
                  value: _rememberMe,
                  onChanged: _isLoading ? null : (value) => setState(() => _rememberMe = value ?? false),
                  activeColor: _cyan,
                  checkColor: _ink,
                  side: const BorderSide(color: _muted),
                ),
              ),
              const Text('Remember me', style: TextStyle(color: _muted, fontSize: 13)),
              const Spacer(),
              TextButton(
                onPressed: null,
                style: TextButton.styleFrom(padding: EdgeInsets.zero),
                child: const Text(
                  'Password recovery unavailable',
                  style: TextStyle(color: _muted, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 54,
            child: FilledButton.icon(
              onPressed: _isLoading ? null : _login,
              icon: _isLoading
                  ? const SizedBox(
                      width: 19,
                      height: 19,
                      child: CircularProgressIndicator(strokeWidth: 2, color: _ink),
                    )
                  : const Icon(Icons.arrow_forward_rounded),
              label: Text(_isLoading ? 'Signing in...' : 'Sign In'),
              style: FilledButton.styleFrom(
                backgroundColor: _cyan,
                foregroundColor: _ink,
                disabledBackgroundColor: _cyan.withValues(alpha: 0.5),
                disabledForegroundColor: _ink.withValues(alpha: 0.7),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required String? Function(String?) validator,
    FocusNode? focusNode,
    TextInputType? keyboardType,
    TextInputAction? textInputAction,
    bool obscureText = false,
    Widget? suffix,
    ValueChanged<String>? onFieldSubmitted,
  }) {
    return TextFormField(
      controller: controller,
      focusNode: focusNode,
      obscureText: obscureText,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      onFieldSubmitted: onFieldSubmitted,
      validator: validator,
      style: const TextStyle(color: _ink, fontSize: 15),
      cursorColor: _cyan,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: _muted, size: 21),
        suffixIcon: suffix,
        labelStyle: const TextStyle(color: _muted),
        hintStyle: TextStyle(color: _muted.withValues(alpha: 0.62)),
        filled: true,
        fillColor: _field,
        contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFDCE3F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFDCE3F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: _cyan, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFFF7B81)),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFFF9A9F), width: 1.5),
        ),
        errorStyle: const TextStyle(color: Color(0xFFFFA5AA), fontSize: 11),
      ),
    );
  }

  Widget _buildRegistrationPrompt() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text("Don't have an account?", style: TextStyle(color: _muted, fontSize: 13)),
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pushNamed(context, '/register'),
          child: const Text(
            'Create Account',
            style: TextStyle(color: _cyan, fontSize: 13, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }
}

class _CommandGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = _blue.withValues(alpha: 0.08)
      ..strokeWidth = 1;
    const spacing = 42.0;
    for (var x = 0.0; x <= size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (var y = 0.0; y <= size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
    final accent = Paint()..color = _cyan.withValues(alpha: 0.18);
    canvas.drawCircle(Offset(size.width * 0.88, size.height * 0.14), 2.5, accent);
    canvas.drawCircle(Offset(size.width * 0.12, size.height * 0.76), 2.5, accent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
