import 'dart:async';
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../models/vital_model.dart';
import '../theme.dart';

class AICopilotScreen extends StatefulWidget {
  final List<VitalModel> vitals;
  final UserModel user;
  final Function(String page) onNavigate;

  const AICopilotScreen({
    Key? key,
    required this.vitals,
    required this.user,
    required this.onNavigate,
  }) : super(key: key);

  @override
  State<AICopilotScreen> createState() => _AICopilotScreenState();
}

class _AICopilotScreenState extends State<AICopilotScreen> {
  String _activeTab = 'chat'; // chat | symptom

  // Chat States
  final List<Map<String, String>> _messages = [
    {
      'sender': 'ai',
      'text': 'Hello! I am your VitalTrack AI Medical Assistant. How can I help you check your health metrics today?'
    }
  ];
  final _chatInputController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isTyping = false;

  // Symptom Checker States
  int _symptomStep = 1; // 1: symptoms, 2: duration, 3: severity, 5: result
  final List<String> _selectedSymptoms = [];
  String _symptomDuration = '2-3 days';
  String _symptomSeverity = 'Moderate';
  Map<String, dynamic>? _triageReport;

  final List<Map<String, String>> _symptomOptions = [
    {'id': 'chest_pain', 'label': 'Chest Pain or Pressure'},
    {'id': 'shortness_breath', 'label': 'Shortness of Breath'},
    {'id': 'fever', 'label': 'High Fever (>38°C)'},
    {'id': 'headache', 'label': 'Severe Headache'},
    {'id': 'cough', 'label': 'Persistent Dry Cough'},
    {'id': 'fatigue', 'label': 'Extreme Fatigue'},
    {'id': 'dizziness', 'label': 'Dizziness or Lightheadedness'}
  ];

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleSendMessage() {
    final query = _chatInputController.text.trim();
    if (query.isEmpty) return;

    _chatInputController.clear();
    setState(() {
      _messages.add({'sender': 'user', 'text': query});
      _isTyping = true;
    });
    _scrollToBottom();

    final latestVital = widget.vitals.isNotEmpty ? widget.vitals[0] : null;

    Timer(const Duration(milliseconds: 1500), () {
      if (!mounted) return;

      String responseText = "I understand you have a question. Based on your health profile, it is always recommended to check in with a doctor for specific diagnostics.";
      final lower = query.toLowerCase();

      if (lower.contains('bp') || lower.contains('blood pressure')) {
        if (latestVital != null && latestVital.systolic != null) {
          final sys = latestVital.systolic!.toInt();
          final dia = latestVital.diastolic!.toInt();
          String rating = "Optimal";
          if (sys >= 140 || dia >= 90) {
            rating = "High (Stage 2 Hypertension)";
          } else if (sys >= 120 || dia >= 80) {
            rating = "Elevated";
          }

          responseText = "Your latest recorded Blood Pressure is $sys/$dia mmHg, which is classified as $rating. If you are experiencing headaches, dizziness, or blurry vision, please consult a practitioner. Keep sodium low and take scheduled hypertension medicines.";
        } else {
          responseText = "You haven't recorded any blood pressure values recently. You can head over to the Vitals Tracker to log your systolic/diastolic levels.";
        }
      } else if (lower.contains('heart') || lower.contains('pulse') || lower.contains('bpm')) {
        if (latestVital != null && latestVital.heartRate != null) {
          responseText = "Your latest recorded resting pulse is ${latestVital.heartRate!.toInt()} bpm. A normal resting rate is between 60 to 100 bpm. Your current reading is stable. If it spikes above 120 bpm at rest, or if you feel palpitations, record details and contact care.";
        } else {
          responseText = "There are no pulse logs in your database yet. Let me know if you would like me to show you how to log heart rate values.";
        }
      } else if (lower.contains('oxygen') || lower.contains('spo2')) {
        if (latestVital != null && latestVital.spo2 != null) {
          final spo2Val = latestVital.spo2!.toInt();
          responseText = "Your blood oxygen level is measured at $spo2Val%. Normal levels range from 95% to 100%. " +
              (spo2Val < 95 ? "This is slightly low. Ensure you practice deep breathing exercises." : "This is in the healthy optimal range.");
        } else {
          responseText = "Your oxygen saturation level has not been logged. Consider recording a reading if you have an oximeter.";
        }
      } else if (lower.contains('sugar') || lower.contains('glucose') || lower.contains('diabetes')) {
        if (latestVital != null && latestVital.bloodSugar != null) {
          final sugarVal = latestVital.bloodSugar!.toInt();
          responseText = "Your latest blood sugar reading is $sugarVal mg/dL (${latestVital.bloodSugarType ?? 'Fasting'}). " +
              (sugarVal >= 126 ? "This is in the high/diabetic range. Please consult an endocrinologist." : "This is currently within the standard range.");
        } else {
          responseText = "You haven't logged blood sugar readings. Tracking fasting glucose can help spot pre-diabetic tendencies.";
        }
      } else if (lower.contains('fever') || lower.contains('temp') || lower.contains('temperature')) {
        if (latestVital != null && latestVital.temperature != null) {
          final tempVal = latestVital.temperature!;
          responseText = "Your last temperature reading was ${tempVal.toStringAsFixed(1)}°C. Standard human temperature ranges from 36.5°C to 37.5°C. " +
              (tempVal >= 38.0 ? "You have a mild fever. Ensure hydration and rest." : "Your body temperature is normal.");
        } else {
          responseText = "No temperature records found in your dashboard logs.";
        }
      } else if (lower.contains('hello') || lower.contains('hi')) {
        responseText = "Hello ${widget.user.fullName.isNotEmpty ? widget.user.fullName : widget.user.username}! I'm looking at your health records. Is there a specific metric (blood pressure, sugar, sleep, pulse) you want to talk about?";
      } else if (lower.contains('sleep') || lower.contains('tired')) {
        final sleepLogs = widget.vitals.where((v) => v.sleepHours != null).toList();
        if (sleepLogs.isNotEmpty) {
          final sum = sleepLogs.fold(0.0, (acc, curr) => acc + curr.sleepHours!);
          final avgSleep = (sum / sleepLogs.length).toStringAsFixed(1);
          responseText = "Your logged sleep averages $avgSleep hours. The recommended target is 7-9 hours per night. " +
              (double.parse(avgSleep) < 6.5 ? "You seem to be sleep-deprived lately. Rest is critical for heart recovery." : "You are maintaining healthy sleep cycles.");
        } else {
          responseText = "I don't have sleep logs to analyze. Try logging your hours slept in the trackers panel.";
        }
      }

      setState(() {
        _messages.add({'sender': 'ai', 'text': responseText});
        _isTyping = false;
      });
      _scrollToBottom();
    });
  }

  void _submitSymptoms() {
    String tier = 'Self-Care';
    String action = 'Rest and hydrate. Track your temperature and blood pressure every 4 hours. If symptoms persist beyond 5 days, book a clinic visit.';
    Color color = AppTheme.success;
    IconData icon = Icons.info_outline_rounded;

    final hasCritical = _selectedSymptoms.contains('chest_pain') || _selectedSymptoms.contains('shortness_breath');
    final isSevere = _symptomSeverity == 'Severe';

    if (hasCritical && isSevere) {
      tier = 'EMERGENCY WARNING';
      action = 'URGENT: Your symptoms indicate potential cardiovascular or respiratory distress. Press the emergency SOS button immediately or call emergency services (911).';
      color = AppTheme.danger;
      icon = Icons.error_outline_rounded;
    } else if (hasCritical || isSevere) {
      tier = 'Urgent Care Required';
      action = 'Warning: We suggest contacting a telehealth advisor or booking a same-day doctor appointment. Do not engage in strenuous physical activity.';
      color = AppTheme.warning;
      icon = Icons.warning_amber_rounded;
    } else if (_selectedSymptoms.contains('fever') && _symptomDuration == '1 week+') {
      tier = 'Doctor Consultation Recommended';
      action = 'A persistent fever lasting over a week requires checking by a general practitioner to rule out bacterial infections.';
      color = AppTheme.info;
      icon = Icons.calendar_today_rounded;
    }

    final selectedLabels = _selectedSymptoms.map((id) {
      return _symptomOptions.firstWhere((opt) => opt['id'] == id)['label'] ?? '';
    }).toList();

    setState(() {
      _triageReport = {
        'tier': tier,
        'action': action,
        'color': color,
        'icon': icon,
        'symptoms': selectedLabels.join(', '),
        'duration': _symptomDuration,
        'severity': _symptomSeverity,
      };
      _symptomStep = 5;
    });
  }

  void _resetSymptomChecker() {
    setState(() {
      _symptomStep = 1;
      _selectedSymptoms.clear();
      _symptomDuration = '2-3 days';
      _symptomSeverity = 'Moderate';
      _triageReport = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Tab Selection Header
        Container(
          padding: const EdgeInsets.all(12),
          color: AppTheme.bgSecondary,
          child: Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _activeTab = 'chat'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _activeTab == 'chat' ? AppTheme.primary : Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _activeTab == 'chat' ? AppTheme.primary : AppTheme.borderLight),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.chat_bubble_outline, size: 16),
                        SizedBox(width: 8),
                        Text('AI Assistant Chat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _activeTab = 'symptom'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: _activeTab == 'symptom' ? AppTheme.primary : Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _activeTab == 'symptom' ? AppTheme.primary : AppTheme.borderLight),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_box_outlined, size: 16),
                        SizedBox(width: 8),
                        Text('Symptom Checker', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Main screen bodies
        Expanded(
          child: _activeTab == 'chat' ? _buildChatTab() : _buildSymptomTab(),
        ),
      ],
    );
  }

  // --- CHAT WIDGETS ---

  Widget _buildChatTab() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.glassDecoration(),
      child: Column(
        children: [
          // Chat title summary info
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.psychology, color: AppTheme.primary, size: 22),
                  SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('AI Clinical Copilot', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14)),
                      Text('Always active', style: TextStyle(color: AppTheme.success, fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              Text(
                'References ${widget.vitals.length} records',
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
              ),
            ],
          ),
          const Divider(color: AppTheme.borderLight, height: 24),

          // Message Bubbles Scroll view
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (ctx, idx) {
                if (idx == _messages.length && _isTyping) {
                  return _bubbleItem(
                    sender: 'ai',
                    text: 'Thinking...',
                    isTypingIndicator: true,
                  );
                }
                final msg = _messages[idx];
                return _bubbleItem(
                  sender: msg['sender']!,
                  text: msg['text']!,
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          // Chat field input form
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _chatInputController,
                  enabled: !_isTyping,
                  decoration: const InputDecoration(hintText: 'Ask about BP, sugar, sleep...'),
                  onSubmitted: (_) => _handleSendMessage(),
                ),
              ),
              const SizedBox(width: 10),
              IconButton(
                onPressed: _isTyping ? null : _handleSendMessage,
                icon: const Icon(Icons.send),
                color: AppTheme.primary,
                style: IconButton.styleFrom(
                  backgroundColor: AppTheme.primary.withOpacity(0.1),
                  padding: const EdgeInsets.all(12),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _bubbleItem({required String sender, required String text, bool isTypingIndicator = false}) {
    final isAi = sender == 'ai';
    return Align(
      alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12, left: 8, right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isAi ? Colors.white.withOpacity(0.04) : AppTheme.primary,
          border: isAi ? Border.all(color: AppTheme.borderLight) : null,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isAi ? 0 : 16),
            bottomRight: Radius.circular(isAi ? 16 : 0),
          ),
        ),
        child: isTypingIndicator
            ? const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 1.5, color: AppTheme.primary)),
                  SizedBox(width: 8),
                  Text('AI assistant is thinking...', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontStyle: FontStyle.italic)),
                ],
              )
            : Text(
                text,
                style: TextStyle(
                  color: isAi ? AppTheme.textPrimary : Colors.white,
                  fontSize: 13.5,
                  height: 1.4,
                ),
              ),
      ),
    );
  }

  // --- SYMPTOM WIDGETS ---

  Widget _buildSymptomTab() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: AppTheme.glassDecoration(),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.check_circle_outline, color: AppTheme.primary, size: 22),
                const SizedBox(width: 8),
                Text(
                  _symptomStep == 5 ? 'Triage Assessment Report' : 'Symptom Triage Checker',
                  style: const TextStyle(fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
            const Divider(color: AppTheme.borderLight, height: 24),

            if (_symptomStep == 1) _buildSymptomStep1(),
            if (_symptomStep == 2) _buildSymptomStep2(),
            if (_symptomStep == 3) _buildSymptomStep3(),
            if (_symptomStep == 5) _buildSymptomStep5(),
          ],
        ),
      ),
    );
  }

  Widget _buildSymptomStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('Step 1: Select symptoms you are experiencing', style: TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Column(
          children: _symptomOptions.map((opt) {
            final isSelected = _selectedSymptoms.contains(opt['id']);
            return Padding(
              padding: const EdgeInsets.only(bottom: 10.0),
              child: InkWell(
                onTap: () {
                  setState(() {
                    if (isSelected) {
                      _selectedSymptoms.remove(opt['id']);
                    } else {
                      _selectedSymptoms.add(opt['id']!);
                    }
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary.withOpacity(0.08) : Colors.white.withOpacity(0.01),
                    border: Border.all(color: isSelected ? AppTheme.primary : AppTheme.borderLight),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        opt['label']!,
                        style: TextStyle(color: isSelected ? Colors.white : AppTheme.textSecondary, fontSize: 13, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
                      ),
                      Checkbox(
                        value: isSelected,
                        activeColor: AppTheme.primary,
                        onChanged: (_) {
                          setState(() {
                            if (isSelected) {
                              _selectedSymptoms.remove(opt['id']);
                            } else {
                              _selectedSymptoms.add(opt['id']!);
                            }
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: _selectedSymptoms.isEmpty ? null : () => setState(() => _symptomStep = 2),
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, padding: const EdgeInsets.symmetric(vertical: 12)),
          child: const Text('Continue to Duration', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildSymptomStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('Step 2: How long have you felt these symptoms?', style: TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Column(
          children: ['1 day or less', '2-3 days', '4-7 days', '1 week+'].map((dur) {
            final active = _symptomDuration == dur;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10.0),
              child: RadioListTile<String>(
                title: Text(dur, style: TextStyle(color: active ? Colors.white : AppTheme.textSecondary, fontSize: 13)),
                value: dur,
                groupValue: _symptomDuration,
                activeColor: AppTheme.primary,
                tileColor: active ? AppTheme.primary.withOpacity(0.08) : Colors.white.withOpacity(0.01),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: active ? AppTheme.primary : AppTheme.borderLight),
                ),
                onChanged: (val) {
                  if (val != null) setState(() => _symptomDuration = val);
                },
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _symptomStep = 1),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.borderLight)),
                child: const Text('Back', style: TextStyle(color: Colors.white)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: () => setState(() => _symptomStep = 3),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                child: const Text('Continue to Severity', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildSymptomStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('Step 3: Grade the intensity of discomfort', style: TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Column(
          children: ['Mild', 'Moderate', 'Severe'].map((sev) {
            final active = _symptomSeverity == sev;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10.0),
              child: RadioListTile<String>(
                title: Text(sev, style: TextStyle(color: active ? Colors.white : AppTheme.textSecondary, fontSize: 13)),
                value: sev,
                groupValue: _symptomSeverity,
                activeColor: AppTheme.primary,
                tileColor: active ? AppTheme.primary.withOpacity(0.08) : Colors.white.withOpacity(0.01),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: active ? AppTheme.primary : AppTheme.borderLight),
                ),
                onChanged: (val) {
                  if (val != null) setState(() => _symptomSeverity = val);
                },
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _symptomStep = 2),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.borderLight)),
                child: const Text('Back', style: TextStyle(color: Colors.white)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _submitSymptoms,
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                child: const Text('Run Assessment Report', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildSymptomStep5() {
    if (_triageReport == null) return const SizedBox();

    final Color color = _triageReport!['color'];
    final IconData icon = _triageReport!['icon'];
    final bool isEmergency = _triageReport!['tier'].toString().contains('EMERGENCY');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                child: Icon(icon, color: color, size: 44),
              ),
              const SizedBox(height: 12),
              Text(
                _triageReport!['tier'],
                style: TextStyle(fontSize: 18, color: color, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: AppTheme.glassDecoration(background: Colors.white.withOpacity(0.01)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Evaluated Symptoms: ${_triageReport!['symptoms']}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              const SizedBox(height: 6),
              Text('Duration: ${_triageReport!['duration']} | Intensity: ${_triageReport!['severity']}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              const Divider(color: AppTheme.borderLight, height: 20),
              Text(
                _triageReport!['action'],
                style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.5, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _resetSymptomChecker,
                style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.borderLight)),
                child: const Text('Run Again', style: TextStyle(color: Colors.white)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: isEmergency
                  ? ElevatedButton(
                      onPressed: () => widget.onNavigate('sos'),
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
                      child: const Text('Trigger SOS Alert', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    )
                  : ElevatedButton(
                      onPressed: () => widget.onNavigate('dashboard'),
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                      child: const Text('Return to Dashboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
            ),
          ],
        )
      ],
    );
  }
}
