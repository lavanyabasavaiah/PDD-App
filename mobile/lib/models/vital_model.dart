class VitalModel {
  final String id;
  final double? systolic;
  final double? diastolic;
  final double? heartRate;
  final double? temperature;
  final double? spo2;
  final double? respiratoryRate;
  final double? bloodSugar;
  final String? bloodSugarType;
  final double? sleepHours;
  final String? sleepQuality;
  final double? waterIntake;
  final double? stepsCount;
  final double? weight;
  final String? notes;
  final DateTime timestamp;

  VitalModel({
    required this.id,
    this.systolic,
    this.diastolic,
    this.heartRate,
    this.temperature,
    this.spo2,
    this.respiratoryRate,
    this.bloodSugar,
    this.bloodSugarType,
    this.sleepHours,
    this.sleepQuality,
    this.waterIntake,
    this.stepsCount,
    this.weight,
    this.notes,
    required this.timestamp,
  });

  factory VitalModel.fromJson(Map<String, dynamic> json) {
    return VitalModel(
      id: json['_id'] ?? '',
      systolic: json['systolic'] != null ? (json['systolic'] as num).toDouble() : null,
      diastolic: json['diastolic'] != null ? (json['diastolic'] as num).toDouble() : null,
      heartRate: json['heartRate'] != null ? (json['heartRate'] as num).toDouble() : null,
      temperature: json['temperature'] != null ? (json['temperature'] as num).toDouble() : null,
      spo2: json['spo2'] != null ? (json['spo2'] as num).toDouble() : null,
      respiratoryRate: json['respiratoryRate'] != null ? (json['respiratoryRate'] as num).toDouble() : null,
      bloodSugar: json['bloodSugar'] != null ? (json['bloodSugar'] as num).toDouble() : null,
      bloodSugarType: json['bloodSugarType'],
      sleepHours: json['sleepHours'] != null ? (json['sleepHours'] as num).toDouble() : null,
      sleepQuality: json['sleepQuality'],
      waterIntake: json['waterIntake'] != null ? (json['waterIntake'] as num).toDouble() : null,
      stepsCount: json['stepsCount'] != null ? (json['stepsCount'] as num).toDouble() : null,
      weight: json['weight'] != null ? (json['weight'] as num).toDouble() : null,
      notes: json['notes'],
      timestamp: json['timestamp'] != null ? DateTime.parse(json['timestamp']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (id.isNotEmpty) data['_id'] = id;
    if (systolic != null) data['systolic'] = systolic;
    if (diastolic != null) data['diastolic'] = diastolic;
    if (heartRate != null) data['heartRate'] = heartRate;
    if (temperature != null) data['temperature'] = temperature;
    if (spo2 != null) data['spo2'] = spo2;
    if (respiratoryRate != null) data['respiratoryRate'] = respiratoryRate;
    if (bloodSugar != null) data['bloodSugar'] = bloodSugar;
    if (bloodSugarType != null) data['bloodSugarType'] = bloodSugarType;
    if (sleepHours != null) data['sleepHours'] = sleepHours;
    if (sleepQuality != null) data['sleepQuality'] = sleepQuality;
    if (waterIntake != null) data['waterIntake'] = waterIntake;
    if (stepsCount != null) data['stepsCount'] = stepsCount;
    if (weight != null) data['weight'] = weight;
    if (notes != null) data['notes'] = notes;
    data['timestamp'] = timestamp.toIso8601String();
    return data;
  }
}
