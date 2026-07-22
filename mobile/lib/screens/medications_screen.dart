import 'package:flutter/material.dart';
import '../models/medication_model.dart';
import '../theme.dart';

class MedicationsScreen extends StatefulWidget {
  final List<MedicationModel> medications;
  final Function(Map<String, dynamic> data) onAddMedication;
  final Function(String id) onDeleteMedication;
  final Function(String id, bool active) onToggleActive;

  const MedicationsScreen({
    Key? key,
    required this.medications,
    required this.onAddMedication,
    required this.onDeleteMedication,
    required this.onToggleActive,
  }) : super(key: key);

  @override
  State<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends State<MedicationsScreen> {
  final _nameController = TextEditingController();
  final _dosageController = TextEditingController();
  String _frequency = 'Daily';

  // Default reminder times lists based on count
  List<TimeOfDay> _reminderTimes = [const TimeOfDay(hour: 8, minute: 0)];
  bool _saving = false;

  void _updateTimesCountForFrequency(String freq) {
    setState(() {
      _frequency = freq;
      if (freq == 'Daily') {
        _reminderTimes = [const TimeOfDay(hour: 8, minute: 0)];
      } else if (freq == 'Twice Daily') {
        _reminderTimes = [const TimeOfDay(hour: 8, minute: 0), const TimeOfDay(hour: 20, minute: 0)];
      } else if (freq == 'Three Times Daily') {
        _reminderTimes = [const TimeOfDay(hour: 8, minute: 0), const TimeOfDay(hour: 14, minute: 0), const TimeOfDay(hour: 20, minute: 0)];
      } else {
        _reminderTimes = [const TimeOfDay(hour: 8, minute: 0)];
      }
    });
  }

  Future<void> _selectTime(int index) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _reminderTimes[index],
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              surface: AppTheme.bgSecondary,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _reminderTimes[index] = picked;
      });
    }
  }

  void _saveMedication() async {
    final name = _nameController.text.trim();
    final dosage = _dosageController.text.trim();

    if (name.isEmpty || dosage.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in drug name and dosage details.'), backgroundColor: AppTheme.warning),
      );
      return;
    }

    setState(() => _saving = true);

    final List<String> timesList = _reminderTimes.map((t) {
      final hh = t.hour.toString().padLeft(2, '0');
      final mm = t.minute.toString().padLeft(2, '0');
      return '$hh:$mm';
    }).toList();

    final body = {
      'name': name,
      'dosage': dosage,
      'frequency': _frequency,
      'times': timesList,
      'active': true,
    };

    try {
      await widget.onAddMedication(body);
      _nameController.clear();
      _dosageController.clear();
      setState(() {
        _frequency = 'Daily';
        _reminderTimes = [const TimeOfDay(hour: 8, minute: 0)];
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Medication added successfully!'), backgroundColor: AppTheme.success),
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
          // Add Form
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Row(
                  children: [
                    Icon(Icons.add_moderator_rounded, color: AppTheme.primary, size: 24),
                    SizedBox(width: 8),
                    Text('Schedule New Medication', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 20),

                const Text('DRUG NAME', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(hintText: 'e.g. Lisinopril'),
                ),
                const SizedBox(height: 16),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DOSAGE', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _dosageController,
                            decoration: const InputDecoration(hintText: 'e.g. 10mg'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('FREQUENCY', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          DropdownButtonFormField<String>(
                            value: _frequency,
                            dropdownColor: AppTheme.bgSecondary,
                            items: ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed'].map((f) {
                              return DropdownMenuItem(value: f, child: Text(f, style: const TextStyle(color: Colors.white, fontSize: 13)));
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) _updateTimesCountForFrequency(val);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                const Text('REMINDER TIMES', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: List.generate(_reminderTimes.length, (idx) {
                    final time = _reminderTimes[idx];
                    final hh = time.hour.toString().padLeft(2, '0');
                    final mm = time.minute.toString().padLeft(2, '0');
                    return InkWell(
                      onTap: () => _selectTime(idx),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.08),
                          border: Border.all(color: AppTheme.borderLight),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.access_time, color: AppTheme.primary, size: 14),
                            const SizedBox(width: 6),
                            Text('$hh:$mm', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: _saving ? null : _saveMedication,
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
                      : const Text('Schedule Medication', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Title List
          const Text(
            'Scheduled Medications',
            style: TextStyle(fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 12),

          widget.medications.isEmpty
              ? Container(
                  height: 100,
                  alignment: Alignment.center,
                  decoration: AppTheme.glassDecoration(),
                  child: const Text('No medications scheduled yet.', style: TextStyle(color: AppTheme.textMuted)),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: widget.medications.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (ctx, idx) {
                    final med = widget.medications[idx];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: AppTheme.glassDecoration(),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withOpacity(med.active ? 0.1 : 0.03),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.medication, color: med.active ? AppTheme.primary : AppTheme.textMuted, size: 24),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  med.name,
                                  style: TextStyle(
                                    color: med.active ? Colors.white : AppTheme.textSecondary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    decoration: med.active ? TextDecoration.none : TextDecoration.lineThrough,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${med.dosage} • ${med.frequency}',
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                ),
                                const SizedBox(height: 4),
                                Wrap(
                                  spacing: 6,
                                  children: med.times.map((t) {
                                    return Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(4)),
                                      child: Text(t, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold)),
                                    );
                                  }).toList(),
                                )
                              ],
                            ),
                          ),
                          Row(
                            children: [
                              Switch(
                                value: med.active,
                                activeColor: AppTheme.primary,
                                onChanged: (val) => widget.onToggleActive(med.id, val),
                              ),
                              IconButton(
                                onPressed: () => widget.onDeleteMedication(med.id),
                                icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 18),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ],
      ),
    );
  }
}
