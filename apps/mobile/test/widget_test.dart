// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:crisis_mesh/main.dart';
import 'package:crisis_mesh/screens/settings_screen.dart';

void main() {
  testWidgets('renders the onboarding screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: CrisisMeshApp()));

    expect(find.text('AI-Powered Disaster Management Network'), findsOneWidget);
  });

  testWidgets('settings screen includes a dark mode toggle', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: ThemeModeController(
            notifier: themeModeNotifier,
            child: const SettingsScreen(),
          ),
        ),
      ),
    );

    expect(find.text('Dark Mode'), findsOneWidget);
  });
}
