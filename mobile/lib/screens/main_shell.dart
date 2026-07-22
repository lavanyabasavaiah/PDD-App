import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';
import '../models/vital_model.dart';
import '../models/medication_model.dart';
import '../models/alert_model.dart';
import '../models/insight_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../theme.dart';

// Import Screens
import 'dashboard_screen.dart';
import 'trackers_screen.dart';
import 'medications_screen.dart';
import 'prescription_scanner_screen.dart';
import 'ai_copilot_screen.dart';
import 'insights_screen.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';
import 'utility_hub_screen.dart';

class MainShell extends StatefulWidget {
  final UserModel user;
  final String token;
  final VoidCallback onLogout;

  const MainShell({
    Key? key,
    required this.user,
    required this.token,
    required this.onLogout,
  }) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  String _currentPage = 'dashboard';
  late UserModel _currentUser;

  // Data States
  List<VitalModel> _vitals = [];
  List<MedicationModel> _medications = [];
  List<AlertModel> _alerts = [];
  InsightModel? _insight;

  // Polling Timer for Medication Reminder popups
  Timer? _medCheckTimer;
  Map<String, dynamic>? _activeReminder;

  // Quick Log form controllers
  final _systolicController = TextEditingController();
  final _diastolicController = TextEditingController();
  final _heartRateController = TextEditingController();
  final _tempController = TextEditingController();
  final _spo2Controller = TextEditingController();

  bool _fetching = false;

  @override
  void initState() {
    super.initState();
    _currentUser = widget.user;
    _fetchDashboardData();

    // Setup medication checks every 15 seconds
    _medCheckTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      _checkMedicationReminders();
    });
  }

  @override
  void dispose() {
    _medCheckTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchDashboardData() async {
    if (_fetching) return;
    setState(() => _fetching = true);

    try {
      final vitals = await ApiService.getVitals();
      final medications = await ApiService.getMedications();
      final alerts = await ApiService.getAlerts();
      final insight = await ApiService.getLatestInsight();

      setState(() {
        _vitals = vitals;
        _medications = medications;
        _alerts = alerts;
        _insight = insight;
      });
    } catch (e) {
      // Quietly log error
      print('Error loading dashboard data: $e');
    } finally {
      if (mounted) setState(() => _fetching = false);
    }
  }

  void _checkMedicationReminders() {
    if (_medications.isEmpty) return;

    final now = DateTime.now();
    final currentHourMin = DateFormat('HH:mm').format(now);
    final todayStr = DateFormat('yyyy-MM-dd').format(now);

    for (var med in _medications) {
      if (!med.active) continue;

      for (var time in med.times) {
        if (time == currentHourMin) {
          // Check if already logged today
          final logged = med.logs.any((l) => l.date == todayStr && l.time == time);
          if (!logged && (_activeReminder == null || _activeReminder!['id'] != med.id)) {
            setState(() {
              _activeReminder = {
                'id': med.id,
                'name': med.name,
                'dosage': med.dosage,
                'time': time,
              };
            });
            _showMedReminderPopup();
          }
        }
      }
    }
  }

  void _showMedReminderPopup() {
    if (_activeReminder == null) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppTheme.bgSecondary,
          shape: RoundedRectangleBorder(
            side: const BorderSide(color: AppTheme.primaryGlow),
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), shape: BoxShape.circle),
                child: const Icon(Icons.medication_rounded, color: AppTheme.primary, size: 24),
              ),
              const SizedBox(width: 12),
              const Text('Time for Medication', style: TextStyle(fontFamily: 'Outfit', fontSize: 18, color: Colors.white)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${_activeReminder!['name']} (${_activeReminder!['dosage']})',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 6),
              Text(
                'Scheduled for: ${_activeReminder!['time']}',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
            ],
          ),
          actionsAlignment: MainAxisAlignment.spaceBetween,
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          actions: [
            TextButton(
              onPressed: () {
                _logMedicationStatus(_activeReminder!['id'], _activeReminder!['time'], 'skipped');
                Navigator.of(ctx).pop();
                setState(() => _activeReminder = null);
              },
              child: const Text('Skip Dose', style: TextStyle(color: AppTheme.textSecondary)),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                setState(() => _activeReminder = null);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Reminder snoozed for 5 minutes.')),
                );
              },
              child: const Text('Snooze', style: TextStyle(color: AppTheme.warning)),
            ),
            ElevatedButton(
              onPressed: () {
                _logMedicationStatus(_activeReminder!['id'], _activeReminder!['time'], 'taken');
                Navigator.of(ctx).pop();
                setState(() => _activeReminder = null);
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
              child: const Text('Take Now', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _logMedicationStatus(String medId, String time, String status) async {
    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    try {
      await ApiService.logMedication(medId, todayStr, time, status);
      _fetchDashboardData();
    } catch (e) {
      print('Error logging medication status: $e');
    }
  }

  // Quick Vitals log submission
  Future<void> _submitQuickLog() async {
    final Map<String, dynamic> vitalData = {};
    if (_systolicController.text.isNotEmpty) vitalData['systolic'] = double.tryParse(_systolicController.text);
    if (_diastolicController.text.isNotEmpty) vitalData['diastolic'] = double.tryParse(_diastolicController.text);
    if (_heartRateController.text.isNotEmpty) vitalData['heartRate'] = double.tryParse(_heartRateController.text);
    if (_tempController.text.isNotEmpty) vitalData['temperature'] = double.tryParse(_tempController.text);
    if (_spo2Controller.text.isNotEmpty) vitalData['spo2'] = double.tryParse(_spo2Controller.text);

    if (vitalData.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter at least one vital parameter!'), backgroundColor: AppTheme.warning),
      );
      return;
    }

    try {
      await ApiService.addVital(vitalData);
      _systolicController.clear();
      _diastolicController.clear();
      _heartRateController.clear();
      _tempController.clear();
      _spo2Controller.clear();
      Navigator.of(context).pop();
      _fetchDashboardData();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vitals logged successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save vitals: $e'), backgroundColor: AppTheme.danger),
      );
    }
  }

  void _showQuickLogDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppTheme.bgSecondary,
          shape: RoundedRectangleBorder(
            side: const BorderSide(color: AppTheme.borderLight),
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.heart_broken_rounded, color: AppTheme.danger, size: 24),
                  SizedBox(width: 12),
                  Text('Quick Vitals Log', style: TextStyle(fontFamily: 'Outfit', fontSize: 18, color: Colors.white)),
                ],
              ),
              IconButton(
                onPressed: () => Navigator.of(ctx).pop(),
                icon: const Icon(Icons.close, color: AppTheme.textMuted),
              )
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('SYSTOLIC BP', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _systolicController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'mmHg'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DIASTOLIC BP', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _diastolicController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'mmHg'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('HEART RATE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: _heartRateController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: 'bpm', prefixIcon: Icon(Icons.favorite_outline)),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('TEMP (°C)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _tempController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(hintText: '°C'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('OXYGEN (%)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _spo2Controller,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'SpO2 %'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            OutlinedButton(
              onPressed: () => Navigator.of(ctx).pop(),
              style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.borderLight)),
              child: const Text('Cancel', style: TextStyle(color: AppTheme.textPrimary)),
            ),
            ElevatedButton(
              onPressed: _submitQuickLog,
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
              child: const Text('Save Vitals', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  // Advanced data wipe
  Future<void> _clearLogsDatabase() async {
    try {
      for (var v in _vitals) {
        await ApiService.deleteVital(v.id);
      }
      _fetchDashboardData();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Local vital log database cleared successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Wipe failed: $e'), backgroundColor: AppTheme.danger),
      );
    }
  }

  // Update profile callback
  Future<void> _updateProfile(Map<String, dynamic> data) async {
    final updated = await ApiService.updateProfile(data);
    setState(() {
      _currentUser = updated;
    });
  }

  String _getPageTitle() {
    switch (_currentPage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'trackers': return 'Vitals & Activity Trackers';
      case 'medications': return 'Medication Scheduling';
      case 'prescription-scanner': return 'Prescription OCR Scanner';
      case 'ai-assistant': return 'AI Diagnostic Copilot';
      case 'insights': return 'Weekly & Monthly Trends';
      case 'notifications': return 'Notification Center Drawer';
      case 'sos': return 'Emergency SOS & Care Summary';
      case 'settings': return 'Configurations & Settings';
      default: return 'VitalTrack';
    }
  }

  Widget _buildCurrentScreen() {
    switch (_currentPage) {
      case 'dashboard':
        return DashboardScreen(
          vitals: _vitals,
          medications: _medications,
          alerts: _alerts.where((a) => a.status == 'Unread').toList(),
          insight: _insight,
          onLogMedication: _logMedicationStatus,
          onResolveAlert: (id) async {
            await ApiService.resolveAlert(id);
            _fetchDashboardData();
          },
          onTriggerInsight: () async {
            final ins = await ApiService.triggerInsightAnalysis();
            setState(() => _insight = ins);
            _fetchDashboardData();
          },
          user: _currentUser,
          onNavigate: (page) => setState(() => _currentPage = page),
        );
      case 'trackers':
        return TrackersScreen(
          vitals: _vitals,
          onAddVital: (data) async {
            await ApiService.addVital(data);
            _fetchDashboardData();
          },
          onDeleteVital: (id) async {
            await ApiService.deleteVital(id);
            _fetchDashboardData();
          },
          user: _currentUser,
        );
      case 'medications':
        return MedicationsScreen(
          medications: _medications,
          onAddMedication: (data) async {
            await ApiService.addMedication(data);
            _fetchDashboardData();
          },
          onDeleteMedication: (id) async {
            await ApiService.deleteMedication(id);
            _fetchDashboardData();
          },
          onToggleActive: (id, active) async {
            await ApiService.toggleMedicationActive(id, active);
            _fetchDashboardData();
          },
        );
      case 'prescription-scanner':
        return PrescriptionScannerScreen(
          onAddMedication: (data) async {
            await ApiService.addMedication(data);
            _fetchDashboardData();
          },
          onNavigate: (page) => setState(() => _currentPage = page),
        );
      case 'ai-assistant':
        return AICopilotScreen(
          vitals: _vitals,
          user: _currentUser,
          onNavigate: (page) => setState(() => _currentPage = page),
        );
      case 'insights':
        return InsightsScreen(
          vitals: _vitals,
          medications: _medications,
          insight: _insight,
          onTriggerInsight: () async {
            final ins = await ApiService.triggerInsightAnalysis();
            setState(() => _insight = ins);
            _fetchDashboardData();
          },
          user: _currentUser,
        );
      case 'notifications':
        return NotificationsScreen(
          alerts: _alerts.where((a) => a.status == 'Unread').toList(),
          onResolveAlert: (id) async {
            await ApiService.resolveAlert(id);
            _fetchDashboardData();
          },
          onMarkAllRead: () async {
            await ApiService.markAllAlertsRead();
            _fetchDashboardData();
          },
        );
      case 'settings':
        return SettingsScreen(
          user: _currentUser,
          onUpdateProfile: _updateProfile,
          onClearDatabase: _clearLogsDatabase,
        );
      case 'sos':
        return UtilityHubScreen(
          user: _currentUser,
          onUpdateProfile: _updateProfile,
          medications: _medications,
        );
      default:
        return Center(child: Text('Screen $_currentPage not implemented yet.'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadAlerts = _alerts.where((a) => a.status == 'Unread').toList();
    final hasCritical = unreadAlerts.any((a) => a.severity == 'Critical');

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppTheme.bgSecondary,
        elevation: 0,
        title: Text(
          _getPageTitle(),
          style: const TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          IconButton(
            onPressed: _showQuickLogDialog,
            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primary),
            tooltip: 'Quick Log',
          ),
          IconButton(
            onPressed: _fetchDashboardData,
            icon: _fetching
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 2),
                  )
                : const Icon(Icons.refresh, color: AppTheme.textSecondary),
            tooltip: 'Refresh Data',
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                onPressed: () => setState(() => _currentPage = 'notifications'),
                icon: Icon(
                  Icons.notifications_outlined,
                  color: hasCritical ? AppTheme.danger : AppTheme.textSecondary,
                ),
              ),
              if (unreadAlerts.isNotEmpty)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppTheme.danger, shape: BoxShape.circle),
                    child: Text(
                      unreadAlerts.length.toString(),
                      style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: AppTheme.bgSecondary,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(color: AppTheme.bgPrimary),
              currentAccountPicture: CircleAvatar(
                backgroundImage: _currentUser.profilePhoto.startsWith('http')
                    ? NetworkImage(_currentUser.profilePhoto)
                    : null,
                backgroundColor: AppTheme.primary,
                child: _currentUser.profilePhoto.isEmpty
                    ? Text(_currentUser.fullName.isNotEmpty ? _currentUser.fullName[0].toUpperCase() : 'U')
                    : null,
              ),
              accountName: Text(_currentUser.fullName.isNotEmpty ? _currentUser.fullName : _currentUser.username, style: const TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold)),
              accountEmail: Text(_currentUser.email, style: const TextStyle(color: AppTheme.textSecondary)),
            ),
            _drawerItem(Icons.dashboard_outlined, 'Dashboard Overview', 'dashboard'),
            _drawerItem(Icons.favorite_border_rounded, 'Vitals Tracker', 'trackers'),
            _drawerItem(Icons.medication_outlined, 'Medication Scheduling', 'medications'),
            _drawerItem(Icons.document_scanner_outlined, 'Prescription Scanner', 'prescription-scanner'),
            _drawerItem(Icons.psychology_outlined, 'AI Assistant Copilot', 'ai-assistant'),
            _drawerItem(Icons.trending_up_rounded, 'Insights Trends', 'insights'),
            _drawerItem(Icons.sos_outlined, 'EmergencySOS Hub', 'sos'),
            _drawerItem(Icons.settings_outlined, 'Settings & Profile', 'settings'),
            const Divider(color: AppTheme.borderLight),
            ListTile(
              leading: const Icon(Icons.logout_rounded, color: AppTheme.danger),
              title: const Text('Sign Out', style: TextStyle(color: AppTheme.danger)),
              onTap: () {
                Navigator.of(context).pop();
                StorageService.clearAll();
                widget.onLogout();
              },
            ),
          ],
        ),
      ),
      body: _buildCurrentScreen(),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: AppTheme.bgSecondary,
        selectedItemColor: AppTheme.primary,
        unselectedItemColor: AppTheme.textMuted,
        currentIndex: _getCurrentIndex(),
        onTap: (idx) {
          setState(() {
            _currentPage = _getPageFromIndex(idx);
          });
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_border_rounded), label: 'Vitals'),
          BottomNavigationBarItem(icon: Icon(Icons.medication_outlined), label: 'Meds'),
          BottomNavigationBarItem(icon: Icon(Icons.psychology_outlined), label: 'AI Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.sos_outlined), label: 'SOS'),
        ],
      ),
    );
  }

  Widget _drawerItem(IconData icon, String title, String page) {
    final active = _currentPage == page;
    return ListTile(
      leading: Icon(icon, color: active ? AppTheme.primary : AppTheme.textSecondary),
      title: Text(title, style: TextStyle(color: active ? Colors.white : AppTheme.textSecondary, fontWeight: active ? FontWeight.bold : FontWeight.normal)),
      onTap: () {
        Navigator.of(context).pop();
        setState(() => _currentPage = page);
      },
    );
  }

  int _getCurrentIndex() {
    switch (_currentPage) {
      case 'dashboard': return 0;
      case 'trackers': return 1;
      case 'medications': return 2;
      case 'ai-assistant': return 3;
      case 'sos': return 4;
      default: return 0;
    }
  }

  String _getPageFromIndex(int index) {
    switch (index) {
      case 0: return 'dashboard';
      case 1: return 'trackers';
      case 2: return 'medications';
      case 3: return 'ai-assistant';
      case 4: return 'sos';
      default: return 'dashboard';
    }
  }
}
