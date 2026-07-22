import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../models/vital_model.dart';
import '../theme.dart';

class CustomChart extends StatelessWidget {
  final List<VitalModel> data;
  final String parameter;

  const CustomChart({
    Key? key,
    required this.data,
    required this.parameter,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return Container(
        height: 220,
        alignment: Alignment.center,
        child: const Text(
          'No historical vital data logged yet.',
          style: TextStyle(color: AppTheme.textMuted, fontSize: 14),
        ),
      );
    }

    // Sort chronologically ascending and limit to last 7 readings
    final chartData = List<VitalModel>.from(data)
      ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
    final displayData = chartData.length > 7 ? chartData.sublist(chartData.length - 7) : chartData;

    // Define colors & labels based on parameter
    Color primaryColor = AppTheme.primary;
    String label = '';
    String unit = '';

    switch (parameter) {
      case 'heartRate':
        primaryColor = AppTheme.danger;
        label = 'Heart Rate';
        unit = ' bpm';
        break;
      case 'temperature':
        primaryColor = AppTheme.warning;
        label = 'Temp';
        unit = '°C';
        break;
      case 'spo2':
        primaryColor = AppTheme.info;
        label = 'SpO2';
        unit = '%';
        break;
      case 'bloodSugar':
        primaryColor = AppTheme.primary;
        label = 'Sugar';
        unit = ' mg/dL';
        break;
      case 'sleepHours':
        primaryColor = AppTheme.info;
        label = 'Sleep';
        unit = ' hrs';
        break;
      case 'waterIntake':
        primaryColor = AppTheme.info;
        label = 'Water';
        unit = ' ml';
        break;
      case 'stepsCount':
        primaryColor = AppTheme.success;
        label = 'Steps';
        unit = '';
        break;
      case 'weight':
        primaryColor = AppTheme.warning;
        label = 'Weight';
        unit = ' kg';
        break;
      default:
        primaryColor = AppTheme.primary;
        label = 'Value';
        unit = '';
    }

    // Extract raw values to calculate yBounds
    double yMin = 0;
    double yMax = 100;

    if (parameter == 'bloodPressure') {
      final sysVals = displayData.map((d) => d.systolic ?? 120.0).toList();
      final diaVals = displayData.map((d) => d.diastolic ?? 80.0).toList();
      final allVals = [...sysVals, ...diaVals];
      final minVal = allVals.reduce((a, b) => a < b ? a : b);
      final maxVal = allVals.reduce((a, b) => a > b ? a : b);
      yMin = (minVal - 10).clamp(0.0, 300.0);
      yMax = maxVal + 10;
    } else {
      final values = displayData.map((d) => _getValue(d, parameter)).toList();
      final minVal = values.reduce((a, b) => a < b ? a : b);
      final maxVal = values.reduce((a, b) => a > b ? a : b);
      final pad = parameter == 'temperature' ? 0.5 : 10.0;
      yMin = (minVal - pad).clamp(0.0, double.infinity);
      yMax = maxVal + pad;
    }

    // Grid interval
    double yInterval = (yMax - yMin) / 3;
    if (yInterval <= 0) yInterval = 10;

    // Line definitions
    final List<LineChartBarData> lineBarsData = [];

    if (parameter == 'bloodPressure') {
      // Systolic line
      lineBarsData.add(
        LineChartBarData(
          spots: displayData.asMap().entries.map((e) {
            return FlSpot(e.key.toDouble(), e.value.systolic ?? 120.0);
          }).toList(),
          isCurved: true,
          color: AppTheme.danger,
          barWidth: 3,
          isStrokeCapRound: true,
          dotData: FlDotData(
            show: true,
            getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
              radius: 4,
              color: AppTheme.bgPrimary,
              strokeWidth: 2,
              strokeColor: AppTheme.danger,
            ),
          ),
          belowBarData: BarAreaData(
            show: true,
            color: AppTheme.danger.withOpacity(0.15),
          ),
        ),
      );

      // Diastolic line
      lineBarsData.add(
        LineChartBarData(
          spots: displayData.asMap().entries.map((e) {
            return FlSpot(e.key.toDouble(), e.value.diastolic ?? 80.0);
          }).toList(),
          isCurved: true,
          color: AppTheme.info,
          barWidth: 3,
          isStrokeCapRound: true,
          dotData: FlDotData(
            show: true,
            getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
              radius: 4,
              color: AppTheme.bgPrimary,
              strokeWidth: 2,
              strokeColor: AppTheme.info,
            ),
          ),
          belowBarData: BarAreaData(
            show: true,
            color: AppTheme.info.withOpacity(0.15),
          ),
        ),
      );
    } else {
      // Single parameter line
      lineBarsData.add(
        LineChartBarData(
          spots: displayData.asMap().entries.map((e) {
            return FlSpot(e.key.toDouble(), _getValue(e.value, parameter));
          }).toList(),
          isCurved: true,
          color: primaryColor,
          barWidth: 3,
          isStrokeCapRound: true,
          dotData: FlDotData(
            show: true,
            getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
              radius: 4,
              color: AppTheme.bgPrimary,
              strokeWidth: 2,
              strokeColor: primaryColor,
            ),
          ),
          belowBarData: BarAreaData(
            show: true,
            color: primaryColor.withOpacity(0.15),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Legend
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: parameter == 'bloodPressure'
              ? [
                  _legendItem('Systolic', AppTheme.danger),
                  const SizedBox(width: 12),
                  _legendItem('Diastolic', AppTheme.info),
                ]
              : [
                  _legendItem(label, primaryColor),
                ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 220,
          child: LineChart(
            LineChartData(
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: yInterval,
                getDrawingHorizontalLine: (value) => const FlLine(
                  color: AppTheme.borderLight,
                  strokeWidth: 1,
                  dashArray: [4, 4],
                ),
              ),
              titlesData: FlTitlesData(
                show: true,
                rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 30,
                    interval: 1,
                    getTitlesWidget: (value, meta) {
                      final idx = value.toInt();
                      if (idx >= 0 && idx < displayData.length) {
                        final date = displayData[idx].timestamp;
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            DateFormat('MMM dd').format(date),
                            style: const TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 9,
                            ),
                          ),
                        );
                      }
                      return const SizedBox();
                    },
                  ),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 40,
                    interval: yInterval,
                    getTitlesWidget: (value, meta) {
                      return Text(
                        parameter == 'temperature' ? value.toStringAsFixed(1) : value.toInt().toString(),
                        style: const TextStyle(
                          color: AppTheme.textMuted,
                          fontSize: 10,
                        ),
                        textAlign: TextAlign.end,
                      );
                    },
                  ),
                ),
              ),
              borderData: FlBorderData(
                show: false,
              ),
              minX: 0,
              maxX: (displayData.length - 1).toDouble(),
              minY: yMin,
              maxY: yMax,
              lineBarsData: lineBarsData,
              lineTouchData: LineTouchData(
                touchTooltipData: LineTouchTooltipData(
                  tooltipBgColor: AppTheme.bgSecondary.withOpacity(0.95),
                  tooltipBorder: const BorderSide(color: AppTheme.borderLight),
                  tooltipRoundedRadius: 8,
                  getTooltipItems: (List<LineBarSpot> touchedSpots) {
                    return touchedSpots.map((barSpot) {
                      final vital = displayData[barSpot.x.toInt()];
                      final dateStr = DateFormat('MMM dd, HH:mm').format(vital.timestamp);
                      final isBp = parameter == 'bloodPressure';
                      final valLabel = isBp
                          ? (barSpot.barIndex == 0 ? 'Systolic' : 'Diastolic')
                          : label;
                      final finalUnit = isBp ? ' mmHg' : unit;

                      return LineTooltipItem(
                        '$dateStr\n$valLabel: ${barSpot.y.toStringAsFixed(parameter == 'temperature' ? 1 : 0)}$finalUnit',
                        const TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      );
                    }).toList();
                  },
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _legendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 4,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
        ),
      ],
    );
  }

  double _getValue(VitalModel d, String param) {
    switch (param) {
      case 'heartRate':
        return d.heartRate ?? 72.0;
      case 'temperature':
        return d.temperature ?? 36.8;
      case 'spo2':
        return d.spo2 ?? 98.0;
      case 'bloodSugar':
        return d.bloodSugar ?? 100.0;
      case 'sleepHours':
        return d.sleepHours ?? 8.0;
      case 'waterIntake':
        return d.waterIntake ?? 2000.0;
      case 'stepsCount':
        return d.stepsCount ?? 8000.0;
      case 'weight':
        return d.weight ?? 70.0;
      default:
        return 0.0;
    }
  }
}
