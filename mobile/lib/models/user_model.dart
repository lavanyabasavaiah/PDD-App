class UserModel {
  final String id;
  final String username;
  final String email;
  final String fullName;
  final int age;
  final String gender;
  final double height;
  final double weight;
  final String bloodGroup;
  final List<String> conditions;
  final List<String> allergies;
  final List<EmergencyContact> emergencyContacts;
  final List<FamilyAccess> familyAccess;
  final UserGoals goals;
  final String profilePhoto;
  final UserSettings settings;
  final bool onboardingComplete;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.fullName,
    required this.age,
    required this.gender,
    required this.height,
    required this.weight,
    required this.bloodGroup,
    required this.conditions,
    required this.allergies,
    required this.emergencyContacts,
    required this.familyAccess,
    required this.goals,
    required this.profilePhoto,
    required this.settings,
    required this.onboardingComplete,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      age: json['age'] != null ? (json['age'] as num).toInt() : 35,
      gender: json['gender'] ?? 'Other',
      height: json['height'] != null ? (json['height'] as num).toDouble() : 170.0,
      weight: json['weight'] != null ? (json['weight'] as num).toDouble() : 70.0,
      bloodGroup: json['bloodGroup'] ?? '',
      conditions: List<String>.from(json['conditions'] ?? []),
      allergies: List<String>.from(json['allergies'] ?? []),
      emergencyContacts: (json['emergencyContacts'] as List?)
              ?.map((item) => EmergencyContact.fromJson(item))
              .toList() ??
          [],
      familyAccess: (json['familyAccess'] as List?)
              ?.map((item) => FamilyAccess.fromJson(item))
              .toList() ??
          [],
      goals: json['goals'] != null ? UserGoals.fromJson(json['goals']) : UserGoals.defaultGoals(),
      profilePhoto: json['profilePhoto'] ?? '',
      settings: json['settings'] != null ? UserSettings.fromJson(json['settings']) : UserSettings.defaultSettings(),
      onboardingComplete: json['onboardingComplete'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'username': username,
      'email': email,
      'fullName': fullName,
      'age': age,
      'gender': gender,
      'height': height,
      'weight': weight,
      'bloodGroup': bloodGroup,
      'conditions': conditions,
      'allergies': allergies,
      'emergencyContacts': emergencyContacts.map((x) => x.toJson()).toList(),
      'familyAccess': familyAccess.map((x) => x.toJson()).toList(),
      'goals': goals.toJson(),
      'profilePhoto': profilePhoto,
      'settings': settings.toJson(),
      'onboardingComplete': onboardingComplete,
    };
  }
}

class EmergencyContact {
  final String name;
  final String phone;
  final String relationship;

  EmergencyContact({
    required this.name,
    required this.phone,
    required this.relationship,
  });

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      relationship: json['relationship'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'relationship': relationship,
    };
  }
}

class FamilyAccess {
  final String email;
  final String role;
  final String status;

  FamilyAccess({
    required this.email,
    required this.role,
    required this.status,
  });

  factory FamilyAccess.fromJson(Map<String, dynamic> json) {
    return FamilyAccess(
      email: json['email'] ?? '',
      role: json['role'] ?? 'Viewer',
      status: json['status'] ?? 'Pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'role': role,
      'status': status,
    };
  }
}

class UserGoals {
  final int steps;
  final int sleep;
  final int water;
  final double weight;

  UserGoals({
    required this.steps,
    required this.sleep,
    required this.water,
    required this.weight,
  });

  factory UserGoals.fromJson(Map<String, dynamic> json) {
    return UserGoals(
      steps: json['steps'] != null ? (json['steps'] as num).toInt() : 8000,
      sleep: json['sleep'] != null ? (json['sleep'] as num).toInt() : 8,
      water: json['water'] != null ? (json['water'] as num).toInt() : 2000,
      weight: json['weight'] != null ? (json['weight'] as num).toDouble() : 70.0,
    );
  }

  factory UserGoals.defaultGoals() {
    return UserGoals(steps: 8000, sleep: 8, water: 2000, weight: 70.0);
  }

  Map<String, dynamic> toJson() {
    return {
      'steps': steps,
      'sleep': sleep,
      'water': water,
      'weight': weight,
    };
  }
}

class UserSettings {
  final String tempUnit;
  final String weightUnit;
  final int sosTrigger;

  UserSettings({
    required this.tempUnit,
    required this.weightUnit,
    required this.sosTrigger,
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      tempUnit: json['tempUnit'] ?? 'C',
      weightUnit: json['weightUnit'] ?? 'kg',
      sosTrigger: json['sosTrigger'] != null ? (json['sosTrigger'] as num).toInt() : 5,
    );
  }

  factory UserSettings.defaultSettings() {
    return UserSettings(tempUnit: 'C', weightUnit: 'kg', sosTrigger: 5);
  }

  Map<String, dynamic> toJson() {
    return {
      'tempUnit': tempUnit,
      'weightUnit': weightUnit,
      'sosTrigger': sosTrigger,
    };
  }
}
