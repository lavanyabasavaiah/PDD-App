import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';
import '../models/vital_model.dart';
import '../theme.dart';

class TrackersScreen extends StatefulWidget {
  final List<VitalModel> vitals;
  final Function(Map<String, dynamic> data) onAddVital;
  final Function(String id) onDeleteVital;
  final UserModel user;

  const TrackersScreen({
    Key? key,
    required this.vitals,
    required this.onAddVital,
    required this.onDeleteVital,
    required this.user,
  }) : super(key: key);

  @override
  State<TrackersScreen> createState() => _TrackersScreenState();
}

class _TrackersScreenState extends State<TrackersScreen> {
  // Input fields
  final _systolicController = TextEditingController();
  final _diastolicController = TextEditingController();
  final _heartRateController = TextEditingController();
  final _tempController = TextEditingController();
  final _spo2Controller = TextEditingController();
  final _sugarController = TextEditingController();
  String _sugarType = 'Fasting';
  final _stepsController = TextEditingController();
  final _waterController = TextEditingController();
  final _sleepController = TextEditingController();
  final _weightController = TextEditingController();
  final _notesController = TextEditingController();

  bool _saving = false;

  void _saveLog() async {
    final Map<String, dynamic> body = {};

    if (_systolicController.text.isNotEmpty) body['systolic'] = double.tryParse(_systolicController.text);
    if (_diastolicController.text.isNotEmpty) body['diastolic'] = double.tryParse(_diastolicController.text);
    if (_heartRateController.text.isNotEmpty) body['heartRate'] = double.tryParse(_heartRateController.text);
    if (_tempController.text.isNotEmpty) body['temperature'] = double.tryParse(_tempController.text);
    if (_spo2Controller.text.isNotEmpty) body['spo2'] = double.tryParse(_spo2Controller.text);
    if (_sugarController.text.isNotEmpty) {
      body['bloodSugar'] = double.tryParse(_sugarController.text);
      body['bloodSugarType'] = _sugarType;
    }
    if (_stepsController.text.isNotEmpty) body['stepsCount'] = double.tryParse(_stepsController.text);
    if (_waterController.text.isNotEmpty) body['waterIntake'] = double.tryParse(_waterController.text);
    if (_sleepController.text.isNotEmpty) body['sleepHours'] = double.tryParse(_sleepController.text);
    if (_weightController.text.isNotEmpty) body['weight'] = double.tryParse(_weightController.text);
    if (_notesController.text.isNotEmpty) body['notes'] = _notesController.text;

    if (body.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log at least one health metric.'), backgroundColor: AppTheme.warning),
      );
      return;
    }

    setState(() => _saving = true);

    try {
      await widget.onAddVital(body);
      
      // Clear controllers
      _systolicController.clear();
      _diastolicController.clear();
      _heartRateController.clear();
      _tempController.clear();
      _spo2Controller.clear();
      _sugarController.clear();
      _stepsController.clear();
      _waterController.clear();
      _sleepController.clear();
      _weightController.clear();
      _notesController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vitals logged successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Save failed: $e'), backgroundColor: AppTheme.danger),
      );
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Input Form Container
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.edit_note_rounded, color: AppTheme.primary, size: 24),
                    SizedBox(width: 8),
                    Text('Log Daily Health Metrics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 20),

                // BP Row
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('SYSTOLIC (mmHg)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _systolicController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'e.g. 120'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DIASTOLIC (mmHg)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _diastolicController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'e.g. 80'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // HR / Temp Row
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('HEART RATE (BPM)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _heartRateController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'e.g. 72'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('TEMP (°C)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _tempController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(hintText: 'e.g. 36.8'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // SpO2 / Blood Sugar Row
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('OXYGEN (SpO2 %)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _spo2Controller,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'e.g. 98'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('BLOOD GLUCOSE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _sugarController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'mg/dL'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Blood Sugar Type selection (Visible only if glucose entered)
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Text('Glucose Type: ', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                    const SizedBox(width: 8),
                    DropdownButton<String>(
                      value: _sugarType,
                      dropdownColor: AppTheme.bgSecondary,
                      underline: const SizedBox(),
                      items: ['Fasting', 'Post-Prandial', 'Random'].map((t) {
                        return DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(color: Colors.white, fontSize: 12)));
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _sugarType = val);
                      },
                    ),
                  ],
                ),
                const Divider(color: AppTheme.borderLight, height: 24),

                // Steps / Sleep / Water / Weight
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DAILY STEPS', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _stepsController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'Steps'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('SLEEP HOURS', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _sleepController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(hintText: 'Hours'),
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
                          const Text('WATER INTAKE (ml)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _waterController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(hintText: 'ml'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('WEIGHT (KG)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _weightController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(hintText: 'kg'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                const Text('NOTES & OBSERVATIONS', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: _notesController,
                  maxLines: 2,
                  decoration: const InputDecoration(hintText: 'Feelings, symptoms, or custom logs...'),
                ),
                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: _saving ? null : _saveLog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _saving
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Save Vitals & Logs', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Log History Title
          const Text(
            'Health Log History',
            style: TextStyle(fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 12),

          // List of Vitals History
          widget.vitals.isEmpty
              ? Container(
                  height: 120,
                  alignment: Alignment.center,
                  decoration: AppTheme.glassDecoration(),
                  child: const Text('No vital readings recorded yet.', style: TextStyle(color: AppTheme.textMuted)),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: widget.vitals.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (ctx, idx) {
                    final item = widget.vitals[idx];
                    final dateStr = DateFormat('MMM dd, yyyy - HH:mm').format(item.timestamp);
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: AppTheme.glassDecoration(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(dateStr, style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                              IconButton(
                                onPressed: () => widget.onDeleteVital(item.id),
                                icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 18),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                              ),
                            ],
                          ),
                          const Divider(color: AppTheme.borderLight, height: 16),
                          
                          // Wrap stats tags in wrap
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if (item.systolic != null) _statBadge('BP: ${item.systolic!.toInt()}/${item.diastolic!.toInt()} mmHg', AppTheme.danger),
                              if (item.heartRate != null) _statBadge('HR: ${item.heartRate!.toInt()} bpm', AppTheme.danger),
                              if (item.temperature != null) _statBadge('Temp: ${item.temperature!.toStringAsFixed(1)}°C', AppTheme.warning),
                              if (item.spo2 != null) _statBadge('SpO2: ${item.spo2!.toInt()}%', AppTheme.info),
                              if (item.bloodSugar != null) _statBadge('GLU: ${item.bloodSugar!.toInt()} (${item.bloodSugarType ?? 'Random'})', AppTheme.primary),
                              if (item.stepsCount != null) _statBadge('Steps: ${item.stepsCount!.toInt()}', AppTheme.success),
                              if (item.sleepHours != null) _statBadge('Sleep: ${item.sleepHours!.toInt()} hrs', AppTheme.primary),
                              if (item.waterIntake != null) _statBadge('Water: ${item.waterIntake!.toInt()} ml', AppTheme.info),
                              if (item.weight != null) _statBadge('Weight: ${item.weight!.toInt()} kg', AppTheme.warning),
                            ],
                          ),

                          if (item.notes != null && item.notes!.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Text(
                              'Notes: ${item.notes}',
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontStyle: FontStyle.italic),
                            ),
                          ]
                        ],
                      ),
                    );
                  },
                ),
        ],
      ),
    );
  }

  Widget _statBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        border: Border.all(color: color.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
