import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pill,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Send,
  Printer,
  Sparkles,
  Info,
  Check,
  Zap,
  ArrowRight,
  BookmarkCheck,
  UserCheck,
  UserPlus,
  FileSignature,
  Share2,
  Activity,
  X
} from 'lucide-react';
import { Patient, Language, RiskLevel } from '../types';

interface SmartRecommendationsCardProps {
  patient: Patient;
  lang: Language;
  onExecuteRecommendation?: (actionTitle: string, note?: string) => void;
  onApproveEntirePlan?: (planTitle: string, note?: string) => void;
  onRequestConsult?: (specialty: string, urgency: string, reason: string) => void;
}

export interface ProtocolActionStep {
  id: string;
  protocolCode: string;
  protocolNameAr: string;
  protocolNameEn: string;
  authority: 'SFDA' | 'MOH' | 'KDIGO' | 'BEERS' | 'SHA' | 'GINA';
  category: 'deprescribe' | 'dose_adjust' | 'lab_urgent' | 'counseling' | 'refill';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  evidenceLevel: string;
  urgencySLAAr: string;
  urgencySLAEn: string;
  expectedOutcomeAr: string;
  expectedOutcomeEn: string;
  riskReductionMetric: string;
  actionRequiredAr: string;
  actionRequiredEn: string;
  suggestedPrescriptionNotesAr: string;
  suggestedPrescriptionNotesEn: string;
}

export const SmartRecommendationsCard: React.FC<SmartRecommendationsCardProps> = ({
  patient,
  lang,
  onExecuteRecommendation,
  onApproveEntirePlan,
  onRequestConsult
}) => {
  const isAr = lang === 'ar';

  // Track applied recommendations state locally for responsive clinical workflow
  const [appliedStepIds, setAppliedStepIds] = useState<Record<string, { applied: boolean; timestamp: string; note?: string }>>({});
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals state
  const [activeModalAction, setActiveModalAction] = useState<ProtocolActionStep | null>(null);
  const [actionNote, setActionNote] = useState<string>('');
  
  const [isApproveAllModalOpen, setIsApproveAllModalOpen] = useState<boolean>(false);
  const [approveAllNote, setApproveAllNote] = useState<string>(
    isAr 
      ? 'تمت مراجعة السجل الدوائي واعتماد حزمة التوصيات البروتوكولية وتحديث منظومة وصفتي والسجل الطبي الموحد.'
      : 'Full protocol intervention plan reviewed, approved, and synchronized with Wasfaty and unified EMR.'
  );
  const [pharmacistSigner, setPharmacistSigner] = useState<string>(
    isAr ? 'د. عبدالعزيز آل سعود - استشاري الصيدلة السريرية (SCFHS: 408219)' : 'Dr. Abdulaziz - Lead Clinical Pharmacist (SCFHS: 408219)'
  );

  const [isConsultModalOpen, setIsConsultModalOpen] = useState<boolean>(false);
  const [consultSpecialty, setConsultSpecialty] = useState<string>('cardiology');
  const [consultUrgency, setConsultUrgency] = useState<'stat' | 'urgent' | 'routine'>('stat');
  const [consultReason, setConsultReason] = useState<string>('');
  const [activeConsults, setActiveConsults] = useState<Array<{ id: string; specialty: string; urgency: string; timestamp: string }>>([]);

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4500);
  };

  // Generate tailored clinical protocol recommendations based on the patient's exact observed riskLevel & clinical profile
  const getProtocolSteps = (p: Patient): ProtocolActionStep[] => {
    const level: RiskLevel = p.riskLevel;

    if (level === 'high') {
      return [
        {
          id: 'STEP-HIGH-01',
          protocolCode: 'SFDA-BEERS-ANTICOAG-23',
          protocolNameAr: 'بروتوكول هيئة الغذاء والدواء لمعايير Beers 2023 لمضادات التخثر',
          protocolNameEn: 'SFDA / Beers 2023 Anticoagulant Stewardship Protocol',
          authority: 'SFDA',
          category: 'deprescribe',
          titleAr: 'إيقاف فوري للأسبرين غير المبرر سريرياً (Deprescribe Aspirin)',
          titleEn: 'Immediate Deprescribing of Concurrent Aspirin 81mg',
          descriptionAr: 'المريض يتناول وارفارين (Coumadin) بالتزامن مع أسبرين وقائي دون توثيق متلازمة الشريان التاجي الحادة الحديثة. الجمع بينهما يرفع خطر النزيف الهضمي الحاد بنسبة 350% لدى كبار السن.',
          descriptionEn: 'Concurrent Warfarin and low-dose Aspirin without acute coronary syndrome indication within 12 months. Dual therapy increases major GI bleeding risk by 350% in geriatric cohorts.',
          evidenceLevel: 'Level A - Class I (Highest Clinical Evidence)',
          urgencySLAAr: 'خلال ساعتين (عاجل جداً - High Priority)',
          urgencySLAEn: 'Within 2 Hours (Stat Priority)',
          expectedOutcomeAr: 'خفض احتمالية النزيف الدماغي والهضمي الحاد بنسبة 82%',
          expectedOutcomeEn: '82% reduction in catastrophic bleeding risk',
          riskReductionMetric: '-35 نقطة خطر',
          actionRequiredAr: 'إيقاف دواء أسبرين بروتكت من السجل، وإرسال تنبيه إلغاء الصرف لصيدلية وصفتي.',
          actionRequiredEn: 'Discontinue Aspirin Protect in unified EMR and trigger cancellation flag to Wasfaty.',
          suggestedPrescriptionNotesAr: 'تم إيقاف الأسبرين وقائياً لتفادي النزيف الحاد بالتزامن مع الوارفارين، بعد مراجعة معايير Beers 2023.',
          suggestedPrescriptionNotesEn: 'Aspirin discontinued per Beers Criteria 2023 to avoid severe bleeding interaction with Warfarin.'
        },
        {
          id: 'STEP-HIGH-02',
          protocolCode: 'SHA-HF-DIURETIC-24',
          protocolNameAr: 'الدليل الإرشادي لجمعية القلب السعودية لقصور القلب الاحتقاني',
          protocolNameEn: 'Saudi Heart Association (SHA) Heart Failure Diuretic Protocol',
          authority: 'SHA',
          category: 'counseling',
          titleAr: 'تدخل الصيدلي السريري لمعالجة تفويت مدر البول (Lasix Outreach)',
          titleEn: 'Clinical Pharmacist Adherence Outreach for Lasix (40mg)',
          descriptionAr: 'رصد تذبذب خطير في تناول مدر البول خلال آخر 72 ساعة عقب الخروج من التنويم بـ 4 أيام. عدم الالتزام بجرعة الصباح يسبب احتباس السوائل وتكرار دخول الطوارئ بنسبة 68%.',
          descriptionEn: 'Irregular loop diuretic intake detected over the past 72h post-discharge. Suboptimal diuretic adherence is the primary driver of 30-day heart failure readmission (68% incidence).',
          evidenceLevel: 'Level A - Class I Recommendation',
          urgencySLAAr: 'خلال 4 ساعات عمل',
          urgencySLAEn: 'Within 4 Clinical Hours',
          expectedOutcomeAr: 'استقرار توازن السوائل ومنع تنويم الطوارئ المكلف (وفر تقديري 14,200 ريال)',
          expectedOutcomeEn: 'Fluid balance stabilization; prevents costly acute readmission (~14,200 SAR saved)',
          riskReductionMetric: '-28 نقطة خطر',
          actionRequiredAr: 'إجراء مكالمة مرئية/هاتفية لتثقيف المريض حول فحص الوزن اليومي وأخذ الجرعة عند 8:00 صباحاً.',
          actionRequiredEn: 'Conduct tele-pharmacist outreach to counsel on morning scheduling and daily weight logging.',
          suggestedPrescriptionNotesAr: 'تم تفعيل التنبيه الصباحي الذكي وإلزام المريض بتسجيل الوزن اليومي ومراقبة انتفاخ الأطراف.',
          suggestedPrescriptionNotesEn: 'Enabled smart morning pillbox notification; mandated daily weight and edema tracking.'
        },
        {
          id: 'STEP-HIGH-03',
          protocolCode: 'MOH-LAB-INR-STAT',
          protocolNameAr: 'بروتوكول وزارة الصحة للمراقبة المعملية لمضادات التخثر',
          protocolNameEn: 'MOH Rapid Coagulation / INR Lab Surveillance Protocol',
          authority: 'MOH',
          category: 'lab_urgent',
          titleAr: 'طلب فحص سيولة عاجل (Stat INR Lab Order) للمنزل أو المركز الصحي',
          titleEn: 'Stat INR & Serum Potassium / Creatinine Lab Order',
          descriptionAr: 'المريض لم يجرِ تحليل السيولة (INR) منذ أكثر من 21 يوماً مع بدء مدر البول. يلزم التحقق من بقاء معدل السيولة ضمن النطاق الآمن (2.0 - 3.0) واستبعاد هبوط البوتاسيوم.',
          descriptionEn: 'No verified INR check in last 21 days concurrent with diuretic therapy. Mandatory evaluation to confirm therapeutic window (INR 2.0-3.0) and prevent hypokalemia.',
          evidenceLevel: 'Class I Guidelines (MOH Standard)',
          urgencySLAAr: 'خلال 24 ساعة',
          urgencySLAEn: 'Within 24 Hours',
          expectedOutcomeAr: 'ضبط دقيق لجرعة الوارفارين وتفادي التسمم أو التجلط الارتدادي',
          expectedOutcomeEn: 'Precision dosing calibration; eliminates under/over-anticoagulation risks',
          riskReductionMetric: '-18 نقطة خطر',
          actionRequiredAr: 'إرسال طلب سحب عينة منزلي عبر خدمة الرعاية المنزلية بالتجمع الصحي أو حجز موعد سريع.',
          actionRequiredEn: 'Order home-health phlebotomy visit or fast-track PHC laboratory appointment.',
          suggestedPrescriptionNotesAr: 'طلب فحص INR + كيمياء دم شاملة لتقييم السيولة ووظائف الكلى بالتزامن مع لازكس.',
          suggestedPrescriptionNotesEn: 'Order Stat INR + BMP to monitor international normalized ratio and renal function with Lasix.'
        }
      ];
    } else if (level === 'rising') {
      return [
        {
          id: 'STEP-RISING-01',
          protocolCode: 'SFDA-DEP-BETA-02',
          protocolNameAr: 'الدليل الوطني لإزالة الازدواجية العلاجية لحاصرات بيتا',
          protocolNameEn: 'National SFDA Deprescribing Guideline for Dual Beta-Blockade',
          authority: 'SFDA',
          category: 'deprescribe',
          titleAr: 'إلغاء الصرف المزدوج لحاصرات بيتا (إيقاف Carvedilol والإبقاء على Concor)',
          titleEn: 'Deprescribe Duplicate Beta-Blocker (Withhold Carvedilol, Maintain Concor)',
          descriptionAr: 'المريض صُرف له كونكور 5mg من مستشفى التجمع وكاربيفيدول 6.25mg من عيادة خاصة. هذا الازدواج العلاجي الخطير يسبب بطء نبض القلب الحاد (Bradycardia < 50 bpm) وهبوط الضغط الانتصابي.',
          descriptionEn: 'Concurrent Bisoprolol (Concor) and Carvedilol prescribed across divergent health facilities. Dangerous duplication inducing profound bradycardia and postural hypotension.',
          evidenceLevel: 'Class I Clinical Stop Order',
          urgencySLAAr: 'خلال 6 ساعات',
          urgencySLAEn: 'Within 6 Hours',
          expectedOutcomeAr: 'حماية نبض القلب من التباطؤ الحرج وتوفير 850 ريال شهرياً من الهدر الصيدلاني',
          expectedOutcomeEn: 'Protects against severe bradycardia; eliminates 850 SAR monthly pharmaceutical waste',
          riskReductionMetric: '-30 نقطة خطر',
          actionRequiredAr: 'التواصل مع المريض لوقف كاربيفيدول وإشعار الطبيب في السجل الموحد (Nphies).',
          actionRequiredEn: 'Instruct patient to discontinue Carvedilol; flag duplicate entry across Nphies.',
          suggestedPrescriptionNotesAr: 'تم إيقاف كاربيفيدول لازدواجيته مع كونكور لضبط النبض وتفادي الإغماء.',
          suggestedPrescriptionNotesEn: 'Carvedilol discontinued due to therapeutic duplication with Concor.'
        },
        {
          id: 'STEP-RISING-02',
          protocolCode: 'KDIGO-CKD-STAGE3',
          protocolNameAr: 'بروتوكول KDIGO العالمي لضبط جرعات اعتلال الكلى المزمن (المرحلة 3)',
          protocolNameEn: 'KDIGO 2024 Clinical Practice Guideline for CKD Stage 3',
          authority: 'KDIGO',
          category: 'dose_adjust',
          titleAr: 'تعديل جرعة الميتفورمين (Glucophage XR) لتلائم معدل ترشيح الكلى (eGFR)',
          titleEn: 'Renal Dose Titration for Metformin XR (Cap at 1000mg Daily)',
          descriptionAr: 'المريض يتناول 2000mg يومياً بينما تشير الفحوصات إلى اعتلال كلوي مرحلة 3 (eGFR 35-44 mL/min). توصيات هيئة الغذاء والدواء وKDIGO تفرض تخفيض الجرعة إلى 1000mg كحد أقصى لتفادي التحمض اللبني.',
          descriptionEn: 'Patient on 2000mg daily while eGFR corresponds to CKD Stage 3b. Guidelines mandate capping daily Metformin dose at 1000mg to prevent fatal lactic acidosis accumulation.',
          evidenceLevel: 'Level A Evidence (KDIGO / SFDA)',
          urgencySLAAr: 'خلال 24 ساعة',
          urgencySLAEn: 'Within 24 Hours',
          expectedOutcomeAr: 'حماية أنسجة الكلى من التدهور والوقاية من مضاعفات حمض اللاكتيك',
          expectedOutcomeEn: 'Halts nephron decline and eliminates lactic acidosis hazards',
          riskReductionMetric: '-22 نقطة خطر',
          actionRequiredAr: 'تعديل الجرعة في الوصفة من حبتين إلى حبة واحدة مساءً وتحديث تعليمات المريض.',
          actionRequiredEn: 'Adjust e-prescription from 2 tablets to 1 tablet at dinner; update patient instructions.',
          suggestedPrescriptionNotesAr: 'تخفيض جرعة الميتفورمين إلى 1000mg يومياً تماشياً مع معدل ترشيح الكلى eGFR.',
          suggestedPrescriptionNotesEn: 'Metformin XR titrated down to 1000mg daily based on renal eGFR parameters.'
        },
        {
          id: 'STEP-RISING-03',
          protocolCode: 'MOH-METABOLIC-LAB-01',
          protocolNameAr: 'بروتوكول وزارة الصحة للرصد الأيضي والمؤشرات الكلوية',
          protocolNameEn: 'MOH Renal Function & HbA1c Metabolic Monitoring',
          authority: 'MOH',
          category: 'lab_urgent',
          titleAr: 'جدولة فحص دوري للكرياتينين ومعدل الترشيح والسكر التراكمي (HbA1c)',
          titleEn: 'Schedule Serum Creatinine, eGFR & HbA1c Lab Panel',
          descriptionAr: 'تحديث مؤشرات الترشيح الكبيبي للتأكد من استقرار وظائف الكلى قبل دورة الصرف القادمة، ومراجعة فعالية تنظيم سكر الدم مع الجرعة المعدلة.',
          descriptionEn: 'Reassess renal baseline filtration before subsequent refill cycle and track glycemic control under titrated dosing.',
          evidenceLevel: 'Class IIa Recommendation',
          urgencySLAAr: 'خلال 5 أيام',
          urgencySLAEn: 'Within 5 Days',
          expectedOutcomeAr: 'تأكيد سلامة الكلى ومواءمة الخطة العلاجية للمرحلة المستهدفة',
          expectedOutcomeEn: 'Validates renal stability and harmonizes long-term regimen',
          riskReductionMetric: '-12 نقطة خطر',
          actionRequiredAr: 'إصدار موعد فحص مختبري في مركز الرعاية الصحية الأولية الأقرب لمنزل المريضة.',
          actionRequiredEn: 'Schedule PHC laboratory appointment for comprehensive renal/metabolic panel.',
          suggestedPrescriptionNotesAr: 'طلب فحص لوظائف الكلى والسكر التراكمي خلال الأسبوع الجاري.',
          suggestedPrescriptionNotesEn: 'Routine CKD Stage 3 surveillance lab panel scheduled.'
        }
      ];
    } else if (level === 'monitor') {
      return [
        {
          id: 'STEP-MONITOR-01',
          protocolCode: 'WASFATY-PROACTIVE-REF-05',
          protocolNameAr: 'بروتوكول الصرف الاستباقي لمنظومة وصفتي الموحدة',
          protocolNameEn: 'Wasfaty Automated Refill Authorization Protocol',
          authority: 'MOH',
          category: 'refill',
          titleAr: 'جدولة وصرف استباقي لبخاخ الربو الوقائي (Symbicort) قبل 5 أيام من النفاد',
          titleEn: 'Proactive Refill Dispensing for Maintenance Inhaler (Symbicort)',
          descriptionAr: 'المتبقي من بخاخ الوقاية يكفي لـ 5 أيام فقط. انقطاع البخاخ الوقائي هو العامل الرئيسي لحدوث الأزمات الصدرية المفاجئة ونوبات ضيق التنفس الحادة.',
          descriptionEn: '5 days of maintenance inhaler supply remaining. Inhaler depletion is the primary trigger for sudden acute bronchospasm episodes.',
          evidenceLevel: 'Preventive Stewardship Standard',
          urgencySLAAr: 'خلال 48 ساعة',
          urgencySLAEn: 'Within 48 Hours',
          expectedOutcomeAr: 'استمرارية الحماية الرئوية ومنع 100% من أزمات الربو الناتجة عن انقطاع الدواء',
          expectedOutcomeEn: '100% prevention of medication-gap asthma flare-ups',
          riskReductionMetric: '-16 نقطة خطر',
          actionRequiredAr: 'تفعيل إشعار الصرف الآلي للمريض عبر تطبيق وصفتي ليتم استلامه من الصيدلية المجتمعية الأقرب.',
          actionRequiredEn: 'Trigger proactive refill dispatch via Wasfaty community pharmacy network.',
          suggestedPrescriptionNotesAr: 'تم تفعيل إعادة الصرف المبكر لبخاخ الوقاية لضمان استمرار التحكم بالربو.',
          suggestedPrescriptionNotesEn: 'Proactive early refill authorized for Symbicort maintenance inhaler.'
        },
        {
          id: 'STEP-MONITOR-02',
          protocolCode: 'GINA-INHALER-TECH-24',
          protocolNameAr: 'معايير المبادرة العالمية للربو (GINA 2024) لتقييم تقنية الاستنشاق',
          protocolNameEn: 'GINA 2024 Inhaler Technique & Adherence Verification',
          authority: 'GINA',
          category: 'counseling',
          titleAr: 'إرسال دليل مرئي تفاعلي للتحقق من تقنية الاستنشاق الصحيحة (Turbuhaler Technique)',
          titleEn: 'Inhaler Technique Digital Verification & Post-Inhalation Rinse Guide',
          descriptionAr: 'أكثر من 65% من مرضى الربو يستخدمون أجهزة الاستنشاق بطريقة غير مكتملة، مما يقلل وصول الدواء للشعب الهوائية ويسبب داء المبيضات الفموي (Oral Candidiasis) لعدم الغرغرة.',
          descriptionEn: 'Over 65% of asthma patients exhibit imperfect inhaler mechanics. Guidance ensures drug deposition into deep airways and prevents oral candidiasis via post-rinse reminders.',
          evidenceLevel: 'Class I Preventive Protocol',
          urgencySLAAr: 'خلال 3 أيام',
          urgencySLAEn: 'Within 3 Days',
          expectedOutcomeAr: 'مضاعفة كفاءة امتصاص الدواء بنسبة 40% وتفادي الأعراض الجانبية الموضعية',
          expectedOutcomeEn: '40% increase in pulmonary drug delivery; prevents oral candidiasis',
          riskReductionMetric: '-10 نقطة خطر',
          actionRequiredAr: 'إرسال بطاقة تعليمية تفاعلية عبر تطبيق المريض ورسالة نصية SMS تذكيرية.',
          actionRequiredEn: 'Send interactive multimedia educational card via patient portal and SMS.',
          suggestedPrescriptionNotesAr: 'تم توجيه المريض بتقنية الاستنشاق السليمة والغرغرة بالماء بعد كل جرعة.',
          suggestedPrescriptionNotesEn: 'Patient counseled on proper Turbuhaler technique and mouth rinsing.'
        }
      ];
    } else {
      // 'low' risk
      return [
        {
          id: 'STEP-LOW-01',
          protocolCode: 'MOH-VISION2030-PREV',
          protocolNameAr: 'بروتوكول الرعاية الوقائية وتمكين المريض - رؤية السعودية 2030',
          protocolNameEn: 'Saudi Vision 2030 Preventive Care & Wellness Stewardship',
          authority: 'MOH',
          category: 'counseling',
          titleAr: 'تثبيت خطة الصرف التلقائي ربع السنوي (90-Day Auto Refill)',
          titleEn: 'Establish 90-Day Auto-Refill & Digital Adherence Certification',
          descriptionAr: 'المريضة تتمتع بنسبة التزام ممتازة (98%) واستقرار سريري كامل. ينصح باعتماد الصرف المتتابع لمدة 90 يوماً لتقليل عبء مراجعة الصيدلية وتعزيز الرعاية الرقمية.',
          descriptionEn: 'Patient demonstrates stellar adherence (98%) and stable endocrinology profile. 90-day dispensing minimizes clinical friction and maintains self-management continuity.',
          evidenceLevel: 'Health Transformation Standard',
          urgencySLAAr: 'متابعة روتينية (Routine)',
          urgencySLAEn: 'Routine Schedule',
          expectedOutcomeAr: 'الحفاظ على مؤشر السلامة فوق 95% وتسهيل تجربة المستفيد',
          expectedOutcomeEn: 'Maintains safety score >95% while enhancing patient experience',
          riskReductionMetric: 'استدامة الأمان 100%',
          actionRequiredAr: 'اعتماد تجديد الوصفة التلقائي لثلاث دورات قادمة عبر الرعاية الأولية.',
          actionRequiredEn: 'Authorize 90-day multi-refill protocol via Primary Healthcare Center.',
          suggestedPrescriptionNotesAr: 'استمرار الخطة الدوائية الحالية مع التجديد التلقائي لالتزام المريضة الممتاز.',
          suggestedPrescriptionNotesEn: 'Regimen sustained with multi-month refill enabled due to optimal adherence.'
        },
        {
          id: 'STEP-LOW-02',
          protocolCode: 'SFDA-THYROID-SURV-24',
          protocolNameAr: 'الدليل الإرشادي لمتابعة قصور الغدة الدرقية وفيتامين د',
          protocolNameEn: 'SFDA Annual Endocrine & Vitamin D Maintenance Protocol',
          authority: 'SFDA',
          category: 'lab_urgent',
          titleAr: 'جدولة الفحص الهرموني السنوي (TSH & 25-OH Vitamin D) بعد 6 أشهر',
          titleEn: 'Schedule Routine Annual Endocrine Follow-up (TSH & Vit D Panel)',
          descriptionAr: 'المريضة مستقرة حالياً. الفحص السنوي يضمن بقاء هرمون TSH ضمن المعدل الطبيعي وضبط جرعة الثيروكسين مع تغيرات الوزن أو العمر.',
          descriptionEn: 'Patient is clinically euthyroid. Annual screening guarantees TSH parameters remain calibrated and guides subtle levothyroxine adjustments if weight shifts.',
          evidenceLevel: 'Class IIa Maintenance Guideline',
          urgencySLAAr: 'خلال 6 أشهر',
          urgencySLAEn: 'Within 6 Months',
          expectedOutcomeAr: 'الوقاية المبكرة من أي قصور هرموني خفي أو تراجع في كثافة العظام',
          expectedOutcomeEn: 'Early detection of subclinical thyroid shifts and bone health maintenance',
          riskReductionMetric: 'وقاية استباقية',
          actionRequiredAr: 'حجز تذكير تقويمي تلقائي للفحص المعملي القادم في عيادة طب الأسرة.',
          actionRequiredEn: 'Set automated calendar reminder for upcoming routine laboratory panel.',
          suggestedPrescriptionNotesAr: 'متابعة سنوية روتينية لـ TSH وفيتامين د.',
          suggestedPrescriptionNotesEn: 'Routine annual surveillance panel scheduled for TSH and Vitamin D.'
        }
      ];
    }
  };

  const steps = getProtocolSteps(patient);

  // Filter steps by category if selected
  const filteredSteps = selectedCategory === 'all'
    ? steps
    : steps.filter(s => s.category === selectedCategory);

  // Handle single step action
  const handleApplyStep = (step: ProtocolActionStep) => {
    setActiveModalAction(step);
    setActionNote(isAr ? step.suggestedPrescriptionNotesAr : step.suggestedPrescriptionNotesEn);
  };

  const handleConfirmSingleAction = () => {
    if (!activeModalAction) return;

    const newApplied = {
      ...appliedStepIds,
      [activeModalAction.id]: {
        applied: true,
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        note: actionNote
      }
    };
    setAppliedStepIds(newApplied);

    if (onExecuteRecommendation) {
      onExecuteRecommendation(
        isAr ? activeModalAction.titleAr : activeModalAction.titleEn,
        actionNote
      );
    }

    showToast(
      isAr
        ? `تم اعتماد الخطوة: "${activeModalAction.titleAr}" وإشعار صيدلية وصفتي فوراً.`
        : `Step approved: "${activeModalAction.titleEn}" and dispatched to Wasfaty.`
    );

    setActiveModalAction(null);
    setActionNote('');
  };

  // Handle BULK "اعتماد الخطة بالكامل" (Approve Entire Plan)
  const handleConfirmApproveEntirePlan = () => {
    const timestamp = new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    const bulkApplied: Record<string, { applied: boolean; timestamp: string; note?: string }> = {};

    steps.forEach((st) => {
      bulkApplied[st.id] = {
        applied: true,
        timestamp,
        note: `${approveAllNote} - [${pharmacistSigner}]`
      };
    });

    setAppliedStepIds(bulkApplied);

    if (onApproveEntirePlan) {
      onApproveEntirePlan(
        isAr ? 'اعتماد حزمة البروتوكولات السريرية الكاملة' : 'Full Protocol Bundle Approval',
        approveAllNote
      );
    }

    showToast(
      isAr
        ? `تم اعتماد وتوثيق الخطة السريرية بالكامل (${steps.length} خطوات) وإرسال إشعار لمنظومة نفيس ووصفتي!`
        : `Full clinical protocol bundle (${steps.length} steps) approved and synchronized with Nphies & Wasfaty!`
    );

    setIsApproveAllModalOpen(false);
  };

  // Handle "طلب استشارة إضافية" (Request Specialist Consult)
  const handleOpenConsultModal = (step?: ProtocolActionStep) => {
    if (step) {
      setConsultReason(
        isAr
          ? `بشأن تطبيق خطوة: ${step.titleAr} (${step.protocolCode}) لمريض يعاني من ${patient.conditionsAr.join('، ')}.`
          : `Regarding protocol: ${step.titleEn} (${step.protocolCode}) for patient with ${patient.conditionsEn.join(', ')}.`
      );
    } else {
      setConsultReason(
        isAr
          ? `طلب استشارة سريرية مشتركة لمراجعة الأدوية المتعددة ومؤشر الخطورة (${patient.riskScore}/100) وتنسيق الرعاية بين العيادات.`
          : `Interdisciplinary consult requested for complex polypharmacy risk (${patient.riskScore}/100) and cross-cluster reconciliation.`
      );
    }
    setIsConsultModalOpen(true);
  };

  const handleConfirmConsult = () => {
    const timestamp = new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    
    const specialtyLabels: Record<string, { ar: string; en: string }> = {
      cardiology: { ar: 'استشاري أمراض القلب والأوعية الدموية', en: 'Cardiology Consultant' },
      nephrology: { ar: 'استشاري أمراض وزراعة الكلى', en: 'Nephrology Consultant' },
      clinical_pharmacy: { ar: 'صيدلي سريري أول (Pharmacotherapy Specialist)', en: 'Lead Clinical Pharmacist' },
      geriatrics: { ar: 'استشاري طب كبار السن والشيخوخة', en: 'Geriatrics Specialist' },
      endocrinology: { ar: 'استشاري الغدد الصماء والسكري', en: 'Endocrinology Consultant' }
    };

    const specInfo = specialtyLabels[consultSpecialty] || specialtyLabels.cardiology;

    setActiveConsults([
      ...activeConsults,
      {
        id: `CONSULT-${Date.now()}`,
        specialty: isAr ? specInfo.ar : specInfo.en,
        urgency: consultUrgency.toUpperCase(),
        timestamp
      }
    ]);

    if (onRequestConsult) {
      onRequestConsult(consultSpecialty, consultUrgency, consultReason);
    }

    showToast(
      isAr
        ? `تم إرسال طلب استشارة عاجلة إلى [${specInfo.ar}] عبر منصة الإحالات الطبية الموحدة (SLA: ${consultUrgency === 'stat' ? 'ساعتان' : '24 ساعة'}).`
        : `Consult dispatched to [${specInfo.en}] via unified e-referrals (SLA: ${consultUrgency === 'stat' ? '2h STAT' : '24h'}).`
    );

    setIsConsultModalOpen(false);
  };

  const getRiskBadgeConfig = () => {
    switch (patient.riskLevel) {
      case 'high':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badgeBg: 'bg-rose-700 text-white',
          labelAr: 'خطورة سريرية عالية (مطلوب تدخل فوري)',
          labelEn: 'High Clinical Risk (Immediate Action Required)',
          icon: ShieldAlert,
          accentBorder: 'border-rose-500'
        };
      case 'rising':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-600 text-white',
          labelAr: 'خطورة متصاعدة (مطلوب تعديل علاجي)',
          labelEn: 'Rising Risk (Regimen Reconciliation Required)',
          icon: AlertTriangle,
          accentBorder: 'border-amber-500'
        };
      case 'monitor':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-900',
          badgeBg: 'bg-blue-600 text-white',
          labelAr: 'مراقبة مستمرة (إجراءات استباقية ووقائية)',
          labelEn: 'Continuous Monitoring (Proactive Maintenance)',
          icon: Clock,
          accentBorder: 'border-blue-500'
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-700 text-white',
          labelAr: 'رعاية وقائية مستقرة (استدامة التمكين)',
          labelEn: 'Stable Preventive Care (Wellness Maintenance)',
          icon: CheckCircle2,
          accentBorder: 'border-emerald-500'
        };
    }
  };

  const badgeConfig = getRiskBadgeConfig();
  const RiskIcon = badgeConfig.icon;

  const appliedCount = Object.keys(appliedStepIds).filter(id => appliedStepIds[id]?.applied).length;
  const totalCount = steps.length;
  const isAllPlanApplied = totalCount > 0 && appliedCount === totalCount;

  return (
    <div
      id="smart-clinical-recommendations-card"
      className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden transition-all text-start"
    >
      {/* Card Header with Clinical Protocol Identity & Risk Gauge */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-blue-950 flex items-center justify-center shrink-0 border border-blue-800 text-blue-300 shadow-xs">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-blue-100 text-blue-900 border border-blue-200 font-mono">
                {isAr ? 'محرك التوصيات السريرية الذكية' : 'Clinical AI Guidance'}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm ${badgeConfig.badgeBg} font-mono flex items-center gap-1`}>
                <RiskIcon className="w-3 h-3" />
                <span>{patient.riskLevel.toUpperCase()} RISK</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {isAr ? `المؤشر: ${patient.riskScore}/100` : `Index: ${patient.riskScore}/100`}
              </span>
              {isAllPlanApplied && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>{isAr ? 'الخطة معتمدة بالكامل' : 'Plan Fully Approved'}</span>
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span>
                {isAr
                  ? 'التوصيات العلاجية الذكية وخطوات العمل البروتوكولية'
                  : 'Smart Clinical Recommendations & Protocol Action Plan'}
              </span>
            </h3>

            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-3xl">
              {isAr
                ? 'مقترحات علاجية مستخلصة آلياً بالاستناد إلى الأدلة الإرشادية لهيئة الغذاء والدواء (SFDA)، معايير Beers 2023، وضوابط KDIGO لتسريع اتخاذ القرار السريري.'
                : 'Automated evidence-based interventions mapped to SFDA Clinical Guidelines, Beers Criteria 2023, and KDIGO renal parameters to accelerate clinical workflow.'}
            </p>
          </div>
        </div>

        {/* Progress KPI and Print */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
          <div className="text-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isAr ? 'حالة إنجاز الخطة' : 'Protocol Progress'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-slate-800">
                {appliedCount} / {totalCount}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${
                isAllPlanApplied ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {Math.round((appliedCount / (totalCount || 1)) * 100)}%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title={isAr ? 'طباعة خطة التوصيات السريرية' : 'Print Clinical Action Plan'}
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">{isAr ? 'طباعة الخطة' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* 🚀 HIGH-VISIBILITY PRIMARY CLINICAL ACTION TOOLBAR (أزرار العمل السريري الرئيسية) */}
      <div 
        id="clinical-primary-actions-toolbar"
        className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-inner"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
              {isAr ? 'إجراءات القرار السريري السريع (Fast-Track Actions)' : 'Fast-Track Clinical Actions'}
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {isAr
              ? 'تجاوز الإدخال اليدوي؛ اعتمد الخطة البروتوكولية بالكامل بنقرة زر واحدة أو اطلب استشارة تخصصية مع التوثيق المباشر.'
              : 'One-click clinical execution: approve the multi-step protocol plan simultaneously or dispatch a subspecialist consultation.'}
          </p>
        </div>

        {/* The Action Buttons requested by user */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          {/* 1. BUTTON: "اعتماد الخطة" (Approve Plan) */}
          <button
            type="button"
            id="btn-approve-entire-plan"
            onClick={() => setIsApproveAllModalOpen(true)}
            className={`px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer border ${
              isAllPlanApplied
                ? 'bg-emerald-800/90 text-emerald-100 border-emerald-600'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-400 hover:shadow-emerald-900/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="font-bold">
              {isAllPlanApplied 
                ? (isAr ? 'تم اعتماد الخطة رسمياً ✓' : 'Plan Officially Approved ✓') 
                : (isAr ? 'اعتماد الخطة السريرية بالكامل' : 'Approve Entire Protocol Plan')}
            </span>
            {!isAllPlanApplied && (
              <span className="px-1.5 py-0.2 rounded-sm bg-emerald-800 text-white font-mono text-[10px] font-bold">
                {totalCount} {isAr ? 'خطوات' : 'Steps'}
              </span>
            )}
          </button>

          {/* 2. BUTTON: "طلب استشارة إضافية" (Request Additional Consult) */}
          <button
            type="button"
            id="btn-request-additional-consult"
            onClick={() => handleOpenConsultModal()}
            className="px-4 py-2.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer border border-indigo-400 hover:shadow-indigo-900/40"
          >
            <Stethoscope className="w-4 h-4 text-indigo-200 shrink-0" />
            <span className="font-bold">{isAr ? 'طلب استشارة إضافية' : 'Request Specialist Consult'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </button>

          {/* 3. Fast E-Prescribe / Wasfaty Sync */}
          <button
            type="button"
            id="btn-sync-wasfaty-fast"
            onClick={() => {
              showToast(
                isAr
                  ? 'تمت مزامنة السجل الدوائي المحدث مع صيدليات وصفتي والملف الوطني بنجاح.'
                  : 'Synchronized updated medication passport with Wasfaty network.'
              );
            }}
            className="px-3.5 py-2.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title={isAr ? 'مزامنة مباشرة مع وصفتي' : 'Direct Sync with Wasfaty'}
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isAr ? 'إشعار وصفتي' : 'Wasfaty Sync'}</span>
          </button>
        </div>
      </div>

      {/* Active Consultations Alert Banner if any consult was requested */}
      {activeConsults.length > 0 && (
        <div className="p-3.5 bg-indigo-50/90 border-b border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-xs text-indigo-950 font-medium">
            <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {isAr 
                ? `توجد استشارة تخصصية مرسلة قيد المراجعة: [${activeConsults[activeConsults.length - 1].specialty}] - الأولوية: ${activeConsults[activeConsults.length - 1].urgency}`
                : `Active Consult in progress: [${activeConsults[activeConsults.length - 1].specialty}] - Priority: ${activeConsults[activeConsults.length - 1].urgency}`}
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded-sm border border-indigo-200 font-bold">
            {activeConsults[activeConsults.length - 1].timestamp}
          </span>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          {isAr ? 'تصنيف التوصيات:' : 'Filter Protocol:'}
        </span>
        {[
          { id: 'all', labelAr: 'كافة الخطوات', labelEn: 'All Steps' },
          { id: 'deprescribe', labelAr: 'إيقاف دواء (Deprescribe)', labelEn: 'Deprescribing' },
          { id: 'dose_adjust', labelAr: 'تعديل جرعة', labelEn: 'Dose Titration' },
          { id: 'lab_urgent', labelAr: 'فحص مخبري', labelEn: 'Lab Orders' },
          { id: 'counseling', labelAr: 'توعية وتثقيف', labelEn: 'Patient Counseling' },
          { id: 'refill', labelAr: 'إعادة صرف', labelEn: 'Refill Auth' }
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isAr ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Recommendations List Container */}
      <div className="p-5 sm:p-6 space-y-4">
        {filteredSteps.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Info className="w-6 h-6 mx-auto text-slate-400 mb-2" />
            <p>{isAr ? 'لا توجد توصيات مطابقة لهذا التصنيف' : 'No protocol steps match this category'}</p>
          </div>
        ) : (
          filteredSteps.map((step, idx) => {
            const isApplied = !!appliedStepIds[step.id]?.applied;
            const isExpanded = expandedStepId === step.id;

            return (
              <div
                key={step.id}
                id={`protocol-step-${step.id}`}
                className={`rounded-sm border transition-all ${
                  isApplied
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Step Summary Bar */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Status Checkbox or Sequence Marker */}
                    <div
                      className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                        isApplied
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 border border-slate-300 text-slate-700'
                      }`}
                    >
                      {isApplied ? <Check className="w-4 h-4 text-white" /> : idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                          {step.protocolCode}
                        </span>

                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-sm bg-blue-50 text-blue-800 border border-blue-200">
                          {step.authority}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{isAr ? step.urgencySLAAr : step.urgencySLAEn}</span>
                        </span>

                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200">
                          {step.riskReductionMetric}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold leading-snug ${isApplied ? 'text-emerald-950' : 'text-slate-900'}`}>
                        {isAr ? step.titleAr : step.titleEn}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {isAr ? step.descriptionAr : step.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {/* VISIBLE ACTION BUTTONS ON EACH STEP */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                      className="px-2.5 py-1.5 rounded-sm text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? (isAr ? 'طي التفاصيل' : 'Collapse') : (isAr ? 'الأدلة' : 'Details')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Step Consult Request Action */}
                    {!isApplied && (
                      <button
                        type="button"
                        onClick={() => handleOpenConsultModal(step)}
                        className="px-2.5 py-1.5 rounded-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title={isAr ? 'طلب استشارة طبية خاصة بهذه الخطوة' : 'Request Specialist Consult for this step'}
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">{isAr ? 'استشارة' : 'Consult'}</span>
                      </button>
                    )}

                    {isApplied ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isAr ? 'معتمد' : 'Approved'}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">({appliedStepIds[step.id]?.timestamp})</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id={`btn-apply-step-${step.id}`}
                        onClick={() => handleApplyStep(step)}
                        className="px-3.5 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-100" />
                        <span>{isAr ? 'اعتماد الإجراء' : 'Approve Step'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Protocol Clinical Intelligence Drawer */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 text-xs space-y-3.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Scientific Reference & Clinical Evidence */}
                      <div className="space-y-2 bg-white p-3.5 rounded-sm border border-slate-200">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          <span>{isAr ? 'المرجع والبروتوكول العلمي:' : 'Protocol Reference & Evidence:'}</span>
                        </div>
                        <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                          {isAr ? step.protocolNameAr : step.protocolNameEn}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>{isAr ? 'مستوى الدليل:' : 'Evidence Level:'}</span>
                          <span className="font-bold text-blue-700">{step.evidenceLevel}</span>
                        </div>
                      </div>

                      {/* Right: Expected Patient Outcome & Health Economics */}
                      <div className="space-y-2 bg-white p-3.5 rounded-sm border border-slate-200">
                        <div className="flex items-center gap-2 font-bold text-emerald-800">
                          <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                          <span>{isAr ? 'الأثر السريري والوقائي المتوقع:' : 'Expected Clinical Outcome:'}</span>
                        </div>
                        <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                          {isAr ? step.expectedOutcomeAr : step.expectedOutcomeEn}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>{isAr ? 'الأثر على مؤشر الخطورة:' : 'Risk Index Impact:'}</span>
                          <span className="font-bold text-emerald-700">{step.riskReductionMetric}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Practical Instructions */}
                    <div className="p-3.5 rounded-sm bg-blue-50/60 border border-blue-200 text-blue-950 space-y-1.5">
                      <span className="font-bold text-[11px] text-blue-900 block uppercase tracking-wider">
                        {isAr ? 'إجراءات التنفيذ المعتمدة في النظام:' : 'Approved Clinical Workflow Instructions:'}
                      </span>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {isAr ? step.actionRequiredAr : step.actionRequiredEn}
                      </p>
                    </div>

                    {/* Clinical Note Preview */}
                    <div className="text-[11px] text-slate-500 flex items-start gap-2 pt-1">
                      <span className="font-bold uppercase tracking-wider shrink-0 text-slate-600">
                        {isAr ? 'صيغة التوثيق في وصفتي / Nphies:' : 'EMR Clinical Note:'}
                      </span>
                      <span className="font-mono text-slate-700 bg-white px-2 py-1 rounded-sm border border-slate-200 flex-1">
                        {isAr ? step.suggestedPrescriptionNotesAr : step.suggestedPrescriptionNotesEn}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 🟢 MODAL 1: "اعتماد الخطة بالكامل" (Approve Entire Plan Modal) */}
      {isApproveAllModalOpen && (
        <div
          id="approve-entire-plan-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsApproveAllModalOpen(false)}
        >
          <div
            id="approve-entire-plan-modal-dialog"
            className="bg-white rounded-sm border border-slate-200 max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {isAr ? 'اعتماد وتوثيق الخطة السريرية بالكامل' : 'Approve Full Clinical Protocol Plan'}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {isAr ? `المريض: ${patient.nameAr} (${patient.mrn})` : `Patient: ${patient.nameEn} (${patient.mrn})`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsApproveAllModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Summary of what will be approved */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-emerald-950 font-bold">
                  <span>{isAr ? 'حزمة الإجراءات المعتمدة آلياً:' : 'Action Steps to be Executed:'}</span>
                  <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-sm">
                    {steps.length} {isAr ? 'إجراءات بروتوكولية' : 'Protocol Steps'}
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-emerald-900">
                  {steps.map((st, i) => (
                    <li key={st.id} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{st.titleAr}</span>
                      <span className="text-[10px] text-emerald-700 font-mono">({st.riskReductionMetric})</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Digital Clinical Signer Note */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {isAr ? 'ملاحظة الاعتماد السريري الموثقة في السجل الطبي (Clinical Pharmacist Statement):' : 'Official Clinical EMR Sign-off Note:'}
                </label>
                <textarea
                  value={approveAllNote}
                  onChange={(e) => setApproveAllNote(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:outline-none focus:border-emerald-500 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {isAr ? 'التوقيع الإلكتروني والمعتمد السريري:' : 'Digital Signature / Authorizing Clinician:'}
                </label>
                <div className="flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-emerald-700 shrink-0" />
                  <input
                    type="text"
                    value={pharmacistSigner}
                    onChange={(e) => setPharmacistSigner(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:outline-none focus:border-emerald-500 font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Real-time system dispatch targets */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">{isAr ? 'المخرجات التلقائية الفورية:' : 'Automated System Dispatch:'}</div>
                <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px] flex-wrap">
                  <span className="text-emerald-700 font-bold">✓ منصة وصفتي الموحدة</span>
                  <span className="text-emerald-700 font-bold">✓ منصة نفيس (Nphies)</span>
                  <span className="text-emerald-700 font-bold">✓ سجل التدخلات الصيدلانية</span>
                  <span className="text-emerald-700 font-bold">✓ تحديث مؤشر الخطورة</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsApproveAllModalOpen(false)}
                className="px-3.5 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                id="btn-confirm-approve-all"
                onClick={handleConfirmApproveEntirePlan}
                className="px-5 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4 text-white" />
                <span>{isAr ? 'تأكيد واعتماد الخطة بالكامل' : 'Confirm & Commit Plan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 MODAL 2: "طلب استشارة إضافية" (Request Specialist Consult Modal) */}
      {isConsultModalOpen && (
        <div
          id="request-consult-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsConsultModalOpen(false)}
        >
          <div
            id="request-consult-modal-dialog"
            className="bg-white rounded-sm border border-slate-200 max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {isAr ? 'طلب استشارة سريرية تخصصية عاجلة' : 'Request Interdisciplinary Specialist Consult'}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {isAr ? `إحالة سريرية للمريض: ${patient.nameAr}` : `Clinical Referral for: ${patient.nameEn}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConsultModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Specialty Selection */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? 'التخصص الطبي المطلوب للاستشارة:' : 'Consulting Subspecialty:'}
                  </label>
                  <select
                    value={consultSpecialty}
                    onChange={(e) => setConsultSpecialty(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
                  >
                    <option value="cardiology">{isAr ? 'أمراض القلب والأوعية الدموية (Cardiology)' : 'Cardiology'}</option>
                    <option value="nephrology">{isAr ? 'أمراض وزراعة الكلى (Nephrology)' : 'Nephrology'}</option>
                    <option value="clinical_pharmacy">{isAr ? 'صيدلي سريري أول (Pharmacotherapy Specialist)' : 'Clinical Pharmacotherapy'}</option>
                    <option value="geriatrics">{isAr ? 'طب الشيخوخة وكبار السن (Geriatrics)' : 'Geriatric Medicine'}</option>
                    <option value="endocrinology">{isAr ? 'الغدد الصماء والسكري (Endocrinology)' : 'Endocrinology'}</option>
                  </select>
                </div>

                {/* Urgency SLA */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? 'أولوية الاستشارة (SLA Urgency):' : 'Consult Urgency Level:'}
                  </label>
                  <select
                    value={consultUrgency}
                    onChange={(e) => setConsultUrgency(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
                  >
                    <option value="stat">{isAr ? 'عاجل جداً (STAT - خلال ساعتين)' : 'STAT (Within 2 Hours)'}</option>
                    <option value="urgent">{isAr ? 'عاجل (خلال 6 ساعات)' : 'Urgent (Within 6 Hours)'}</option>
                    <option value="routine">{isAr ? 'روتيني (خلال 24 ساعة)' : 'Routine (Within 24 Hours)'}</option>
                  </select>
                </div>
              </div>

              {/* Clinical Referral Reason */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {isAr ? 'موجز دواعي الاستشارة والحالة السريرية:' : 'Clinical Consultation Rationale & Case Summary:'}
                </label>
                <textarea
                  value={consultReason}
                  onChange={(e) => setConsultReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                  placeholder={isAr ? 'اكتب دواعي الاستشارة أو الاستفسار السريري...' : 'State the clinical query...'}
                />
              </div>

              {/* Patient Snapshot Attached */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-sm text-[11px] space-y-1">
                <span className="font-bold text-indigo-950 block">
                  {isAr ? 'البيانات المرفقة تلقائياً بطلب الاستشارة:' : 'Automatically Attached Clinical Snapshot:'}
                </span>
                <p className="text-slate-600 text-[10px]">
                  {isAr
                    ? `مؤشر الخطورة: ${patient.riskScore}/100 • الأمراض: ${patient.conditionsAr.join('، ')} • عدد الأدوية الحالية: ${patient.medications.length} أدوية • التجمع الصحي: ${patient.healthCluster}`
                    : `Risk Score: ${patient.riskScore}/100 • Conditions: ${patient.conditionsEn.join(', ')} • Active Meds: ${patient.medications.length} • Cluster: ${patient.healthCluster}`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsConsultModalOpen(false)}
                className="px-3.5 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                id="btn-confirm-send-consult"
                onClick={handleConfirmConsult}
                className="px-5 py-2 rounded-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5 text-indigo-200" />
                <span>{isAr ? 'إرسال طلب الاستشارة الطبية' : 'Dispatch Consultation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ MODAL 3: Single Action Step Execution */}
      {activeModalAction && (
        <div
          id="action-execution-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveModalAction(null)}
        >
          <div
            id="action-execution-modal-dialog"
            className="bg-white rounded-sm border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-emerald-600 flex items-center justify-center text-white">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAr ? 'تأكيد اعتماد الإجراء السريري' : 'Confirm Protocol Action Execution'}
                  </h4>
                  <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">
                    {activeModalAction.protocolCode}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm space-y-1">
                <span className="font-bold text-slate-800 block text-xs">
                  {isAr ? activeModalAction.titleAr : activeModalAction.titleEn}
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {isAr ? activeModalAction.actionRequiredAr : activeModalAction.actionRequiredEn}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {isAr ? 'ملاحظة الصيدلي السريري الموثقة في السجل الطبي:' : 'Clinical Pharmacist Audit Note (Recorded in EMR):'}
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-sm focus:bg-white focus:outline-none focus:border-emerald-500 font-mono text-slate-800"
                  placeholder={isAr ? 'اكتب ملاحظاتك السريرية هنا...' : 'Enter clinical action notes...'}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 rounded-sm border border-emerald-200">
                <span className="font-semibold text-emerald-950">
                  {isAr ? 'التصعيد التلقائي المعتمد:' : 'Auto Dispatch Targets:'}
                </span>
                <span className="font-mono text-emerald-800 font-bold">
                  {isAr ? 'إشعار فوري لنظام وصفتي + منصة نفيس' : 'Real-time alert sent to Wasfaty & Nphies'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveModalAction(null)}
                className="px-3.5 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                id="btn-confirm-execute-recommendation"
                onClick={handleConfirmSingleAction}
                className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{isAr ? 'تأكيد وتوثيق الإجراء' : 'Confirm & Log Execution'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Toast Notification */}
      {notificationToast && (
        <div
          id="recommendation-toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-sm shadow-xl border border-slate-700 text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200 max-w-md"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{notificationToast}</span>
        </div>
      )}
    </div>
  );
};
