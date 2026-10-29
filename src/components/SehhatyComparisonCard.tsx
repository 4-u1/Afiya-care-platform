import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Stethoscope,
  FileText,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Info
} from 'lucide-react';
import { Language } from '../types';

interface SehhatyComparisonProps {
  lang: Language;
  onClose?: () => void;
  isModal?: boolean;
}

export const SehhatyComparisonCard: React.FC<SehhatyComparisonProps> = ({
  lang,
  onClose,
  isModal = false
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'matrix' | 'scenario' | 'pitch'>('matrix');
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const comparisonRows = [
    {
      id: 'objective',
      dimAr: 'الهدف الأساسي والوظيفة',
      dimEn: 'Core Objective & Function',
      sehhatyAr: 'أرشفة السجل الطبي وعرض البيانات والوصفات للمواطن مع تسهيل حجز المواعيد والخدمات العامة.',
      sehhatyEn: 'Archiving medical records, displaying prescriptions, and facilitating patient appointments.',
      aafiyaAr: 'التنبؤ الاستباقي بالانتكاسة السريرية والتدخل السريع قبل وصول المريض لأزمة الطوارئ.',
      aafiyaEn: 'Predictive clinical deterioration forecasting & proactive intervention before emergency crises.',
      advantageAr: 'استباقي تنبؤي بدلاً من كونه مجرد أرشيف ساكن',
      advantageEn: 'Proactive & predictive rather than a passive archive'
    },
    {
      id: 'user',
      dimAr: 'المستخدم الأساسي والمستفيد',
      dimEn: 'Primary User & Beneficiary',
      sehhatyAr: 'المريض / المواطن كبوابة خدمات شخصية لمتابعة سجلاته (B2C Patient Portal).',
      sehhatyEn: 'Patient/Citizen as a personal portal for their personal records (B2C Patient Portal).',
      aafiyaAr: 'الصيدلي السريري، طبيب التجمع الصحي، وفرق إدارة الأمراض المزمنة (B2B/B2G Clinical Command Center).',
      aafiyaEn: 'Clinical pharmacists, hospital cluster physicians, and chronic disease care teams (B2B/B2G).',
      advantageAr: 'أداة قرار سريرية في يد الفريق الطبي وليس مجرد شاشة للمريض',
      advantageEn: 'Direct clinical decision engine for doctors and pharmacists'
    },
    {
      id: 'data_behavior',
      dimAr: 'طبيعة التعامل مع البيانات',
      dimEn: 'Data Nature & Behavior',
      sehhatyAr: 'ساكن وتاريخي (Passive & Historical): يسجل ما حدث في الماضي (وصفة سابقة، موعد مكتمل).',
      sehhatyEn: 'Passive & Historical: records past events (previous prescription, past appointments).',
      aafiyaAr: 'حي وتنبؤي مغلق (Active & Closed-Loop): يدمج سرعة الصرف + التحاليل + الالتزام للتنبؤ بما سيحدث غداً.',
      aafiyaEn: 'Active & Closed-Loop: fuses refill velocity + labs + adherence to forecast upcoming risks.',
      advantageAr: 'رؤية مستقبلية استشرافية تعتمد على تحليلات متعددة المصادر',
      advantageEn: 'Forward-looking multi-source analytical fusion'
    },
    {
      id: 'alert_triage',
      dimAr: 'منطق التنبيهات وإرهاق الأطباء',
      dimEn: 'Alert Logic & Clinical Fatigue',
      sehhatyAr: 'تنبيهات مواعيد عامة، أو قواعد ثابتة (Rule-based) تطلق إنذاراً لكل تداخل دوائي مما يسبب تجاهل الأطباء.',
      sehhatyEn: 'Generic appointment alerts or rigid rule checks that flood clinicians with noisy alerts.',
      aafiyaAr: 'فرز ذكي (Precision Triage): خفض إرهاق التنبيهات بنسبة 78.5%، وإظهار الحالات الحرجة المقترنة بتوصية جاهزة.',
      aafiyaEn: 'Precision Triage: 78.5% reduction in alert fatigue, surfacing only critical cases with actionable drafts.',
      advantageAr: 'تصفية ذكية تلغي الضوضاء وتركز على الخطر الحقيقي',
      advantageEn: 'Eliminates alert noise and targets genuine life hazards'
    },
    {
      id: 'cross_signal',
      dimAr: 'الربط بين الإشارات (Cross-Signal)',
      dimEn: 'Cross-Signal Correlation',
      sehhatyAr: 'يعرض قائمة الأدوية في صفحة، والتحاليل المخبرية في صفحة أخرى دون ربط ديناميكي بينهما.',
      sehhatyEn: 'Displays medications on one page and lab reports on another without live dynamic cross-linking.',
      aafiyaAr: 'ربط لحظي: دمج هبوط وظائف الكلى (eGFR) مع بدء مسكن NSAID وتأخر منظم السكر لإطلاق إنذار فوري.',
      aafiyaEn: 'Real-time fusion: links eGFR decline + new NSAID + delayed refill to flag acute renal damage.',
      advantageAr: 'اكتشاف التناقضات الخطرة بين التحاليل والأدوية تلقائياً',
      advantageEn: 'Automatic detection of multi-drug lab contradictions'
    },
    {
      id: 'actionability',
      dimAr: 'آلية التدخل والمسؤولية الطبية',
      dimEn: 'Actionability & Workflow',
      sehhatyAr: 'تعتمد على وعي المريض وحضوره بعد تدهور صحته وشعوره بالأعراض.',
      sehhatyEn: 'Relies on patient self-awareness to seek help after physical symptoms emerge.',
      aafiyaAr: 'تمنح الطبيب مسودة تدخل سريري جاهزة بضغطة زر للتواصل الفوري وتعديل الجرعة قبل الطوارئ.',
      aafiyaEn: 'Provides one-click actionable clinical intervention drafts to contact patient and modify regimen early.',
      advantageAr: 'تدخل موجه وموثق في دقائق معدودة يمنع التنويم',
      advantageEn: 'Documented, targeted intervention preventing hospitalization'
    },
    {
      id: 'financial_roi',
      dimAr: 'الأثر المالي المباشر (ROI)',
      dimEn: 'Financial Impact & ROI',
      sehhatyAr: 'تقليل التعاملات الورقية وتوثيق الاستهلاك والمواعيد.',
      sehhatyEn: 'Paperless transformation and operational service tracking.',
      aafiyaAr: 'وفر مالي ضخم ومباشر عبر منع الهدر الدوائي وتفادي تكاليف التنويم بالعناية المركزة وزيارات الطوارئ.',
      aafiyaEn: 'Direct cost avoidance: curbs drug waste and avoids costly ICU and repeated ER admissions.',
      advantageAr: 'عائد استثماري صحي ومالي قابل للقياس المباشر بالريال',
      advantageEn: 'Measurable SAR-denominated healthcare cost avoidance'
    },
    {
      id: 'ecosystem',
      dimAr: 'التموضع في المنظومة الوطنية',
      dimEn: 'National Ecosystem Role',
      sehhatyAr: 'البنية التحتية والواجهة الوطنية الموحدة الشاملة لخدمة المواطن.',
      sehhatyEn: 'The national foundation portal and public citizen interface.',
      aafiyaAr: 'محرك الذكاء والفرز السريري الاستباقي (Intelligence Overlay) المتكامل معها عبر معايير نفيس و HL7 FHIR.',
      aafiyaEn: 'The specialized proactive clinical intelligence overlay integrating via Nphies & HL7 FHIR.',
      advantageAr: 'تكامل تكافلي وليس منافسة: عافية كير هي العقل السريري الداعم',
      advantageEn: 'Complementary synergy: AafiyaCare acts as the clinical brain'
    }
  ];

  const handleCopyPitch = () => {
    const text = isAr
      ? `المقارنة بين سجل المريض الموحد (صحتي) ومحرك المخاطر التنبؤي (عافية كير):\n\n«صحتي تجيب عن سؤال: ما هي أدوية المريض وماذا كُتب له بالأمس؟ بينما عافية كير تجيب عن سؤال: أي هؤلاء المرضى سيتعرض لانتكاسة حرجة خلال 72 ساعة، وكيف نتدخل الآن لمنعها؟»\n\n- صحتي: أرشفة وعرض بيانات للمواطن (Passive Record)\n- عافية كير: فرز ذكي وتدخل استباقي للطبيب والصيدلي (Active Predictive Engine)\n- تكامل تام عبر معايير نفيس و HL7 FHIR لخدمة مستهدفات رؤية المملكة 2030.`
      : `Comparison between Unified Record (Sehhaty) & Predictive Risk Engine (AafiyaCare):\n\n"Sehhaty answers: What are the patient's meds and what was written yesterday? AafiyaCare answers: Which patient will face a critical breakdown within 72 hours, and how do we intervene right now to prevent it?"\n\n- Sehhaty: Citizen health portal & passive records.\n- AafiyaCare: Predictive clinical intelligence & proactive triage for healthcare providers.\n- Seamless FHIR & Nphies integration serving Vision 2030 Healthcare Transformation.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      id="sehhaty-comparison-component"
      className={`rounded-sm border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 ${
        isModal ? 'max-w-5xl w-full mx-auto my-auto max-h-[90vh] flex flex-col' : 'w-full'
      }`}
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-4 sm:p-6 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5" />
                {isAr ? 'مقارنة معيارية للمنظومة' : 'Ecosystem Comparative Benchmark'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                {isAr ? 'تكامل تكافلي • ليس منافسة' : 'Synergistic Integration • Not Competition'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{isAr ? 'سجل المريض الموحد (تطبيق صحتي)' : 'Unified Patient Record (Sehhaty)'}</span>
              <span className="text-slate-400 font-normal text-sm">{isAr ? 'مقابل' : 'vs'}</span>
              <span className="text-blue-400 font-bold">{isAr ? 'محرك المخاطر التنبؤي (عافية كير)' : 'Predictive Risk Engine (AafiyaCare)'}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {isAr
                ? 'توضيح الفارق الجوهري بين البوابة الرقمية العامة لعرض السجلات وبين طبقة الذكاء السريري الاستباقية الداعمة للأطباء والصيادلة.'
                : 'Clarifying the architectural distinction between public citizen record portals and proactive clinical intelligence overlays.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              id="btn-copy-pitch-summary"
              onClick={handleCopyPitch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title={isAr ? 'نسخ الجملة الذهبية للشرح أمام اللجنة' : 'Copy pitch quote for presentation'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>{isAr ? 'نسخ ملخص اللجنة' : 'Copy Pitch'}</span>
                </>
              )}
            </button>

            {!isModal && (
              <button
                type="button"
                id="btn-toggle-collapse-comparison"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isCollapsed ? (isAr ? 'توسيع الجدول' : 'Expand') : (isAr ? 'طي الجدول' : 'Collapse')}
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            )}

            {isModal && onClose && (
              <button
                type="button"
                id="btn-close-comparison-modal"
                onClick={onClose}
                className="p-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto">
          <button
            type="button"
            id="tab-btn-matrix"
            onClick={() => {
              setActiveTab('matrix');
              setIsCollapsed(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? 'مصفوفة المقارنة الشاملة (8 أبعاد)' : 'Comprehensive Matrix (8 Dimensions)'}</span>
          </button>

          <button
            type="button"
            id="tab-btn-scenario"
            onClick={() => {
              setActiveTab('scenario');
              setIsCollapsed(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scenario'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'سيناريو سريري حي (مقارنة واقعية)' : 'Live Clinical Scenario'}</span>
          </button>

          <button
            type="button"
            id="tab-btn-pitch"
            onClick={() => {
              setActiveTab('pitch');
              setIsCollapsed(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pitch'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'مفاتيح الإجابة أمام لجنة التحكيم' : 'Judges Pitch Cheatsheet'}</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!isCollapsed && (
        <div className={`p-4 sm:p-6 ${isModal ? 'overflow-y-auto flex-1' : ''}`}>
          {/* TAB 1: Comparison Matrix */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              {/* Executive Summary Quote Callout */}
              <div className="p-3.5 sm:p-4 rounded-sm bg-blue-50/80 border-s-4 border-blue-600 border-t border-b border-e border-blue-100 text-xs sm:text-sm text-slate-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isAr ? 'القاعدة الذهبية للتفريق أمام اللجان والمسؤولين:' : 'The Golden Rule for Differentiating to Panels:'}
                  </span>
                  <p className="leading-relaxed text-slate-700 font-medium">
                    {isAr
                      ? '« تطبيق صحتي يجيب عن سؤال: "ما هي أدوية المريض وماذا كُتب له في الماضي؟" بينما عافية كير تجيب عن سؤال: "أيّ هؤلاء المرضى يوشك على انتكاسة حرجة خلال 72 ساعة، وما هو التدخل السريري الفوري لمنعها؟" »'
                      : '"Sehhaty answers: What are the patient’s meds and what was documented in the past? While AafiyaCare answers: Which patient is nearing a critical breakdown within 72 hours, and what is the exact clinical action to prevent it?"'}
                  </p>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-sm">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700">
                      <th className="p-3 font-bold text-start w-[20%]">
                        {isAr ? 'وجه المقارنة' : 'Evaluation Dimension'}
                      </th>
                      <th className="p-3 font-bold text-start w-[35%] bg-slate-100/60 border-s border-slate-200">
                        <div className="flex items-center gap-2">
                          <Database className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isAr ? 'السجل الصحي الموحد (صحتي / نفيس)' : 'Unified Record (Sehhaty / Nphies)'}</span>
                        </div>
                      </th>
                      <th className="p-3 font-bold text-start w-[45%] bg-blue-50/50 border-s border-blue-200 text-blue-950">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-bold">{isAr ? 'محرك المخاطر التنبؤي (AafiyaCare)' : 'Predictive Risk Engine (AafiyaCare)'}</span>
                          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            {isAr ? 'استباقي' : 'Proactive'}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {comparisonRows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                        }`}
                      >
                        <td className="p-3 align-top font-bold text-slate-900 border-e border-slate-200">
                          <div>{isAr ? row.dimAr : row.dimEn}</div>
                          <div className="text-[10px] text-blue-700 font-semibold mt-1">
                            {isAr ? row.advantageAr : row.advantageEn}
                          </div>
                        </td>
                        <td className="p-3 align-top text-slate-600 leading-relaxed border-e border-slate-200 bg-slate-50/20">
                          <div className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                            <span>{isAr ? row.sehhatyAr : row.sehhatyEn}</span>
                          </div>
                        </td>
                        <td className="p-3 align-top text-slate-800 leading-relaxed bg-blue-50/20">
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="font-medium text-slate-900">{isAr ? row.aafiyaAr : row.aafiyaEn}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Live Clinical Scenario */}
          {activeTab === 'scenario' && (
            <div className="space-y-4">
              <div className="p-4 rounded-sm bg-slate-900 text-white">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="font-bold text-sm">
                      {isAr ? 'حالة دراسية مقارنة: المريض "أبو فهد" (62 عاماً)' : 'Comparative Case Study: "Abu Fahad" (62y)'}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {isAr ? 'مريض سكري وضغط وفشل قلبي معتدل' : 'Hypertension + T2D + Moderate Heart Failure'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {isAr
                    ? 'زار أبو فهد عيادة العظام بسبب آلام بالركبة ووُصف له مسكن مضاد للالتهاب (Diclofenac 50mg)، بينما يتناول من قبل (Candesartan) و (Metformin). إليك كيف تتعامل كل منصة مع الواقعة:'
                    : 'Abu Fahad visited an orthopedic clinic for knee pain and was prescribed Diclofenac 50mg, while already on Candesartan (ARB) & Metformin. Here is how each system behaves:'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Sehhaty Behavior */}
                <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-600" />
                      <span className="font-bold text-sm text-slate-800">
                        {isAr ? 'في تطبيق صحتي / السجل الموحد' : 'In Sehhaty / Unified Portal'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {isAr ? 'سجل ساكن' : 'Passive Record'}
                    </span>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{isAr ? 'تظهر الوصفة الجديدة "ديكلوفيناك" في قائمة أدوية المريض كـ "سارية المفعول".' : 'The new prescription shows in medication list as "Active".'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{isAr ? 'لا يوجد إنذار سريري يربط بين المسكن وبين تحليل وظائف الكلى السابق (eGFR = 42).' : 'No live alert correlating the NSAID with his declining renal lab (eGFR 42).'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{isAr ? 'طبيب الأسرة في المركز الصحي لا يعلم أن المريض بدأ مسكناً من عيادة العظام.' : 'Primary care physician remains unaware that an NSAID was initiated elsewhere.'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-rose-700 font-medium">
                      <span className="font-bold">⚠️</span>
                      <span>{isAr ? 'النتيجة الواقعية: يدخل أبو فهد بعد 10 أيام إلى طوارئ المستشفى بفشل كلوي حاد (Acute Kidney Injury) وارتفاع بوتاسيوم خطير.' : 'Outcome: Patient admitted to ER 10 days later with Acute Kidney Injury and hyperkalemia.'}</span>
                    </li>
                  </ul>
                </div>

                {/* Column 2: AafiyaCare Behavior */}
                <div className="p-4 rounded-sm border-2 border-blue-300 bg-blue-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-sm text-blue-950">
                        {isAr ? 'في منصة عافية كير (AafiyaCare)' : 'In AafiyaCare Risk Engine'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white font-mono">
                      {isAr ? 'تدخل استباقي 72h' : 'Proactive 72h'}
                    </span>
                  </div>

                  <ul className="text-xs text-slate-800 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{isAr ? 'يلتقط محرك المخاطر إشارة الصرف فوراً ويربطها بمثلث الخطر القاتل (Triple Whammy: NSAID + ARB + Renal Risk).' : 'Instantly captures refill signal and maps the Triple Whammy hazard (NSAID + ARB + low eGFR).'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{isAr ? 'يتم رفع الحالة في شريط الأولويات للصيدلي السريري مع مسودة تدخل معتمدة.' : 'Surfaces case to clinical pharmacist with an approved intervention draft.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{isAr ? 'التوصية المباشرة: استبدال الديكلوفيناك بـ Paracetamol موضعي أو آمن وطلب تحليل وظائف كلى فوري.' : 'Action: Switch to topical/safe analgesic and order immediate creatinine lab test.'}</span>
                    </li>
                    <li className="flex items-start gap-2 text-emerald-800 font-bold bg-emerald-100/70 p-2 rounded-xs">
                      <span>🎯</span>
                      <span>{isAr ? 'النتيجة السريرية: تم منع الفشل الكلوي الحاد، وحفظ حياة المريض، وتوفير أكثر من 38,000 ريال تكلفة تنويم وعناية مركزة.' : 'Clinical Outcome: Prevented acute dialysis, protected patient life, and saved >38,000 SAR in ICU/ER costs.'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Judges Pitch Cheatsheet */}
          {activeTab === 'pitch' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-sm border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isAr ? '1. التموضع السليم' : '1. Right Positioning'}
                  </div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {isAr ? 'نحن لا ننافس صحتي، نحن نُفعّلها' : 'We don’t compete with Sehhaty, we empower it'}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {isAr
                      ? 'صحتي هي الأوتوستراد الوطني لنقل البيانات، وعافية كير هي سيارة الإسعاف الذكية التي تراقب الطريق وتتدخل قبل التصادم.'
                      : 'Sehhaty is the national data highway; AafiyaCare is the smart clinical ambulance monitoring the route.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-sm border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isAr ? '2. المستهدف السريري' : '2. Clinical Target'}
                  </div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {isAr ? 'محاربة إرهاق التنبيهات (78.5%)' : 'Fighting Alert Fatigue (78.5%)'}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {isAr
                      ? 'الأنظمة التقليدية تطلق مئات التنبيهات غير المجدية، عافية كير تقدم فرزاً دقيقاً وتوصية علاجية بضغطة زر واحدة.'
                      : 'Legacy systems flood doctors with useless alerts. AafiyaCare delivers precision triage and 1-click clinical drafts.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-sm border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isAr ? '3. مستهدفات 2030' : '3. Vision 2030 Fit'}
                  </div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {isAr ? 'التحول من العلاج إلى الوقاية' : 'From Sick-Care to Preventive Healthcare'}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {isAr
                      ? 'ينسجم مباشرة مع نموذج الرعاية الصحية الحديث (Model of Care) وإدارة صحة السكان لخفض التنويم المتكرر.'
                      : 'Directly aligns with the modern Model of Care and population health to curb unnecessary readmissions.'}
                  </p>
                </div>
              </div>

              {/* Ready Speech Bullet Points */}
              <div className="p-4 rounded-sm bg-slate-100 border border-slate-200 text-xs text-slate-800 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  {isAr ? 'عبارات موصى باستخدامها شفهياً أثناء الإجابة:' : 'Recommended Verbal Phrasing for Abdulaziz:'}
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{isAr ? '«تطبيق صحتي هو الواجهة الوطنية الممتازة للمواطن، بينما عافية كير هي لوحة القيادة السريرية المخصصة للصيدلي والطبيب في التجمع الصحي.»' : '"Sehhaty is the excellent citizen portal; AafiyaCare is the clinical command center for doctors and clinical pharmacists."'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{isAr ? '«تكاملنا يعتمد على معيار HL7 FHIR ومنصة نفيس، بحيث نتغذى على سجلات الخروج والوصفات لنقدم طبقة ذكاء تنبؤي دون تكرار بناء البنية التحتية.»' : '"Our integration leverages HL7 FHIR and Nphies to ingest discharge and refill data, providing predictive intelligence without reinventing infrastructure."'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{isAr ? '«مؤشر نجاحنا الأسمى هو كم حالة حرجة منعناها من دخول الطوارئ، وكم ريالاً تم حفظه من الهدر الدوائي غير المبرر.»' : '"Our north star metric is how many emergency readmissions we prevented and how many SAR we saved from medication waste."'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">{isAr ? 'المعايير المعتمدة:' : 'Supported Standards:'}</span>
          <span className="font-mono text-slate-600">HL7® FHIR® R4 • Saudi Nphies • PDPL Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyPitch}
            className="text-blue-700 hover:text-blue-900 font-bold cursor-pointer"
          >
            {copied ? (isAr ? 'تم نسخ الملخص ✓' : 'Summary Copied ✓') : (isAr ? 'نسخ الجملة الذهبية' : 'Copy Golden Quote')}
          </button>
        </div>
      </div>
    </div>
  );
};
