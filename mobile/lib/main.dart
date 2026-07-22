import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/main_shell.dart';
import 'services/storage_service.dart';
import 'models/user_model.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _initialized = false;
  String? _token;
  UserModel? _user;

  // Current sub-route when not logged in: 'login' | 'register' | 'forgot-password' | 'onboarding'
  String _preAuthScreen = 'login';

  @override
  void initState() {
    super.initState();
    _checkAuthState();
  }

  Future<void> _checkAuthState() async {
    final token = await StorageService.getToken();
    final user = await StorageService.getUser();
    final hasSeenIntro = await StorageService.hasSeenOnboarding();

    setState(() {
      _token = token;
      _user = user;
      _preAuthScreen = hasSeenIntro ? 'login' : 'onboarding';
      _initialized = true;
    });
  }

  void _handleLoginSuccess(String token, UserModel user) {
    setState(() {
      _token = token;
      _user = user;
    });
  }

  void _handleLogout() {
    setState(() {
      _token = null;
      _user = null;
      _preAuthScreen = 'login';
    });
  }

  void _handleOnboardingComplete(UserModel updatedUser) {
    setState(() {
      _user = updatedUser;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      return MaterialApp(
        theme: AppTheme.darkTheme,
        home: const Scaffold(
          backgroundColor: AppTheme.bgPrimary,
          body: Center(
            child: CircularProgressIndicator(color: AppTheme.primary),
          ),
        ),
      );
    }

    Widget homeWidget;

    // 1. Session check: User logged in
    if (_token != null && _user != null) {
      if (!_user!.onboardingComplete) {
        // User created but needs profile setup
        homeWidget = OnboardingScreen(
          initialStage: 'create-profile',
          user: _user,
          token: _token,
          onComplete: _handleOnboardingComplete,
          onCancel: _handleLogout,
        );
      } else {
        // Logged in with complete profile
        homeWidget = MainShell(
          user: _user!,
          token: _token!,
          onLogout: _handleLogout,
        );
      }
    } else {
      // 2. Guest check: User NOT logged in
      if (_preAuthScreen == 'onboarding') {
        homeWidget = OnboardingScreen(
          initialStage: 'splash',
          onComplete: (_) {
            setState(() => _preAuthScreen = 'login');
          },
          onCancel: () {
            setState(() => _preAuthScreen = 'login');
          },
        );
      } else if (_preAuthScreen == 'register') {
        homeWidget = RegisterScreen(
          onRegister: _handleLoginSuccess,
          onNavigateLogin: () => setState(() => _preAuthScreen = 'login'),
        );
      } else if (_preAuthScreen == 'forgot-password') {
        homeWidget = ForgotPasswordScreen(
          onNavigateLogin: () => setState(() => _preAuthScreen = 'login'),
        );
      } else {
        homeWidget = LoginScreen(
          onLogin: _handleLoginSuccess,
          onNavigateRegister: () => setState(() => _preAuthScreen = 'register'),
          onNavigateForgotPassword: () => setState(() => _preAuthScreen = 'forgot-password'),
        );
      }
    }

    return MaterialApp(
      title: 'VitalTrack',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: homeWidget,
    );
  }
}
