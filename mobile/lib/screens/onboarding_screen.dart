import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../theme.dart';

class OnboardingScreen extends StatefulWidget {
  final String initialStage;
  final UserModel? user;
  final String? token;
  final Function(UserModel updatedUser) onComplete;
  final VoidCallback onCancel;

  const OnboardingScreen({
    Key? key,
    this.initialStage = 'splash',
    this.user,
    this.token,
    required this.onComplete,
    required this.onCancel,
  }) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  late String _stage;
  
  // OTP Form States
  final List<TextEditingController> _otpControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (_) => FocusNode());
  String _otpError = '';

  // Profile Form States
  final _fullNameController = TextEditingController();
  final _ageController = TextEditingController(text: '30');
  String _gender = 'Male';
  final _heightController = TextEditingController(text: '175');
  final _weightController = TextEditingController(text: '70');

  // Photo / Avatar States
  String _selectedPhoto = '';
  final List<String> _predefinedAvatars = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Missy'
  ];

  // Health Setup States
  String _bloodGroup = 'O+';
  final List<String> _selectedConditions = [];
  final _allergiesController = TextEditingController();

  final List<String> _commonConditions = [
    'Hypertension',
    'Type 2 Diabetes',
    'Asthma',
    'Heart Disease',
    'High Cholesterol',
    'Thyroid Disorder',
    'None'
  ];

  // Goals States
  double _stepsGoal = 8000;
  double _sleepGoal = 8;
  double _waterGoal = 2000;
  double _weightGoal = 70;

  // Permissions States
  bool _permNotifications = false;
  bool _permCamera = false;
  bool _permFitness = false;

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _stage = widget.initialStage;
    _selectedPhoto = _predefinedAvatars[0];

    // If pre-profile setup (user already exists)
    if (widget.user != null) {
      _fullNameController.text = widget.user!.fullName;
      _ageController.text = widget.user!.age.toString();
      _gender = widget.user!.gender;
      _heightController.text = widget.user!.height.toInt().toString();
      _weightController.text = widget.user!.weight.toInt().toString();
      _bloodGroup = widget.user!.bloodGroup.isNotEmpty ? widget.user!.bloodGroup : 'O+';
      _selectedConditions.addAll(widget.user!.conditions);
      _stepsGoal = widget.user!.goals.steps.toDouble();
      _sleepGoal = widget.user!.goals.sleep.toDouble();
      _waterGoal = widget.user!.goals.water.toDouble();
      _weightGoal = widget.user!.goals.weight;
      _selectedPhoto = widget.user!.profilePhoto.isNotEmpty ? widget.user!.profilePhoto : _predefinedAvatars[0];
    }

    if (_stage == 'splash') {
      Future.delayed(const Duration(milliseconds: 2500), () {
        if (mounted && _stage == 'splash') {
          setState(() => _stage = 'intro');
        }
      });
    }
  }

  void _verifyOtpSubmit() {
    final code = _otpControllers.map((c) => c.text).join();
    if (code.length < 6) {
      setState(() => _otpError = 'Please enter all 6 digits.');
      return;
    }

    // Call verify or just simulate success
    StorageService.saveHasSeenOnboarding(true);
    setState(() {
      _stage = 'create-profile';
    });
  }

  void _toggleCondition(String cond) {
    setState(() {
      if (cond == 'None') {
        _selectedConditions.clear();
        _selectedConditions.add('None');
      } else {
        _selectedConditions.remove('None');
        if (_selectedConditions.contains(cond)) {
          _selectedConditions.remove(cond);
        } else {
          _selectedConditions.add(cond);
        }
      }
    });
  }

  Future<void> _handleSaveWizard() async {
    setState(() => _saving = true);
    final conditionsList = _selectedConditions.where((c) => c != 'None').toList();
    final allergyList = _allergiesController.text
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();

    final profileData = {
      'fullName': _fullNameController.text,
      'age': int.tryParse(_ageController.text) ?? 30,
      'gender': _gender,
      'height': double.tryParse(_heightController.text) ?? 175.0,
      'weight': double.tryParse(_weightController.text) ?? 70.0,
      'bloodGroup': _bloodGroup,
      'allergies': allergyList,
      'conditions': conditionsList,
      'goals': {
        'steps': _stepsGoal.toInt(),
        'sleep': _sleepGoal.toInt(),
        'water': _waterGoal.toInt(),
        'weight': _weightGoal,
      },
      'profilePhoto': _selectedPhoto,
      'settings': {
        'tempUnit': 'C',
        'weightUnit': 'kg',
        'sosTrigger': 5,
      },
      'onboardingComplete': true,
    };

    try {
      final updatedUser = await ApiService.updateProfile(profileData);
      await StorageService.saveUser(updatedUser);
      await StorageService.saveHasSeenOnboarding(true);
      widget.onComplete(updatedUser);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update profile: $e'), backgroundColor: AppTheme.danger),
      );
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false, // Disable back button during onboarding
      child: Scaffold(
        backgroundColor: AppTheme.bgPrimary,
        body: SafeArea(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _buildStageContent(),
          ),
        ),
      ),
    );
  }

  Widget _buildStageContent() {
    switch (_stage) {
      case 'splash':
        return _buildSplashStage();
      case 'intro':
        return _buildIntroStage();
      case 'onboarding1':
        return _buildOnboardingSlide1();
      case 'onboarding2':
        return _buildOnboardingSlide2();
      case 'onboarding3':
        return _buildOnboardingSlide3();
      case 'otp':
        return _buildOtpStage();
      case 'create-profile':
        return _buildCreateProfileStage();
      case 'upload-photo':
        return _buildUploadPhotoStage();
      case 'health-setup':
        return _buildHealthSetupStage();
      case 'goals':
        return _buildGoalsStage();
      case 'permissions':
        return _buildPermissionsStage();
      default:
        return _buildSplashStage();
    }
  }

  // --- STAGE WIDGETS ---

  Widget _buildSplashStage() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.danger.withOpacity(0.1),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.danger.withOpacity(0.15),
                  blurRadius: 20,
                  spreadRadius: 5,
                )
              ],
            ),
            child: const Icon(
              Icons.favorite_rounded,
              size: 72,
              color: AppTheme.danger,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'VitalTrack',
            style: TextStyle(fontFamily: 'Outfit', fontSize: 40, fontWeight: FontWeight.w800, color: Colors.white),
          ),
          const SizedBox(height: 8),
          const Text(
            'AI Intelligent Health Companion',
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 48),
          OutlinedButton(
            onPressed: () => setState(() => _stage = 'intro'),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppTheme.borderLight),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
            ),
            child: const Text('Skip Intro', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
          )
        ],
      ),
    );
  }

  Widget _buildIntroStage() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(hasGlow: true),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primary, AppTheme.info],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: AppTheme.primary.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 8))
                  ],
                ),
                child: const Icon(Icons.auto_awesome, color: Colors.white, size: 32),
              ),
              const SizedBox(height: 24),
              const Text(
                'Welcome to VitalTrack',
                style: TextStyle(fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              const SizedBox(height: 12),
              const Text(
                'Empower your health journey with real-time analytics, automated medication logging, prescription scanner, and AI clinical support.',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              _featureItem(Icons.analytics_outlined, 'Automated Vital Logging', 'Track blood pressure, oxygen, blood sugar, steps and weight in one hub.'),
              const SizedBox(height: 16),
              _featureItem(Icons.psychology_outlined, 'AI Intelligent Monitor', 'Detect anomalous health trends and read custom diagnostic suggestions.'),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => setState(() => _stage = 'onboarding1'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Get Started ', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                    Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _featureItem(IconData icon, String title, String subtitle) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: AppTheme.primary, size: 18),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(subtitle, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildOnboardingSlide1() {
    return _buildSlideFrame(
      icon: Icons.directions_run_rounded,
      iconColor: AppTheme.primary,
      title: 'Track Vitals & Activity',
      description: 'Monitor key metrics like Heart Rate, Blood Sugar, Blood Pressure, Sleep quality, hydration levels, and daily Steps easily.',
      previewWidget: Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.glassDecoration(background: Colors.white.withOpacity(0.02)),
        child: const Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Heart Rate', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                Text('72 bpm (Normal)', style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.w600, fontSize: 13)),
              ],
            ),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Blood Pressure', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                Text('120/80 mmHg (Normal)', style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.w600, fontSize: 13)),
              ],
            ),
          ],
        ),
      ),
      onBack: () => setState(() => _stage = 'intro'),
      onNext: () => setState(() => _stage = 'onboarding2'),
    );
  }

  Widget _buildOnboardingSlide2() {
    return _buildSlideFrame(
      icon: Icons.psychology,
      iconColor: AppTheme.info,
      title: 'AI Smart Health Monitor',
      description: 'Get personalized warnings on health anomalies. The system correlates medical metrics with your current active prescription details.',
      previewWidget: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.danger.withOpacity(0.15),
          border: Border.all(color: AppTheme.danger.withOpacity(0.25)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('TREND ALARM', style: TextStyle(color: AppTheme.danger, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
            SizedBox(height: 4),
            Text(
              'Elevated blood pressure observed after skipping Lisinopril medication.',
              style: TextStyle(color: Colors.white, fontSize: 12),
            )
          ],
        ),
      ),
      onBack: () => setState(() => _stage = 'onboarding1'),
      onNext: () => setState(() => _stage = 'onboarding3'),
    );
  }

  Widget _buildOnboardingSlide3() {
    return _buildSlideFrame(
      icon: Icons.notifications_active_outlined,
      iconColor: AppTheme.primary,
      title: 'Medication Reminders',
      description: 'Set alerts for medications. Avoid missing doses with custom timers, log skipped/taken adherence, and scan prescriptions to add.',
      previewWidget: Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.glassDecoration(background: Colors.white.withOpacity(0.02)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Atorvastatin', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                SizedBox(height: 2),
                Text('10mg • Daily • 09:00 PM', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.success.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
              child: const Text('Reminder Set', style: TextStyle(color: AppTheme.success, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
      onBack: () => setState(() => _stage = 'onboarding2'),
      onNext: () {
        if (widget.token != null) {
          // Already authenticated (post-registration profile setup)
          setState(() => _stage = 'create-profile');
        } else {
          // Guest finished intro slides → mark seen and navigate to login
          StorageService.saveHasSeenOnboarding(true);
          widget.onCancel();
        }
      },
      nextLabel: 'Get Started',
    );
  }

  Widget _buildSlideFrame({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
    required Widget previewWidget,
    required VoidCallback onBack,
    required VoidCallback onNext,
    String nextLabel = 'Next Slide',
  }) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 450),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 64, color: iconColor),
              const SizedBox(height: 24),
              Text(
                title,
                style: const TextStyle(fontFamily: 'Outfit', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Text(
                description,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              previewWidget,
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onBack,
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.borderLight),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Back', style: TextStyle(color: AppTheme.textPrimary)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: onNext,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(nextLabel, style: const TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOtpStage() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 420),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), shape: BoxShape.circle),
                child: const Icon(Icons.lock_outline_rounded, color: AppTheme.primary, size: 24),
              ),
              const SizedBox(height: 20),
              const Text(
                'Security Code',
                style: TextStyle(fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              const SizedBox(height: 8),
              const Text(
                "We've sent a 6-digit confirmation code to your email. Enter the code below to verify.",
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // 6 input boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 45,
                    height: 50,
                    child: TextField(
                      controller: _otpControllers[index],
                      focusNode: _otpFocusNodes[index],
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      decoration: const InputDecoration(counterText: '', contentPadding: EdgeInsets.zero),
                      onChanged: (val) {
                        if (val.isNotEmpty && index < 5) {
                          FocusScope.of(context).requestFocus(_otpFocusNodes[index + 1]);
                        }
                      },
                    ),
                  );
                }),
              ),
              const SizedBox(height: 16),

              if (_otpError.isNotEmpty) ...[
                Text(_otpError, style: const TextStyle(color: AppTheme.danger, fontSize: 12)),
                const SizedBox(height: 16),
              ],

              ElevatedButton(
                onPressed: _verifyOtpSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  minimumSize: const Size.fromHeight(45),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Verify Account', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
              ),
              const SizedBox(height: 20),

              TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Verification OTP resent!')),
                  );
                },
                child: const Text('Resend Code', style: TextStyle(color: AppTheme.primary, decoration: TextDecoration.underline)),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCreateProfileStage() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Center(
                child: Column(
                  children: [
                    Icon(Icons.account_circle_outlined, color: AppTheme.primary, size: 48),
                    SizedBox(height: 12),
                    Text('Create Profile', style: TextStyle(fontFamily: 'Outfit', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
                    SizedBox(height: 4),
                    Text("Let's configure your basic health dimensions", style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text('FULL NAME', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              TextField(
                controller: _fullNameController,
                decoration: const InputDecoration(hintText: 'e.g. John Doe'),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('AGE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _ageController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '30'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('GENDER', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                          value: _gender,
                          dropdownColor: AppTheme.bgSecondary,
                          decoration: const InputDecoration(),
                          items: ['Male', 'Female', 'Other'].map((g) {
                            return DropdownMenuItem(value: g, child: Text(g, style: const TextStyle(color: Colors.white)));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _gender = val);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('HEIGHT (CM)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _heightController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '175'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('WEIGHT (KG)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _weightController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '70'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: () {
                  if (_fullNameController.text.trim().isNotEmpty) {
                    setState(() => _stage = 'upload-photo');
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter your full name')),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Continue', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUploadPhotoStage() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 460),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Profile Picture', style: TextStyle(fontFamily: 'Outfit', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Choose a preset avatar or record custom credentials', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 24),

              // Avatar preview
              Stack(
                children: [
                  CircleAvatar(
                    radius: 60,
                    backgroundColor: AppTheme.primary,
                    child: CircleAvatar(
                      radius: 56,
                      backgroundColor: AppTheme.bgSecondary,
                      backgroundImage: _selectedPhoto.startsWith('http')
                          ? NetworkImage(_selectedPhoto) as ImageProvider
                          : const AssetImage('assets/images/avatar.png'), // local asset fallback
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                      child: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Avatar preset items
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: _predefinedAvatars.map((url) {
                    final isSelected = _selectedPhoto == url;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6.0),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedPhoto = url),
                        child: CircleAvatar(
                          radius: 28,
                          backgroundColor: isSelected ? AppTheme.primary : Colors.transparent,
                          child: CircleAvatar(
                            radius: 26,
                            backgroundImage: NetworkImage(url),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _stage = 'create-profile'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.borderLight),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Back', style: TextStyle(color: AppTheme.textPrimary)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () => setState(() => _stage = 'health-setup'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Continue', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHealthSetupStage() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Health Conditions', textAlign: TextAlign.center, style: TextStyle(fontFamily: 'Outfit', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Select any pre-existing chronic conditions and record allergies', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 24),

              const Text('BLOOD TYPE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _bloodGroup,
                dropdownColor: AppTheme.bgSecondary,
                items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) {
                  return DropdownMenuItem(value: bt, child: Text(bt, style: const TextStyle(color: Colors.white)));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _bloodGroup = val);
                },
              ),
              const SizedBox(height: 20),

              const Text('CHRONIC CONDITIONS', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _commonConditions.map((cond) {
                  final isSelected = _selectedConditions.contains(cond);
                  return FilterChip(
                    label: Text(cond, style: TextStyle(color: isSelected ? Colors.white : AppTheme.textSecondary, fontSize: 12)),
                    selected: isSelected,
                    selectedColor: AppTheme.primary,
                    checkmarkColor: Colors.white,
                    backgroundColor: Colors.white.withOpacity(0.04),
                    side: BorderSide(color: isSelected ? AppTheme.primary : AppTheme.borderLight),
                    onSelected: (_) => _toggleCondition(cond),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              const Text('ALLERGIES', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              TextField(
                controller: _allergiesController,
                decoration: const InputDecoration(hintText: 'e.g. Peanuts, Penicillin (Comma separated)'),
              ),
              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _stage = 'upload-photo'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.borderLight),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Back', style: TextStyle(color: AppTheme.textPrimary)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () => setState(() => _stage = 'goals'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Continue', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGoalsStage() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Daily Health Goals', textAlign: TextAlign.center, style: TextStyle(fontFamily: 'Outfit', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Configure your daily target levels to gauge your health score', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 24),

              // Steps
              _goalSlider(
                icon: Icons.directions_walk_rounded,
                label: 'Step Goal',
                value: _stepsGoal,
                min: 3000,
                max: 20000,
                divisions: 34,
                valueText: '${_stepsGoal.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')} steps',
                color: AppTheme.primary,
                onChanged: (val) => setState(() => _stepsGoal = val),
              ),
              const SizedBox(height: 20),

              // Sleep
              _goalSlider(
                icon: Icons.bedtime_outlined,
                label: 'Sleep Goal',
                value: _sleepGoal,
                min: 5,
                max: 10,
                divisions: 10,
                valueText: '${_sleepGoal.toInt()} hours',
                color: AppTheme.info,
                onChanged: (val) => setState(() => _sleepGoal = val),
              ),
              const SizedBox(height: 20),

              // Water
              _goalSlider(
                icon: Icons.water_drop_outlined,
                label: 'Water Goal',
                value: _waterGoal,
                min: 1000,
                max: 5000,
                divisions: 16,
                valueText: '${_waterGoal.toInt()} ml',
                color: AppTheme.info,
                onChanged: (val) => setState(() => _waterGoal = val),
              ),
              const SizedBox(height: 20),

              // Weight
              _goalSlider(
                icon: Icons.scale_outlined,
                label: 'Target Weight',
                value: _weightGoal,
                min: 40,
                max: 150,
                divisions: 110,
                valueText: '${_weightGoal.toInt()} kg',
                color: AppTheme.warning,
                onChanged: (val) => setState(() => _weightGoal = val),
              ),
              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _stage = 'health-setup'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.borderLight),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Back', style: TextStyle(color: AppTheme.textPrimary)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () => setState(() => _stage = 'permissions'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Continue', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _goalSlider({
    required IconData icon,
    required String label,
    required double value,
    required double min,
    required double max,
    required int divisions,
    required String valueText,
    required Color color,
    required Function(double) onChanged,
  }) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 14),
                const SizedBox(width: 6),
                Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
              ],
            ),
            Text(valueText, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: divisions,
          activeColor: color,
          inactiveColor: color.withOpacity(0.2),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildPermissionsStage() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 460),
          padding: const EdgeInsets.all(32.0),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('App Permissions', textAlign: TextAlign.center, style: TextStyle(fontFamily: 'Outfit', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
              const SizedBox(height: 8),
              const Text('Grant necessary services to activate AI reminders and scanning logs', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 24),

              _permRow('Enable Notifications', 'Needed for pill reminders, health alerts, and daily updates.', _permNotifications, (val) => setState(() => _permNotifications = val)),
              const Divider(color: AppTheme.borderLight, height: 24),
              _permRow('Access Camera', 'Required for prescription scanning and uploading clinical records.', _permCamera, (val) => setState(() => _permCamera = val)),
              const Divider(color: AppTheme.borderLight, height: 24),
              _permRow('Fitness Tracker Access', 'Allows synchronizing steps, heart rate and activity metrics.', _permFitness, (val) => setState(() => _permFitness = val)),
              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _stage = 'goals'),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.borderLight),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text('Back', style: TextStyle(color: AppTheme.textPrimary)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _saving ? null : _handleSaveWizard,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: _saving
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('Save & Finish', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _permRow(String title, String desc, bool value, Function(bool) onChanged) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text(desc, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Switch(
          value: value,
          activeColor: AppTheme.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
