import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/medication_model.dart';
import '../theme.dart';

class UtilityHubScreen extends StatefulWidget {
  final UserModel user;
  final Function(Map<String, dynamic> data) onUpdateProfile;
  final List<MedicationModel> medications;

  const UtilityHubScreen({
    Key? key,
    required this.user,
    required this.onUpdateProfile,
    required this.medications,
  }) : super(key: key);

  @override
  State<UtilityHubScreen> createState() => _UtilityHubScreenState();
}

class _UtilityHubScreenState extends State<UtilityHubScreen> {
  String _activeTab = 'sos'; // sos | appointments | records | family

  // SOS States
  Timer? _countdownTimer;
  int? _countdown;
  bool _sosCountdownActive = false;
  bool _sosTriggered = false;

  // Appointments States
  final List<Map<String, String>> _appointments = [
    {
      'id': '1',
      'doctor': 'Dr. Sarah Connor',
      'spec': 'Cardiologist',
      'clinic': 'City Heart Clinic',
      'date': '2026-06-25',
      'time': '10:00'
    }
  ];
  final _apptDoctorController = TextEditingController();
  String _apptSpec = 'Cardiologist';
  final _apptClinicController = TextEditingController();
  final _apptDateController = TextEditingController();
  final _apptTimeController = TextEditingController();

  // Records States
  final List<Map<String, String>> _records = [
    {
      'id': '1',
      'title': 'Lipid Panel Report',
      'category': 'Lab Report',
      'date': '2026-05-10',
      'fileName': 'lipid_panel_may2026.pdf'
    }
  ];
  final _recTitleController = TextEditingController();
  String _recCat = 'Lab Report';
  final _recDateController = TextEditingController();
  bool _uploadingRecord = false;

  // Emergency Contact States
  final _contactNameController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  String _contactRel = 'Spouse';

  // Family Access States
  final _inviteEmailController = TextEditingController();
  String _inviteRole = 'Viewer';
  String _generatedCode = '';

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startSOS() {
    setState(() {
      _countdown = widget.user.settings.sosTrigger;
      _sosCountdownActive = true;
      _sosTriggered = false;
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown! > 1) {
        setState(() {
          _countdown = _countdown! - 1;
        });
      } else {
        timer.cancel();
        setState(() {
          _sosCountdownActive = false;
          _sosTriggered = true;
          _countdown = null;
        });
        final contactNames = widget.user.emergencyContacts.map((c) => c.name).toList();
        final label = contactNames.isEmpty ? 'Spouse contact' : contactNames.join(', ');
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppTheme.bgSecondary,
            title: const Text('SOS Alert Broadcasted', style: TextStyle(color: Colors.white, fontFamily: 'Outfit')),
            content: Text('EMERGENCY SOS BROADCAST SENT to contacts: $label'),
            actions: [
              TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('OK', style: TextStyle(color: AppTheme.primary))),
            ],
          ),
        );
      }
    });
  }

  void _abortSOS() {
    _countdownTimer?.cancel();
    setState(() {
      _sosCountdownActive = false;
      _countdown = null;
      _sosTriggered = false;
    });
  }

  void _addContact() async {
    final name = _contactNameController.text.trim();
    final phone = _contactPhoneController.text.trim();

    if (name.isEmpty || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Name and phone required.'), backgroundColor: AppTheme.warning),
      );
      return;
    }

    final contactsList = widget.user.emergencyContacts.map((c) => c.toJson()).toList();
    contactsList.add({
      'name': name,
      'phone': phone,
      'relationship': _contactRel,
    });

    try {
      await widget.onUpdateProfile({'emergencyContacts': contactsList});
      _contactNameController.clear();
      _contactPhoneController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Contact added successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Add failed: $e'), backgroundColor: AppTheme.danger),
      );
    }
  }

  void _deleteContact(int index) async {
    final contactsList = widget.user.emergencyContacts.map((c) => c.toJson()).toList();
    contactsList.removeAt(index);

    try {
      await widget.onUpdateProfile({'emergencyContacts': contactsList});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Contact removed successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Delete failed: $e'), backgroundColor: AppTheme.danger),
      );
    }
  }

  void _addAppointment() {
    final doc = _apptDoctorController.text.trim();
    final cl = _apptClinicController.text.trim();
    final date = _apptDateController.text.trim();
    final time = _apptTimeController.text.trim();

    if (doc.isEmpty || cl.isEmpty || date.isEmpty || time.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all appointment fields.'), backgroundColor: AppTheme.warning),
      );
      return;
    }

    setState(() {
      _appointments.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'doctor': doc,
        'spec': _apptSpec,
        'clinic': cl,
        'date': date,
        'time': time,
      });
      _apptDoctorController.clear();
      _apptClinicController.clear();
      _apptDateController.clear();
      _apptTimeController.clear();
    });
  }

  void _addRecord() {
    final title = _recTitleController.text.trim();
    final date = _recDateController.text.trim();

    if (title.isEmpty || date.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Record title and date are required.'), backgroundColor: AppTheme.warning),
      );
      return;
    }

    setState(() {
      _uploadingRecord = true;
    });

    Timer(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _records.add({
            'id': DateTime.now().millisecondsSinceEpoch.toString(),
            'title': title,
            'category': _recCat,
            'date': date,
            'fileName': 'record_pdf_${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}.pdf',
          });
          _recTitleController.clear();
          _recDateController.clear();
          _uploadingRecord = false;
        });
      }
    });
  }

  void _sendFamilyInvite() async {
    final email = _inviteEmailController.text.trim();
    if (email.isEmpty) return;

    final familyList = widget.user.familyAccess.map((f) => f.toJson()).toList();
    familyList.add({
      'email': email,
      'role': _inviteRole,
      'status': 'Pending',
    });

    try {
      await widget.onUpdateProfile({'familyAccess': familyList});
      _inviteEmailController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invite sent successfully to $email!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invite failed: $e'), backgroundColor: AppTheme.danger),
      );
    }
  }

  void _deleteFamilyInvite(int index) async {
    final familyList = widget.user.familyAccess.map((f) => f.toJson()).toList();
    familyList.removeAt(index);

    try {
      await widget.onUpdateProfile({'familyAccess': familyList});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Revoked access successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Revoke failed: $e'), backgroundColor: AppTheme.danger),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Tab Selection Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          color: AppTheme.bgSecondary,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _tabButton('sos', 'SOS Portal', Icons.shield_outlined),
                const SizedBox(width: 8),
                _tabButton('appointments', 'Appointments', Icons.calendar_today_outlined),
                const SizedBox(width: 8),
                _tabButton('records', 'Records Library', Icons.file_present_outlined),
                const SizedBox(width: 8),
                _tabButton('family', 'Family Sharing', Icons.people_outline),
              ],
            ),
          ),
        ),

        // Main Switcher
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: _buildActiveTabContent(),
          ),
        ),
      ],
    );
  }

  Widget _tabButton(String tab, String title, IconData icon) {
    final active = _activeTab == tab;
    return InkWell(
      onTap: () => setState(() => _activeTab = tab),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppTheme.primary : Colors.white.withOpacity(0.02),
          border: Border.all(color: active ? AppTheme.primary : AppTheme.borderLight),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, color: active ? Colors.white : AppTheme.textSecondary, size: 14),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(color: active ? Colors.white : AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveTabContent() {
    switch (_activeTab) {
      case 'sos':
        return _buildSosPortal();
      case 'appointments':
        return _buildAppointmentsPortal();
      case 'records':
        return _buildRecordsPortal();
      case 'family':
        return _buildFamilyPortal();
      default:
        return _buildSosPortal();
    }
  }

  // --- TAB SUB-VIEWS ---

  Widget _buildSosPortal() {
    final contacts = widget.user.emergencyContacts;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth > 600;
            return Flex(
              direction: wide ? Axis.horizontal : Axis.vertical,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Big SOS Dial
                Expanded(
                  flex: wide ? 1 : 0,
                  child: Container(
                    height: 380,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: AppTheme.glassDecoration(),
                    child: Center(
                      child: _buildSosTriggerWidget(),
                    ),
                  ),
                ),
                if (wide) const SizedBox(width: 16),
                // EMT Card
                Expanded(
                  flex: wide ? 1 : 0,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecoration(borderColor: AppTheme.danger.withOpacity(0.3)),
                    child: _buildEmtMedicalCard(),
                  ),
                ),
              ],
            );
          },
        ),
        const SizedBox(height: 16),

        // Contacts list manager
        Container(
          padding: const EdgeInsets.all(20),
          decoration: AppTheme.glassDecoration(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Row(
                children: [
                  Icon(Icons.phone, color: AppTheme.primary, size: 20),
                  SizedBox(width: 8),
                  Text('Manage Emergency Contacts', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
              const Divider(color: AppTheme.borderLight, height: 24),

              LayoutBuilder(
                builder: (context, constraints) {
                  final wide = constraints.maxWidth > 600;
                  return Flex(
                    direction: wide ? Axis.horizontal : Axis.vertical,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Form
                      Expanded(
                        flex: wide ? 2 : 0,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text('Contact Name', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            TextField(controller: _contactNameController, decoration: const InputDecoration(hintText: 'e.g. Mary Watson')),
                            const SizedBox(height: 12),
                            const Text('Phone Number', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            TextField(controller: _contactPhoneController, decoration: const InputDecoration(hintText: '+1 555-0199')),
                            const SizedBox(height: 12),
                            const Text('Relationship', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: _contactRel,
                              dropdownColor: AppTheme.bgSecondary,
                              items: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Doctor'].map((r) {
                                return DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(color: Colors.white, fontSize: 13)));
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _contactRel = val);
                              },
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _addContact,
                              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                              child: const Text('Add Emergency Contact', style: TextStyle(color: Colors.white)),
                            )
                          ],
                        ),
                      ),
                      if (wide) const SizedBox(width: 24),
                      // Contacts Table
                      Expanded(
                        flex: wide ? 3 : 0,
                        child: Container(
                          margin: const EdgeInsets.only(top: 16),
                          child: contacts.isEmpty
                              ? const SizedBox(
                                  height: 120,
                                  child: Center(child: Text('No contacts added yet.', style: TextStyle(color: AppTheme.textMuted))),
                                )
                              : ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: contacts.length,
                                  separatorBuilder: (_, __) => const Divider(color: AppTheme.borderLight),
                                  itemBuilder: (ctx, idx) {
                                    final c = contacts[idx];
                                    return ListTile(
                                      contentPadding: EdgeInsets.zero,
                                      title: Text(c.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                                      subtitle: Text('${c.relationship} • ${c.phone}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                                      trailing: IconButton(
                                        onPressed: () => _deleteContact(idx),
                                        icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 18),
                                      ),
                                    );
                                  },
                                ),
                        ),
                      )
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSosTriggerWidget() {
    if (!_sosCountdownActive && !_sosTriggered) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: _startSOS,
            child: Container(
              width: 170,
              height: 170,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppTheme.danger,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.danger.withOpacity(0.25), width: 8),
                boxShadow: [
                  BoxShadow(color: AppTheme.danger.withOpacity(0.4), blurRadius: 20, spreadRadius: 5),
                ],
              ),
              child: const Text(
                'SOS',
                style: TextStyle(fontFamily: 'Outfit', fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text('One-Touch Emergency Alarm', style: TextStyle(fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 6),
          Text(
            'Hold triggers countdown of ${widget.user.settings.sosTrigger}s to alert contacts.',
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
          ),
        ],
      );
    }

    if (_sosCountdownActive) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 150,
            height: 150,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppTheme.danger.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.danger, width: 4),
            ),
            child: Text(
              _countdown.toString(),
              style: const TextStyle(fontSize: 64, fontWeight: FontWeight.w800, color: Colors.white),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Broadcasting SOS Alarm...', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: _abortSOS,
            style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.borderLight)),
            child: const Text('Cancel Broadcast', style: TextStyle(color: Colors.white)),
          ),
        ],
      );
    }

    // SOS Triggered Screen
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 120,
          height: 120,
          alignment: Alignment.center,
          decoration: const BoxDecoration(color: AppTheme.success, shape: BoxShape.circle),
          child: const Icon(Icons.check, size: 48, color: Colors.white),
        ),
        const SizedBox(height: 20),
        const Text('SOS Alerts Broadcasted!', style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 6),
        const Text('Your emergency contacts have been messaged.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () => setState(() => _sosTriggered = false),
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.bgSecondary),
          child: const Text('Reset SOS Portal', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _buildEmtMedicalCard() {
    final activeMeds = widget.medications.where((m) => m.active).map((m) => '${m.name} (${m.dosage})').toList();
    final allergies = widget.user.allergies;
    final contacts = widget.user.emergencyContacts;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.contact_emergency_outlined, color: AppTheme.danger, size: 20),
                SizedBox(width: 8),
                Text('EMT Emergency Card', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: AppTheme.danger.withOpacity(0.15), borderRadius: BorderRadius.circular(4)),
              child: Text('Blood: ${widget.user.bloodGroup}', style: const TextStyle(color: AppTheme.danger, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const Divider(color: AppTheme.borderLight, height: 24),

        _medCardRow('Patient Name:', widget.user.fullName.isNotEmpty ? widget.user.fullName : widget.user.username),
        const SizedBox(height: 12),
        const Text('Chronic Conditions:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
        const SizedBox(height: 4),
        Wrap(
          spacing: 6,
          children: widget.user.conditions.map((c) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: AppTheme.danger.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
              child: Text(c, style: const TextStyle(color: AppTheme.danger, fontSize: 10, fontWeight: FontWeight.bold)),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
        _medCardRow('Active Scheduled Medications:', activeMeds.isEmpty ? 'None' : activeMeds.join(', ')),
        const SizedBox(height: 12),
        _medCardRow('Allergies & Sensitivities:', allergies.isEmpty ? 'None' : allergies.join(', '), isAlertColor: true),
        const Divider(color: AppTheme.borderLight, height: 20),
        if (contacts.isNotEmpty) ...[
          const Text('SOS Emergency Contact:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${contacts[0].name} (${contacts[0].relationship})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              Text(contacts[0].phone, style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
        ] else ...[
          const Text('SOS Emergency Contact:', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 4),
          const Text('No contact registered.', style: TextStyle(color: Colors.white, fontSize: 12)),
        ],
      ],
    );
  }

  Widget _medCardRow(String label, String value, {bool isAlertColor = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: isAlertColor ? AppTheme.danger : Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _buildAppointmentsPortal() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth > 600;
            return Flex(
              direction: wide ? Axis.horizontal : Axis.vertical,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Form
                Expanded(
                  flex: wide ? 4 : 0,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('Schedule Appointment', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        const Text('Doctor Name', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextField(controller: _apptDoctorController, decoration: const InputDecoration(hintText: 'e.g. Dr. Sarah Connor')),
                        const SizedBox(height: 12),
                        const Text('Specialization', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _apptSpec,
                          dropdownColor: AppTheme.bgSecondary,
                          items: ['Cardiologist', 'Endocrinologist', 'General Practitioner', 'Neurologist', 'Pediatrician'].map((s) {
                            return DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(color: Colors.white, fontSize: 13)));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _apptSpec = val);
                          },
                        ),
                        const SizedBox(height: 12),
                        const Text('Clinic / Location', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextField(controller: _apptClinicController, decoration: const InputDecoration(hintText: 'e.g. City Heart Clinic')),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Date (YYYY-MM-DD)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 6),
                                  TextField(controller: _apptDateController, decoration: const InputDecoration(hintText: '2026-06-25')),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Time (HH:MM)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 6),
                                  TextField(controller: _apptTimeController, decoration: const InputDecoration(hintText: '10:00')),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _addAppointment,
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                          child: const Text('Schedule', style: TextStyle(color: Colors.white)),
                        )
                      ],
                    ),
                  ),
                ),
                if (wide) const SizedBox(width: 16),
                // Appts List
                Expanded(
                  flex: wide ? 6 : 0,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Upcoming Appointments', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        _appointments.isEmpty
                            ? const SizedBox(
                                height: 160,
                                child: Center(child: Text('No upcoming appointments.', style: TextStyle(color: AppTheme.textMuted))),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _appointments.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 10),
                                itemBuilder: (ctx, idx) {
                                  final appt = _appointments[idx];
                                  return Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), borderRadius: BorderRadius.circular(8)),
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                          child: const Icon(Icons.calendar_today, color: AppTheme.primary, size: 18),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(appt['doctor']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                                              Text('${appt['spec']} • ${appt['clinic']}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                                            ],
                                          ),
                                        ),
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          children: [
                                            Text(appt['date']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 11)),
                                            Text(appt['time']!, style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                                          ],
                                        ),
                                        IconButton(
                                          onPressed: () {
                                            setState(() {
                                              _appointments.removeAt(idx);
                                            });
                                          },
                                          icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 16),
                                        )
                                      ],
                                    ),
                                  );
                                },
                              )
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildRecordsPortal() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth > 600;
            return Flex(
              direction: wide ? Axis.horizontal : Axis.vertical,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Form
                Expanded(
                  flex: wide ? 4 : 0,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('Upload Medical Record', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        const Text('Record Title', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextField(controller: _recTitleController, decoration: const InputDecoration(hintText: 'e.g. Lipid Panel Report')),
                        const SizedBox(height: 12),
                        const Text('Category', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _recCat,
                          dropdownColor: AppTheme.bgSecondary,
                          items: ['Lab Report', 'Prescription Sheet', 'Vaccination Card', 'Diagnostic Scan'].map((c) {
                            return DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(color: Colors.white, fontSize: 13)));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _recCat = val);
                          },
                        ),
                        const SizedBox(height: 12),
                        const Text('Record Date (YYYY-MM-DD)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextField(controller: _recDateController, decoration: const InputDecoration(hintText: '2026-05-10')),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _uploadingRecord ? null : _addRecord,
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                          child: _uploadingRecord
                              ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 1.5))
                              : const Text('Upload Record', style: TextStyle(color: Colors.white)),
                        )
                      ],
                    ),
                  ),
                ),
                if (wide) const SizedBox(width: 16),
                // Library
                Expanded(
                  flex: wide ? 6 : 0,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Medical Records Library', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        _records.isEmpty
                            ? const SizedBox(
                                height: 160,
                                child: Center(child: Text('No records uploaded.', style: TextStyle(color: AppTheme.textMuted))),
                              )
                            : GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  crossAxisSpacing: 10,
                                  mainAxisSpacing: 10,
                                  childAspectRatio: 1.5,
                                ),
                                itemCount: _records.length,
                                itemBuilder: (ctx, idx) {
                                  final rec = _records[idx];
                                  return Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.01), border: Border.all(color: AppTheme.borderLight), borderRadius: BorderRadius.circular(10)),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Icon(Icons.file_copy_outlined, color: AppTheme.primary, size: 20),
                                        const SizedBox(height: 8),
                                        Expanded(
                                          child: Text(
                                            rec['title']!,
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(rec['date']!, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                                            IconButton(
                                              onPressed: () {
                                                setState(() {
                                                  _records.removeAt(idx);
                                                });
                                              },
                                              icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 14),
                                              padding: EdgeInsets.zero,
                                              constraints: const BoxConstraints(),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              )
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildFamilyPortal() {
    final family = widget.user.familyAccess;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth > 600;
            return Flex(
              direction: wide ? Axis.horizontal : Axis.vertical,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Form / Code share
                Expanded(
                  flex: wide ? 4 : 0,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('Invite Family Member', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        const Text('Email Address', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        TextField(controller: _inviteEmailController, decoration: const InputDecoration(hintText: 'e.g. family@example.com')),
                        const SizedBox(height: 12),
                        const Text('Access Permissions', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _inviteRole,
                          dropdownColor: AppTheme.bgSecondary,
                          items: ['Viewer', 'Editor'].map((r) {
                            return DropdownMenuItem(value: r, child: Text(r == 'Viewer' ? 'Viewer (Read-only)' : 'Editor (Full access)', style: const TextStyle(color: Colors.white, fontSize: 13)));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _inviteRole = val);
                          },
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _sendFamilyInvite,
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                          child: const Text('Send Invitation', style: TextStyle(color: Colors.white)),
                        ),
                        const Divider(color: AppTheme.borderLight, height: 32),
                        const Center(child: Text('Or share unique Invite Code', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12))),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                readOnly: true,
                                style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.white, fontSize: 14),
                                textAlign: TextAlign.center,
                                decoration: InputDecoration(
                                  hintText: _generatedCode.isNotEmpty ? _generatedCode : 'VT-XXXX',
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () {
                                final rand = Random().nextInt(9000) + 1000;
                                setState(() {
                                  _generatedCode = 'VT-$rand';
                                });
                              },
                              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.bgSecondary, side: const BorderSide(color: AppTheme.borderLight)),
                              child: const Text('Generate', style: TextStyle(color: Colors.white)),
                            )
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                if (wide) const SizedBox(width: 16),
                // Directory List
                Expanded(
                  flex: wide ? 6 : 0,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Shared Family Profiles Directory', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Divider(color: AppTheme.borderLight, height: 24),
                        family.isEmpty
                            ? const SizedBox(
                                height: 160,
                                child: Center(child: Text('No shared access directory accounts linked.', style: TextStyle(color: AppTheme.textMuted))),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: family.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 10),
                                itemBuilder: (ctx, idx) {
                                  final f = family[idx];
                                  final isActive = f.status == 'Active';
                                  return Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), borderRadius: BorderRadius.circular(8)),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(f.email, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13), overflow: TextOverflow.ellipsis),
                                              const SizedBox(height: 2),
                                              Text('Role: ${f.role}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                                            ],
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: isActive ? AppTheme.success.withOpacity(0.15) : AppTheme.warning.withOpacity(0.15),
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              child: Text(
                                                f.status,
                                                style: TextStyle(color: isActive ? AppTheme.success : AppTheme.warning, fontSize: 10, fontWeight: FontWeight.bold),
                                              ),
                                            ),
                                            IconButton(
                                              onPressed: () => _deleteFamilyInvite(idx),
                                              icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 16),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              )
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}
