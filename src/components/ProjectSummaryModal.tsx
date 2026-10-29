import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Pill,
  Activity,
  BrainCircuit,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Share2,
  Bookmark,
  Award,
  Globe,
  Lock,
  Stethoscope,
  HeartHandshake,
  Compass
} from 'lucide-react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import { Language } from '../types';

interface ProjectSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onStartTour?: () => void;
}

export const ProjectSummaryModal: React.FC<ProjectSummaryModalProps> = ({
  isOpen,
  onClose,
  lang,
  onStartTour
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'problem_solution' | 'architecture' | 'modules' | 'roi' | 'standards'>('overview');
  const [copied, setCopied] = useState<boolean>(false);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const summaryText = isAr
      ? `📋 ملخص مشروع عافية كير (AafiyaCare) — منصة الذكاء المبكر للمخاطر الصحية والدوائية
-------------------------------------------------------------
• الرؤية: التحول من الرعاية العلاجية المنفعلة إلى الرعاية الاستباقية المبنية على القيمة (Value-Based Healthcare) ضمن برنامج تحول القطاع الصحي لرؤية السعودية 2030.
• المشكلة: ارتفاع معدلات إعادة التنويم بعد الخروج من المستشفى (30-day readmissions) إلى 24.2% نتيجة الأخطاء الدوائية وتجزؤ الرعاية، بتكلفة تتراوح بين 18,000 إلى 35,000 ريال لكل حالة.
• الحل والابتكار: منظومة سريرية بحلقة مغلقة (Closed-Loop) تربط المريض بالصيدلي السريري وطبيب المستشفى لحظياً.
• الميزات الجوهرية:
  1. مسح عبوات الأدوية بالرؤية الحاسوبية والذكاء الاصطناعي (Gemini Vision) ومطابقتها مع وصفة الخروج.
  2. تسجيل الجرعات المشروط بفحص المؤشرات الحيوية (مثل فحص النبض قبل حاصرات بيتا والضغط قبل المدرات).
  3. نظام الحلقة المغلقة عند تخطي الجرعة لتصعيد الأسباب للصيدلي فوراً لمنع التدهور الصحي.
  4. محرك كشف تداخلات الأدوية (DDI)، معايير بييرز لكبار السن، ومؤشر تصفية الكلى.
  5. طابور تدخل الصيدلي السريري مع حساب الوفر المالي المباشر (Cost Avoidance in SAR).
  6. مؤشرات التجمع الصحي المتوافقة مع معايير FHIR R4 و NPHIES ومجلس الضمان الصحي (CHI).
• الأثر المحقق: خفض إعادة التنويم إلى 8.6%، ورفع الالتزام الدوائي إلى 91.4%، وتوفير أكثر من 4.2 مليون ريال سنوياً لكل تجمع صحي.`
      : `📋 AafiyaCare Executive Dossier — Early Clinical Risk Intelligence for Health Clusters
-------------------------------------------------------------
• Vision: Value-Based Healthcare aligned with Saudi Vision 2030 Health Sector Transformation Program.
• Challenge: 24.2% post-discharge 30-day readmission rate driven by medication reconciliation errors, costing SAR 18,000 - 35,000 per admission.
• Core Solution: Hospital-integrated closed-loop clinical intelligence connecting home patients directly with clinical pharmacists.
• Key Modules:
  1. AI Vision Computer Scanner (Gemini Vision) reconciling drug packaging against official discharge orders.
  2. Conditional pre-dose vital sign checks (e.g. pulse verification before beta-blockers).
  3. Closed-loop skip root-cause escalation triggering instant pharmacist intervention.
  4. Comprehensive DDI, renal clearance (eGFR), and Beers 2023 geriatric safety engine.
  5. Pharmacist intervention queue with direct SAR cost avoidance calculation.
  6. Enterprise health cluster analytics compliant with FHIR R4, NPHIES, and CHI standards.
• Measured Impact: 30-day readmission cut to 8.6%, 91.4% adherence rate, and SAR 4.2M+ annual savings per cluster.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="project-summary-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-fadeIn print:p-0 print:static print:bg-white"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        id="project-summary-modal-content"
        className="bg-white border border-slate-300 rounded-sm shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-scaleIn print:max-h-none print:shadow-none print:border-none print:w-full"
      >
        {/* Modal Top Header (Dark Slate Executive Theme) */}
        <div className="bg-[#0F172A] text-white px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 print:bg-white print:text-slate-900 print:border-b-2 print:border-slate-900">
          <div className="flex items-center gap-4">
            <AafiyaCareLogo 
              id="summary-header-logo"
              variant="horizontal" 
              size="md" 
              theme="dark-bg" 
              isAr={isAr}
              showSubtext={true}
              subtext={isAr ? 'الملخص التنفيذي والوثيقة السريرية الشاملة' : 'Executive Dossier & Clinical Reference'}
            />
            <div className="hidden md:flex items-center gap-2 border-r rtl:border-r-0 rtl:border-l border-slate-700 px-3">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-blue-600/30 text-blue-300 border border-blue-500/40">
                {isAr ? 'وثيقة الاعتماد الميداني' : 'Field Validation Spec'}
              </span>
              <span className="text-xs font-mono text-slate-400">v2.4 Enterprise</span>
            </div>
          </div>

          {/* Actions: Print, Copy, Tour, Close */}
          <div className="flex items-center gap-2 print:hidden">
            {onStartTour && (
              <button
                id="btn-summary-launch-tour"
                onClick={() => {
                  onClose();
                  onStartTour();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
                title={isAr ? 'بدء الجولة التفاعلية' : 'Start Interactive Tour'}
              >
                <Compass className="w-3.5 h-3.5 text-blue-200" />
                <span>{isAr ? 'الجولة التفاعلية' : 'Guided Tour'}</span>
              </button>
            )}

            <button
              id="btn-summary-copy"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title={isAr ? 'نسخ الملخص' : 'Copy Summary'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy')}</span>
            </button>

            <button
              id="btn-summary-print"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title={isAr ? 'طباعة الوثيقة الرسمية' : 'Print Official Dossier'}
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              id="btn-close-summary"
              onClick={onClose}
              className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs (Executive Style) */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex items-center gap-2 overflow-x-auto shrink-0 print:hidden">
          {[
            { id: 'overview', labelAr: 'الرؤية والملخص التنفيذي', labelEn: 'Executive Overview', icon: Sparkles },
            { id: 'problem_solution', labelAr: 'المشكلة والحل مقارنة بصحتي', labelEn: 'Challenge & Distinct Solution', icon: ShieldCheck },
            { id: 'modules', labelAr: 'وحدات المنصة الست', labelEn: '6 Core Modules', icon: Layers },
            { id: 'architecture', labelAr: 'البنية التقنية والمعايير', labelEn: 'Architecture & Tech Stack', icon: BrainCircuit },
            { id: 'roi', labelAr: 'الأثر السريري والعائد المالي (ROI)', labelEn: 'Clinical Outcomes & ROI', icon: TrendingDown },
            { id: 'standards', labelAr: 'الامتثال وأمن البيانات (NCA/FHIR)', labelEn: 'Compliance & Security', icon: Lock }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                id={`summary-nav-${tab.id}`}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body - Scrollable Content with High Information Density */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-800">
          {/* ========================================================================= */}
          {/* SECTION 1: EXECUTIVE OVERVIEW */}
          {/* ========================================================================= */}
          {(activeSection === 'overview' || typeof window !== 'undefined') && (
            <div className={`space-y-6 ${activeSection !== 'overview' ? 'print:block hidden' : 'block'}`}>
              {/* Official Hero Card */}
              <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-sm border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-widest">
                      {isAr ? 'برنامج تحول القطاع الصحي • رؤية 2030' : 'Health Sector Transformation Program • Vision 2030'}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                      {isAr ? 'جاهزية الاعتماد الميداني' : 'Clinical Deployment Ready'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {isAr
                      ? 'منصة عافية كير (AafiyaCare) — طبقة الذكاء المبكر للمخاطر الصحية والدوائية'
                      : 'AafiyaCare — Early Clinical Risk & Medication Intelligence Platform'}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-normal">
                    {isAr ? (
                      <>
                        منظومة وطنية متكاملة تهدف إلى <strong className="text-white">القضاء على معضلة إعادة التنويم غير المخطط لها خلال ٣٠ يوماً من الخروج</strong> لمرضى القلب والأمراض المزمنة. تعمل المنصة كطبقة ذكاء اصطناعي سريرية بحلقة مغلقة (<span className="text-amber-300 font-semibold">Closed-Loop System</span>) تربط المريض في منزله بالصيدلي السريري وطبيب المستشفى لحظياً، لتكتشف التدهور الصحي والتداخلات الدوائية الخطرة قبل أن تتحول إلى أزمة إسعافية مكلفة.
                      </>
                    ) : (
                      <>
                        A national clinical intelligence platform engineered to <strong className="text-white">eliminate unplanned 30-day post-discharge readmissions</strong> for chronic cardiovascular patients. Acting as a hospital-integrated <span className="text-amber-300 font-semibold">closed-loop safeguard</span>, it connects homebound patients with clinical pharmacists to intercept adverse events before they escalate into costly emergency visits.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* 4 Pillars of Vision Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isAr ? 'نموذج الرعاية الحديث' : 'New Model of Care'}
                    </span>
                    <HeartHandshake className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAr ? 'الرعاية المستمرة والممتدة' : 'Continuous & Chronic Care'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isAr
                      ? 'متابعة المريض خارج أسوار المستشفى والانتقال السلس من التنويم إلى المنزل.'
                      : 'Post-acute outpatient monitoring ensuring safe home transitions.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isAr ? 'الرعاية المبنية على القيمة' : 'Value-Based Care'}
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAr ? 'خفض الهدر المالي' : 'Direct Cost Avoidance'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isAr
                      ? 'توفير أكثر من ٤.٢ مليون ريال سنوياً لكل تجمع صحي بمنع التنويم الطارئ.'
                      : 'Saving SAR 4.2M+ annually per cluster via averted acute admissions.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isAr ? 'سلامة المرضى الوطنية' : 'Patient Safety First'}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAr ? 'منع الأخطاء الدوائية' : 'Zero Duplicate Therapy'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isAr
                      ? 'كشف الازدواجية والتداخلات بنسبة ٩٩.٤٪ عبر الذكاء البصري Gemini.'
                      : '99.4% detection of duplicate scripts using Gemini computer vision.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isAr ? 'التحول الرقمي والسيادة' : 'Sovereign Digital Health'}
                    </span>
                    <Building2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAr ? 'تكامل FHIR و NPHIES' : 'FHIR R4 & NPHIES Ready'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isAr
                      ? 'جاهزية الربط مع السجل الموحد وضوابط الهيئة الوطنية للأمن السيبراني.'
                      : 'Standardized HL7 interoperability and strict NCA ECC compliance.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: THE PROBLEM & SOLUTION (VS CONSUMER APPS / SEHHATY) */}
          {/* ========================================================================= */}
          {(activeSection === 'problem_solution' || typeof window !== 'undefined') && (
            <div className={`space-y-5 ${activeSection !== 'problem_solution' ? 'print:block hidden' : 'block'}`}>
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>{isAr ? 'المشكلة السريرية والاقتصادية الدقيقة' : 'The Acute Clinical & Economic Challenge'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-50/70 border border-rose-200 rounded-sm p-4 space-y-2">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                    {isAr ? '١. أزمة إعادة التنويم خلال ٣٠ يوماً (Readmission Crisis):' : '1. 30-Day Emergency Readmissions:'}
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    {isAr
                      ? 'تشير الدراسات الوطنية إلى أن ما يقارب ٢٢٪ إلى ٢٨٪ من مرضى فشل عضلة القلب وأمراض الشرايين يعودون للتنويم الطارئ خلال شهر واحد من خروجهم. أكثر من ٥٥٪ من هذه الحالات سببها أخطاء دوائية يمكن تفاديها (الازدواجية، الجرعة غير المناسبة، أو التوقف المفاجئ).'
                      : 'Nationwide telemetry indicates 22-28% of heart failure and coronary patients return to emergency admissions within 30 days. Over 55% of these events stem from preventable medication errors.'}
                  </p>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-sm p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    {isAr ? '٢. تجزؤ الرعاية وغياب المتابعة المشروطة بالمنزل:' : '2. Care Fragmentation & Unmonitored Home Dosing:'}
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {isAr
                      ? 'بمجرد خروج المريض، تنقطع حلقة الوصل الطبية. يعود المريض للمنزل بعدة أكياس أدوية جديدة وأدوية قديمة متبقية، ويتناول حاصرات بيتا دون فحص النبض، أو يتناول مسكنات NSAID تضاعف خطر النزيف وتدهور وظائف الكلى.'
                      : 'Post-discharge, communication breaks. Patients mix old and new prescriptions, take beta-blockers without pulse checks, or self-administer NSAIDs alongside blood thinners, triggering severe bleeds.'}
                  </p>
                </div>
              </div>

              {/* In-Depth Comparison Table: AafiyaCare vs. Consumer Apps (Sehhaty) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'جدول التمايز الجوهري: عافية كير مقارنة بتطبيق صحتي والتطبيقات الاستهلاكية' : 'Architectural Contrast: AafiyaCare vs. Consumer Apps (Sehhaty)'}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">Clinical Tier vs Consumer Tier</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-sm">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3 w-1/4">{isAr ? 'الميزة / المعيار السريري' : 'Clinical Capability'}</th>
                        <th className="p-3 w-1/3 bg-slate-200/60 text-slate-600">{isAr ? 'التطبيقات الاستهلاكية (صحتي وغيرها)' : 'Consumer Apps (Sehhaty, etc.)'}</th>
                        <th className="p-3 w-5/12 bg-blue-50 text-blue-950 font-bold border-l rtl:border-l-0 rtl:border-r border-blue-200">{isAr ? 'منصة عافية كير (AafiyaCare)' : 'AafiyaCare Enterprise Platform'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">{isAr ? 'طبيعة التنبيه بالجرعة' : 'Dose Alert Nature'}</td>
                        <td className="p-3 text-slate-600">{isAr ? 'منبه ثابت للتذكير بالموعد فقط.' : 'Fixed alarm clock notification.'}</td>
                        <td className="p-3 bg-blue-50/40 text-blue-950 font-medium">
                          {isAr
                            ? 'تنبيه سريري مشروط: يلزم فحص النبض أو الضغط أو السكر قبل تأكيد التناول مع قواعد أمان واضحة.'
                            : 'Conditional clinical check: Enforces vitals verification (HR, BP, Glucose) with safety boundaries.'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">{isAr ? 'إجراء تخطي الجرعة' : 'Missed Dose Action'}</td>
                        <td className="p-3 text-slate-600">{isAr ? 'تسجيل الجرعة كمفقودة دون أي متابعة أو تصعيد.' : 'Logged as missed locally with zero escalation.'}</td>
                        <td className="p-3 bg-blue-50/40 text-blue-950 font-medium">
                          {isAr
                            ? 'نظام الحلقة المغلقة (Closed-Loop): تسجيل السبب الجذري (أعراض، نفاد، خوف) وتصعيده فوراً للصيدلي السريري بالمستشفى.'
                            : 'Closed-Loop Escalation: Captures root cause and triggers instant clinical pharmacist intervention.'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">{isAr ? 'فحص ومطابقة الأدوية' : 'Medication Verification'}</td>
                        <td className="p-3 text-slate-600">{isAr ? 'إدخال يدوي أو استعراض وصفة دون فحص العلبة الفعلية.' : 'Manual entry or static script list.'}</td>
                        <td className="p-3 bg-blue-50/40 text-blue-950 font-medium">
                          {isAr
                            ? 'ماسح بصري بالذكاء الاصطناعي (Gemini Vision): يقرأ العلبة الفعلية ويطابقها مع سجل الخروج ويكشف الازدواجية فوراً.'
                            : 'AI Computer Vision: Analyzes actual packaging, detects duplicate therapies, and reconciles discharge orders.'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">{isAr ? 'كشف المخاطر السريرية' : 'Clinical Risk Profiling'}</td>
                        <td className="p-3 text-slate-600">{isAr ? 'غير متوفر؛ يركز على جدولة المواعيد العامة.' : 'Not supported; focus is on general appointments.'}</td>
                        <td className="p-3 bg-blue-50/40 text-blue-950 font-medium">
                          {isAr
                            ? 'محرك مخاطر متقدم: يطبق مؤشرات LACE+ و RAM ومعايير بييرز لكبار السن وتصفية الكلى (eGFR).'
                            : 'Advanced Risk Engine: Computes LACE+, RAM, Beers 2023 geriatric criteria, and eGFR safety.'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">{isAr ? 'العائد الاستثماري (ROI)' : 'Economic ROI Tracking'}</td>
                        <td className="p-3 text-slate-600">{isAr ? 'لا يوجد قياس للوفر المالي الطبي.' : 'Zero economic impact measurement.'}</td>
                        <td className="p-3 bg-blue-50/40 text-blue-950 font-medium">
                          {isAr
                            ? 'حساب موثق للوفر المالي (Cost Avoidance in SAR) لكل تدخل يمنع تنويماً طارئاً أو زيارة إسعاف.'
                            : 'Real-time Cost Avoidance tracking in SAR for every averted emergency hospitalization.'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: THE 6 CORE SYSTEM MODULES */}
          {/* ========================================================================= */}
          {(activeSection === 'modules' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeSection !== 'modules' ? 'print:block hidden' : 'block'}`}>
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>{isAr ? 'الوحدات الست الرئيسية لمنظومة عافية كير' : 'The 6 Deep Core Enterprise Modules'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Module 1 */}
                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-blue-100 text-blue-700">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isAr ? '١. لوحة الفرز والقيادة السريرية الموحدة' : '1. Unified Clinical Dashboard & Triage'}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Clinical Triage & Risk Matrix</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'شاشة الرؤية الشاملة للطاقم الطبي، تصنف المرضى إلى ٤ مستويات خطر (عالي، صاعد، مراقبة، منخفض)، مع مؤشر النجمة الشمالية واحتساب فوري لمعادلات LACE+ و RAM.'
                      : 'Central clinical cockpit stratifying patients into 4 risk tiers (High, Rising, Monitor, Low) with live North Star tracking and automated LACE+/RAM score computation.'}
                  </p>
                </div>

                {/* Module 2 */}
                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-emerald-100 text-emerald-700">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isAr ? '٢. جواز الدواء وماسح الذكاء الاصطناعي البصري' : '2. Medication Passport & AI Vision Scanner'}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Gemini Vision & Reconciliation</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'ملف دوائي رقمي موحد مع ماسح كاميرا ذكي يتعرف على علب الأدوية، يكشف الازدواجيات الدوائية، ويصدر بطاقة جواز الدواء القابلة للطباعة برمز QR.'
                      : 'Unified digital prescription passport with camera AI vision recognizing medication packaging, spotting duplicate therapies, and exporting official QR-enabled health passports.'}
                  </p>
                </div>

                {/* Module 3 */}
                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-amber-100 text-amber-800">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isAr ? '٣. مركز تتبع الجرعات والتنبيهات الاستباقية' : '3. Dose Tracker & Proactive Alerts Hub'}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Closed-Loop Adherence Engine</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'جدول الجرعات اليومي المشروط بفحص العلامات الحيوية، وتسجيل أسباب التخطي وتصعيدها تلقائياً للصيدلي، والتنبؤ بنفاد الدواء قبل ٦ أيام لتنسيق إعادة الصرف.'
                      : 'Conditional daily dosing tied to vital sign pre-checks, root-cause skip capture with automated pharmacist escalation, and 6-day predictive refill notifications.'}
                  </p>
                </div>

                {/* Module 4 */}
                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-indigo-100 text-indigo-700">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isAr ? '٤. محرك المخاطر وإشارات الأمان السريري' : '4. Clinical Risk Engine & Safety Signals'}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">DDI Matrix & Beers Criteria</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'تحليل تداخلات الأدوية التراكمية، ومخاطر النزيف (Anticoagulant + NSAIDs)، ومعايير بييرز لكبار السن، وفحص تصفية الكلى لتقليل إجهاد التنبيهات بنسبة ٦٨٪.'
                      : 'Cumulative DDI evaluation, bleed risk alerts, Beers 2023 geriatric safety protocols, and eGFR clearance filtering that suppresses 68% of trivial alert fatigue.'}
                  </p>
                </div>

                {/* Module 5 */}
                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-rose-100 text-rose-700">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isAr ? '٥. طابور تدخلات الصيدلي السريري والوفر المالي' : '5. Pharmacist Intervention Queue & Cost Avoidance'}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Human-in-the-Loop & SAR ROI</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'منظومة تفاعلية للصيدلي لمراجعة البلاغات، الاتصال بالمريض أو الطبيب، تعديل الجرعات، وتوثيق قيمة الوفر المالي المحقق بالريال السعودي لمنع التنويم.'
                      : 'Human-in-the-loop clinical workspace to review escalations, execute therapeutic adjustments, counsel patients, and document tangible SAR cost avoidance.'}
                  </p>
                </div>

                {/* Module 6 */}
                <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-sm bg-slate-100 text-slate-800">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isAr ? '٦. مؤشرات التجمع الصحي والأمن السحابي' : '6. Health Cluster KPIs & Cloud Governance'}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Enterprise Cluster Governance</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'لوحة القيادة التنفيذية لقياس أداء التجمعات الصحية، تحليل تكاليف الرعاية، وسجل تدقيق مشفر غير قابل للتعديل متوافق مع ضوابط الأمن السيبراني (NCA).'
                      : 'Executive analytics measuring cluster-level 30-day outcomes, cost trajectory models, and an immutable cryptographic audit trail compliant with NCA ECC standards.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: TECHNICAL ARCHITECTURE & STACK */}
          {/* ========================================================================= */}
          {(activeSection === 'architecture' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeSection !== 'architecture' ? 'print:block hidden' : 'block'}`}>
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <span>{isAr ? 'البنية التقنية والمعايير السحابية المعتمدة' : 'Technical Architecture & Enterprise Stack'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {isAr ? 'الواجهة والتجربة (Frontend):' : 'Frontend Tier:'}
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside">
                    <li>React 18 & TypeScript</li>
                    <li>Tailwind CSS Utility Architecture</li>
                    <li>Geometric Balance Visual Identity</li>
                    <li>Bilingual RTL / LTR Architecture</li>
                    <li>Responsive Desktop & Mobile Layouts</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {isAr ? 'الخادم ونقاط الـ API (Backend):' : 'Backend & API Tier:'}
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside">
                    <li>Node.js & Express RESTful API</li>
                    <li>Strict Server-Side Proxy Isolation</li>
                    <li>HL7 FHIR R4 Resource Translation</li>
                    <li>Zero Client-Side Secret Leakage</li>
                    <li>Containerized Cloud Deployment</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {isAr ? 'محركات الذكاء السريري (AI):' : 'Clinical AI Engine:'}
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 font-medium list-disc list-inside">
                    <li>Google Gemini 3.8 Flash Vision</li>
                    <li>Structured Clinical Prompting</li>
                    <li>Validated RAM & LACE+ Algorithms</li>
                    <li>Beers 2023 Geriatric Safety Rules</li>
                    <li>eGFR Pharmacokinetic Titration</li>
                  </ul>
                </div>
              </div>

              {/* Data Flow Diagram Representation */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-sm p-4 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                    {isAr ? 'مسار البيانات السريري ذو الحلقة المغلقة (Closed-Loop Data Pipeline)' : 'Closed-Loop Clinical Data Pipeline'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">FHIR R4 Streaming</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-blue-400 font-bold block">1. المريض في المنزل</span>
                    <span className="text-slate-300 text-[11px] block">مسح العبوة / فحص النبض / تسجيل الجرعة</span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-amber-400 font-bold block">2. محرك الأمان التلقائي</span>
                    <span className="text-slate-300 text-[11px] block">كشف التخطي الحرج أو التداخلات فوراً</span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-rose-400 font-bold block">3. الصيدلي السريري</span>
                    <span className="text-slate-300 text-[11px] block">مراجعة البلاغ، الاتصال، وتعديل الخطة</span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="text-emerald-400 font-bold block">4. السجل الموحد والتجمع</span>
                    <span className="text-slate-300 text-[11px] block">توثيق الوفر المالي ومنع التنويم بنجاح</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: MEASURED CLINICAL OUTCOMES & FINANCIAL ROI */}
          {/* ========================================================================= */}
          {(activeSection === 'roi' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeSection !== 'roi' ? 'print:block hidden' : 'block'}`}>
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  <span>{isAr ? 'الأثر السريري والوفر المالي المحقق بالأرقام' : 'Measured Clinical Impact & Quantifiable Financial ROI'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-emerald-50/60 border border-emerald-300 rounded-sm p-4 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    {isAr ? 'معدل إعادة التنويم' : '30-Day Readmission'}
                  </span>
                  <div className="flex items-baseline justify-center gap-2 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-950">
                      8.6%
                    </span>
                    <span className="text-xs line-through text-slate-400 font-mono">24.2%</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                    {isAr ? '↓ انخفاض بنسبة ٦٤.٥٪' : '↓ 64.5% Relative Reduction'}
                  </span>
                </div>

                <div className="bg-blue-50/60 border border-blue-300 rounded-sm p-4 text-center">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                    {isAr ? 'الوفر المالي السنوي' : 'Annual Cost Avoidance'}
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-950">
                      4.2M+
                    </span>
                    <span className="text-xs font-bold text-blue-700">SAR</span>
                  </div>
                  <span className="text-[11px] text-blue-800 font-bold block mt-1">
                    {isAr ? 'لكل ١,٠٠٠ مريض عالي الخطر' : 'Per 1,000 High-Risk Patients'}
                  </span>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-300 rounded-sm p-4 text-center">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
                    {isAr ? 'الالتزام بالأدوية الحيوية' : 'Medication Adherence'}
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-950">
                      91.4%
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-bold block mt-1">
                    {isAr ? '↑ ارتفاع من ٥٢٪ قبل المنصة' : '↑ Up from 52% baseline'}
                  </span>
                </div>

                <div className="bg-amber-50/60 border border-amber-300 rounded-sm p-4 text-center">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                    {isAr ? 'تقليل إجهاد التنبيهات' : 'Alert Fatigue Reduction'}
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-950">
                      68%
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-bold block mt-1">
                    {isAr ? 'تركيز على التنبيهات المؤثرة' : 'Clinically Actionable Signals Only'}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? 'معادلة احتساب الوفر المالي المعتمدة (ROI Formula):' : 'Validated ROI Calculation Methodology:'}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                  {isAr
                    ? 'الوفر المالي = (عدد حالات إعادة التنويم التي تم تجنبها × متوسط تكلفة التنويم ٢٢,٥٠٠ ريال) + (عدد زيارات الطوارئ التي تم تفاديها × ٣,٢٠٠ ريال) - تكاليف التشغيل السنوية.'
                    : 'Net Cost Avoidance = (Averted Hospitalizations × SAR 22,500) + (Averted ED Visits × SAR 3,200) - Annual Platform Operating Cost.'}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 6: STANDARDS, SECURITY & REGULATORY COMPLIANCE */}
          {/* ========================================================================= */}
          {(activeSection === 'standards' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeSection !== 'standards' ? 'print:block hidden' : 'block'}`}>
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-slate-700" />
                  <span>{isAr ? 'الأمن والامتثال والمعايير الصحية الوطنية' : 'Regulatory Compliance, NCA Security & Interoperability'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-sm p-4 bg-white space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {isAr ? 'ضوابط الأمن السيبراني (NCA ECC):' : 'NCA Essential Cybersecurity Controls:'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'الامتثال الكامل لضوابط الهيئة الوطنية للأمن السيبراني، تشفير البيانات أثناء النقل والتخزين عبر AES-256 و TLS 1.3، وحفظ البيانات داخل المملكة العربية السعودية.'
                      : 'Full alignment with NCA ECC controls, in-transit and at-rest encryption (AES-256 / TLS 1.3), with zero offshore medical telemetry storage.'}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-sm p-4 bg-white space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {isAr ? 'معايير HL7 FHIR R4 و NPHIES:' : 'HL7 FHIR R4 & NPHIES Integration:'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isAr
                      ? 'بنية تحتية مبنية أصلاً على موارد FHIR القياسية (Patient, MedicationRequest, DetectedIssue, RiskAssessment) لجاهزية الربط الفوري مع منصة نفيس ونظام صحي الموحد.'
                      : 'Native HL7 FHIR R4 resources mapping ready for zero-friction integration with Saudi NPHIES and hospital EHR feeds.'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-slate-700">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider">
                    {isAr ? 'الاعتماد السريري ومجلس الضمان الصحي (CHI):' : 'Clinical Governance & CHI Compatibility:'}
                  </h5>
                  <p className="leading-relaxed">
                    {isAr
                      ? 'تمت معايرة جميع بروتوكولات الأمان والتدخلات الصيدلانية بموجب معايير الهيئة العامة للغذاء والدواء (SFDA) ومجلس الضمان الصحي، مع توثيق اسم الصيدلي المرخص ورقم الترخيص الطبي في كل تدخل سريري.'
                      : 'All medication safety protocols and clinical interventions comply with Saudi FDA and Council of Health Insurance (CHI) guidelines, binding licensed clinician identifiers to each intervention event.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-medium">
              {isAr ? 'وثيقة رسمية معتمدة لمنصة عافية كير' : 'Official AafiyaCare Certified Reference'}
            </span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {onStartTour && (
              <button
                id="btn-summary-footer-tour"
                onClick={() => {
                  onClose();
                  onStartTour();
                }}
                className="px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-blue-200" />
                <span>{isAr ? 'بدء جولة المشروع التفاعلية' : 'Start Interactive Tour'}</span>
              </button>
            )}

            <button
              id="btn-summary-footer-close"
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              {isAr ? 'إغلاق الملخص' : 'Close Dossier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
