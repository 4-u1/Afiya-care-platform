export type Language = 'ar' | 'en';

export type RiskLevel = 'low' | 'monitor' | 'rising' | 'high';

export interface Medication {
  id: string;
  tradeName: string;
  tradeNameEn: string;
  genericName: string;
  dose: string;
  frequency: string;
  frequencyEn: string;
  indication: string;
  indicationEn: string;
  startDate: string;
  refillDueDate: string;
  daysSupplyRemaining: number;
  adherenceRate: number; // percentage, e.g. 88
  category: 'cardiovascular' | 'endocrine' | 'anticoagulant' | 'antibiotic' | 'analgesic' | 'respiratory' | 'other';
  imageUri?: string;
  pillsRemaining?: number;
  status: 'active' | 'pending_review' | 'discontinued';
}

export interface SafetySignal {
  id: string;
  type: 'drug_interaction' | 'duplicate_therapy' | 'dosage_anomaly' | 'contraindication' | 'refill_lapse';
  severity: 'critical' | 'warning' | 'info';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  medicationIds: string[];
  recommendedActionAr: string;
  recommendedActionEn: string;
  detectedAt: string;
  reviewedByClinician?: boolean;
  resolutionStatus?: 'unreviewed' | 'accepted' | 'overridden' | 'modified';
  clinicianNotes?: string;
}

export interface CareJourney {
  hospitalNameAr: string;
  hospitalNameEn: string;
  dischargeDate: string;
  primaryDiagnosisAr: string;
  primaryDiagnosisEn: string;
  nextFollowUpDate: string;
  followUpStatus: 'scheduled' | 'missed' | 'completed';
  erVisitsLast90Days: number;
  dischargePrescriptionReconciled: boolean;
}

export interface PatientEngagement {
  lastAppActivity: string;
  confirmedDosesLast7Days: number;
  scheduledDosesLast7Days: number;
  unconfirmedDosesCount: number;
  adherenceTrend: 'improving' | 'stable' | 'declining';
  helpRequestsCount: number;
  smartPillboxConnected: boolean;
}

export type DoseStatus = 'taken' | 'skipped' | 'delayed' | 'pending';

export type SkipReason = 
  | 'side_effect'        // أعراض جانبية: دوخة، غثيان، هبوط
  | 'fasting'            // صيام أو عدم الأكل
  | 'forgot'             // نسيان أو خارج المنزل
  | 'out_of_med'         // نفاد العبوة الدوائية
  | 'confusion'          // شك في الجرعة أو خوف من التفاعل
  | 'physician_hold'     // توجيه مؤقت من الطبيب
  | 'other';             // سبب آخر

export interface DoseScheduleItem {
  id: string;
  patientId: string;
  medicationId: string;
  tradeName: string;
  tradeNameEn: string;
  genericName: string;
  dose: string;
  scheduledTime: string; // e.g. "08:00 AM" / "08:00 ص"
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'bedtime';
  instructionsAr: string;
  instructionsEn: string;
  criticality: 'critical' | 'moderate' | 'routine';
  status: DoseStatus;
  loggedAt?: string;
  skipReason?: SkipReason;
  skipReasonDetails?: string;
  vitalRequired?: 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'none';
  vitalValue?: string;
}

export interface SmartAlert {
  id: string;
  patientId: string;
  medicationId?: string;
  type: 'refill_prediction' | 'vital_check' | 'clinical_adherence_lapse' | 'food_interaction' | 'side_effect_triage';
  severity: 'critical' | 'warning' | 'info';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  clinicalContextAr: string;
  clinicalContextEn: string;
  actionRequiredAr: string;
  actionRequiredEn: string;
  createdAt: string;
  acknowledged: boolean;
  escalatedToPharmacist: boolean;
}

export interface Patient {
  id: string;
  nationalIdMasked: string;
  mrn: string; // Medical Record Number
  nameAr: string;
  nameEn: string;
  age: number;
  gender: 'male' | 'female';
  healthCluster: string; // e.g. "تجمع الرياض الصحي الأول"
  healthClusterEn: string;
  chronicConditionsAr: string[];
  chronicConditionsEn: string[];
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskDriversAr: string[];
  riskDriversEn: string[];
  medications: Medication[];
  safetySignals: SafetySignal[];
  careJourney: CareJourney;
  engagement: PatientEngagement;
  lastTriageDate: string;
  doseSchedule?: DoseScheduleItem[];
  smartAlerts?: SmartAlert[];
}

export interface Intervention {
  id: string;
  patientId: string;
  patientNameAr: string;
  patientNameEn: string;
  signalId: string;
  riskLevel: RiskLevel;
  typeAr: string;
  typeEn: string;
  triggerReasonAr: string;
  triggerReasonEn: string;
  proposedActionAr: string;
  proposedActionEn: string;
  assignedPharmacistAr: string;
  assignedPharmacistEn: string;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  outcome?: 'dose_adjusted' | 'drug_swapped' | 'adherence_counseling' | 'refill_authorized' | 'physician_escalated';
  outcomeNotes?: string;
  costAvoidanceSAR: number;
  createdAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  resourceType: 'Patient' | 'MedicationRequest' | 'RiskAssessment' | 'DetectedIssue';
  fhirResourceId: string;
  securityHash: string;
  status: 'SUCCESS' | 'ENCRYPTED' | 'FLAGGED';
}

export interface PlatformKPIs {
  northStarHighRiskResolved: number;
  totalActiveMonitored: number;
  highPriorityCount: number;
  risingRiskCount: number;
  activeSafetyAlerts: number;
  averageAdherenceRate: number;
  estimatedMedicationWasteSavedSAR: number;
  alertFatigueReductionPercent: number;
  humanInTheLoopResolutionRate: number;
}
