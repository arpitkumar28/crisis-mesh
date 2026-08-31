import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/onboarding_screen.dart';
import 'screens/get_started_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/report_incident_screen.dart';
import 'screens/weather_screen.dart';
import 'screens/news_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/otp_verification_screen.dart';
import 'screens/new_password_screen.dart';
import 'screens/emergency_contacts_screen.dart';
import 'screens/air_quality_screen.dart';
import 'screens/shelters_screen.dart';
import 'screens/my_location_screen.dart';
import 'screens/language_screen.dart';
import 'screens/safety_tips_screen.dart';
import 'screens/preparedness_screen.dart';
import 'screens/checklists_screen.dart';
import 'screens/training_videos_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/help_support_screen.dart';
import 'screens/biometric_login_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/incidents_screen.dart';

final themeModeNotifier = ValueNotifier<ThemeMode>(ThemeMode.light);

class ThemeModeController extends InheritedNotifier<ValueNotifier<ThemeMode>> {
  const ThemeModeController({
    super.key,
    required super.notifier,
    required super.child,
  });

  static ValueNotifier<ThemeMode> of(BuildContext context) {
    final controller = context.dependOnInheritedWidgetOfExactType<ThemeModeController>();
    assert(controller != null, 'ThemeModeController not found above this widget');
    return controller!.notifier!;
  }
}

ThemeData _buildLightTheme() {
  final seed = const Color(0xFF0757E8);

  return ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: seed),
    scaffoldBackgroundColor: const Color(0xFFF6F8FC),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: Color(0xFF0B1B3F),
      elevation: 0,
      surfaceTintColor: Colors.white,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Color(0xFF102043),
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE4EAF4)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFDCE3F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFDCE3F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF0757E8), width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    useMaterial3: true,
  );
}

ThemeData _buildDarkTheme() {
  final seed = const Color(0xFF0757E8);

  return ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: seed,
      brightness: Brightness.dark,
    ),
    scaffoldBackgroundColor: const Color(0xFF08121F),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF111C2B),
      foregroundColor: Colors.white,
      elevation: 0,
      surfaceTintColor: Color(0xFF111C2B),
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    ),
    cardTheme: CardThemeData(
      color: const Color(0xFF111C2B),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFF1F2D3D)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF111C2B),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF2A3A4D)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF2A3A4D)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF7AA2FF), width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    useMaterial3: true,
  );
}

void main() {
  runApp(const ProviderScope(child: CrisisMeshApp()));
}

class CrisisMeshApp extends StatelessWidget {
  const CrisisMeshApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ThemeModeController(
      notifier: themeModeNotifier,
      child: ValueListenableBuilder<ThemeMode>(
        valueListenable: themeModeNotifier,
        builder: (context, themeMode, _) {
          return MaterialApp(
            title: 'CrisisMesh',
            debugShowCheckedModeBanner: false,
            theme: _buildLightTheme(),
            darkTheme: _buildDarkTheme(),
            themeMode: themeMode,
            initialRoute: '/',
            routes: {
              '/': (context) => const OnboardingScreen(),
              '/get-started': (context) => const GetStartedScreen(),
              '/login': (context) => const LoginScreen(),
              '/biometric': (context) => const BiometricLoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/forgot-password': (context) => const ForgotPasswordScreen(),
              '/otp': (context) => const OTPVerificationScreen(),
              '/new-password': (context) => const NewPasswordScreen(),
              '/home': (context) => const HomeScreen(),
              '/report-incident': (context) => const ReportIncidentScreen(),
              '/incidents': (context) => const IncidentsScreen(),
              '/weather': (context) => const WeatherScreen(),
              '/news': (context) => const NewsScreen(),
              '/emergency-contacts': (context) => const EmergencyContactsScreen(),
              '/air-quality': (context) => const AirQualityScreen(),
              '/shelters': (context) => const SheltersScreen(),
              '/my-location': (context) => const MyLocationScreen(),
              '/language': (context) => const LanguageScreen(),
              '/safety-tips': (context) => const SafetyTipsScreen(),
              '/preparedness': (context) => const PreparednessScreen(),
              '/checklists': (context) => const ChecklistsScreen(),
              '/training-videos': (context) => const TrainingVideosScreen(),
              '/settings': (context) => const SettingsScreen(),
              '/help-support': (context) => const HelpSupportScreen(),
              '/notifications': (context) => const NotificationsScreen(),
            },
          );
        },
      ),
    );
  }
}
