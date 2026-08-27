import 'package:flutter/material.dart';

/*
 * AppMessenger - Centralized Application Feedback System
 * 
 * Provides a unified interface for showing user feedback messages
 * across the application. Wraps ScaffoldMessenger to provide a clean API.
 * 
 * Phase 1 Foundation - Architectural placeholder
 * 
 * Usage:
 *   AppMessenger.success("Operation completed");
 *   AppMessenger.error("Unable to connect");
 *   AppMessenger.warning("Connection lost");
 *   AppMessenger.info("Synchronizing data");
 * 
 * Critical emergency events (flood warning, fire warning, evacuation order,
 * critical pollution, SOS, responder emergency) should NOT use this temporary
 * SnackBar system. They require a dedicated persistent emergency UI system
 * to be implemented in later phases.
 */
class AppMessenger {
  /// Show a success message (green)
  static void success(
    BuildContext context,
    String message, {
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    _showSnackBar(
      context,
      message,
      backgroundColor: Colors.green.shade700,
      icon: Icons.check_circle,
      duration: duration,
      action: action,
    );
  }

  /// Show an error message (red)
  static void error(
    BuildContext context,
    String message, {
    Duration duration = const Duration(seconds: 4),
    SnackBarAction? action,
  }) {
    _showSnackBar(
      context,
      message,
      backgroundColor: Colors.red.shade700,
      icon: Icons.error,
      duration: duration,
      action: action,
    );
  }

  /// Show a warning message (orange)
  static void warning(
    BuildContext context,
    String message, {
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    _showSnackBar(
      context,
      message,
      backgroundColor: Colors.orange.shade700,
      icon: Icons.warning,
      duration: duration,
      action: action,
    );
  }

  /// Show an info message (blue)
  static void info(
    BuildContext context,
    String message, {
    Duration duration = const Duration(seconds: 2),
    SnackBarAction? action,
  }) {
    _showSnackBar(
      context,
      message,
      backgroundColor: Colors.blue.shade700,
      icon: Icons.info,
      duration: duration,
      action: action,
    );
  }

  /// Show a custom message
  static void custom(
    BuildContext context,
    String message, {
    required Color backgroundColor,
    IconData? icon,
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
  }) {
    _showSnackBar(
      context,
      message,
      backgroundColor: backgroundColor,
      icon: icon,
      duration: duration,
      action: action,
    );
  }

  /// Convert API error to user-friendly message
  static String getErrorMessage(dynamic error) {
    if (error is Map) {
      final message = error['message'] as String?;
      if (message != null) {
        // Sanitize technical error messages
        return _sanitizeErrorMessage(message);
      }
    }
    return 'An unexpected error occurred. Please try again.';
  }

  static void _showSnackBar(
    BuildContext context,
    String message, {
    required Color backgroundColor,
    IconData? icon,
    required Duration duration,
    SnackBarAction? action,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: Colors.white),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor,
        duration: duration,
        action: action,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  static String _sanitizeErrorMessage(String message) {
    // Remove technical details that shouldn't be shown to users
    return message
        .replaceAll(RegExp(r'\[.*?\]'), '') // Remove bracketed technical info
        .replaceAll(RegExp(r'\{.*?\}'), '') // Remove JSON-like structures
        .replaceAll(RegExp(r'<.*?>'), '') // Remove HTML-like tags
        .trim();
  }
}
