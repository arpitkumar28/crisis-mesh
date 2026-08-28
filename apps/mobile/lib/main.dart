import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const ProviderScope(child: CrisisMeshApp()));
}

class CrisisMeshApp extends StatelessWidget {
  const CrisisMeshApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CrisisMesh',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0757E8)),
        scaffoldBackgroundColor: const Color(0xFFF6F8FC),
        appBarTheme: const AppBarTheme(backgroundColor: Colors.white, foregroundColor: Color(0xFF0B1B3F), elevation: 0, surfaceTintColor: Colors.white, centerTitle: false),
        cardTheme: CardThemeData(color: Colors.white, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFFE4EAF4)))),
        inputDecorationTheme: InputDecorationTheme(filled: true, fillColor: const Color(0xFFF8FAFD), border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFDCE3F0))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFDCE3F0)))),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
      },
    );
  }
}
