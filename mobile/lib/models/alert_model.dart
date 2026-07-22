class AlertModel {
  final String id;
  final String? vitalId;
  final String type;
  final String message;
  final String severity; // Normal, Warning, Critical
  final String status; // Unread, Read, Resolved
  final DateTime timestamp;

  AlertModel({
    required this.id,
    this.vitalId,
    required this.type,
    required this.message,
    required this.severity,
    required this.status,
    required this.timestamp,
  });

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: json['_id'] ?? '',
      vitalId: json['vitalId'],
      type: json['type'] ?? 'General',
      message: json['message'] ?? '',
      severity: json['severity'] ?? 'Warning',
      status: json['status'] ?? 'Unread',
      timestamp: json['timestamp'] != null ? DateTime.parse(json['timestamp']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      if (vitalId != null) 'vitalId': vitalId,
      'type': type,
      'message': message,
      'severity': severity,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
