class MedicationModel {
  final String id;
  final String name;
  final String dosage;
  final String frequency;
  final List<String> times;
  final DateTime startDate;
  final DateTime? endDate;
  final bool active;
  final List<MedicationLog> logs;

  MedicationModel({
    required this.id,
    required this.name,
    required this.dosage,
    required this.frequency,
    required this.times,
    required this.startDate,
    this.endDate,
    required this.active,
    required this.logs,
  });

  factory MedicationModel.fromJson(Map<String, dynamic> json) {
    return MedicationModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      dosage: json['dosage'] ?? '',
      frequency: json['frequency'] ?? 'Daily',
      times: List<String>.from(json['times'] ?? []),
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : DateTime.now(),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      active: json['active'] ?? true,
      logs: (json['logs'] as List?)
              ?.map((item) => MedicationLog.fromJson(item))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'dosage': dosage,
      'frequency': frequency,
      'times': times,
      'startDate': startDate.toIso8601String(),
      if (endDate != null) 'endDate': endDate!.toIso8601String(),
      'active': active,
      'logs': logs.map((x) => x.toJson()).toList(),
    };
  }
}

class MedicationLog {
  final String date; // YYYY-MM-DD
  final String time; // HH:MM
  final String status; // taken, skipped
  final DateTime timestamp;

  MedicationLog({
    required this.date,
    required this.time,
    required this.status,
    required this.timestamp,
  });

  factory MedicationLog.fromJson(Map<String, dynamic> json) {
    return MedicationLog(
      date: json['date'] ?? '',
      time: json['time'] ?? '',
      status: json['status'] ?? 'taken',
      timestamp: json['timestamp'] != null ? DateTime.parse(json['timestamp']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'time': time,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
