import React, { useState } from 'react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import {
  BrainCircuit,
  ShieldAlert,
  Activity,
  CalendarCheck,
  TrendingDown,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { Language, RiskLevel } from '../types';

interface RiskEngineViewProps {
  lang: Language;
}

export const RiskEngineView: React.FC<RiskEngineViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  // Interactive Simulator state
  const [simMedCount, setSimMedCount] = useState<number>(5);
  const [simRecentDischarge, setSimRecentDischarge] = useState<boolean>(true);
  const [simMissedFollowUp, setSimMissedFollowUp] = useState<boolean>(true);
  const [simMissedDoses, setSimMissedDoses] = useState<number>(4);
  const [simHasAnticoagulantInteraction, setSimHasAnticoagulantInteraction] = useState<boolean>(true);
  const [simUnusedSurplus, setSimUnusedSurplus] = useState<boolean>(false);

  // Compute simulated risk score
  const calculateSimulatedRisk = () => {
    let score = 15;
    // Polypharmacy
    score += Math.min(25, (simMedCount - 1) * 5);
    // Care journey
    if (simRecentDischarge) score += 20;
    if (simMissedFollowUp) score += 15;
    // Engagement
    score += Math.min(20, simMissedDoses * 4);
    // Severe DDI
    if (simHasAnticoagulantInteraction) score += 25;
    // Surplus waste
    if (simUnusedSurplus) score += 10;

    const finalScore = Math.min(99, Math.max(10, score));
    let tier: RiskLevel = 'low';
    if (finalScore >= 80) tier = 'high';
    else if (finalScore >= 60) tier = 'rising';
    else if (finalScore >= 40) tier = 'monitor';

    return { score: finalScore, tier };
  };

  const simResult = calculateSimulatedRisk();

  return (
    <div className="space-y-8">
      {/* Overview Header - Geometric Balance Clean White Panel */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <AafiyaCareLogo 
            id="risk-engine-badge"
            variant="badge" 
            size="sm" 
            isAr={isAr} 
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAr ? 'محرك المخاطر التنبؤي وحلقة الذكاء المغلقة' : 'Predictive Risk Engine & Closed-Loop Intelligence'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
              {isAr
                ? 'تحليل متزامن للمخاطر عبر أربعة محاور وثلاثة مصادر إشارات رئيسية'
                : 'Concurrent multi-dimensional risk evaluation across 4 pillars and 3 signal sources'}
            </p>
          </div>
        </div>

        {/* Human-in-the-Loop Core Philosophy - Geometric Stepper */}
        <div className="mt-6 p-5 rounded-sm bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
            <div className="w-2 h-2 border border-blue-600 transform rotate-45" />
            <span>{isAr ? 'المبدأ الأساسي: الإنسان في الحلقة (Human-in-the-Loop)' : 'Core Principle: Human-in-the-Loop Architecture'}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 rounded-sm bg-white border border-slate-200 text-xs font-bold text-center shadow-xs">
            <span className="text-blue-700 px-3 py-1.5 rounded-sm bg-blue-50 border border-blue-200 uppercase tracking-wider">
              AI (الذكاء الاصطناعي)
            </span>
            <span className="text-slate-400 font-mono">→</span>
            <span className="text-amber-700 px-3 py-1.5 rounded-sm bg-amber-50 border border-amber-200 uppercase tracking-wider">
              Safety Signal (إشارة السلامة)
            </span>
            <span className="text-slate-400 font-mono">→</span>
            <span className="text-slate-800 px-3 py-1.5 rounded-sm bg-slate-100 border border-slate-200 uppercase tracking-wider">
              Clinical Review (مراجعة الصيدلي)
            </span>
            <span className="text-slate-400 font-mono">→</span>
            <span className="text-emerald-700 px-3 py-1.5 rounded-sm bg-emerald-50 border border-emerald-200 uppercase tracking-wider">
              Outcome (التدخل والنتيجة)
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-3 leading-relaxed text-center sm:text-start font-normal">
            {isAr
              ? '« الذكاء الاصطناعي لا يصدر قراراً علاجياً مستقلاً؛ يقوم بالتحليل وترتيب الأولويات واكتشاف الأنماط، بينما يبقى القرار السريري النهائي لدى المختص المخوّل »'
              : '"AI does not independently dictate clinical therapy; it discovers latent patterns and triages priorities, preserving the final therapeutic authority with the credentialed clinician."'}
          </p>
        </div>
      </div>

      {/* The 4 Pillars of Medication Risk (Geometric Balance Cards) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-none" />
          <span>{isAr ? 'المحاور الأربعة للمخاطر الدوائية المتراكمة' : 'The Four Pillars of Medication Risk'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono">01. Medication Safety</span>
              <div className="w-2 h-2 border border-blue-600 transform rotate-45" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">
              {isAr ? 'السلامة الدوائية' : 'Medication Safety'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'هل توجد إشارة سلامة دوائية أو تعارض حرج أو جرعة زائدة تحتاج مراجعة فورية؟'
                : 'Are there active adverse drug-drug interactions, duplicate therapies, or dosage anomalies?'}
            </p>
          </div>

          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono">02. Medication Adherence</span>
              <div className="w-2 h-2 border border-blue-600 transform rotate-45" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">
              {isAr ? 'الالتزام الدوائي' : 'Medication Adherence'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'هل يستخدم المريض العلاج كما هو مخطط له دون تفويت الجرعات الحيوية؟'
                : 'Is the patient consuming prescribed regimens on schedule without hazardous omissions?'}
            </p>
          </div>

          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono">03. Medication Continuity</span>
              <div className="w-2 h-2 border border-blue-600 transform rotate-45" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">
              {isAr ? 'استمرارية الرعاية' : 'Medication Continuity'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'هل استمرت رحلة المتابعة وإعادة الصرف بعد الخروج من المستشفى أو الزيارة؟'
                : 'Did the follow-up journey and prescription refills continue unbroken post-discharge?'}
            </p>
          </div>

          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono">04. Medication Waste</span>
              <div className="w-2 h-2 border border-blue-600 transform rotate-45" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1.5">
              {isAr ? 'الهدر الدوائي' : 'Medication Waste'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'هل توجد أدوية فائضة أو غير مستخدمة أو ازدواجية صيدلانية يمكن ترشيدها؟'
                : 'Are there stockpiled surplus, expired, or redundant therapies that can be deprescribed?'}
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Signal Sources Matrix - Geometric Balance */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-none" />
          <span>{isAr ? 'مصادر الإشارات الثلاث المغذية للمحرك' : 'Three Core Multi-Signal Feeders'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Signal 1: Medication Signals */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isAr ? 'إشارات دوائية (Medication)' : 'Medication Signals'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 uppercase font-bold">EMR + Wasfaty</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'عدد الأدوية وتعقيد جدول الجرعات (Polypharmacy)' : 'Number of concurrent drugs & dosage schedule complexity'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'تغييرات العلاج والتبديل المفاجئ' : 'Sudden therapy regimen adjustments'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'انتظام إعادة الصرف وانقطاعه (Wasfaty sync)' : 'Prescription refill cadence & disruption lapses'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'وجود أدوية فائضة غير مستخدمة بالمنزل' : 'Identified unused surplus supplies'}</span>
              </li>
            </ul>
          </div>

          {/* Signal 2: Care Journey Signals */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isAr ? 'إشارات رحلة الرعاية (Care Journey)' : 'Care Journey Signals'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 uppercase font-bold">Handoffs</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'الخروج حديثاً من المستشفى (نقطة العمى)' : 'Recent hospital discharge (post-acute blind spot)'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'عدم إكمال موعد المتابعة السريرية' : 'Missed or unconfirmed specialty clinic follow-up'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'تكرار التواصل أو مراجعة الطوارئ السابقة' : 'Frequent acute care touchpoints or prior ER admissions'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'تغييرات غير موثقة في الخطة العلاجية' : 'Unreconciled discharge prescriptions'}</span>
              </li>
            </ul>
          </div>

          {/* Signal 3: Patient Engagement Signals */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isAr ? 'إشارات تفاعل المريض (Engagement)' : 'Engagement Signals'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 uppercase font-bold">Patient App</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'عدم الاستجابة لتأكيد الجرعات الذكية' : 'Unacknowledged dose reminders on patient app'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'طلب المساعدة أو الاستفسار عن أعراض جانبية' : 'Self-reported side effects or assistance requests'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'نمط استخدام متذبذب أو انقطاع مفاجئ' : 'Erratic usage trajectory signaling impending relapse'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 mt-1.5 rounded-none shrink-0" />
                <span>{isAr ? 'فصل جهاز العلبة الذكية (Smart Pillbox)' : 'Disconnection of smart IoT dispenser sensors'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Risk Simulator for Clinicians - Geometric Balance */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
              <div className="w-2 h-2 border border-blue-600 transform rotate-45" />
              <span>{isAr ? 'محاكي تقييم المخاطر التفاعلي' : 'Interactive Risk Score Simulator'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {isAr ? 'اختبر كيفية استجابة خوارزمية الذكاء الاصطناعي للمتغيرات السريرية' : 'Simulate Real-time AI Risk Re-scoring with Clinical Variables'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Med count slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <span>{isAr ? 'عدد الأدوية الموصوفة متزامنة (Polypharmacy):' : 'Concurrent Medications Count:'}</span>
                <span className="text-blue-600 font-mono text-sm font-bold">{simMedCount} {isAr ? 'أدوية' : 'drugs'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={simMedCount}
                onChange={(e) => setSimMedCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Missed doses slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <span>{isAr ? 'الجرعات غير المؤكدة آخر ٧ أيام:' : 'Unconfirmed Doses in Last 7 Days:'}</span>
                <span className="text-rose-600 font-mono text-sm font-bold">{simMissedDoses} {isAr ? 'جرعات' : 'doses'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={simMissedDoses}
                onChange={(e) => setSimMissedDoses(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-sm bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={simRecentDischarge}
                  onChange={(e) => setSimRecentDischarge(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded-sm"
                />
                <span className="text-xs font-bold text-slate-700">
                  {isAr ? 'خروج حديث من المستشفى (خلال ٧ أيام)' : 'Recent Discharge (<7 Days)'}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-sm bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={simMissedFollowUp}
                  onChange={(e) => setSimMissedFollowUp(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded-sm"
                />
                <span className="text-xs font-bold text-slate-700">
                  {isAr ? 'موعد متابعة لم يتم تأكيده أو إكماله' : 'Uncompleted Follow-up Visit'}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-sm bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={simHasAnticoagulantInteraction}
                  onChange={(e) => setSimHasAnticoagulantInteraction(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded-sm"
                />
                <span className="text-xs font-bold text-slate-700">
                  {isAr ? 'تفاعل دوائي مهدد (مضاد تخثر + مسيل)' : 'Severe DDI (Anticoagulant + Antiplatelet)'}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-sm bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={simUnusedSurplus}
                  onChange={(e) => setSimUnusedSurplus(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded-sm"
                />
                <span className="text-xs font-bold text-slate-700">
                  {isAr ? 'وجود مخزون أدوية فائضة (>500 ريال)' : 'Surplus Stored Meds (>500 SAR)'}
                </span>
              </label>
            </div>
          </div>

          {/* Simulator Output Gauge - High-Contrast Dark Slate Geometric Console */}
          <div className="bg-[#0F172A] text-white rounded-sm p-6 border border-slate-800 flex flex-col items-center justify-between text-center shadow-sm">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {isAr ? 'النتيجة المحسوبة فوراً' : 'Calculated AI Risk Tier'}
            </span>

            <div className="my-4">
              <div
                className={`text-5xl font-black font-mono ${
                  simResult.tier === 'high'
                    ? 'text-rose-400'
                    : simResult.tier === 'rising'
                    ? 'text-amber-400'
                    : simResult.tier === 'monitor'
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {simResult.score}
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-mono">{isAr ? 'من أصل 100' : 'out of 100'}</div>

              <div className="mt-4">
                <span
                  className={`inline-block px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
                    simResult.tier === 'high'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : simResult.tier === 'rising'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : simResult.tier === 'monitor'
                      ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {simResult.tier === 'high' && (isAr ? 'أولوية قصوى (تدخل فوري)' : 'High Priority (Immediate)')}
                  {simResult.tier === 'rising' && (isAr ? 'خطر متصاعد (مراجعة ٢٤ ساعة)' : 'Rising Risk (24h Review)')}
                  {simResult.tier === 'monitor' && (isAr ? 'مراقبة استباقية' : 'Proactive Monitor')}
                  {simResult.tier === 'low' && (isAr ? 'خطر منخفض ومستقر' : 'Stable Low Risk')}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-sm border border-slate-800 w-full text-start">
              <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                {isAr ? 'توصية النظام السريري:' : 'Clinical Engine Action:'}
              </div>
              <p className="leading-relaxed">
                {simResult.tier === 'high' &&
                  (isAr
                    ? 'جدولة تدخل صيدلي فوري وتنبيه منسق الخروج لتعليق الوصفة المتعارضة.'
                    : 'Queue urgent clinical pharmacist consultation and freeze duplicate dispensing.')}
                {simResult.tier === 'rising' &&
                  (isAr
                    ? 'إرسال تنبيه ذكي وتحديد موعد اتصال هاتفي لتفادي عودة السوائل أو الانتكاسة.'
                    : 'Dispatch smart adherence trigger & schedule outbound nursing check.')}
                {simResult.tier === 'monitor' &&
                  (isAr
                    ? 'مواصلة المراقبة الآلية وإرسال تذكيرات إعادة الصرف عبر تطبيق وصفتي.'
                    : 'Continue automated passive telemetry and queue refill reminders.')}
                {simResult.tier === 'low' &&
                  (isAr
                    ? 'المريض ملتزم ومستقر؛ لا يتطلب تدخلاً سريرياً يدوياً في الوقت الراهن.'
                    : 'Patient is stable. No human intervention required at this time.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
