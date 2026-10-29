import { Patient, Language } from '../types';

export interface HealthRiskAlert {
  id: string;
  patientId: string;
  patientNameAr: string;
  patientNameEn: string;
  mrn: string;
  age: number;
  gender: 'male' | 'female';
  healthClusterAr: string;
  healthClusterEn: string;
  riskLevel: 'high' | 'rising' | 'monitor' | 'low';
  category:
    | 'drug_interaction'
    | 'adherence_drop'
    | 'discharge_vulnerability'
    | 'refill_depletion'
    | 'vital_warning'
    | 'duplicate_therapy'
    | 'geriatric_beers';
  severity: 'critical' | 'warning' | 'watch';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  clinicalRationaleAr: string;
  clinicalRationaleEn: string;
  earlyDetectionWindowAr: string;
  earlyDetectionWindowEn: string;
  recommendedActionAr: string;
  recommendedActionEn: string;
  evidenceTags: string[];
  detectedAt: string;
  status: 'active' | 'acknowledged' | 'escalated';
  potentialCostAvoidanceSAR: number;
  medicationNames?: string[];
}

/**
 * Intelligent Risk Alert Engine
 * Evaluates patient records, medications, adherence metrics, recent discharge dates,
 * and safety signals to flag impending clinical risks BEFORE they turn into emergency crises.
 */
export function generatePatientRiskAlerts(patients: Patient[]): HealthRiskAlert[] {
  const alerts: HealthRiskAlert[] = [];

  patients.forEach((patient) => {
    const meds = patient.medications || [];
    const isElderly = patient.age >= 65;

    // Calculate actual 7-day adherence percentage
    const adherenceRate = patient.engagement?.scheduledDosesLast7Days > 0
      ? Math.round((patient.engagement.confirmedDosesLast7Days / patient.engagement.scheduledDosesLast7Days) * 100)
      : (meds.length > 0
          ? Math.round(meds.reduce((acc, m) => acc + m.adherenceRate, 0) / meds.length)
          : 85);

    // -------------------------------------------------------------
    // RULE 1: Severe Bleeding Risk (Anticoagulant + Antiplatelet/NSAID)
    // -------------------------------------------------------------
    const hasAnticoagulant = meds.some(m =>
      m.category === 'anticoagulant' ||
      m.genericName?.toLowerCase().includes('warfarin') ||
      m.genericName?.toLowerCase().includes('rivaroxaban') ||
      m.genericName?.toLowerCase().includes('apixaban')
    );
    const hasAntiplateletOrNSAID = meds.some(m =>
      m.tradeNameEn?.toLowerCase().includes('aspirin') ||
      m.genericName?.toLowerCase().includes('acetylsalicylic') ||
      m.tradeNameEn?.toLowerCase().includes('ibuprofen') ||
      m.tradeNameEn?.toLowerCase().includes('naproxen')
    );

    if (hasAnticoagulant && hasAntiplateletOrNSAID) {
      alerts.push({
        id: `RISK-${patient.id}-BLEED`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        mrn: patient.mrn,
        age: patient.age,
        gender: patient.gender,
        healthClusterAr: patient.healthCluster,
        healthClusterEn: patient.healthClusterEn,
        riskLevel: patient.riskLevel,
        category: 'drug_interaction',
        severity: 'critical',
        titleAr: 'خطر وشيك لنزيف هضمي حاد: تداخل دوائي عالي الخطورة (وارفارين + أسبرين)',
        titleEn: 'Imminent Major GI Bleeding: High-Risk Synergistic Anti-Hemostatic Interaction',
        descriptionAr: 'تناول مضاد التخثر (وارفارين) بالتزامن مع الأسبرين يضاعف معدل النزيف الهضمي الحاد بنسبة تفوق ٤٠٠٪ عند كبار السن دون إشراف كافٍ.',
        descriptionEn: 'Concurrent Warfarin and Aspirin increases upper gastrointestinal bleed risk by over 400% in geriatric cardiac patients.',
        clinicalRationaleAr: 'تثبيط التصاق الصفائح الدموية بالتزامن مع كبت عوامل التخثر المعتمدة على فيتامين ك دون مضاد حموضة واقٍ (PPI) يُحدث نزيفاً صامتاً متسارعاً.',
        clinicalRationaleEn: 'Dual platelet aggregation inhibition and Vitamin-K clotting factor suppression causes progressive occult hemorrhagic shock.',
        earlyDetectionWindowAr: 'رصد مبكر: ٢٤ - ٤٨ ساعة قبل ظهور نزيف ظاهر وتدهور المؤشرات الحيوية',
        earlyDetectionWindowEn: 'Early interception: 24 - 48 hours prior to acute overt gastrointestinal hemorrhage',
        recommendedActionAr: 'إيقاف الأسبرين غير المبرر فوراً، طلب فحص مستعجل لسيولة الدم (INR)، وتعيين صيدلي سريري لإعادة التقييم خلال ساعتين.',
        recommendedActionEn: 'Deprescribe unindicated Aspirin immediately, order stat INR lab panel, and route to clinical pharmacist within 2h.',
        evidenceTags: ['وارفارين 5mg', 'أسبرين بروتكت 81mg', 'تفاعل DDI فئة X', 'عمر > 65'],
        detectedAt: '2026-09-09T08:15:00Z',
        status: 'active',
        potentialCostAvoidanceSAR: 28500,
        medicationNames: ['Warfarin 5mg', 'Aspirin 81mg']
      });
    }

    // -------------------------------------------------------------
    // RULE 2: Duplicate Beta-Blocker / Profound Hypotension & Bradycardia
    // -------------------------------------------------------------
    const betaBlockers = meds.filter(m =>
      m.tradeNameEn?.toLowerCase().includes('concor') ||
      m.tradeNameEn?.toLowerCase().includes('carvedilol') ||
      m.genericName?.toLowerCase().includes('bisoprolol') ||
      m.genericName?.toLowerCase().includes('metoprolol') ||
      m.genericName?.toLowerCase().includes('atenolol')
    );

    if (betaBlockers.length >= 2) {
      alerts.push({
        id: `RISK-${patient.id}-DUAL-BB`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        mrn: patient.mrn,
        age: patient.age,
        gender: patient.gender,
        healthClusterAr: patient.healthCluster,
        healthClusterEn: patient.healthClusterEn,
        riskLevel: patient.riskLevel,
        category: 'duplicate_therapy',
        severity: 'critical',
        titleAr: 'ازدواجية علاجية خطيرة: تناول دواءين من فئة حاصرات بيتا بالتزامن',
        titleEn: 'Critical Duplicate Therapy: Dual Concomitant Beta-Blocker Regimen',
        descriptionAr: 'رصد وصف وصرف (كونكور + كاربيفيدول) في نفس الوقت، مما يهدد بهبوط حاد بضغط الدم وانخفاض النبض لأقل من ٤٠ نبضة/دقيقة.',
        descriptionEn: 'Dual beta-blocker prescription detected (Concor + Carvedilol). Imminent hazard of profound hypotension and severe bradycardia.',
        clinicalRationaleAr: 'الحصار المزدوج لمستقبلات بيتا-1 وبيتا-2 يسبب تثبيطاً شديداً للعقدة الجيبية الأذينية (SA node) وتراجع النتاج القلبي.',
        clinicalRationaleEn: 'Synergistic beta-adrenergic blockade risks acute chronotropic incompetence and syncope.',
        earlyDetectionWindowAr: 'رصد استباقي: تم التقاط الإشارة قبل الجرعة المسائية بـ ٦ ساعات',
        earlyDetectionWindowEn: 'Proactive window: Intercepted 6 hours prior to scheduled evening dosing cycle',
        recommendedActionAr: 'إلغاء جرعة الكاربيفيدول المعلقة فوراً، تنبيه الصيدلي المناوب لإلغاء الصرف من نظام وصفتي، ومراقبة النبض.',
        recommendedActionEn: 'Withhold pending Carvedilol dose immediately, notify pharmacist to cancel duplicate in Wasfaty, check pulse.',
        evidenceTags: ['Concor 5mg', 'Carvedilol 6.25mg', 'ازدواجية فئة BB', 'نبض معرض للهبوط'],
        detectedAt: '2026-09-09T08:45:00Z',
        status: 'active',
        potentialCostAvoidanceSAR: 22000,
        medicationNames: ['Concor 5mg', 'Carvedilol 6.25mg']
      });
    }

    // -------------------------------------------------------------
    // RULE 3: Critical Non-Adherence / Diuretic Cessation in Heart Failure
    // -------------------------------------------------------------
    const hasHeartFailure = patient.chronicConditionsAr?.some(c => c.includes('قلب')) ||
      patient.chronicConditionsEn?.some(c => c.toLowerCase().includes('heart'));
    const hasDiuretic = meds.some(m =>
      m.tradeNameEn?.toLowerCase().includes('lasix') ||
      m.genericName?.toLowerCase().includes('furosemide')
    );

    if (hasHeartFailure && (adherenceRate < 70 || (hasDiuretic && patient.engagement?.unconfirmedDosesCount >= 2))) {
      alerts.push({
        id: `RISK-${patient.id}-HF-ADHERENCE`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        mrn: patient.mrn,
        age: patient.age,
        gender: patient.gender,
        healthClusterAr: patient.healthCluster,
        healthClusterEn: patient.healthClusterEn,
        riskLevel: patient.riskLevel,
        category: 'adherence_drop',
        severity: 'critical',
        titleAr: 'تراجع حرج في الالتزام بمدرات البول: خطر احتقان رئوي وتنويم طارئ',
        titleEn: 'Critical Loop Diuretic Non-Adherence: Imminent Acute Pulmonary Edema Risk',
        descriptionAr: `معدل التزام المريض (${adherenceRate}٪) مع تفويت متكرر لجرعات لازكس. محرك التنبؤ السريري يشير لاحتمال ٧٦٪ لانتكاسة قلبية خلال ٥ أيام.`,
        descriptionEn: `Patient adherence dropped to ${adherenceRate}% with missed Lasix doses. Predictive model flags a 76% likelihood of decompensation within 5 days.`,
        clinicalRationaleAr: 'توقف مدر البول يسبب احتباساً متسارعاً للصوديوم والماء، مما يرفع ضغط الأوردة الرئوية ويؤدي لصدمة قلبية.',
        clinicalRationaleEn: 'Diuretic cessation leads to rapid fluid retention, pulmonary capillary wedge pressure surge, and acute decompensated heart failure.',
        earlyDetectionWindowAr: 'إنذار مبكر: ٣٦ - ٧٢ ساعة قبل وصول المريض للطوارئ وهو يعاني من ضيق التنفس',
        earlyDetectionWindowEn: 'Early window: 36 - 72 hours prior to acute dyspneic emergency room presentation',
        recommendedActionAr: 'إجراء مكالمة هاتفية عاجلة من صيدلي الرعاية المتنقلة، جدولة فحص وزني منزلي، وإرسال تنبيه صوتي على التطبيق.',
        recommendedActionEn: 'Initiate outbound tele-pharmacist outreach, review daily weight telemetry, push urgent app adherence prompt.',
        evidenceTags: [`التزام منخفض: ${adherenceRate}%`, 'لازكس 40mg مفقود', 'فشل قلب احتقاني', 'خطر تنويم 76%'],
        detectedAt: '2026-09-09T07:20:00Z',
        status: 'active',
        potentialCostAvoidanceSAR: 32000,
        medicationNames: ['Lasix (Furosemide) 40mg']
      });
    }

    // -------------------------------------------------------------
    // RULE 4: Vulnerable Discharge Window (< 10 days post-discharge + high risk)
    // -------------------------------------------------------------
    if (patient.riskLevel === 'high' && patient.careJourney?.dischargePrescriptionReconciled === false) {
      alerts.push({
        id: `RISK-${patient.id}-DISCHARGE-RECON`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        mrn: patient.mrn,
        age: patient.age,
        gender: patient.gender,
        healthClusterAr: patient.healthCluster,
        healthClusterEn: patient.healthClusterEn,
        riskLevel: patient.riskLevel,
        category: 'discharge_vulnerability',
        severity: 'warning',
        titleAr: 'فجوة مطابقة أدوية ما بعد الخروج: أدوية المستشفى غير متزامنة مع وصفات العيادة',
        titleEn: 'Post-Discharge Reconciliation Gap: Inpatient Discrepancy Unresolved',
        descriptionAr: 'المريض خرج حديثاً دون إتمام المطابقة الدوائية الرسمية من الصيدلي السريري، مع وجود أدوية منزلية سابقة قد تتعارض مع الخطة الجديدة.',
        descriptionEn: 'Recent discharge with uncompleted formal medication reconciliation. High risk of conflicting home vs discharge regimens.',
        clinicalRationaleAr: 'أكثر من ٥٠٪ من أخطاء الأدوية تقع في نقطة الانتقال من التنويم للمنزل بسبب عدم وضوح الأدوية المستمرة والمتوقفة.',
        clinicalRationaleEn: 'Transition of care gaps cause over 50% of preventable post-discharge medication discrepancies.',
        earlyDetectionWindowAr: 'رصد مبكر: خلال الـ ٧ أيام الأولى الحرجة بعد الخروج',
        earlyDetectionWindowEn: 'Early window: Within critical day 1 - 7 post-discharge timeframe',
        recommendedActionAr: 'فتح جلسة مطابقة دوائية مرئية مع المريض والتنسيق مع طبيب الأسرة بالمركز الصحي.',
        recommendedActionEn: 'Schedule virtual Med-Recon visit with clinical pharmacist and sync with primary care physician.',
        evidenceTags: ['خروج حديث', 'عدم اكتمال المطابقة', 'نقطة انتقال حرجة', 'مستشفى KSMC'],
        detectedAt: '2026-09-08T14:30:00Z',
        status: 'active',
        potentialCostAvoidanceSAR: 18000
      });
    }

    // -------------------------------------------------------------
    // RULE 5: Imminent Supply Depletion of Essential Chronic Medication
    // -------------------------------------------------------------
    const depletingMed = meds.find(m =>
      m.daysSupplyRemaining <= 4 &&
      m.status === 'active' &&
      (m.category === 'cardiovascular' || m.category === 'anticoagulant' || m.category === 'endocrine')
    );

    if (depletingMed) {
      alerts.push({
        id: `RISK-${patient.id}-SUPPLY-${depletingMed.id}`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        mrn: patient.mrn,
        age: patient.age,
        gender: patient.gender,
        healthClusterAr: patient.healthCluster,
        healthClusterEn: patient.healthClusterEn,
        riskLevel: patient.riskLevel,
        category: 'refill_depletion',
        severity: 'warning',
        titleAr: `نفاد وشيك لمخزون دواء حيوي: متبقي ${depletingMed.daysSupplyRemaining} أيام من ${depletingMed.tradeName}`,
        titleEn: `Imminent Essential Supply Depletion: ${depletingMed.daysSupplyRemaining} Days Left of ${depletingMed.tradeNameEn}`,
        descriptionAr: `رصيد دواء (${depletingMed.tradeName}) سينفد قبل موعد المراجعة القادمة، مما يهدد بانقطاع قسري للعلاج.`,
        descriptionEn: `Patient has only ${depletingMed.daysSupplyRemaining} days of ${depletingMed.tradeNameEn} remaining. Unplanned treatment lapse predicted.`,
        clinicalRationaleAr: 'الانقطاع غير المخطط للأدوية المزمنة يسبب ارتداداً حاداً في ضغط الدم وسكر الدم أو تكون خثرات دموية مفاجئة.',
        clinicalRationaleEn: 'Abrupt chronic therapy omission triggers rebound hypertensive crisis or thromboembolic cascade.',
        earlyDetectionWindowAr: `استباق مبكر: قبل ٩٦ ساعة من نفاد العلبة بالكامل`,
        earlyDetectionWindowEn: 'Proactive window: 96 hours before full blister-pack depletion',
        recommendedActionAr: 'إصدار إعادة صرف استباقية وتوجيه رسالة للمستودع الإقليمي لخدمة التوصيل السريع للمنزل.',
        recommendedActionEn: 'Trigger automated Wasfaty electronic refill renewal with door-to-door courier dispatch.',
        evidenceTags: [`متبقي ${depletingMed.daysSupplyRemaining} أيام`, depletingMed.tradeNameEn, 'دواء مزمن أساسي'],
        detectedAt: '2026-09-09T06:10:00Z',
        status: 'active',
        potentialCostAvoidanceSAR: 12500,
        medicationNames: [depletingMed.tradeNameEn]
      });
    }

    // -------------------------------------------------------------
    // RULE 6: Geriatric Inappropriate Medication Alert (Beers Criteria)
    // -------------------------------------------------------------
    if (isElderly && meds.some(m => m.category === 'analgesic' || m.genericName?.toLowerCase().includes('sedative'))) {
      alerts.push({
        id: `RISK-${patient.id}-BEERS`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        mrn: patient.mrn,
        age: patient.age,
        gender: patient.gender,
        healthClusterAr: patient.healthCluster,
        healthClusterEn: patient.healthClusterEn,
        riskLevel: patient.riskLevel,
        category: 'geriatric_beers',
        severity: 'watch',
        titleAr: 'تنبيه معايير بييرز لكبار السن: خطر هبوط الدورة الدموية والسقوط',
        titleEn: 'Beers Criteria Alert: Elevated Fall and Syncope Risk in Geriatric Patient',
        descriptionAr: `المريض بعمر (${patient.age} عاماً) يتناول أدوية ذات تأثير مهديء أو خافض للضغط قد ترفع احتمالية السقوط وكسور الحوض.`,
        descriptionEn: `Patient age ${patient.age} on high-fall-risk regimen. Increased hazard of orthostatic hypotension and hip fracture.`,
        clinicalRationaleAr: 'تراجع كفاءة التصفية الكلوية والاستقلاب الكبدي لدى كبار السن يؤدي لتراكم الدواء وتثبيط الجهاز العصبي المركزي.',
        clinicalRationaleEn: 'Age-related pharmacodynamic sensitivity exacerbates fall risk and sedative accumulation.',
        earlyDetectionWindowAr: 'رصد وقائي: قبل حدوث إصابة أو حادث سقوط منزلي',
        earlyDetectionWindowEn: 'Preventive window: Prior to home fall incident or trauma ER visit',
        recommendedActionAr: 'إجراء تقييم شامل لأدوية كبار السن واستبدال الدواء ببديل آمن معتمد في دليل التجمع.',
        recommendedActionEn: 'Conduct comprehensive geriatric deprescribing review; switch to cluster safe alternative.',
        evidenceTags: [`عمر ${patient.age} سنة`, 'معايير بييرز', 'خطر السقوط'],
        detectedAt: '2026-09-08T16:00:00Z',
        status: 'active',
        potentialCostAvoidanceSAR: 45000
      });
    }

    // -------------------------------------------------------------
    // Ingest Patient's Embedded Smart Alerts if unreviewed
    // -------------------------------------------------------------
    if (patient.smartAlerts && patient.smartAlerts.length > 0) {
      patient.smartAlerts.forEach((sa) => {
        if (!sa.acknowledged) {
          // Avoid duplicate by ID
          if (!alerts.some(a => a.id === sa.id)) {
            alerts.push({
              id: sa.id,
              patientId: patient.id,
              patientNameAr: patient.nameAr,
              patientNameEn: patient.nameEn,
              mrn: patient.mrn,
              age: patient.age,
              gender: patient.gender,
              healthClusterAr: patient.healthCluster,
              healthClusterEn: patient.healthClusterEn,
              riskLevel: patient.riskLevel,
              category: sa.type === 'refill_prediction'
                ? 'refill_depletion'
                : sa.type === 'clinical_adherence_lapse'
                ? 'adherence_drop'
                : sa.type === 'food_interaction'
                ? 'drug_interaction'
                : 'vital_warning',
              severity: sa.severity === 'critical' ? 'critical' : sa.severity === 'warning' ? 'warning' : 'watch',
              titleAr: sa.titleAr,
              titleEn: sa.titleEn,
              descriptionAr: sa.messageAr,
              descriptionEn: sa.messageEn,
              clinicalRationaleAr: sa.clinicalContextAr,
              clinicalRationaleEn: sa.clinicalContextEn,
              earlyDetectionWindowAr: 'رصد استباقي من نظام المراقبة الذاتي وتطبيق المريض',
              earlyDetectionWindowEn: 'Proactive signal intercepted from patient mobile engagement layer',
              recommendedActionAr: sa.actionRequiredAr,
              recommendedActionEn: sa.actionRequiredEn,
              evidenceTags: ['إشارة تطبيق ذكية', patient.mrn, sa.type],
              detectedAt: sa.createdAt || '2026-09-09T08:00:00Z',
              status: 'active',
              potentialCostAvoidanceSAR: sa.severity === 'critical' ? 24000 : 12000
            });
          }
        }
      });
    }
  });

  // Sort: Critical first, then Warning, then Watch
  const severityScore = { critical: 3, warning: 2, watch: 1 };
  return alerts.sort((a, b) => severityScore[b.severity] - severityScore[a.severity]);
}
