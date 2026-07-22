import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';
import '../models/vital_model.dart';
import '../models/medication_model.dart';
import '../models/alert_model.dart';
import '../models/insight_model.dart';
import '../components/custom_chart.dart';
import '../theme.dart';

class DashboardScreen extends StatefulWidget {
  final List<VitalModel> vitals;
  final List<MedicationModel> medications;
  final List<AlertModel> alerts;
  final InsightModel? insight;
  final Function(String medId, String time, String status) onLogMedication;
  final Function(String alertId) onResolveAlert;
  final VoidCallback onTriggerInsight;
  final UserModel user;
  final Function(String page) onNavigate;

  const DashboardScreen({
    Key? key,
    required this.vitals,
    required this.medications,
    required this.alerts,
    this.insight,
    required this.onLogMedication,
    required this.onResolveAlert,
    required this.onTriggerInsight,
    required this.user,
    required this.onNavigate,
  }) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _selectedChartParam = 'bloodPressure';
  bool _generatingInsight = false;

  // Rating getters
  Map<String, dynamic> _getBPStatus(double? sys, double? dia) {
    if (sys == null || dia == null) return {'text': 'No Data', 'color': AppTheme.textMuted};
    if (sys >= 180 || dia >= 120) return {'text': 'Crisis', 'color': AppTheme.danger};
    if (sys >= 140 || dia >= 90) return {'text': 'High', 'color': AppTheme.danger};
    if (sys >= 120 || dia >= 80) return {'text': 'Elevated', 'color': AppTheme.warning};
    if (sys < 90 || dia < 60) return {'text': 'Low', 'color': AppTheme.warning};
    return {'text': 'Normal', 'color': AppTheme.success};
  }

  Map<String, dynamic> _getHRStatus(double? hr) {
    if (hr == null) return {'text': 'No Data', 'color': AppTheme.textMuted};
    if (hr >= 120 || hr <= 45) return {'text': 'Critical', 'color': AppTheme.danger};
    if (hr > 100) return {'text': 'High', 'color': AppTheme.warning};
    if (hr < 55) return {'text': 'Low', 'color': AppTheme.warning};
    return {'text': 'Normal', 'color': AppTheme.success};
  }

  Map<String, dynamic> _getTempStatus(double? temp) {
    if (temp == null) return {'text': 'No Data', 'color': AppTheme.textMuted};
    if (temp >= 39.5 || temp < 35.0) return {'text': 'Critical', 'color': AppTheme.danger};
    if (temp >= 38.0) return {'text': 'Fever', 'color': AppTheme.warning};
    return {'text': 'Normal', 'color': AppTheme.success};
  }

  Map<String, dynamic> _getSpO2Status(double? o2) {
    if (o2 == null) return {'text': 'No Data', 'color': AppTheme.textMuted};
    if (o2 < 90) return {'text': 'Severe Hypoxia', 'color': AppTheme.danger};
    if (o2 < 95) return {'text': 'Low', 'color': AppTheme.warning};
    return {'text': 'Normal', 'color': AppTheme.success};
  }

  double _getTodayMetric(String key) {
    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final logs = widget.vitals.where((v) {
      final logDate = DateFormat('yyyy-MM-dd').format(v.timestamp);
      if (logDate != todayStr) return false;
      
      switch (key) {
        case 'stepsCount': return v.stepsCount != null;
        case 'waterIntake': return v.waterIntake != null;
        case 'sleepHours': return v.sleepHours != null;
        default: return false;
      }
    });

    return logs.fold(0.0, (sum, v) {
      switch (key) {
        case 'stepsCount': return sum + (v.stepsCount ?? 0.0);
        case 'waterIntake': return sum + (v.waterIntake ?? 0.0);
        case 'sleepHours': return sum + (v.sleepHours ?? 0.0);
        default: return sum;
      }
    });
  }

  List<Map<String, dynamic>> _getMedicationSchedule() {
    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final List<Map<String, dynamic>> list = [];

    for (var med in widget.medications) {
      if (!med.active) continue;
      for (var time in med.times) {
        final log = med.logs.firstWhere(
          (l) => l.date == todayStr && l.time == time,
          orElse: () => MedicationLog(date: '', time: '', status: 'pending', timestamp: DateTime.now()),
        );

        list.add({
          'id': med.id,
          'name': med.name,
          'dosage': med.dosage,
          'time': time,
          'status': log.status == '' ? 'pending' : log.status,
        });
      }
    }

    list.sort((a, b) => (a['time'] as String).compareTo(b['time'] as String));
    return list;
  }

  int _calculateHealthScore(double stepsToday, double stepsGoal, double waterToday, double waterGoal, double sleepToday, double sleepGoal, int totalMeds, int takenMeds) {
    int score = 70; // baseline
    final latestVital = widget.vitals.isNotEmpty ? widget.vitals[0] : null;

    if (latestVital != null) {
      if (latestVital.systolic != null && latestVital.diastolic != null) {
        if (latestVital.systolic! < 120 && latestVital.diastolic! < 80) {
          score += 5;
        } else if (latestVital.systolic! >= 140 || latestVital.diastolic! >= 90) {
          score -= 10;
        }
      }
      if (latestVital.heartRate != null) {
        if (latestVital.heartRate! >= 60 && latestVital.heartRate! <= 85) {
          score += 5;
        } else if (latestVital.heartRate! > 100) {
          score -= 5;
        }
      }
    }

    if (stepsToday >= stepsGoal) {
      score += 10;
    } else if (stepsToday > 0) {
      score += ((stepsToday / stepsGoal) * 5).round();
    }
    if (waterToday >= waterGoal) score += 5;
    if (sleepToday >= sleepGoal) score += 5;
    if (totalMeds > 0) {
      score += ((takenMeds / totalMeds) * 10).round();
    } else {
      score += 5;
    }

    return score.clamp(20, 100);
  }

  @override
  Widget build(BuildContext context) {
    final latestVital = widget.vitals.isNotEmpty ? widget.vitals[0] : null;

    // Daily Metrics Calculations
    final stepsToday = _getTodayMetric('stepsCount');
    final stepsGoal = widget.user.goals.steps.toDouble();
    final stepsPercent = (stepsGoal > 0 ? (stepsToday / stepsGoal) : 0.0).clamp(0.0, 1.0);

    final waterToday = _getTodayMetric('waterIntake');
    final waterGoal = widget.user.goals.water.toDouble();
    final waterPercent = (waterGoal > 0 ? (waterToday / waterGoal) : 0.0).clamp(0.0, 1.0);

    final sleepToday = _getTodayMetric('sleepHours');
    final sleepGoal = widget.user.goals.sleep.toDouble();
    final sleepPercent = (sleepGoal > 0 ? (sleepToday / sleepGoal) : 0.0).clamp(0.0, 1.0);

    final scheduledMeds = _getMedicationSchedule();
    final totalMeds = scheduledMeds.length;
    final takenMeds = scheduledMeds.where((m) => m['status'] == 'taken').length;

    final healthScore = _calculateHealthScore(
      stepsToday, stepsGoal,
      waterToday, waterGoal,
      sleepToday, sleepGoal,
      totalMeds, takenMeds,
    );

    final bpStatus = _getBPStatus(latestVital?.systolic, latestVital?.diastolic);
    final hrStatus = _getHRStatus(latestVital?.heartRate);
    final tempStatus = _getTempStatus(latestVital?.temperature);
    final spo2Status = _getSpO2Status(latestVital?.spo2);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Row 1: Health Score & Daily Widgets
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 600;
              return Flex(
                direction: isWide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Health Score
                  Expanded(
                    flex: isWide ? 4 : 0,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: AppTheme.glassDecoration(hasGlow: true),
                      child: Row(
                        children: [
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              SizedBox(
                                width: 72,
                                height: 72,
                                child: CircularProgressIndicator(
                                  value: healthScore / 100,
                                  strokeWidth: 4,
                                  backgroundColor: AppTheme.borderLight,
                                  valueColor: const AlwaysStoppedAnimation(AppTheme.primary),
                                ),
                              ),
                              Text(
                                healthScore.toString(),
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                            ],
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.bolt, color: AppTheme.primary, size: 16),
                                    SizedBox(width: 4),
                                    Text('Health Score', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  healthScore >= 80
                                      ? 'Optimal status! Today’s metrics look excellent.'
                                      : healthScore >= 65
                                          ? 'Healthy. Fill steps or water to maximize score.'
                                          : 'Alert: Health scores flagged low. Check metrics.',
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                  if (isWide) const SizedBox(width: 16),
                  // Daily Activity Summary Progress
                  Expanded(
                    flex: isWide ? 5 : 0,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: AppTheme.glassDecoration(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Daily Activity Widget', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                          const SizedBox(height: 12),
                          _progressBar('Steps', '${stepsToday.toInt()}/${stepsGoal.toInt()}', stepsPercent, AppTheme.success),
                          const SizedBox(height: 8),
                          _progressBar('Water Log', '${waterToday.toInt()}/${waterGoal.toInt()} ml', waterPercent, AppTheme.info),
                          const SizedBox(height: 8),
                          _progressBar('Sleep Quality', '${sleepToday.toInt()}/${sleepGoal.toInt()} hrs', sleepPercent, AppTheme.primary),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // Vitals Quick Cards Row
          GridView.count(
            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.5,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              _vitalCard('Blood Pressure', latestVital?.systolic != null ? '${latestVital!.systolic!.toInt()}/${latestVital.diastolic!.toInt()}' : '--/--', 'mmHg', bpStatus['text'], bpStatus['color'], AppTheme.danger, Icons.favorite_border),
              _vitalCard('Heart Rate', latestVital?.heartRate != null ? latestVital!.heartRate!.toInt().toString() : '--', 'bpm', hrStatus['text'], hrStatus['color'], AppTheme.danger, Icons.favorite),
              _vitalCard('Temperature', latestVital?.temperature != null ? '${latestVital!.temperature!.toStringAsFixed(1)}' : '--', '°C', tempStatus['text'], tempStatus['color'], AppTheme.warning, Icons.thermostat),
              _vitalCard('Blood Oxygen', latestVital?.spo2 != null ? '${latestVital!.spo2!.toInt()}' : '--', '%', spo2Status['text'], spo2Status['color'], AppTheme.info, Icons.water_drop),
            ],
          ),
          const SizedBox(height: 20),

          // Trends Trend Graph Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: AppTheme.glassDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Vital Sign Trends', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                    Row(
                      children: ['bloodPressure', 'heartRate', 'temperature', 'spo2'].map((param) {
                        final active = _selectedChartParam == param;
                        final label = param == 'bloodPressure' ? 'BP' : param == 'heartRate' ? 'HR' : param == 'temperature' ? 'Temp' : 'SpO2';
                        return Padding(
                          padding: const EdgeInsets.only(left: 4.0),
                          child: InkWell(
                            onTap: () => setState(() => _selectedChartParam = param),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: active ? AppTheme.primary : Colors.transparent,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                label,
                                style: TextStyle(color: active ? Colors.white : AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                CustomChart(data: widget.vitals, parameter: _selectedChartParam),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // AI Insights Engine Card
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
                        Icon(Icons.psychology, color: AppTheme.primary, size: 20),
                        SizedBox(width: 8),
                        Text('AI Smart Health Insights', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: (_generatingInsight || widget.vitals.isEmpty)
                          ? null
                          : () async {
                              setState(() => _generatingInsight = true);
                              widget.onTriggerInsight();
                              await Future.delayed(const Duration(seconds: 1)); // simulated extra loader
                              setState(() => _generatingInsight = false);
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.bgSecondary,
                        side: const BorderSide(color: AppTheme.borderLight),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      ),
                      icon: _generatingInsight
                          ? const SizedBox(
                              height: 12,
                              width: 12,
                              child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 1.5),
                            )
                          : const Icon(Icons.auto_awesome, color: AppTheme.primary, size: 12),
                      label: Text(
                        _generatingInsight ? 'Analyzing...' : 'Refresh AI',
                        style: const TextStyle(fontSize: 11, color: AppTheme.textPrimary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (widget.insight != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.04),
                      border: Border.all(color: AppTheme.primary.withOpacity(0.1)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      widget.insight!.summary,
                      style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('AI RECOMMENDATIONS', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  Text(
                    widget.insight!.recommendation,
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.5),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Report Generated: ${DateFormat('yyyy-MM-dd HH:mm').format(widget.insight!.timestamp)}',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                    textAlign: TextAlign.end,
                  ),
                ] else ...[
                  Container(
                    height: 100,
                    alignment: Alignment.center,
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.psychology, color: AppTheme.textMuted, size: 32),
                        SizedBox(height: 8),
                        Text('No reports generated yet. Click Refresh AI.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                      ],
                    ),
                  )
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Row 3: Active Warnings & Medication list
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 600;
              return Flex(
                direction: isWide ? Axis.horizontal : Axis.vertical,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Warnings
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: AppTheme.glassDecoration(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.warning_amber_rounded, color: AppTheme.warning, size: 20),
                                  SizedBox(width: 8),
                                  Text('Active Warnings', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: AppTheme.warning.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                child: Text('${widget.alerts.length} unread', style: const TextStyle(color: AppTheme.warning, fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          widget.alerts.isEmpty
                              ? const SizedBox(
                                  height: 80,
                                  child: Center(child: Text('All vitals stable. No alerts.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12))),
                                )
                              : ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: widget.alerts.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                                  itemBuilder: (ctx, idx) {
                                    final alert = widget.alerts[idx];
                                    final critical = alert.severity == 'Critical';
                                    return Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: (critical ? AppTheme.danger : AppTheme.warning).withOpacity(0.08),
                                        border: Border.all(color: (critical ? AppTheme.danger : AppTheme.warning).withOpacity(0.2)),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(alert.type, style: TextStyle(color: critical ? AppTheme.danger : AppTheme.warning, fontWeight: FontWeight.bold, fontSize: 12)),
                                              GestureDetector(
                                                onTap: () => widget.onResolveAlert(alert.id),
                                                child: const Text('Dismiss', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, decoration: TextDecoration.underline)),
                                              )
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(alert.message, style: const TextStyle(color: Colors.white, fontSize: 12)),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                        ],
                      ),
                    ),
                  ),
                  if (isWide) const SizedBox(width: 16),
                  // Medications Checklist
                  Expanded(
                    flex: isWide ? 1 : 0,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: AppTheme.glassDecoration(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.calendar_today, color: AppTheme.primary, size: 18),
                              SizedBox(width: 8),
                              Text("Today's Medications", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          scheduledMeds.isEmpty
                              ? const SizedBox(
                                  height: 80,
                                  child: Center(child: Text('No medications scheduled today.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12))),
                                )
                              : ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: scheduledMeds.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                                  itemBuilder: (ctx, idx) {
                                    final slot = scheduledMeds[idx];
                                    final isPending = slot['status'] == 'pending';
                                    return Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), borderRadius: BorderRadius.circular(8)),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(slot['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                                const SizedBox(height: 2),
                                                Text('${slot['dosage']} • ${slot['time']}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                                              ],
                                            ),
                                          ),
                                          if (isPending)
                                            Row(
                                              children: [
                                                IconButton(
                                                  onPressed: () => widget.onLogMedication(slot['id'], slot['time'], 'taken'),
                                                  icon: const Icon(Icons.check_circle_outline, color: AppTheme.success, size: 20),
                                                  padding: EdgeInsets.zero,
                                                  constraints: const BoxConstraints(),
                                                ),
                                                const SizedBox(width: 8),
                                                IconButton(
                                                  onPressed: () => widget.onLogMedication(slot['id'], slot['time'], 'skipped'),
                                                  icon: const Icon(Icons.cancel_outlined, color: AppTheme.danger, size: 20),
                                                  padding: EdgeInsets.zero,
                                                  constraints: const BoxConstraints(),
                                                ),
                                              ],
                                            )
                                          else
                                            Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                  decoration: BoxDecoration(
                                                    color: slot['status'] == 'taken' ? AppTheme.success.withOpacity(0.15) : AppTheme.danger.withOpacity(0.15),
                                                    borderRadius: BorderRadius.circular(12),
                                                  ),
                                                  child: Text(
                                                    slot['status'] == 'taken' ? 'Taken' : 'Skipped',
                                                    style: TextStyle(color: slot['status'] == 'taken' ? AppTheme.success : AppTheme.danger, fontSize: 10, fontWeight: FontWeight.bold),
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                TextButton(
                                                  onPressed: () => widget.onLogMedication(slot['id'], slot['time'], 'pending'),
                                                  style: TextButton.styleFrom(
                                                    padding: EdgeInsets.zero,
                                                    minimumSize: Size.zero,
                                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                  ),
                                                  child: const Text('Reset', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, decoration: TextDecoration.underline)),
                                                )
                                              ],
                                            ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                        ],
                      ),
                    ),
                  )
                ],
              );
            },
          )
        ],
      ),
    );
  }

  Widget _progressBar(String label, String valueText, double percent, Color color) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            Text(valueText, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: SizedBox(
            height: 6,
            child: LinearProgressIndicator(
              value: percent,
              backgroundColor: Colors.white.withOpacity(0.05),
              valueColor: AlwaysStoppedAnimation(color),
            ),
          ),
        ),
      ],
    );
  }

  Widget _vitalCard(String title, String value, String unit, String status, Color statusColor, Color iconColor, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: AppTheme.glassDecoration(),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: iconColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor, size: 20),
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
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      if (unit.isNotEmpty) Text(' $unit', style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                    ],
                  ),
                ),
                Text(status, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
