import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/user_model.dart';
import '../models/vital_model.dart';
import '../models/medication_model.dart';
import '../models/alert_model.dart';
import '../models/insight_model.dart';
import 'storage_service.dart';

class ApiService {
  static const String baseUrl = AppConfig.backendUrl;

  // Helper to build headers with optional token injection
  static Future<Map<String, String>> _headers() async {
    final token = await StorageService.getToken();
    final headers = {
      'Content-Type': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Handle API response helper
  static dynamic _processResponse(http.Response res) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return null;
      return jsonDecode(res.body);
    } else {
      Map<String, dynamic>? errorData;
      try {
        errorData = jsonDecode(res.body);
      } catch (_) {}
      final message = errorData != null ? errorData['message'] : 'Server Error';
      throw Exception(message ?? 'Failed request with status: ${res.statusCode}');
    }
  }

  // --- AUTH ENDPOINTS ---

  static Future<Map<String, dynamic>> login(String username, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await _headers(),
      body: jsonEncode({'username': username, 'password': password}),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    // Returns { token, user: {...} }
    return data;
  }

  static Future<Map<String, dynamic>> register(String username, String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await _headers(),
      body: jsonEncode({'username': username, 'email': email, 'password': password}),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return data;
  }

  static Future<void> forgotPassword(String email) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/forgot-password'),
      headers: await _headers(),
      body: jsonEncode({'email': email}),
    );
    _processResponse(res);
  }

  static Future<void> resetPassword(String email, String code, String newPassword) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/reset-password'),
      headers: await _headers(),
      // Server expects 'otp' (not 'code') as the field name
      body: jsonEncode({'email': email, 'otp': code, 'newPassword': newPassword}),
    );
    _processResponse(res);
  }

  static Future<UserModel> getProfile() async {
    final res = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: await _headers(),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return UserModel.fromJson(data);
  }

  static Future<UserModel> updateProfile(Map<String, dynamic> profileData) async {
    final res = await http.put(
      Uri.parse('$baseUrl/auth/profile'),
      headers: await _headers(),
      body: jsonEncode(profileData),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return UserModel.fromJson(data);
  }

  // --- VITALS ENDPOINTS ---

  static Future<List<VitalModel>> getVitals() async {
    final res = await http.get(
      Uri.parse('$baseUrl/vitals'),
      headers: await _headers(),
    );
    final list = _processResponse(res) as List;
    return list.map((item) => VitalModel.fromJson(item)).toList();
  }

  static Future<VitalModel> addVital(Map<String, dynamic> vitalData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/vitals'),
      headers: await _headers(),
      body: jsonEncode(vitalData),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return VitalModel.fromJson(data);
  }

  static Future<void> deleteVital(String vitalId) async {
    final res = await http.delete(
      Uri.parse('$baseUrl/vitals/$vitalId'),
      headers: await _headers(),
    );
    _processResponse(res);
  }

  // --- MEDICATIONS ENDPOINTS ---

  static Future<List<MedicationModel>> getMedications() async {
    final res = await http.get(
      Uri.parse('$baseUrl/medications'),
      headers: await _headers(),
    );
    final list = _processResponse(res) as List;
    return list.map((item) => MedicationModel.fromJson(item)).toList();
  }

  static Future<MedicationModel> addMedication(Map<String, dynamic> medData) async {
    final res = await http.post(
      Uri.parse('$baseUrl/medications'),
      headers: await _headers(),
      body: jsonEncode(medData),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return MedicationModel.fromJson(data);
  }

  static Future<void> deleteMedication(String medId) async {
    final res = await http.delete(
      Uri.parse('$baseUrl/medications/$medId'),
      headers: await _headers(),
    );
    _processResponse(res);
  }

  static Future<MedicationModel> toggleMedicationActive(String medId, bool active) async {
    final res = await http.put(
      Uri.parse('$baseUrl/medications/$medId'),
      headers: await _headers(),
      body: jsonEncode({'active': active}),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return MedicationModel.fromJson(data);
  }

  static Future<MedicationModel> logMedication(String medId, String date, String time, String status) async {
    final res = await http.post(
      Uri.parse('$baseUrl/medications/$medId/log'),
      headers: await _headers(),
      body: jsonEncode({'date': date, 'time': time, 'status': status}),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return MedicationModel.fromJson(data);
  }

  // --- ALERTS ENDPOINTS ---

  static Future<List<AlertModel>> getAlerts() async {
    final res = await http.get(
      Uri.parse('$baseUrl/alerts'),
      headers: await _headers(),
    );
    final list = _processResponse(res) as List;
    return list.map((item) => AlertModel.fromJson(item)).toList();
  }

  static Future<AlertModel> resolveAlert(String alertId) async {
    final res = await http.put(
      Uri.parse('$baseUrl/alerts/$alertId'),
      headers: await _headers(),
      body: jsonEncode({'status': 'Resolved'}),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return AlertModel.fromJson(data);
  }

  static Future<void> markAllAlertsRead() async {
    final res = await http.put(
      Uri.parse('$baseUrl/alerts/read-all'),
      headers: await _headers(),
    );
    _processResponse(res);
  }

  // --- INSIGHTS ENDPOINTS ---

  static Future<InsightModel?> getLatestInsight() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/insights/latest'),
        headers: await _headers(),
      );
      final data = _processResponse(res);
      if (data == null) return null;
      return InsightModel.fromJson(data as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  static Future<List<InsightModel>> getInsights() async {
    final res = await http.get(
      Uri.parse('$baseUrl/insights'),
      headers: await _headers(),
    );
    final list = _processResponse(res) as List;
    return list.map((item) => InsightModel.fromJson(item)).toList();
  }

  static Future<InsightModel> triggerInsightAnalysis() async {
    final res = await http.post(
      Uri.parse('$baseUrl/insights/analyze'),
      headers: await _headers(),
    );
    final data = _processResponse(res) as Map<String, dynamic>;
    return InsightModel.fromJson(data);
  }
}
