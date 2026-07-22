import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  final VoidCallback onNavigateLogin;

  const ForgotPasswordScreen({
    Key? key,
    required this.onNavigateLogin,
  }) : super(key: key);

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _newPasswordController = TextEditingController();
  
  bool _codeSent = false;
  String _error = '';
  String _success = '';
  bool _loading = false;

  Future<void> _handleRequestCode() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Please enter your email address');
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
      _success = '';
    });

    try {
      await ApiService.forgotPassword(email);
      setState(() {
        _codeSent = true;
        _success = 'A reset OTP has been sent to your email.';
      });
    } catch (err) {
      setState(() => _error = err.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _handleResetPassword() async {
    final email = _emailController.text.trim();
    final code = _codeController.text.trim();
    final newPassword = _newPasswordController.text.trim();

    if (email.isEmpty || code.isEmpty || newPassword.isEmpty) {
      setState(() => _error = 'All fields are required');
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
      _success = '';
    });

    try {
      await ApiService.resetPassword(email, code, newPassword);
      setState(() {
        _success = 'Password reset successful! You can now log in.';
      });
      // Redirect to login after 2 seconds
      Future.delayed(const Duration(seconds: 2), () {
        widget.onNavigateLogin();
      });
    } catch (err) {
      setState(() => _error = err.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 420),
            padding: const EdgeInsets.all(32.0),
            decoration: AppTheme.glassDecoration(hasGlow: true),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Brand Header
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primary, AppTheme.info],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withOpacity(0.4),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: const Icon(
                        Icons.lock_reset_rounded,
                        size: 32,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _codeSent ? 'Reset Password' : 'Forgot Password',
                      style: const TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _codeSent
                          ? 'Enter code and your new credentials'
                          : 'Receive a temporary OTP security code',
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Error Indicator
                if (_error.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.danger.withOpacity(0.1),
                      border: Border.all(color: AppTheme.danger.withOpacity(0.2)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: AppTheme.danger, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _error,
                            style: const TextStyle(color: AppTheme.danger, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Success Indicator
                if (_success.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.success.withOpacity(0.1),
                      border: Border.all(color: AppTheme.success.withOpacity(0.2)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_outline_rounded, color: AppTheme.success, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _success,
                            style: const TextStyle(color: AppTheme.success, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Email Input (Disabled if code sent)
                const Text(
                  'EMAIL ADDRESS',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _emailController,
                  enabled: !_codeSent,
                  decoration: const InputDecoration(
                    hintText: 'Enter registered email',
                    prefixIcon: Icon(Icons.email_outlined, color: AppTheme.textMuted, size: 18),
                  ),
                ),
                const SizedBox(height: 16),

                if (_codeSent) ...[
                  const Text(
                    'SECURITY CODE (OTP)',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _codeController,
                    decoration: const InputDecoration(
                      hintText: 'Enter 6-digit OTP',
                      prefixIcon: Icon(Icons.security_rounded, color: AppTheme.textMuted, size: 18),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'NEW PASSWORD',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _newPasswordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      hintText: 'Enter new password',
                      prefixIcon: Icon(Icons.lock_outline_rounded, color: AppTheme.textMuted, size: 18),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Submit Button
                ElevatedButton(
                  onPressed: _loading
                      ? null
                      : (_codeSent ? _handleResetPassword : _handleRequestCode),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 4,
                  ),
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          _codeSent ? 'Reset Password' : 'Request Security Code',
                          style: const TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                        ),
                ),
                const SizedBox(height: 20),

                // Back to Login Redirect
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: widget.onNavigateLogin,
                      child: const Text(
                        'Back to Sign In',
                        style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
