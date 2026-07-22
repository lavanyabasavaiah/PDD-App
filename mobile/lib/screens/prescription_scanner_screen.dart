import 'dart:async';
import 'package:flutter/material.dart';
import '../theme.dart';

class PrescriptionScannerScreen extends StatefulWidget {
  final Function(Map<String, dynamic> data) onAddMedication;
  final Function(String page) onNavigate;

  const PrescriptionScannerScreen({
    Key? key,
    required this.onAddMedication,
    required this.onNavigate,
  }) : super(key: key);

  @override
  State<PrescriptionScannerScreen> createState() => _PrescriptionScannerScreenState();
}

class _PrescriptionScannerScreenState extends State<PrescriptionScannerScreen> {
  String _scanState = 'idle'; // idle | scanning | completed
  List<Map<String, dynamic>> _extractedMeds = [];

  void _startMockScan() {
    setState(() {
      _scanState = 'scanning';
    });

    Timer(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _extractedMeds = [
            {'name': 'Lisinopril', 'dosage': '10mg', 'frequency': 'Daily', 'times': ['08:00']},
            {'name': 'Atorvastatin', 'dosage': '20mg', 'frequency': 'Daily', 'times': ['20:00']},
            {'name': 'Metformin', 'dosage': '500mg', 'frequency': 'Twice Daily', 'times': ['08:00', '20:00']}
          ];
          _scanState = 'completed';
        });
      }
    });
  }

  void _handleMedChange(int index, String field, String value) {
    setState(() {
      _extractedMeds[index][field] = value;
    });
  }

  void _handleTimeChange(int medIndex, int timeIndex, String value) {
    setState(() {
      _extractedMeds[medIndex]['times'][timeIndex] = value;
    });
  }

  void _scheduleSingleMed(int index) async {
    final med = _extractedMeds[index];
    final timesList = List<String>.from(med['times']).where((t) => t.isNotEmpty).toList();

    await widget.onAddMedication({
      'name': med['name'],
      'dosage': med['dosage'],
      'frequency': med['frequency'],
      'times': timesList.isNotEmpty ? timesList : ['08:00'],
      'active': true,
    });

    setState(() {
      _extractedMeds.removeAt(index);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("${med['name']} scheduled successfully!"), backgroundColor: AppTheme.success),
    );
  }

  void _scheduleAllMeds() async {
    for (var med in _extractedMeds) {
      final timesList = List<String>.from(med['times']).where((t) => t.isNotEmpty).toList();
      await widget.onAddMedication({
        'name': med['name'],
        'dosage': med['dosage'],
        'frequency': med['frequency'],
        'times': timesList.isNotEmpty ? timesList : ['08:00'],
        'active': true,
      });
    }

    setState(() {
      _extractedMeds.clear();
      _scanState = 'idle';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("All scanned medications successfully scheduled!"), backgroundColor: AppTheme.success),
    );
    widget.onNavigate('medications');
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_scanState == 'idle') _buildIdleView(),
          if (_scanState == 'scanning') _buildScanningView(),
          if (_scanState == 'completed') _buildCompletedView(),
        ],
      ),
    );
  }

  Widget _buildIdleView() {
    return GestureDetector(
      onTap: _startMockScan,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
        decoration: BoxDecoration(
          color: AppTheme.bgPanel,
          border: Border.all(color: AppTheme.borderGlow, width: 2, style: BorderStyle.solid), // simulating dashed border style via solid lines in glow color
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.37), blurRadius: 32),
            BoxShadow(color: AppTheme.primary.withOpacity(0.15), blurRadius: 20),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), shape: BoxShape.circle),
              child: const Icon(Icons.cloud_upload_outlined, color: AppTheme.primary, size: 36),
            ),
            const SizedBox(height: 16),
            const Text(
              'Scan Medical Prescription',
              style: TextStyle(fontFamily: 'Outfit', fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Select prescription image file from device camera or gallery to scan schedules',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            const Text(
              'Supports PNG, JPEG, and WebP',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScanningView() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: AppTheme.glassDecoration(),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: AppTheme.info.withOpacity(0.1), shape: BoxShape.circle),
                child: const Icon(Icons.camera_alt_outlined, color: AppTheme.info, size: 40),
              ),
              SizedBox(
                width: 100,
                height: 100,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(AppTheme.info.withOpacity(0.4)),
                  strokeWidth: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Processing Prescription Image',
            style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 8),
          const Text(
            'Running AI OCR character recognition...',
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 16),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                height: 14,
                width: 14,
                child: CircularProgressIndicator(color: AppTheme.info, strokeWidth: 1.5),
              ),
              SizedBox(width: 8),
              Text(
                'Parsing schedule slots & dosage indicators...',
                style: TextStyle(color: AppTheme.info, fontSize: 12, fontWeight: FontWeight.bold),
              )
            ],
          )
        ],
      ),
    );
  }

  Widget _buildCompletedView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Success Header Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.success.withOpacity(0.08),
            border: Border.all(color: AppTheme.success.withOpacity(0.2)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.check_circle_outline, color: AppTheme.success, size: 20),
                      SizedBox(width: 8),
                      Text('Scan Completed Successfully', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  OutlinedButton(
                    onPressed: () => setState(() {
                      _scanState = 'idle';
                      _extractedMeds.clear();
                    }),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.borderLight),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                    ),
                    child: const Text('Scan Another', style: TextStyle(color: Colors.white, fontSize: 10)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                "We've identified 3 medications. Review the scheduled fields and click save to load them.",
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        _extractedMeds.isEmpty
            ? Container(
                padding: const EdgeInsets.all(24),
                decoration: AppTheme.glassDecoration(),
                child: Column(
                  children: [
                    const Icon(Icons.info_outline, color: AppTheme.textMuted, size: 32),
                    const SizedBox(height: 8),
                    const Text('All scanned prescription meds scheduled.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => widget.onNavigate('medications'),
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                      child: const Text('Go to Medications Manager', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              )
            : Column(
                children: List.generate(_extractedMeds.length, (idx) {
                  final med = _extractedMeds[idx];
                  final List<String> times = List<String>.from(med['times']);
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: AppTheme.glassDecoration(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                              child: const Icon(Icons.medication, color: AppTheme.primary, size: 20),
                            ),
                            const SizedBox(width: 12),
                            const Text('EXTRACTED DATA', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Form items
                        Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Drug Name', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                                  const SizedBox(height: 4),
                                  TextFormField(
                                    initialValue: med['name'],
                                    style: const TextStyle(fontSize: 13),
                                    onChanged: (val) => _handleMedChange(idx, 'name', val),
                                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Dosage', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                                  const SizedBox(height: 4),
                                  TextFormField(
                                    initialValue: med['dosage'],
                                    style: const TextStyle(fontSize: 13),
                                    onChanged: (val) => _handleMedChange(idx, 'dosage', val),
                                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              flex: 2,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Frequency', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                                  const SizedBox(height: 4),
                                  DropdownButtonFormField<String>(
                                    value: med['frequency'],
                                    dropdownColor: AppTheme.bgSecondary,
                                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 4)),
                                    items: ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed'].map((f) {
                                      return DropdownMenuItem(value: f, child: Text(f, style: const TextStyle(color: Colors.white, fontSize: 12)));
                                    }).toList(),
                                    onChanged: (val) {
                                      if (val != null) {
                                        _handleMedChange(idx, 'frequency', val);
                                        // Update times size
                                        List<String> newTimes = ['08:00'];
                                        if (val == 'Twice Daily') newTimes = ['08:00', '20:00'];
                                        if (val == 'Three Times Daily') newTimes = ['08:00', '14:00', '20:00'];
                                        setState(() {
                                          _extractedMeds[idx]['times'] = newTimes;
                                        });
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Reminder Times', style: TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: List.generate(times.length, (tIdx) {
                                      return Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.only(right: 4.0),
                                          child: TextFormField(
                                            initialValue: times[tIdx],
                                            style: const TextStyle(fontSize: 11),
                                            decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 4, vertical: 8)),
                                            onChanged: (val) => _handleTimeChange(idx, tIdx, val),
                                          ),
                                        ),
                                      );
                                    }),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => _scheduleSingleMed(idx),
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, minimumSize: const Size.fromHeight(38)),
                          child: const Text('Schedule This Med', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                        )
                      ],
                    ),
                  );
                }),
              ),

        if (_extractedMeds.isNotEmpty) ...[
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton(
                onPressed: () => setState(() {
                  _scanState = 'idle';
                  _extractedMeds.clear();
                }),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: AppTheme.borderLight)),
                child: const Text('Clear Results', style: TextStyle(color: AppTheme.textPrimary)),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: _scheduleAllMeds,
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
                icon: const Icon(Icons.auto_awesome, color: Colors.white, size: 16),
                label: const Text('Save All Scanned', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ],
          )
        ]
      ],
    );
  }
}
