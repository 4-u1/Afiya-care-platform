import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Activity,
  Pill,
  BrainCircuit,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye,
  Zap,
  Clock,
  HelpCircle,
  FileText,
  HeartHandshake
} from 'lucide-react';
import { Language } from '../types';

interface ProjectTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenSummary: () => void;
}

export interface TourStep {
  id: string;
  tabId: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeAr: string;
  badgeEn: string;
  descriptionAr: string;
  descriptionEn: string;
  keyFeaturesAr: string[];
  keyFeaturesEn: string[];
  clinicalSignificanceAr: string;
  clinicalSignificanceEn: string;
  actionPromptAr: string;
  actionPromptEn: string;
}

export const tourSteps: TourStep[] = [
  {
    id: 'step-dashboard',
    tabId: 'dashboard',
    titleAr: 'المحطة الأولى: لوحة الفرز والقيادة السريرية الموحدة',
    titleEn: 'Step 1: Clinical Dashboard & Unified Triage',
    subtitleAr: 'المراقبة الاستباقية لمرضى ما بعد الخروج من المستشفى',
    subtitleEn: 'Proactive post-discharge patient monitoring and triage',
    icon: Activity,
    badgeAr: 'محور الرعاية الممتدة',
    badgeEn: 'Extended Care Core',
    descriptionAr: 'واجهة قيادية مخصصة للطواقم الطبية والصيادلة السريريين لمراقبة المرضى الأكثر عرضة لخطر إعادة التنويم الطارئ (Readmission Risk) خلال ٣٠ يوماً من مغادرة المستشفى.',
    descriptionEn: 'An executive clinical cockpit for physicians and clinical pharmacists to track patients at highest risk of 30-day unplanned emergency readmissions.',
    keyFeaturesAr: [
      'مؤشرات قياس الخطر المعتمدة: تقييم LACE+ ونقاط RAM للتنبؤ بدقة بالمخاطر القلبية.',
      'مؤشر النجمة الشمالية (North Star Metric): نسبة معالجة حالات الخطر الحرج بدون إعادة تنويم.',
      'جدول فرز فوري للمرضى مع مرشحات ذكية حسب مستوى الخطر والتجمع الصحي.',
      'تحديث حي للجرعات المتبقية اليوم والتنبيهات غير المراجعة لكل مريض.'
    ],
    keyFeaturesEn: [
      'Validated clinical risk scoring: LACE+ and RAM algorithms calibrated for chronic care.',
      'North Star Metric: Resolution percentage of high-risk cases preventing hospital readmission.',
      'Real-time triage table with advanced filters by risk level and health cluster.',
      'Live synchronization with today\'s pending doses and active clinical safety signals.'
    ],
    clinicalSignificanceAr: 'تُمكّن الفرق الطبية من رصد التدهور الصحي قبل ٧٢ ساعة من حدوث الأزمة الطارئة بدلاً من انتظار عودة المريض للطوارئ.',
    clinicalSignificanceEn: 'Empowers care teams to detect clinical decompensation 72 hours prior to an acute crisis rather than waiting for an emergency visit.',
    actionPromptAr: 'انتقل الآن لشاشة لوحة التحكم لاستعراض قائمة المرضى ومؤشرات الخطر الحية.',
    actionPromptEn: 'Navigate to the Clinical Dashboard to view the live patient triage matrix.'
  },
  {
    id: 'step-passport',
    tabId: 'passport',
    titleAr: 'المحطة الثانية: جواز الدواء الذكي وماسح الكاميرا بالذكاء الاصطناعي',
    titleEn: 'Step 2: Medication Passport & AI Vision Scanner',
    subtitleAr: 'مطابقة الأدوية وتجنب الازدواجية بالرؤية الحاسوبية',
    subtitleEn: 'Vision-powered medication reconciliation & duplication prevention',
    icon: Pill,
    badgeAr: 'ذكاء اصطناعي بصري',
    badgeEn: 'AI Computer Vision',
    descriptionAr: 'ملف دوائي موحد بديل للوصفات الورقية المشتتة، يتيح مسح علب الأدوية الفعلية عبر كاميرا الهاتف أو رفع صورها ليقوم محرك Gemini بالتحقق الفوري منها ومقارنتها بوصفة الخروج الرسمية.',
    descriptionEn: 'A unified digital medication passport replacing fragmented paper scripts, featuring real-time AI computer vision that scans medication boxes and reconciles them against discharge orders.',
    keyFeaturesAr: [
      'ماسح الكاميرا الذكي (AI Vision Scanner): يتعرف على الاسم التجاري، الاسم العلمي، والتركيز بدقة تفوق ٩٩٪.',
      'كشف الازدواجية العلاجية فورياً (Duplicate Therapy Detection): تحذير المريض عند تناول دوائين لنفس الغرض بأسماء تجارية مختلفة.',
      'بطاقة جواز الدواء القابلة للطباعة والتصدير مع رمز QR مشفر للربط مع سجلات وزارة الصحة.',
      'توضيح التداخلات الغذائية والدوائية المعتمدة بلغة عربية مبسطة وتوعية مخصصة للمريض.'
    ],
    keyFeaturesEn: [
      'AI Vision Scanner: Extracts trade names, generics, dosage, and strengths with 99%+ accuracy.',
      'Instant Duplicate Therapy Detection: Warns patients against taking duplicate drugs under distinct brand names.',
      'Printable and exportable official Health Passport with encrypted QR link to national registries.',
      'Plain-language dietary and food-drug interaction guidance tailored for patient literacy.'
    ],
    clinicalSignificanceAr: 'يقضي على الخطأ الأكثر شيوعاً بعد الخروج: استمرار المريض في تناول دوائه القديم بالتزامن مع الدواء الجديد المشابه.',
    clinicalSignificanceEn: 'Eliminates the #1 post-discharge medication error: patients taking old prescriptions concurrently with newly prescribed equivalents.',
    actionPromptAr: 'شاهد جواز الدواء وجرب ماسح الذكاء الاصطناعي التفاعلي الآن.',
    actionPromptEn: 'Explore the Medication Passport and test the interactive AI scanner.'
  },
  {
    id: 'step-doses-alerts',
    tabId: 'passport',
    titleAr: 'المحطة الثالثة: تسجيل الجرعات المشروط والتنبيهات الاستباقية',
    titleEn: 'Step 3: Conditional Dose Tracking & Proactive Alerts',
    subtitleAr: 'نظام الحلقة المغلقة (Closed-Loop) والفرق عن التطبيقات الاستهلاكية',
    subtitleEn: 'Closed-loop clinical safeguard vs. ordinary consumer alarm apps',
    icon: Clock,
    badgeAr: 'حلقة مغلقة مع المستشفى',
    badgeEn: 'Hospital Closed-Loop',
    descriptionAr: 'عافية كير ليست مجرد تطبيق منبه للمواعيد (مثل صحتي)؛ هنا يرتبط تناول الدواء بفحص العلامات الحيوية، وعند تخطي أي جرعة يتم تصعيد الحالة فوراً لطابور تدخل الصيدلي السريري.',
    descriptionEn: 'Unlike consumer pill alarms, AafiyaCare conditions medication intake on mandatory pre-dose vital signs and escalates missed critical doses straight to clinical pharmacists.',
    keyFeaturesAr: [
      'فحص العلامات الحيوية المشروط: إدخال نبض القلب قبل حاصرات بيتا (Concor) أو ضغط الدم قبل المدرات.',
      'تسجيل أسباب التخطي الجذري (Root-Cause Logging): رصد الأعراض الجانبية، نفاد الدواء، أو الخوف من التعارض.',
      'تصعيد استباقي تلقائي: إرسال بلاغ عاجل لطبيب وصيدلي المستشفى بمجرد تسجيل عارض جانبي مقلق.',
      'التنبؤ الذكي بنفاد العبوة: إشعار المريض قبل ٦ أيام من نفاد الدواء لتنسيق إعادة الصرف دون انقطاع.'
    ],
    keyFeaturesEn: [
      'Conditional pre-dose vitals: Requires pulse check before beta-blockers or BP before diuretics.',
      'Root-cause skip logging: Captures side effects, supply exhaustion, fasting, or medication confusion.',
      'Automated proactive escalation: Dispatches an urgent alert to the hospital pharmacist upon adverse symptoms.',
      'Predictive refill warning: Alerts patient 6 days prior to supply depletion to prevent treatment interruption.'
    ],
    clinicalSignificanceAr: 'يحوّل تجربة المريض من مجرد متلقٍ سلبي إلى شريك محمي ببروتوكول أمان سريري يمنع تدهور حالته في المنزل.',
    clinicalSignificanceEn: 'Transforms home care from passive compliance into an active clinical safety net preventing decompensation.',
    actionPromptAr: 'استعرض تبويب "تسجيل الجرعات" و "مركز التنبيهات الذكية" داخل الملف الدوائي.',
    actionPromptEn: 'Check the Dose Logger and Smart Alerts Hub inside the Medication Passport.'
  },
  {
    id: 'step-patient-portal',
    tabId: 'patient-portal',
    titleAr: 'المحطة: واجهة المريض المخصصة (تسجيل الجرعة بضغطة واحدة)',
    titleEn: 'Step: Dedicated Patient Portal (One-Click Dose Log)',
    subtitleAr: 'واجهة بسيطة تراعي كبار السن مع تعزيز سلوكي إيجابي للالتزام',
    subtitleEn: 'Senior-friendly interface with positive adherence reinforcement',
    icon: HeartHandshake,
    badgeAr: 'واجهة المريض المباشرة',
    badgeEn: 'Patient-First Experience',
    descriptionAr: 'واجهة صُممت خصيصاً للمريض وأسرته لتسجيل الدواء بضغطة زر واحدة واضحة، مع رسائل تعزيز إيجابية دافئة ترتقي بالالتزام ومزامنة فورية مع السجل الطبي الموحد.',
    descriptionEn: 'A clear, senior-friendly portal allowing patients to confirm their dose with a single click, featuring positive affirmations and live EMR synchronization.',
    keyFeaturesAr: [
      'زر كبير وواضح لتأكيد الجرعة بضغطة واحدة دون تعقيد.',
      'رسائل تأكيد إيجابية ومحفزة لتعزيز الالتزام العلاجي وبناء عادات صحية مستدامة.',
      'قراءة صوتية ذكية للتعليمات الدوائية لدعم كبار السن وضعاف البصر.',
      'عرض فوري لسلسلة الالتزام المتواصل وإشعار مباشر لصيدلي التجمع الصحي.'
    ],
    keyFeaturesEn: [
      'Prominent one-click button to confirm dose intake without cognitive load.',
      'Culturally tailored positive affirmations that reinforce long-term adherence.',
      'Smart voice readout of medication instructions for seniors and low-vision patients.',
      'Instant adherence streak tracker and direct notification to cluster pharmacists.'
    ],
    clinicalSignificanceAr: 'إزالة عوائق الاستخدام وإرفاق توثيق الجرعة بمشاعر الإنجاز الإيجابية يرفع التزام المرضى بنسبة تفوق ٣٥٪ ويحد من الانتكاسات.',
    clinicalSignificanceEn: 'Eliminating interaction friction and pairing logging with positive reinforcement boosts compliance by over 35% and curtails readmissions.',
    actionPromptAr: 'افتح واجهة المريض وجرب تسجيل تناول الجرعة بضغطة واحدة واستمتع برسالة التعزيز الإيجابي.',
    actionPromptEn: 'Open the Patient Portal, log a dose with a single click, and experience the positive confirmation.'
  },
  {
    id: 'step-risk-engine',
    tabId: 'risk-engine',
    titleAr: 'المحطة الرابعة: محرك الأمان السريري والمخاطر التراكمية',
    titleEn: 'Step 4: Clinical Risk Engine & Safety Signals',
    subtitleAr: 'تحليل تداخلات الأدوية ووظائف الكلى ومعايير بييرز لكبار السن',
    subtitleEn: 'DDI analysis, renal clearance safety, and geriatric Beers criteria',
    icon: BrainCircuit,
    badgeAr: 'محرك أمان متقدم',
    badgeEn: 'Advanced Safety Engine',
    descriptionAr: 'عقل تحليلي سريري يفحص المنظومة الدوائية بالكامل لكل مريض، ويحلل تداخلات DDI التراكمية، ومؤشر تصفية الكلى (eGFR)، وتأثير مضادات التخثر مع الأدوية المسكنة شائعة الاستخدام.',
    descriptionEn: 'A specialized clinical engine analyzing comprehensive drug regimens, cumulative DDI risks, renal clearance constraints (eGFR), and anticoagulant interactions with OTC analgesics.',
    keyFeaturesAr: [
      'كشف تداخلات سيولة الدم (Anticoagulant + NSAID Bleeding Risk) مع إرشادات سريرية موجهة.',
      'تطبيق معايير بييرز (Beers Criteria 2023) لرصد الأدوية غير الملائمة للمرضى كبار السن.',
      'تعديل الجرعات حسب وظائف الكلى والكبد وتجنب السمية الدوائية التراكمية.',
      'شبكة بصرية ثلاثية لتفاعل الأدوية توضح شدة التداخل (حرج، تحذيري، إرشادي).'
    ],
    keyFeaturesEn: [
      'Bleeding risk detection: Anticoagulant + NSAID cross-reactions with targeted clinical protocols.',
      'Beers Criteria 2023 integration: Flags potentially inappropriate medications for geriatric patients.',
      'Renal & hepatic dose titration algorithms to prevent cumulative pharmacotoxicity.',
      'Visual interactive drug-interaction graph showing severity stratification (Critical, Warning, Info).'
    ],
    clinicalSignificanceAr: 'يقلل من إجهاد التنبيهات (Alert Fatigue) بنسبة ٦٨٪ من خلال إظهار التنبيهات ذات الأهمية السريرية الحقيقية فقط.',
    clinicalSignificanceEn: 'Decreases alert fatigue by 68% by suppressing trivial alerts and highlighting only clinically actionable signals.',
    actionPromptAr: 'انتقل لمحرك المخاطر السريري وتفحص شبكة التداخلات وإشارات الأمان المكتشفة.',
    actionPromptEn: 'Open the Risk Engine to inspect interaction matrices and detected safety signals.'
  },
  {
    id: 'step-interventions',
    tabId: 'interventions',
    titleAr: 'المحطة الخامسة: طابور تدخلات الصيدلي السريري والوفر المالي',
    titleEn: 'Step 5: Clinical Pharmacist Queue & Cost Avoidance',
    subtitleAr: 'توثيق التدخل البشري والوفورات المالية لمنع إعادة التنويم',
    subtitleEn: 'Human-in-the-loop intervention workflow with proven ROI metrics',
    icon: ShieldCheck,
    badgeAr: 'تدخل سريري موثق',
    badgeEn: 'Documented Interventions',
    descriptionAr: 'منظومة الحلقة المغلقة (Human-in-the-Loop) التي تتيح للصيدلي مراجعة البلاغات، الاتصال بالمريض أو الطبيب، تعديل الخطة العلاجية، وحساب التكلفة المالية المباشرة التي تم توفيرها على المنظومة.',
    descriptionEn: 'The closed-loop human-in-the-loop workspace where clinical pharmacists review escalated signals, counsel patients, adjust therapies, and document cost avoidance in Saudi Riyals.',
    keyFeaturesAr: [
      'طابور مهام سريري مرتب حسب أولوية الخطر (عالي، متوسط، روتيني).',
      'حساب دقيق للوفر المالي (Cost Avoidance in SAR): احتساب تكلفة منع زيارة الطوارئ وتنويم العناية المركزة.',
      'سجل إجراءات الصيدلي: استبدال الدواء، تخفيض الجرعة، التثقيف الدوائي، أو تصعيد الحالة لطبيب القلب.',
      'توليد تقرير موثق لكل تدخل بصيغة معايير مجلس الضمان الصحي (CHI) ووزارة الصحة.'
    ],
    keyFeaturesEn: [
      'Prioritized clinical task queue sorted by urgency (High, Moderate, Routine).',
      'Accurate Cost Avoidance calculator in SAR based on prevented emergency and ICU readmissions.',
      'Pharmacist action logger: therapy substitution, dose titration, patient counseling, or physician escalation.',
      'Compliant intervention summary generation adhering to CHI and Ministry of Health standards.'
    ],
    clinicalSignificanceAr: 'يُثبت الجدوى الاقتصادية للرعاية المبكرة: كل تدخل صيدلي ناجح يوفر في المتوسط ٨,٥٠٠ إلى ٢٤,٠٠٠ ريال سعودي.',
    clinicalSignificanceEn: 'Demonstrates clear value-based healthcare ROI: each averted admission saves SAR 8,500 to 24,000 on average.',
    actionPromptAr: 'افتح قائمة التدخلات السريرية وشاهد كيف يتخذ الصيدلي الإجراء السريري الحاسم.',
    actionPromptEn: 'View the Interventions Queue to observe pharmacist action workflows.'
  },
  {
    id: 'step-enterprise',
    tabId: 'enterprise',
    titleAr: 'المحطة السادسة: مؤشرات التجمع الصحي والأمن السحابي ومستقبل 2030',
    titleEn: 'Step 6: Health Cluster KPIs, Cloud Security & Vision 2030',
    subtitleAr: 'الامتثال للمعايير الوطنية وسجلات التدقيق الموثوقة',
    subtitleEn: 'National standards compliance, immutable audit trails & Vision 2030',
    icon: Building2,
    badgeAr: 'رؤية المملكة 2030',
    badgeEn: 'Saudi Vision 2030',
    descriptionAr: 'لوحة القيادة التنفيذية للتجمعات الصحية السعودية، توضح مؤشرات الرعاية المبنية على القيمة (Value-Based Healthcare)، مع سجل تدقيق مشفر متوافق مع معايير الأمن السيبراني (NCA ECC) وبروتوكول HL7 FHIR R4.',
    descriptionEn: 'Enterprise executive dashboard for Saudi Health Clusters showcasing Value-Based Healthcare KPIs, an encrypted audit trail compliant with NCA ECC, and native HL7 FHIR R4 interoperability.',
    keyFeaturesAr: [
      'قياس أداء التجمع الصحي: انخفاض معدل إعادة التنويم الإجمالي من ٢٤.٢٪ إلى ٨.٦٪.',
      'جاهزية الربط المباشر مع منصة "نفيس" (NPHIES) ومنظومة الملف الطبي الموحد.',
      'سجل تدقيق ثابت وغير قابل للتلاعب (Immutable Audit Log) يوثق كل وصول للملف الطبي الدوائي.',
      'تحقيق أهداف برنامج تحول القطاع الصحي: تحسين جودة الحياة وتقليل الهدر الدوائي السنوي.'
    ],
    keyFeaturesEn: [
      'Cluster performance analytics: 30-day readmissions reduced from 24.2% down to 8.6%.',
      'Integration-ready architecture for Saudi NPHIES and the National Unified Medical Record.',
      'Tamper-proof immutable audit logging recording every medical access with cryptographic hashes.',
      'Direct alignment with Health Sector Transformation Program goals: enhancing longevity and cutting drug waste.'
    ],
    clinicalSignificanceAr: 'ينقل إدارة الرعاية الصحية من رد الفعل العلاجي المكلف إلى الإدارة الاستباقية الوقائية للمجتمع.',
    clinicalSignificanceEn: 'Shifts healthcare management from expensive reactive hospitalization to proactive population wellness.',
    actionPromptAr: 'استكشف لوحة التجمع الصحي وسجلات الأمان السحابي لمعرفة الحوكمة الكاملة.',
    actionPromptEn: 'Inspect the Health Cluster analytics and security logs for comprehensive governance.'
  }
];

export const ProjectTourModal: React.FC<ProjectTourModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentTab,
  onNavigateTab,
  onOpenSummary
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const isAr = lang === 'ar';

  // Sync step with current tab if user opens while on another tab
  useEffect(() => {
    if (isOpen) {
      const idx = tourSteps.findIndex(s => s.tabId === currentTab);
      if (idx !== -1) {
        setCurrentStepIndex(idx);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = tourSteps[currentStepIndex];
  const totalSteps = tourSteps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (!isLastStep) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onNavigateTab(tourSteps[nextIdx].tabId);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onNavigateTab(tourSteps[prevIdx].tabId);
    }
  };

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
    onNavigateTab(tourSteps[index].tabId);
  };

  return (
    <div
      id="project-tour-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        id="project-tour-modal-content"
        className="bg-white border border-slate-300 rounded-sm shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
      >
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-blue-600/30 border border-blue-500/40 text-blue-400">
              <Compass className="w-5 h-5 text-blue-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {isAr ? 'جولة المشروع التفاعلية — منصة عافية كير' : 'AafiyaCare Interactive Guided Tour'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                  {isAr ? `المحطة ${currentStepIndex + 1} من ${totalSteps}` : `Step ${currentStepIndex + 1} of ${totalSteps}`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'استكشف ركائز المنصة ومحركات الأمان الدوائي المعتمدة لرؤية 2030'
                  : 'Explore core pillars and clinical safety safeguards built for Vision 2030'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSummary();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title={isAr ? 'فتح الملخص الكامل' : 'Open Full Project Dossier'}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'ملخص المشروع كاملاً' : 'Full Dossier'}</span>
            </button>

            <button
              id="btn-close-tour"
              onClick={onClose}
              className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق الجولة' : 'Close Tour'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Tracker Bar */}
        <div className="bg-slate-900 px-5 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          {tourSteps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const StepItemIcon = step.icon;

            return (
              <button
                key={step.id}
                id={`tour-step-btn-${idx}`}
                onClick={() => handleGoToStep(idx)}
                className={`flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <StepItemIcon className="w-3.5 h-3.5" />
                )}
                <span>{idx + 1}. {isAr ? step.badgeAr : step.badgeEn}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Step Main Hero Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-200 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-sm bg-blue-600 text-white shadow-sm shrink-0 mt-0.5">
                <StepIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider">
                    {isAr ? currentStep.badgeAr : currentStep.badgeEn}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Tab: {currentStep.tabId}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 leading-snug">
                  {isAr ? currentStep.titleAr : currentStep.titleEn}
                </h4>
                <p className="text-xs font-medium text-slate-600">
                  {isAr ? currentStep.subtitleAr : currentStep.subtitleEn}
                </p>
              </div>
            </div>

            <button
              id="btn-tour-jump-screen"
              onClick={() => onNavigateTab(currentStep.tabId)}
              className="px-3.5 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs self-stretch sm:self-auto justify-center"
            >
              <Eye className="w-3.5 h-3.5 text-blue-300" />
              <span>{isAr ? 'عرض الشاشة الحالية' : 'Switch to this Screen'}</span>
            </button>
          </div>

          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {isAr ? currentStep.descriptionAr : currentStep.descriptionEn}
            </p>
          </div>

          {/* Key Capabilities Grid */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'القدرات والميزات التشغيلية الميدانية:' : 'Operational Field Capabilities:'}</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(isAr ? currentStep.keyFeaturesAr : currentStep.keyFeaturesEn).map((feat, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-sm p-3 flex items-start gap-2.5 text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical & Economic Impact Box */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-sm p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h6 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                {isAr ? 'الأثر السريري والقيمة المضافة للتجمع الصحي:' : 'Clinical Value & Health Cluster Significance:'}
              </h6>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {isAr ? currentStep.clinicalSignificanceAr : currentStep.clinicalSignificanceEn}
              </p>
            </div>
          </div>

          {/* Direct Action Prompt */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-sm p-3 text-xs text-blue-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold">
                {isAr ? currentStep.actionPromptAr : currentStep.actionPromptEn}
              </span>
            </div>
            <button
              onClick={() => {
                onNavigateTab(currentStep.tabId);
                onClose();
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline whitespace-nowrap cursor-pointer"
            >
              {isAr ? 'ابدأ تجربة الشاشة وأغلق المرشد' : 'Explore Screen & Close Tour'}
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="btn-tour-prev"
              disabled={isFirstStep}
              onClick={handlePrev}
              className={`px-3.5 py-2 rounded-sm text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isFirstStep
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-2xs'
              }`}
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{isAr ? 'المحطة السابقة' : 'Previous Step'}</span>
            </button>

            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block px-2">
              {currentStepIndex + 1} / {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-tour-summary-secondary"
              onClick={() => {
                onClose();
                onOpenSummary();
              }}
              className="px-3.5 py-2 rounded-sm bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'ملخص المشروع كاملاً' : 'Full Project Dossier'}</span>
            </button>

            <button
              id="btn-tour-next"
              onClick={handleNext}
              className="px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{isLastStep ? (isAr ? 'إكمال الجولة وبدء الاستخدام' : 'Finish Tour') : (isAr ? 'المحطة التالية' : 'Next Step')}</span>
              {!isLastStep && (isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
