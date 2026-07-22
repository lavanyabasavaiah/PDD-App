import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../theme.dart';

class SettingsScreen extends StatefulWidget {
  final UserModel user;
  final Function(Map<String, dynamic> data) onUpdateProfile;
  final Future<void> Function() onClearDatabase;

  const SettingsScreen({
    Key? key,
    required this.user,
    required this.onUpdateProfile,
    required this.onClearDatabase,
  }) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _fullNameController = TextEditingController();
  final _ageController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  String _gender = 'Male';
  String _bloodGroup = 'O+';
  
  // Goals controllers
  final _stepsGoalController = TextEditingController();
  final _sleepGoalController = TextEditingController();
  final _waterGoalController = TextEditingController();
  final _weightGoalController = TextEditingController();

  // Photo
  String _selectedPhoto = '';
  final List<String> _predefinedAvatars = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Missy'
  ];

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _fullNameController.text = widget.user.fullName;
    _ageController.text = widget.user.age.toString();
    _heightController.text = widget.user.height.toInt().toString();
    _weightController.text = widget.user.weight.toInt().toString();
    _gender = widget.user.gender;
    _bloodGroup = widget.user.bloodGroup.isNotEmpty ? widget.user.bloodGroup : 'O+';
    
    _stepsGoalController.text = widget.user.goals.steps.toString();
    _sleepGoalController.text = widget.user.goals.sleep.toString();
    _waterGoalController.text = widget.user.goals.water.toString();
    _weightGoalController.text = widget.user.goals.weight.toInt().toString();

    _selectedPhoto = widget.user.profilePhoto.isNotEmpty ? widget.user.profilePhoto : _predefinedAvatars[0];
  }

  void _saveSettings() async {
    final name = _fullNameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your full name.'), backgroundColor: AppTheme.warning),
      );
      return;
    }

    setState(() => _saving = true);

    final data = {
      'fullName': name,
      'age': int.tryParse(_ageController.text) ?? widget.user.age,
      'gender': _gender,
      'height': double.tryParse(_heightController.text) ?? widget.user.height,
      'weight': double.tryParse(_weightController.text) ?? widget.user.weight,
      'bloodGroup': _bloodGroup,
      'profilePhoto': _selectedPhoto,
      'goals': {
        'steps': int.tryParse(_stepsGoalController.text) ?? widget.user.goals.steps,
        'sleep': int.tryParse(_sleepGoalController.text) ?? widget.user.goals.sleep,
        'water': int.tryParse(_waterGoalController.text) ?? widget.user.goals.water,
        'weight': double.tryParse(_weightGoalController.text) ?? widget.user.goals.weight,
      }
    };

    try {
      await widget.onUpdateProfile(data);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile settings updated successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Update failed: $e'), backgroundColor: AppTheme.danger),
      );
    } finally {
      setState(() => _saving = false);
    }
  }

  void _confirmWipeDatabase() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppTheme.bgSecondary,
          title: const Text('Confirm Database Clear', style: TextStyle(color: Colors.white, fontFamily: 'Outfit')),
          content: const Text('Are you sure you want to delete all historical vital logs? This cannot be undone.', style: TextStyle(color: AppTheme.textSecondary)),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel', style: TextStyle(color: AppTheme.textPrimary)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                await widget.onClearDatabase();
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
              child: const Text('Clear All Logs', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Profile Details Section
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.manage_accounts, color: AppTheme.primary, size: 24),
                    SizedBox(width: 8),
                    Text('Edit Profile Metrics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 20),

                // Avatar Display
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: AppTheme.primary,
                        child: CircleAvatar(
                          radius: 46,
                          backgroundImage: _selectedPhoto.startsWith('http') ? NetworkImage(_selectedPhoto) : null,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _predefinedAvatars.map((url) {
                            final sel = _selectedPhoto == url;
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4.0),
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedPhoto = url),
                                child: CircleAvatar(
                                  radius: 20,
                                  backgroundColor: sel ? AppTheme.primary : Colors.transparent,
                                  child: CircleAvatar(radius: 18, backgroundImage: NetworkImage(url)),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(color: AppTheme.borderLight, height: 32),

                const Text('FULL NAME', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
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
                          const Text('AGE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _ageController,
                            keyboardType: TextInputType.number,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('GENDER', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            value: _gender,
                            dropdownColor: AppTheme.bgSecondary,
                            items: ['Male', 'Female', 'Other'].map((g) {
                              return DropdownMenuItem(value: g, child: Text(g, style: const TextStyle(color: Colors.white, fontSize: 13)));
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
                          const Text('HEIGHT (cm)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _heightController,
                            keyboardType: TextInputType.number,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('WEIGHT (kg)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _weightController,
                            keyboardType: TextInputType.number,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                const Text('BLOOD TYPE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: _bloodGroup,
                  dropdownColor: AppTheme.bgSecondary,
                  items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) {
                    return DropdownMenuItem(value: bt, child: Text(bt, style: const TextStyle(color: Colors.white, fontSize: 13)));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _bloodGroup = val);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Daily Goals Section
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.checklist, color: AppTheme.info, size: 24),
                    SizedBox(width: 8),
                    Text('Configure Target Goals', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 20),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('STEPS TARGET', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(controller: _stepsGoalController, keyboardType: TextInputType.number),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('SLEEP TARGET (hrs)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(controller: _sleepGoalController, keyboardType: TextInputType.number),
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
                          const Text('WATER TARGET (ml)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(controller: _waterGoalController, keyboardType: TextInputType.number),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('WEIGHT TARGET (kg)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(controller: _weightGoalController, keyboardType: TextInputType.number),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Submit Actions
          ElevatedButton(
            onPressed: _saving ? null : _saveSettings,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: _saving
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Save Profile Settings', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
          ),
          const SizedBox(height: 16),

          // Database Clear / Maintenance Section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.danger.withOpacity(0.05),
              border: Border.all(color: AppTheme.danger.withOpacity(0.15)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Advanced Maintenance', style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 6),
                const Text(
                  'Remove all cached and saved health vital logs from the database.',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: _confirmWipeDatabase,
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger.withOpacity(0.9)),
                  child: const Text('Clear Database Logs', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
