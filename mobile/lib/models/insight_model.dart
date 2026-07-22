class InsightModel {
  final String id;
  final String summary;
  final String recommendation;
  final String analysisType; // Daily, Weekly, On-Demand
  final DateTime timestamp;

  InsightModel({
    required this.id,
    required this.summary,
    required this.recommendation,
    required this.analysisType,
    required this.timestamp,
  });

  factory InsightModel.fromJson(Map<String, dynamic> json) {
    return InsightModel(
      id: json['_id'] ?? '',
      summary: json['summary'] ?? '',
      recommendation: json['recommendation'] ?? '',
      analysisType: json['analysisType'] ?? 'On-Demand',
      timestamp: json['timestamp'] != null ? DateTime.parse(json['timestamp']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'summary': summary,
      'recommendation': recommendation,
      'analysisType': analysisType,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
