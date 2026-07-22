import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';
import '../models/vital_model.dart';
import '../models/medication_model.dart';
import '../models/insight_model.dart';
import '../components/custom_chart.dart';
import '../theme.dart';

class InsightsScreen extends StatefulWidget {
  final List<VitalModel> vitals;
  final List<MedicationModel> medications;
  final InsightModel? insight;
  final VoidCallback onTriggerInsight;
  final UserModel user;

  const InsightsScreen({
    Key? key,
    required this.vitals,
    required this.medications,
    required this.insight,
    required this.onTriggerInsight,
    required this.user,
  }) : super(key: key);

  @override
  State<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends State<InsightsScreen> {
  String _selectedParam = 'stepsCount';
  bool _generating = false;

  double _getAverage(String param) {
    if (widget.vitals.isEmpty) return 0.0;
    
    final logs = widget.vitals.where((v) {
      switch (param) {
        case 'stepsCount': return v.stepsCount != null;
        case 'waterIntake': return v.waterIntake != null;
        case 'sleepHours': return v.sleepHours != null;
        case 'weight': return v.weight != null;
        default: return false;
      }
    });

    if (logs.isEmpty) return 0.0;

    final sum = logs.fold(0.0, (acc, v) {
      switch (param) {
        case 'stepsCount': return acc + (v.stepsCount ?? 0.0);
        case 'waterIntake': return acc + (v.waterIntake ?? 0.0);
        case 'sleepHours': return acc + (v.sleepHours ?? 0.0);
        case 'weight': return acc + (v.weight ?? 0.0);
        default: return acc;
      }
    });

    return sum / logs.length;
  }

  @override
  Widget build(BuildContext context) {
    final stepsAvg = _getAverage('stepsCount');
    final waterAvg = _getAverage('waterIntake');
    final sleepAvg = _getAverage('sleepHours');
    final weightAvg = _getAverage('weight');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Weekly / Monthly averages grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.6,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              _avgCard('Avg Steps', '${stepsAvg.round()}', 'steps/day', AppTheme.success, Icons.directions_walk_rounded),
              _avgCard('Avg Water', '${waterAvg.round()}', 'ml/day', AppTheme.info, Icons.water_drop_outlined),
              _avgCard('Avg Sleep', '${sleepAvg.toStringAsFixed(1)}', 'hrs/night', AppTheme.primary, Icons.bedtime_outlined),
              _avgCard('Avg Weight', '${weightAvg.toStringAsFixed(1)}', 'kg', AppTheme.warning, Icons.scale_outlined),
            ],
          ),
          const SizedBox(height: 20),

          // Custom Trends Selector & Chart
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Trend Analytics', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                    DropdownButton<String>(
                      value: _selectedParam,
                      dropdownColor: AppTheme.bgSecondary,
                      underline: const SizedBox(),
                      icon: const Icon(Icons.arrow_drop_down, color: AppTheme.primary),
                      items: const [
                        DropdownMenuItem(value: 'stepsCount', child: Text('Steps Count', style: TextStyle(fontSize: 12, color: Colors.white))),
                        DropdownMenuItem(value: 'waterIntake', child: Text('Water Intake', style: TextStyle(fontSize: 12, color: Colors.white))),
                        DropdownMenuItem(value: 'sleepHours', child: Text('Sleep Hours', style: TextStyle(fontSize: 12, color: Colors.white))),
                        DropdownMenuItem(value: 'weight', child: Text('Weight Profile', style: TextStyle(fontSize: 12, color: Colors.white))),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedParam = val);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                CustomChart(data: widget.vitals, parameter: _selectedParam),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Diagnostic Summary reports
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.glassDecoration(hasGlow: true),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.psychology, color: AppTheme.primary, size: 22),
                        SizedBox(width: 8),
                        Text('AI Smart Analysis Report', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: (_generating || widget.vitals.isEmpty)
                          ? null
                          : () async {
                              setState(() => _generating = true);
                              widget.onTriggerInsight();
                              await Future.delayed(const Duration(seconds: 1));
                              setState(() => _generating = false);
                            },
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                      child: _generating
                          ? const SizedBox(height: 12, width: 12, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 1.5))
                          : const Text('Generate Report', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const Divider(color: AppTheme.borderLight, height: 24),

                if (widget.insight != null) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.04),
                      border: Border.all(color: AppTheme.primary.withOpacity(0.1)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      widget.insight!.summary,
                      style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.5),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('AI CLINICAL INSIGHTS & SUGGESTIONS', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                  const SizedBox(height: 8),
                  Text(
                    widget.insight!.recommendation,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.6),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Compiled at: ${DateFormat('yyyy-MM-dd HH:mm').format(widget.insight!.timestamp)}',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                    textAlign: TextAlign.end,
                  ),
                ] else ...[
                  Container(
                    height: 120,
                    alignment: Alignment.center,
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.query_stats_rounded, color: AppTheme.textMuted, size: 36),
                        SizedBox(height: 8),
                        Text('No report compiled. Click Generate Report.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                ]
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _avgCard(String title, String value, String unit, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: AppTheme.glassDecoration(),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                const SizedBox(height: 2),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    value,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                ),
                Text(unit, style: const TextStyle(color: AppTheme.textMuted, fontSize: 9)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
