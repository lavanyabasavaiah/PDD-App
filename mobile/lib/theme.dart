import 'package:flutter/material.dart';

class AppTheme {
  // Color Palette
  static const Color bgPrimary = Color(0xFF0A0C16);
  static const Color bgSecondary = Color(0xFF101426);
  static const Color bgPanel = Color(0x8C161C36); // rgba(22, 28, 54, 0.55)
  static const Color bgPanelHover = Color(0xB21C2444); // rgba(28, 36, 68, 0.7)
  static const Color borderLight = Color(0x0FFFFFFF); // rgba(255, 255, 255, 0.06)
  static const Color borderGlow = Color(0x406366F1); // rgba(99, 102, 241, 0.25)
  
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Accent Colors
  static const Color primary = Color(0xFF6366F1);
  static const Color primaryGlow = Color(0x666366F1);
  static const Color success = Color(0xFF10B981);
  static const Color successGlow = Color(0x4D10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningGlow = Color(0x4DF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerGlow = Color(0x66EF4444);
  static const Color info = Color(0xFF06B6D4);
  static const Color infoGlow = Color(0x4D06B6D4);

  // Glass panel decoration helper
  static BoxDecoration glassDecoration({
    Color background = bgPanel,
    Color borderColor = borderLight,
    double radius = 16.0,
    bool hasGlow = false,
  }) {
    return BoxDecoration(
      color: background,
      border: Border.all(
        color: hasGlow ? borderGlow : borderColor,
        width: 1.0,
      ),
      borderRadius: BorderRadius.circular(radius),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.37),
          blurRadius: 32.0,
          offset: const Offset(0, 8),
        ),
        if (hasGlow)
          BoxShadow(
            color: primary.withOpacity(0.15),
            blurRadius: 20.0,
            spreadRadius: 0,
          ),
      ],
    );
  }

  // Linear background gradients helper
  static BoxDecoration radialBackgroundDecoration() {
    return const BoxDecoration(
      color: bgPrimary,
      // We simulate the radial gradients of the web client using linear gradients or layers
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primary,
      scaffoldBackgroundColor: bgPrimary,
      cardColor: bgSecondary,
      fontFamily: 'Inter',
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w800, color: textPrimary),
        displayMedium: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: textPrimary),
        displaySmall: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: textPrimary),
        headlineMedium: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w600, color: textPrimary),
        titleLarge: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w600, color: textPrimary),
        bodyLarge: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.normal, color: textPrimary),
        bodyMedium: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.normal, color: textSecondary),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgPrimary.withOpacity(0.6),
        labelStyle: const TextStyle(color: textSecondary, fontSize: 13, fontWeight: FontWeight.w500),
        hintStyle: const TextStyle(color: textMuted, fontSize: 14),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primary),
        ),
      ),
      buttonTheme: const ButtonThemeData(
        buttonColor: primary,
        textTheme: ButtonTextTheme.primary,
      ),
    );
  }
}
