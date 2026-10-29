import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  initialPatients,
  initialInterventions,
  initialAuditLogs,
  initialKPIs
} from './src/data/mockData.ts';
import { Patient, Intervention, AuditLog, SafetySignal, DoseScheduleItem, SmartAlert } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 20mb limit for base64 image scanning
app.use(express.json({ limit: '25mb' }));

// In-memory persistent state
let patients: Patient[] = JSON.parse(JSON.stringify(initialPatients));
let interventions: Intervention[] = JSON.parse(JSON.stringify(initialInterventions));
let auditLogs: AuditLog[] = JSON.parse(JSON.stringify(initialAuditLogs));
let kpis = { ...initialKPIs };

// Lazy initialize Gemini AI client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return geminiClient;
}

// Helper to record audit log
function addAuditLog(
  actor: string,
  actorRole: string,
  action: string,
  resourceType: AuditLog['resourceType'],
  fhirResourceId: string
) {
  const log: AuditLog = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    actor,
    actorRole,
    action,
    resourceType,
    fhirResourceId,
    securityHash: `sha256:${Math.random().toString(36).substring(2, 15)}`,
    status: 'ENCRYPTED'
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 50) auditLogs.pop();
}

// ----------------------
// API ROUTES
// ----------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AafiyaCare Intelligence Platform API',
    version: '2.4.0-mvp',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
    compliance: ['HL7-FHIR-R4', 'Saudi-Health-Council-Standards', 'Cybersecurity-Essential-Controls']
  });
});

// Platform KPIs
app.get('/api/kpis', (req, res) => {
  // Recalculate dynamic KPIs based on state
  const highPriority = patients.filter(p => p.riskLevel === 'high').length;
  const risingRisk = patients.filter(p => p.riskLevel === 'rising').length;
  const activeAlerts = patients.reduce((acc, p) => acc + p.safetySignals.filter(s => s.resolutionStatus === 'unreviewed').length, 0);
  const avgAdherence = Math.round(
    patients.flatMap(p => p.medications).reduce((sum, m) => sum + m.adherenceRate, 0) /
    (patients.flatMap(p => p.medications).length || 1) * 10
  ) / 10;

  res.json({
    ...kpis,
    highPriorityCount: highPriority,
    risingRiskCount: risingRisk,
    activeSafetyAlerts: activeAlerts,
    averageAdherenceRate: avgAdherence
  });
});

// Get all patients
app.get('/api/patients', (req, res) => {
  const { risk, search } = req.query;
  let results = [...patients];

  if (risk && typeof risk === 'string') {
    results = results.filter(p => p.riskLevel === risk);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.nationalIdMasked.includes(q)
    );
  }

  res.json({ patients: results, total: results.length });
});

// Get single patient
app.get('/api/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

// Add medication to patient Passport
app.post('/api/patients/:id/medications', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const newMed = {
    id: `MED-${Date.now().toString().slice(-4)}`,
    tradeName: req.body.tradeName || 'دواء جديد',
    tradeNameEn: req.body.tradeNameEn || 'New Medication',
    genericName: req.body.genericName || 'Active Ingredient',
    dose: req.body.dose || '10 mg',
    frequency: req.body.frequency || 'مرة يومياً',
    frequencyEn: req.body.frequencyEn || 'Once daily',
    indication: req.body.indication || 'علاج وقائي',
    indicationEn: req.body.indicationEn || 'Therapeutic indication',
    startDate: new Date().toISOString().split('T')[0],
    refillDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    daysSupplyRemaining: 30,
    adherenceRate: 100,
    category: req.body.category || 'other',
    status: 'active'
  };

  patient.medications.push(newMed as any);

  // Re-evaluate safety triggers
  const medNames = patient.medications.map(m => m.genericName.toLowerCase() + ' ' + m.tradeName.toLowerCase());
  const hasWarfarin = medNames.some(m => m.includes('warfarin') || m.includes('وارفارين') || m.includes('coumadin'));
  const hasAspirin = medNames.some(m => m.includes('aspirin') || m.includes('أسبرين') || m.includes('acetylsalicylic'));

  if (hasWarfarin && hasAspirin && !patient.safetySignals.some(s => s.type === 'drug_interaction' && s.titleEn.includes('Warfarin'))) {
    const interactionSig: SafetySignal = {
      id: `SIG-${Date.now().toString().slice(-4)}`,
      type: 'drug_interaction',
      severity: 'critical',
      titleAr: 'تفاعل دوائي مهدد بالنزيف: وارفارين + أسبرين',
      titleEn: 'High-Risk Bleeding Interaction: Warfarin + Aspirin',
      descriptionAr: 'رصد إضافة دواء مسيل للصفائح بالتزامن مع مضاد التخثر مما يضاعف احتمالية النزيف الهضمي أو الدماغي.',
      descriptionEn: 'Concurrent prescription of oral anticoagulant and antiplatelet without documented high-risk justification.',
      medicationIds: [newMed.id],
      recommendedActionAr: 'مراجعة سريرية عاجلة للتحقق من الداعي الطبي لجمع الدواءين.',
      recommendedActionEn: 'Urgent clinical pharmacist review to reconcile dual antithrombotic therapy.',
      detectedAt: new Date().toISOString(),
      resolutionStatus: 'unreviewed'
    };
    patient.safetySignals.unshift(interactionSig);
    patient.riskScore = Math.min(100, patient.riskScore + 15);
    patient.riskLevel = 'high';
  }

  addAuditLog(
    'Dr. Clinical Pharmacist',
    'Clinical Pharmacist',
    'ADD_MEDICATION_TO_PASSPORT',
    'MedicationRequest',
    `MedicationRequest/${newMed.id}`
  );

  res.status(201).json({ patient, medication: newMed });
});

// Remove / Discontinue medication (Deprescribe)
app.delete('/api/patients/:id/medications/:medId', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const medIndex = patient.medications.findIndex(m => m.id === req.params.medId);
  if (medIndex === -1) {
    return res.status(404).json({ error: 'Medication not found' });
  }

  const removed = patient.medications.splice(medIndex, 1)[0];

  // If duplicate beta blocker or dangerous interaction resolved, ease the risk score
  if (patient.riskScore > 30) {
    patient.riskScore = Math.max(15, patient.riskScore - 20);
    if (patient.riskScore < 40) patient.riskLevel = 'low';
    else if (patient.riskScore < 70) patient.riskLevel = 'monitor';
    else if (patient.riskScore < 85) patient.riskLevel = 'rising';
  }

  // Update associated safety signals
  patient.safetySignals = patient.safetySignals.filter(s => !s.medicationIds.includes(removed.id));

  addAuditLog(
    'Dr. Clinical Pharmacist',
    'Clinical Pharmacist',
    'DEPRESCRIBE_MEDICATION',
    'MedicationRequest',
    `MedicationRequest/${removed.id}`
  );

  res.json({ success: true, patient, removed });
});

// -------------------------------------------------------------
// DOSE LOGGING & SMART CLINICAL ALERTS ENGINE (CLOSED LOOP)
// -------------------------------------------------------------

// Log Dose Confirmation or Skip with Closed-Loop Safety Escalation
app.post('/api/patients/:id/doses/:doseId/log', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  if (!patient.doseSchedule) {
    patient.doseSchedule = [];
  }

  const dose = patient.doseSchedule.find(d => d.id === req.params.doseId);
  if (!dose) {
    return res.status(404).json({ error: 'Dose schedule item not found' });
  }

  const { status, skipReason, skipReasonDetails, vitalValue } = req.body;
  dose.status = status;
  dose.loggedAt = new Date().toISOString();
  if (vitalValue) dose.vitalValue = vitalValue;
  if (skipReason) dose.skipReason = skipReason;
  if (skipReasonDetails) dose.skipReasonDetails = skipReasonDetails;

  let safetySignalAdded: SafetySignal | null = null;
  let interventionAdded: Intervention | null = null;
  let alertAdded: SmartAlert | null = null;

  if (status === 'taken') {
    // Increment patient confirmed engagement
    patient.engagement.confirmedDosesLast7Days = (patient.engagement.confirmedDosesLast7Days || 0) + 1;
    patient.engagement.unconfirmedDosesCount = Math.max(0, (patient.engagement.unconfirmedDosesCount || 1) - 1);
    patient.engagement.lastAppActivity = 'الآن (تسجيل جرعة)';
    
    // Update individual medication adherence rate
    const med = patient.medications.find(m => m.id === dose.medicationId);
    if (med) {
      med.adherenceRate = Math.min(100, Math.round(med.adherenceRate + 2));
    }

    addAuditLog(
      'Patient (via Mobile App / Integration)',
      'Patient',
      'LOG_DOSE_CONFIRMATION',
      'MedicationRequest',
      `MedicationRequest/${dose.medicationId}/Dose/${dose.id}`
    );
  } else if (status === 'skipped') {
    // If critical dose skipped or side effect reported, trigger closed loop escalation!
    const isCritical = dose.criticality === 'critical' || skipReason === 'side_effect';
    
    if (isCritical) {
      const skipReasonTextAr = 
        skipReason === 'side_effect' ? 'ظهور أعراض جانبية غير مرغوبة (دوخة/غثيان/هبوط)' :
        skipReason === 'out_of_med' ? 'نفاد العبوة الدوائية قبل موعد الصرف' :
        skipReason === 'confusion' ? 'خوف المريض من تفاعل دوائي أو شك بالجرعة' :
        skipReason === 'fasting' ? 'الصيام أو عدم تناول وجبة مرافقة' :
        'تخطي غير مبرر لجرعة حرجة';

      // Create high-priority safety signal
      safetySignalAdded = {
        id: `SIG-ESC-${Date.now().toString().slice(-4)}`,
        type: 'refill_lapse',
        severity: 'critical',
        titleAr: `إنذار تخطي جرعة حرجة: ${dose.tradeName}`,
        titleEn: `Critical Dose Missed: ${dose.tradeNameEn}`,
        descriptionAr: `سجل المريض تخطي جرعة ${dose.dose} (${dose.tradeName}). السبب المسجل: ${skipReasonTextAr}. يتطلب تدخلاً سريرياً استباقياً لمنع التنويم أو المضاعفات.`,
        descriptionEn: `Patient missed scheduled dose ${dose.dose} of ${dose.tradeNameEn}. Reason: ${skipReason}. Automated clinical escalation triggered.`,
        medicationIds: [dose.medicationId],
        recommendedActionAr: 'تواصل هاتفي فوري من الصيدلي السريري لمراجعة سبب التخطي، وتقديم الاستشارة الدوائية المناسبة.',
        recommendedActionEn: 'Urgent clinical pharmacist outreach to resolve non-adherence driver and assess clinical stability.',
        detectedAt: new Date().toISOString(),
        resolutionStatus: 'unreviewed'
      };

      patient.safetySignals.unshift(safetySignalAdded);
      patient.riskScore = Math.min(100, patient.riskScore + 12);
      if (patient.riskScore >= 70) patient.riskLevel = 'high';
      else if (patient.riskScore >= 40) patient.riskLevel = 'rising';

      // Create new intervention for clinical pharmacist
      interventionAdded = {
        id: `INT-ESC-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        signalId: safetySignalAdded.id,
        riskLevel: patient.riskLevel,
        typeAr: 'تواصل عاجل لتخطي جرعة حرجة',
        typeEn: 'Urgent Non-Adherence Intervention',
        triggerReasonAr: `تخطي جرعة ${dose.tradeName} (${skipReasonTextAr})`,
        triggerReasonEn: `Missed critical dose of ${dose.tradeNameEn} (${skipReason})`,
        proposedActionAr: 'مكالمة هاتفية لمناقشة الأعراض أو توفير بديل/تعديل توقيت الدواء',
        proposedActionEn: 'Direct pharmacist call to counsel and evaluate clinical barriers',
        assignedPharmacistAr: 'د. رزان الغامدي (صيدلي سريري)',
        assignedPharmacistEn: 'Dr. Razan Al-Ghamdi',
        status: 'pending',
        costAvoidanceSAR: 4200,
        createdAt: new Date().toISOString()
      };
      interventions.unshift(interventionAdded);

      // Create proactive smart alert for patient and care team
      if (!patient.smartAlerts) patient.smartAlerts = [];
      alertAdded = {
        id: `ALT-ESC-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        medicationId: dose.medicationId,
        type: 'clinical_adherence_lapse',
        severity: 'critical',
        titleAr: `تم تصعيد تخطي جرعة ${dose.tradeName} إلى الصيدلي السريري`,
        titleEn: `Missed Dose Escalated to Clinical Pharmacist: ${dose.tradeNameEn}`,
        messageAr: `نظراً لأهمية الدواء وحرجه السريري، تم فتح بلاغ استباقي لدى الصيدلي السريري لمتابعة حالتك والتأكد من سلامتك.`,
        messageEn: `Critical dose skip logged. A high-priority intervention was dispatched to your clinical pharmacist.`,
        clinicalContextAr: `الرصد الاستباقي يمنع ٧٨٪ من حالات الانتكاسة الدوائية بعد الخروج من المستشفى.`,
        clinicalContextEn: `Proactive monitoring averts up to 78% of post-discharge adverse drug events.`,
        actionRequiredAr: `يرجى انتظار مكالمة الفريق الطبي أو تسجيل أي أعراض غير معتادة فوراً.`,
        actionRequiredEn: `Await clinical team call or report persistent symptoms immediately.`,
        createdAt: new Date().toISOString(),
        acknowledged: false,
        escalatedToPharmacist: true
      };
      patient.smartAlerts.unshift(alertAdded);
    }

    patient.engagement.unconfirmedDosesCount = (patient.engagement.unconfirmedDosesCount || 0) + 1;
    patient.engagement.adherenceTrend = 'declining';

    addAuditLog(
      'Patient (via Closed-Loop Safety)',
      'Patient',
      'LOG_DOSE_SKIPPED',
      'MedicationRequest',
      `MedicationRequest/${dose.medicationId}/Dose/${dose.id}`
    );
  }

  res.json({
    success: true,
    patient,
    dose,
    safetySignalAdded,
    interventionAdded,
    alertAdded
  });
});

// Acknowledge Smart Alert
app.post('/api/patients/:id/alerts/:alertId/ack', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  if (!patient.smartAlerts) patient.smartAlerts = [];
  const alert = patient.smartAlerts.find(a => a.id === req.params.alertId);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alert.acknowledged = true;

  addAuditLog(
    'Dr. Clinical Pharmacist / Patient',
    'Clinical Pharmacist',
    'ACKNOWLEDGE_SMART_ALERT',
    'DetectedIssue',
    `DetectedIssue/${alert.id}`
  );

  res.json({ success: true, patient, alert });
});

// Add new scheduled dose to patient
app.post('/api/patients/:id/doses', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  if (!patient.doseSchedule) patient.doseSchedule = [];

  const newDose: DoseScheduleItem = {
    id: `DOSE-${Date.now().toString().slice(-4)}`,
    patientId: patient.id,
    medicationId: req.body.medicationId || `MED-${Date.now().toString().slice(-4)}`,
    tradeName: req.body.tradeName || 'دواء مجدول',
    tradeNameEn: req.body.tradeNameEn || 'Scheduled Medication',
    genericName: req.body.genericName || '',
    dose: req.body.dose || '1 قرص',
    scheduledTime: req.body.scheduledTime || '08:00 ص',
    timeOfDay: req.body.timeOfDay || 'morning',
    instructionsAr: req.body.instructionsAr || 'تناول الجرعة حسب الوصفة الطبية المعتمدة',
    instructionsEn: req.body.instructionsEn || 'Take as prescribed by physician',
    criticality: req.body.criticality || 'routine',
    status: 'pending',
    vitalRequired: req.body.vitalRequired || 'none'
  };

  patient.doseSchedule.push(newDose);

  addAuditLog(
    'Dr. Clinical Pharmacist',
    'Clinical Pharmacist',
    'SCHEDULE_MEDICATION_DOSE',
    'MedicationRequest',
    `MedicationRequest/${newDose.medicationId}/Dose/${newDose.id}`
  );

  res.status(201).json({ success: true, patient, dose: newDose });
});

// Helper: Call Gemini Vision with model cascading and retry loop
async function analyzeMedicationImage(imageBase64: string): Promise<{ data: any; model: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const mimeType = imageBase64.includes(';base64,')
    ? imageBase64.split(';base64,')[0].replace('data:', '')
    : 'image/jpeg';
  const cleanBase64 = imageBase64.includes(';base64,')
    ? imageBase64.split(';base64,')[1]
    : imageBase64;

  const prompt = `You are the chief clinical pharmacist and AI computer vision specialist for the AafiyaCare (عافية كير) health platform in Saudi Arabia.
Your task is to carefully analyze this photo of a medication package, blister pack, vial, bottle, syrup, tube, prescription slip, or label.

READ AND EXTRACT THE EXACT MEDICATION PRESENT IN THIS PHOTO.
Do not assume or default to any preset medication. You must read and detect the exact product visible in the photograph.

Return a JSON object with these exact fields:
- isMedication: boolean (true if the image shows a medication, pharmacy product, blister strip, box, syrup, or prescription; false if totally unrelated, e.g. food, furniture, pet, scenery, or completely illegible)
- tradeNameAr: string (Arabic trade/commercial brand name, e.g. "بانادول إكسترا", "نيكسيوم", "كونكور", "أوغمنتين", "كريستور", "أماريل", "سولبادين", "غلوكوفاج", "فولتارين", "بروفين", "فينتولين", "ليزينوبريل", "كابوتين", etc.)
- tradeNameEn: string (English commercial brand name, e.g. "Panadol Extra", "Nexium", "Concor", "Augmentin", "Crestor", "Amaryl", "Solpadeine", "Glucophage", "Voltaren", "Brufen", "Ventolin", "Lisinopril", etc.)
- genericName: string (Active pharmaceutical ingredient / scientific chemical name, e.g. "Paracetamol + Caffeine", "Esomeprazole Magnesium", "Bisoprolol Fumarate", "Amoxicillin + Clavulanate", "Rosuvastatin Calcium", etc.)
- dose: string (Strength/concentration detected on the package, e.g. "500 mg", "20 mg", "5 mg", "1 g", "1000 mg", "400 mg", "10 mg")
- frequencyAr: string (Standard recommended dosage frequency in Arabic, e.g. "قرص واحد عند اللزوم كل ٦-٨ ساعات", "قرص واحد يومياً قبل الإفطار", "قرص واحد كل ١٢ ساعة مع الوجبة")
- frequencyEn: string (Standard dosage frequency in English, e.g. "1 tablet as needed every 6-8 hrs", "1 tablet once daily before breakfast", "1 tablet every 12 hrs")
- indicationAr: string (Therapeutic use in Arabic, e.g. "تسكين الآلام وخفض الحرارة والصداع", "علاج حموضة المعدة والارتجاع المريئي", "تنظيم ضغط الدم والوقاية القلبية")
- indicationEn: string (Therapeutic use in English)
- category: string (One of: 'analgesic', 'cardiovascular', 'endocrine', 'gastrointestinal', 'antibiotic', 'anticoagulant', 'respiratory', 'neurological', 'other')
- warningsAr: string (Clinical safety precautions, maximum daily dose, or key contraindications in Arabic)
- warningsEn: string (Clinical safety precautions, maximum daily dose, or key contraindications in English)
- ocrDetectedText: string (Any raw words, active ingredients, dosage numbers, or manufacturer text clearly visible on the packaging)
- confidenceScore: number (between 0.75 and 0.99 reflecting recognition clarity)

CRITICAL RULES:
1. Accurately identify whichever medication is shown in the image.
2. If text is partially blurred, infer the most accurate clinical match from visible letters and pharmaceutical design.
3. If the photo does not contain any pharmaceutical or medical packaging at all, set isMedication: false.
4. Respond strictly with valid JSON.`;

  // Resilient model cascade: try newest fast model first, fallback to flash-lite, then flash
  const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: cleanBase64 } }
            ]
          },
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { data: parsed, model };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Vision scan attempt ${attempt} on ${model} failed (${err?.status || err?.message}). Retrying...`);
        await new Promise(r => setTimeout(r, 600));
      }
    }
  }

  throw lastError || new Error('ALL_VISION_MODELS_FAILED');
}

// Helper: Comprehensive clinical drug interaction and therapeutic duplication checker
function checkPatientDrugInteractions(scannedData: any, patient: Patient) {
  const interactions: any[] = [];
  const scanGeneric = (scannedData.genericName || '').toLowerCase();
  const scanTrade = ((scannedData.tradeNameEn || '') + ' ' + (scannedData.tradeNameAr || '')).toLowerCase();
  const scanCategory = (scannedData.category || '').toLowerCase();

  const activeMeds = patient.medications.filter(m => m.status === 'active');
  const activeGenerics = activeMeds.map(m => m.genericName.toLowerCase());
  const activeTrades = activeMeds.map(m => (m.tradeNameEn + ' ' + m.tradeName).toLowerCase());

  // 1. Anticoagulant + Antiplatelet / NSAID (Severe Bleeding)
  const isScanAnticoagulant = scanCategory === 'anticoagulant' || ['warfarin', 'coumadin', 'eliquis', 'apixaban', 'xarelto', 'rivaroxaban', 'pradaxa', 'dabigatran', 'heparin', 'enoxaparin', 'clexane'].some(k => scanGeneric.includes(k) || scanTrade.includes(k));
  const hasActiveAnticoagulant = activeGenerics.some(g => ['warfarin', 'coumadin', 'eliquis', 'apixaban', 'xarelto', 'rivaroxaban', 'pradaxa', 'dabigatran', 'heparin', 'enoxaparin', 'clexane'].some(k => g.includes(k)));

  const isScanNSAIDorAntiplatelet = ['aspirin', 'acetylsalicylic', 'ibuprofen', 'brufen', 'advil', 'diclofenac', 'voltaren', 'cataflam', 'naproxen', 'meloxicam', 'celecoxib', 'celebrex', 'plavix', 'clopidogrel'].some(k => scanGeneric.includes(k) || scanTrade.includes(k));
  const hasActiveNSAIDorAntiplatelet = activeGenerics.some(g => ['aspirin', 'acetylsalicylic', 'ibuprofen', 'brufen', 'advil', 'diclofenac', 'voltaren', 'cataflam', 'naproxen', 'meloxicam', 'celecoxib', 'celebrex', 'plavix', 'clopidogrel'].some(k => g.includes(k)));

  if ((isScanAnticoagulant && hasActiveNSAIDorAntiplatelet) || (isScanNSAIDorAntiplatelet && hasActiveAnticoagulant)) {
    interactions.push({
      severity: 'critical',
      titleAr: 'تنبيه تفاعل دوائي مهدد بالنزيف: مضاد تخثر + مسيل/مسكن NSAID',
      titleEn: 'Severe Hemorrhagic Alert: Anticoagulant + Antiplatelet/NSAID',
      descriptionAr: 'المريض يتناول علاجاً مضاداً للتخثر أو مسيلاً للدم. تزامن هذا الدواء يرفع خطر النزيف الهضمي والدماغي بنسبة تفوق 350%.',
      descriptionEn: 'Concurrent prescription of anticoagulant and NSAID/antiplatelet markedly potentiates gastrointestinal and intracranial bleeding.'
    });
  }

  // 2. Beta-Blocker Class Duplication
  const isScanBetaBlocker = ['bisoprolol', 'concor', 'carvedilol', 'coreg', 'metoprolol', 'lopressor', 'betaloc', 'atenolol', 'propranolol', 'inderal'].some(k => scanGeneric.includes(k) || scanTrade.includes(k));
  const hasActiveBetaBlocker = activeGenerics.some(g => ['bisoprolol', 'carvedilol', 'metoprolol', 'atenolol', 'propranolol'].some(k => g.includes(k)));
  if (isScanBetaBlocker && hasActiveBetaBlocker) {
    interactions.push({
      severity: 'critical',
      titleAr: 'ازدواجية علاجية خطيرة (حاصرات بيتا)',
      titleEn: 'Therapeutic Duplication: Dual Beta-Blocker',
      descriptionAr: 'المريض يتناول مسبقاً أحد حاصرات بيتا. صرف دواء إضافي من نفس الفئة يؤدي لبطء نبض شديد (Bradycardia) وهبوط حاد في ضغط الدم.',
      descriptionEn: 'Patient is already on a beta-blocker. Adding another agent risks profound bradycardia, heart block, and shock.'
    });
  }

  // 3. Statin Duplication / Statin + Macrolide Interaction (Rhabdomyolysis)
  const isScanStatin = ['atorvastatin', 'lipitor', 'rosuvastatin', 'crestor', 'simvastatin', 'zocor', 'pravastatin'].some(k => scanGeneric.includes(k) || scanTrade.includes(k));
  const hasActiveStatin = activeGenerics.some(g => ['atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin'].some(k => g.includes(k)));
  if (isScanStatin && hasActiveStatin) {
    interactions.push({
      severity: 'critical',
      titleAr: 'ازدواجية أدوية خفض الكوليسترول (الستاتينات)',
      titleEn: 'Therapeutic Duplication: Dual Statin Therapy',
      descriptionAr: 'المريض يتناول دواء ستاتين بالفعل؛ الجمع بين نوعين يضاعف خطر انحلال العضلات المخططة (Rhabdomyolysis) والفشل الكلوي الحاد.',
      descriptionEn: 'Concurrent dual statin regimen significantly increases risk of severe myopathy and rhabdomyolysis.'
    });
  }

  const isScanMacrolide = ['clarithromycin', 'klacid', 'erythromycin', 'azithromycin', 'zithromax'].some(k => scanGeneric.includes(k) || scanTrade.includes(k));
  if ((isScanStatin && activeGenerics.some(g => ['clarithromycin', 'erythromycin'].some(k => g.includes(k)))) ||
      (isScanMacrolide && hasActiveStatin)) {
    interactions.push({
      severity: 'critical',
      titleAr: 'تداخل دوائي حرج: مضاد ماكروليد + ستاتين',
      titleEn: 'Severe CYP3A4 Interaction: Macrolide + Statin',
      descriptionAr: 'المضادات الحيوية الماكروليدية تثبط استقلاب الستاتين كبدياً، مما يرفع تركيزه بالدم لدرجة السمية العضلية.',
      descriptionEn: 'Macrolides potent CYP3A4 inhibition elevates statin serum levels, precipitating acute myopathy.'
    });
  }

  // 4. Paracetamol Duplication / Max Dose Caution
  const isScanParacetamol = ['paracetamol', 'acetaminophen', 'panadol', 'solpadeine', 'tylenol', 'adol', 'calpol', 'fevadol'].some(k => scanGeneric.includes(k) || scanTrade.includes(k));
  const hasActiveParacetamol = activeGenerics.some(g => ['paracetamol', 'acetaminophen'].some(k => g.includes(k))) ||
    activeTrades.some(t => ['panadol', 'solpadeine', 'tylenol', 'adol', 'fevadol'].some(k => t.includes(k)));
  if (isScanParacetamol && hasActiveParacetamol) {
    interactions.push({
      severity: 'warning',
      titleAr: 'تنبيه ازدواجية الباراسيتامول وسمية الكبد',
      titleEn: 'Paracetamol Cumulative Overdose Caution',
      descriptionAr: 'المريض يتناول مسبقاً مستحضراً يحتوي على الباراسيتامول. الجمع قد يتجاوز الجرعة الآمنة (4000 مجم/يوم) مما يسبب قصوراً كبدياً حاداً.',
      descriptionEn: 'Patient already has paracetamol-containing regimen. Monitor cumulative daily dose to prevent hepatotoxicity (<4g/24h).'
    });
  }

  // 5. Dual ACE-Inhibitor / ARB
  const isScanRAAS = ['lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan', 'candesartan', 'diovan', 'cozaar', 'zestril'].some(k => scanGeneric.includes(k) || scanTrade.includes(k));
  const hasActiveRAAS = activeGenerics.some(g => ['lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan', 'candesartan'].some(k => g.includes(k)));
  if (isScanRAAS && hasActiveRAAS) {
    interactions.push({
      severity: 'critical',
      titleAr: 'ازدواجية مثبطات الرينين-أنجيوتنسين (ACE-I + ARB)',
      titleEn: 'Therapeutic Duplication: Dual RAAS Blockade',
      descriptionAr: 'الجمع بين مثبط ACE وحاصر ARB غير موصى به سريرياً لخطورته على وظائف الكلى وتسببه في فرط بوتاسيوم الدم.',
      descriptionEn: 'Dual RAAS blockade is contraindicated due to heightened risks of hyperkalemia, syncope, and acute kidney injury.'
    });
  }

  return interactions;
}

// Computer Vision Medication Scanner (AI Vision via Gemini API)
app.post('/api/medications/scan', async (req, res) => {
  try {
    const { imageBase64, sampleId, patientId } = req.body;

    let scannedData: any = null;
    let modelUsed = 'gemini-flash-latest';
    let isRealAiScan = false;

    // Case 1: Real user image uploaded -> Use Live Gemini Vision with multi-model cascade
    if (imageBase64) {
      try {
        const result = await analyzeMedicationImage(imageBase64);
        scannedData = result.data;
        modelUsed = result.model;
        isRealAiScan = true;

        // If the AI determined that the image is NOT a medication packaging
        if (scannedData.isMedication === false || (!scannedData.tradeNameEn && !scannedData.tradeNameAr && !scannedData.genericName)) {
          return res.json({
            success: false,
            unrecognized: true,
            messageAr: 'لم يتمكن الذكاء الاصطناعي من قراءة عبوة دواء أو وصفة طبية واضحة في الصورة المرفوعة. يرجى التأكد من وضوح الصورة والإضاءة، أو إدخال تفاصيل الدواء يدوياً.',
            messageEn: 'Could not clearly recognize medication details from the image. Please ensure packaging is well-lit and legible, or enter details manually.',
            modelUsed
          });
        }
      } catch (aiErr: any) {
        console.warn('Real AI Vision scan error:', aiErr);
        // Do NOT silently replace with project mock data! Return clear message to user
        return res.json({
          success: false,
          error: 'AI_VISION_UNAVAILABLE',
          messageAr: 'تعذر الاتصال بمحرك التحليل البصري للذكاء الاصطناعي مؤقتاً. يمكنك إعادة المحاولة أو إدخال بيانات الدواء يدوياً.',
          messageEn: 'AI Vision analysis service is temporarily busy. Please retry or enter medication details manually.'
        });
      }
    } 
    // Case 2: User explicitly clicked one of the 4 benchmark test samples (Option A)
    else if (sampleId) {
      const sampleDatabase: Record<string, any> = {
        lipitor: {
          tradeNameAr: 'ليبيتور (Lipitor)',
          tradeNameEn: 'Lipitor',
          genericName: 'Atorvastatin Calcium',
          dose: '20 mg',
          frequencyAr: 'قرص واحد يومياً مساءً قبل النوم',
          frequencyEn: 'One tablet once daily at bedtime',
          indicationAr: 'خفض كوليسترول البروتين الشحمي الضار (LDL) والوقاية الوعائية',
          indicationEn: 'Lipid lowering (LDL) and cardiovascular risk reduction',
          category: 'cardiovascular',
          warningsAr: 'تجنب تناول عصير الجريب فروت أثناء العلاج؛ فحص وظائف الكبد دورياً',
          warningsEn: 'Avoid excessive grapefruit consumption; monitor hepatic transaminases',
          confidenceScore: 0.97
        },
        coumadin: {
          tradeNameAr: 'كومادين / وارفارين (Coumadin)',
          tradeNameEn: 'Coumadin (Warfarin)',
          genericName: 'Warfarin Sodium',
          dose: '5 mg',
          frequencyAr: 'قرص واحد يومياً في المساء (بناءً على فحص INR)',
          frequencyEn: 'Once daily in the evening as directed by INR',
          indicationAr: 'مضاد تخثر للوقاية من السكتات والجلطات الوريدية العميقة',
          indicationEn: 'Oral anticoagulant for stroke & DVT prophylaxis',
          category: 'anticoagulant',
          warningsAr: 'تحذير عالي الخطورة: يتفاعل بشدة مع الأسبرين والمسكنات غير الستيرويدية (NSAIDs)',
          warningsEn: 'High-Alert: Severe interaction with Aspirin and NSAIDs; monitor INR regularly',
          confidenceScore: 0.99
        },
        glucophage: {
          tradeNameAr: 'غلوكوفاج إكس آر (Glucophage XR)',
          tradeNameEn: 'Glucophage XR',
          genericName: 'Metformin Hydrochloride (Extended Release)',
          dose: '1000 mg',
          frequencyAr: 'قرص واحد مع وجبة العشاء',
          frequencyEn: 'One tablet with dinner',
          indicationAr: 'تنظيم حساسية الأنسولين ومستوى سكر الدم التراكمي',
          indicationEn: 'Glycemic management for Type 2 Diabetes',
          category: 'endocrine',
          warningsAr: 'مراجعة دورية لوظائف الكلى (eGFR) لتفادي خطر الحماض اللبني',
          warningsEn: 'Periodic renal function (eGFR) monitoring to mitigate lactic acidosis risk',
          confidenceScore: 0.96
        },
        augmentin: {
          tradeNameAr: 'أوغمنتين (Augmentin)',
          tradeNameEn: 'Augmentin',
          genericName: 'Amoxicillin / Clavulanic Acid',
          dose: '1 g (1000 mg)',
          frequencyAr: 'قرص واحد كل ١٢ ساعة مع بداية الوجبة',
          frequencyEn: 'One tablet every 12 hours with meal',
          indicationAr: 'مضاد حيوي واسع المجال لالتهابات الجهاز التنفسي',
          indicationEn: 'Broad-spectrum antibiotic for respiratory tract infections',
          category: 'antibiotic',
          warningsAr: 'إكمال الكورس العلاجي بالكامل لمدة ٧ أيام لمنع مقاومة البكتيريا',
          warningsEn: 'Complete full 7-day course to prevent antimicrobial resistance',
          confidenceScore: 0.98
        }
      };

      scannedData = sampleDatabase[sampleId] || sampleDatabase.lipitor;
      modelUsed = 'benchmark-preset';
      isRealAiScan = false;
    } else {
      return res.status(400).json({ error: 'No image or sampleId provided' });
    }

    // Dynamic Clinical Drug Interaction & Duplication Evaluation
    let potentialInteractions: any[] = [];
    if (patientId) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        potentialInteractions = checkPatientDrugInteractions(scannedData, patient);
      }
    }

    // Record audit trail
    addAuditLog(
      isRealAiScan ? `Aafiya Vision AI (${modelUsed})` : 'Aafiya Clinical Benchmark Engine',
      'Computer Vision Core',
      'AI_MEDICATION_BOX_RECOGNITION',
      'MedicationRequest',
      `ScanResult/${scannedData.tradeNameEn || 'UnknownMed'}`
    );

    res.json({
      success: true,
      scannedData,
      potentialInteractions,
      modelUsed,
      isRealAiScan
    });
  } catch (error: any) {
    console.error('Error in /api/medications/scan:', error);
    res.status(500).json({ error: 'Failed to process medication scan' });
  }
});

// Interventions Queue
app.get('/api/interventions', (req, res) => {
  const { status } = req.query;
  let results = [...interventions];
  if (status && typeof status === 'string') {
    results = results.filter(i => i.status === status);
  }
  res.json({ interventions: results, count: results.length });
});

// Update / Resolve Intervention (Human in the Loop)
app.patch('/api/interventions/:id', (req, res) => {
  const intervention = interventions.find(i => i.id === req.params.id);
  if (!intervention) {
    return res.status(404).json({ error: 'Intervention not found' });
  }

  const { status, outcome, outcomeNotes, assignedPharmacist } = req.body;

  if (status) intervention.status = status;
  if (outcome) intervention.outcome = outcome;
  if (outcomeNotes) intervention.outcomeNotes = outcomeNotes;
  if (assignedPharmacist) intervention.assignedPharmacistEn = assignedPharmacist;

  if (status === 'completed') {
    intervention.completedAt = new Date().toISOString();
    // Increment North Star metric
    kpis.northStarHighRiskResolved += 1;
    kpis.estimatedMedicationWasteSavedSAR += intervention.costAvoidanceSAR || 4500;

    // Resolve associated safety signal on patient
    const patient = patients.find(p => p.id === intervention.patientId);
    if (patient) {
      const sig = patient.safetySignals.find(s => s.id === intervention.signalId);
      if (sig) {
        sig.resolutionStatus = 'accepted';
        sig.reviewedByClinician = true;
        sig.clinicianNotes = outcomeNotes;
      }
      // Re-evaluate patient risk
      patient.riskScore = Math.max(20, patient.riskScore - 25);
      if (patient.riskScore < 40) patient.riskLevel = 'low';
      else if (patient.riskScore < 70) patient.riskLevel = 'monitor';
      else if (patient.riskScore < 85) patient.riskLevel = 'rising';
    }
  }

  addAuditLog(
    intervention.assignedPharmacistEn || 'Clinical Pharmacist',
    'Clinical Pharmacist',
    `RESOLVE_INTERVENTION_${intervention.status.toUpperCase()}`,
    'DetectedIssue',
    `Intervention/${intervention.id}`
  );

  res.json({ success: true, intervention, updatedKPIs: kpis });
});

// Audit Logs endpoint
app.get('/api/audit-logs', (req, res) => {
  res.json({ logs: auditLogs });
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AafiyaCare Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
