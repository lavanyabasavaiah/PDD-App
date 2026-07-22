import Alert from '../models/Alert.js';
import Insight from '../models/Insight.js';

/**
 * Run AI assessment on a newly logged vital.
 * Creates appropriate Alert objects if values exceed thresholds or show abnormal trends.
 * 
 * @param {Object} vital - The newly created Vital document
 * @param {Object} user - The User document
 * @param {Array} vitalsHistory - Recent vitals history for trend analysis (sorted descending by timestamp)
 * @param {Array} medications - User's active medications
 */
export async function analyzeNewVital(vital, user, vitalsHistory = [], medications = []) {
  const alertsCreated = [];

  // Helper to save alerts
  const createAlert = async (type, message, severity) => {
    const alert = new Alert({
      userId: user._id,
      vitalId: vital._id,
      type,
      message,
      severity,
      status: 'Unread'
    });
    await alert.save();
    alertsCreated.push(alert);
  };

  // 1. Blood Pressure Analysis
  if (vital.systolic !== undefined && vital.diastolic !== undefined) {
    const { systolic, diastolic } = vital;
    
    if (systolic >= 180 || diastolic >= 120) {
      await createAlert(
        'Blood Pressure',
        `CRITICAL: Extreme high Blood Pressure (${systolic}/${diastolic} mmHg) detected. This is in the Hypertensive Crisis range. Seek immediate emergency medical care.`,
        'Critical'
      );
    } else if (systolic >= 140 || diastolic >= 90) {
      // High BP Warning
      let message = `Warning: High Blood Pressure (${systolic}/${diastolic} mmHg) detected.`;
      
      // Correlate with hypertension medications
      const bpMeds = medications.filter(med => {
        const name = med.name.toLowerCase();
        return name.includes('lisinopril') || 
               name.includes('losartan') || 
               name.includes('amlodipine') || 
               name.includes('metoprolol') || 
               name.includes('atenolol') ||
               name.includes('bp') || 
               name.includes('hypertension') || 
               name.includes('pressure');
      });

      if (bpMeds.length > 0) {
        // Check if any medication was skipped today or yesterday
        const todayStr = new Date().toISOString().split('T')[0];
        const hasSkipped = bpMeds.some(med => 
          med.logs.some(log => log.date === todayStr && log.status === 'skipped')
        );
        
        if (hasSkipped) {
          message += ` This is likely correlated with skipping your blood pressure medication (${bpMeds.map(m => m.name).join(', ')}) today. Please take your dose.`;
          await createAlert('Medication', `Warning: High BP (${systolic}/${diastolic} mmHg) measured after skipping medication today.`, 'Critical');
        } else {
          message += ` Keep monitoring. Ensure you take your scheduled medications.`;
        }
      }
      
      await createAlert('Blood Pressure', message, 'Warning');
    } else if (systolic < 90 || diastolic < 60) {
      await createAlert(
        'Blood Pressure',
        `Warning: Low Blood Pressure (${systolic}/${diastolic} mmHg) detected. Rest, drink fluids, and avoid sudden posture changes.`,
        'Warning'
      );
    }
  }

  // 2. Heart Rate Analysis
  if (vital.heartRate !== undefined) {
    const hr = vital.heartRate;
    if (hr >= 120 || hr <= 45) {
      await createAlert(
        'Heart Rate',
        `CRITICAL: Severe abnormal heart rate (${hr} bpm) detected. If you experience chest pain, shortness of breath, or dizziness, seek medical help.`,
        'Critical'
      );
    } else if (hr > 100) {
      await createAlert(
        'Heart Rate',
        `Warning: Elevated heart rate (${hr} bpm) detected at rest (Tachycardia). Keep monitoring.`,
        'Warning'
      );
    } else if (hr < 55) {
      await createAlert(
        'Heart Rate',
        `Warning: Low heart rate (${hr} bpm) detected (Bradycardia). Normal if you are a trained athlete.`,
        'Warning'
      );
    }
  }

  // 3. Temperature Analysis
  if (vital.temperature !== undefined) {
    const temp = vital.temperature;
    const tempF = ((temp * 9) / 5 + 32).toFixed(1);
    if (temp >= 39.5) {
      await createAlert(
        'Temperature',
        `CRITICAL: High fever of ${temp}°C (${tempF}°F) detected. Please consult a doctor, rest, and keep hydrated.`,
        'Critical'
      );
    } else if (temp >= 38.0) {
      await createAlert(
        'Temperature',
        `Warning: Mild fever of ${temp}°C (${tempF}°F) detected. Monitor for symptoms of infection.`,
        'Warning'
      );
    } else if (temp < 35.0) {
      await createAlert(
        'Temperature',
        `CRITICAL: Low body temperature (${temp}°C / ${tempF}°F) detected (Hypothermia). Warm up immediately.`,
        'Critical'
      );
    }
  }

  // 4. Oxygen (SpO2) Analysis
  if (vital.spo2 !== undefined) {
    const spo2 = vital.spo2;
    if (spo2 < 90) {
      await createAlert(
        'Oxygen',
        `CRITICAL: Dangerously low blood oxygen levels (${spo2}%) detected. Seek emergency medical attention.`,
        'Critical'
      );
    } else if (spo2 < 95) {
      await createAlert(
        'Oxygen',
        `Warning: Borderline low blood oxygen levels (${spo2}%). Rest, perform deep breathing, and check again.`,
        'Warning'
      );
    }
  }

  // 5. Respiratory Rate Analysis
  if (vital.respiratoryRate !== undefined) {
    const rr = vital.respiratoryRate;
    if (rr > 24) {
      await createAlert(
        'General',
        `Warning: Elevated respiratory rate (${rr} breaths/min) detected (Tachypnea).`,
        'Warning'
      );
    } else if (rr < 10) {
      await createAlert(
        'General',
        `Warning: Slow respiratory rate (${rr} breaths/min) detected (Bradypnea).`,
        'Warning'
      );
    }
  }

  // 5.5. Blood Sugar Analysis
  if (vital.bloodSugar !== undefined) {
    const bs = vital.bloodSugar;
    const type = vital.bloodSugarType || 'Random';
    if (bs < 70) {
      await createAlert(
        'General',
        `Warning: Low blood sugar (${bs} mg/dL, ${type}) detected (Hypoglycemia). Eat fast-acting carbohydrates (juice, candy) immediately.`,
        'Warning'
      );
    } else if (type === 'Fasting') {
      if (bs >= 126) {
        await createAlert(
          'General',
          `Warning: High Fasting blood sugar (${bs} mg/dL) detected. This is in the diabetic range. Consult a physician.`,
          'Warning'
        );
      } else if (bs >= 100) {
        await createAlert(
          'General',
          `Warning: Elevated Fasting blood sugar (${bs} mg/dL) detected. This is in the pre-diabetic range. Monitor your diet.`,
          'Warning'
        );
      }
    } else { // Post-Prandial or Random
      if (bs >= 200) {
        await createAlert(
          'General',
          `Warning: High blood sugar (${bs} mg/dL, ${type}) detected. This is in the diabetic range. Consult a physician.`,
          'Warning'
        );
      } else if (bs >= 140) {
        await createAlert(
          'General',
          `Warning: Elevated blood sugar (${bs} mg/dL, ${type}) detected. This is in the pre-diabetic range.`,
          'Warning'
        );
      }
    }
  }

  // 5.6. Sleep Analysis
  if (vital.sleepHours !== undefined) {
    const sleep = vital.sleepHours;
    if (sleep < 5) {
      await createAlert(
        'General',
        `Warning: Insufficient sleep logged (${sleep} hours). Ensure you get 7-9 hours for recovery.`,
        'Warning'
      );
    }
  }

  // 5.7. Steps Analysis
  if (vital.stepsCount !== undefined && user.goals && user.goals.steps) {
    const steps = vital.stepsCount;
    const goal = user.goals.steps;
    if (steps >= goal) {
      await createAlert(
        'General',
        `Success: Step goal achieved! Logged ${steps} steps today (Goal: ${goal}). Keep moving!`,
        'Normal'
      );
    }
  }


  // 6. Trend Detection using history
  if (vitalsHistory.length >= 2) {
    // History is sorted descending (newest first). Let's take the newest 3 (vital + 2 historical)
    const recent = [vital, ...vitalsHistory.slice(0, 2)];
    
    // Check rising Systolic Blood Pressure trend
    if (recent.length === 3 &&
        recent[0].systolic && recent[1].systolic && recent[2].systolic) {
      if (recent[0].systolic > recent[1].systolic && recent[1].systolic > recent[2].systolic) {
        await createAlert(
          'Blood Pressure',
          `Trend Alert: Your systolic blood pressure has risen steadily over your last 3 logs (${recent[2].systolic} -> ${recent[1].systolic} -> ${recent[0].systolic} mmHg). Monitor stress or lifestyle factors.`,
          'Warning'
        );
      }
    }

    // Check correlation: Rising Temp + Rising HR (potential infection onset)
    if (recent[0].temperature && recent[1].temperature &&
        recent[0].heartRate && recent[1].heartRate) {
      const tempDiff = recent[0].temperature - recent[1].temperature;
      const hrDiff = recent[0].heartRate - recent[1].heartRate;
      
      if (tempDiff >= 0.5 && hrDiff >= 15 && recent[0].temperature >= 37.5) {
        await createAlert(
          'General',
          `AI Correlation: Your temperature has increased by ${tempDiff.toFixed(1)}°C and heart rate has jumped by ${hrDiff} bpm compared to your last reading. This dual spike may indicate early signs of fever or immune response.`,
          'Warning'
        );
      }
    }
  }

  return alertsCreated;
}

/**
 * Generate a comprehensive health report (Insight) for a user based on history.
 * 
 * @param {String} userId - The user ID
 * @param {Array} vitals - List of all vitals sorted ascending by date
 * @param {Array} medications - List of all medications
 */
export async function generateGeneralInsight(userId, vitals, medications) {
  if (vitals.length === 0) {
    return new Insight({
      userId,
      summary: "Insufficient health data to perform detailed analysis.",
      recommendation: "Log your blood pressure, heart rate, and temperature for at least 3 days to unlock AI Health Insights.",
      analysisType: 'On-Demand'
    });
  }

  // Calculate averages
  let totalSystolic = 0, totalDiastolic = 0, bpCount = 0;
  let totalHR = 0, hrCount = 0;
  let totalTemp = 0, tempCount = 0;
  let totalSpO2 = 0, spo2Count = 0;
  let totalSugar = 0, sugarCount = 0;
  let totalSleep = 0, sleepCount = 0;
  let totalWater = 0, waterCount = 0;
  let totalSteps = 0, stepsCount = 0;

  vitals.forEach(v => {
    if (v.systolic) { totalSystolic += v.systolic; totalDiastolic += v.diastolic; bpCount++; }
    if (v.heartRate) { totalHR += v.heartRate; hrCount++; }
    if (v.temperature) { totalTemp += v.temperature; tempCount++; }
    if (v.spo2) { totalSpO2 += v.spo2; spo2Count++; }
    if (v.bloodSugar) { totalSugar += v.bloodSugar; sugarCount++; }
    if (v.sleepHours) { totalSleep += v.sleepHours; sleepCount++; }
    if (v.waterIntake) { totalWater += v.waterIntake; waterCount++; }
    if (v.stepsCount) { totalSteps += v.stepsCount; stepsCount++; }
  });

  const avgSys = bpCount > 0 ? Math.round(totalSystolic / bpCount) : null;
  const avgDia = bpCount > 0 ? Math.round(totalDiastolic / bpCount) : null;
  const avgHR = hrCount > 0 ? Math.round(totalHR / hrCount) : null;
  const avgTemp = tempCount > 0 ? (totalTemp / tempCount).toFixed(1) : null;
  const avgSpO2 = spo2Count > 0 ? Math.round(totalSpO2 / spo2Count) : null;
  const avgSugar = sugarCount > 0 ? Math.round(totalSugar / sugarCount) : null;
  const avgSleep = sleepCount > 0 ? (totalSleep / sleepCount).toFixed(1) : null;
  const avgWater = waterCount > 0 ? Math.round(totalWater / waterCount) : null;
  const avgSteps = stepsCount > 0 ? Math.round(totalSteps / stepsCount) : null;

  // Build summary and recommendations based on averages & adherence
  let summaryParts = [];
  let recommendations = [];

  // BP Evaluation
  if (avgSys) {
    if (avgSys >= 140 || avgDia >= 90) {
      summaryParts.push(`Your average blood pressure (${avgSys}/${avgDia} mmHg) is elevated, indicating Hypertension.`);
      recommendations.push("• Limit sodium intake and engage in moderate cardiovascular exercise (like walking).");
      recommendations.push("• Closely adhere to any prescribed blood pressure medications.");
    } else if (avgSys < 90 || avgDia < 60) {
      summaryParts.push(`Your average blood pressure (${avgSys}/${avgDia} mmHg) is low, indicating Hypotension.`);
      recommendations.push("• Increase fluid intake and ensure you are eating adequate meals throughout the day.");
    } else {
      summaryParts.push(`Your average blood pressure (${avgSys}/${avgDia} mmHg) is within the healthy range.`);
      recommendations.push("• Excellent job! Maintain your current healthy balanced diet and lifestyle habits.");
    }
  }

  // Heart Rate Evaluation
  if (avgHR) {
    if (avgHR > 90) {
      summaryParts.push(`Your heart rate averages ${avgHR} bpm, which is on the higher side of normal at rest.`);
      recommendations.push("• Monitor caffeine intake and practice stress management exercises (e.g. mindfulness, deep breathing).");
    } else if (avgHR < 60) {
      summaryParts.push(`Your average resting heart rate is ${avgHR} bpm, which is athletic or bradycardic.`);
      recommendations.push("• Confirm this resting heart rate is normal for your fitness level; mention it to a doctor if you feel fatigued.");
    } else {
      summaryParts.push(`Your average resting heart rate is a healthy ${avgHR} bpm.`);
      recommendations.push("• Keep up physical activities that support cardiovascular health.");
    }
  }

  // SpO2 Evaluation
  if (avgSpO2 && avgSpO2 < 95) {
    summaryParts.push(`Your average oxygen saturation level of ${avgSpO2}% is below optimal.`);
    recommendations.push("• Practice daily breathing exercises. Seek medical evaluation if you experience persistent shortness of breath.");
  }

  // Blood Sugar Evaluation
  if (avgSugar) {
    if (avgSugar >= 140) {
      summaryParts.push(`Your average blood sugar is elevated at ${avgSugar} mg/dL.`);
      recommendations.push("• Reduce refined carbohydrate and sugar intake. Consult a physician for glucose testing.");
    } else {
      summaryParts.push(`Your average blood sugar is stable at ${avgSugar} mg/dL.`);
    }
  }

  // Sleep Evaluation
  if (avgSleep) {
    if (avgSleep < 7) {
      summaryParts.push(`Your average sleep duration is low at ${avgSleep} hours per night.`);
      recommendations.push("• Aim for a consistent bedtime and keep your bedroom cool, dark, and quiet.");
    } else {
      summaryParts.push(`Your average sleep of ${avgSleep} hours is in the healthy range.`);
    }
  }

  // Water Intake Evaluation
  if (avgWater) {
    if (avgWater < 1500) {
      summaryParts.push(`Your average daily water intake is low at ${avgWater} ml.`);
      recommendations.push("• Carry a reusable water bottle and set hourly reminders to sip water.");
    } else {
      summaryParts.push(`Your average daily hydration is great at ${avgWater} ml.`);
    }
  }

  // Steps Evaluation
  if (avgSteps) {
    if (avgSteps < 5000) {
      summaryParts.push(`Your daily steps average ${avgSteps}, suggesting a sedentary lifestyle.`);
      recommendations.push("• Aim for short, brisk walks during breaks to gradually reach your step goals.");
    } else {
      summaryParts.push(`You average ${avgSteps} steps daily, maintaining active physical habits.`);
    }
  }

  // Medication compliance check
  let medComplianceSummary = "";
  if (medications.length > 0) {
    let totalDoses = 0;
    let takenDoses = 0;
    
    medications.forEach(med => {
      med.logs.forEach(log => {
        totalDoses++;
        if (log.status === 'taken') takenDoses++;
      });
    });

    if (totalDoses > 0) {
      const rate = Math.round((takenDoses / totalDoses) * 100);
      medComplianceSummary = ` Your medication adherence rate is ${rate}% (${takenDoses}/${totalDoses} doses logged as taken).`;
      if (rate < 80) {
        recommendations.push("• Set up alarm notifications or link your daily vitals check directly with medication intake to improve compliance.");
      }
    } else {
      medComplianceSummary = " You have medications scheduled but have not logged compliance logs yet.";
      recommendations.push("• Remember to log whether you have taken or skipped your medications each day to improve AI correlation accuracy.");
    }
  } else {
    medComplianceSummary = " No active medications currently scheduled.";
    recommendations.push("• Log any medications you take regularly to activate medication-vital risk tracking.");
  }

  const finalSummary = summaryParts.join(' ') + medComplianceSummary;
  const finalRecommendation = recommendations.length > 0 
    ? recommendations.join('\n') 
    : "• Keep logging vitals consistently and stay active!";

  const insight = new Insight({
    userId,
    summary: finalSummary,
    recommendation: finalRecommendation,
    analysisType: 'On-Demand'
  });

  await insight.save();
  return insight;
}
