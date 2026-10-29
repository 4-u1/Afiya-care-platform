import React, { useState, useMemo } from 'react';
import {
  Heart,
  CheckCircle2,
  Sparkles,
  Clock,
  Volume2,
  PhoneCall,
  Calendar,
  Flame,
  Award,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  ChevronRight,
  ThumbsUp,
  Activity,
  Smile,
  Info
} from 'lucide-react';
import { Patient, DoseScheduleItem, Language } from '../types';
import { api } from '../services/api';

interface PatientPortalViewProps {
  patient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  lang: Language;
  onPatientUpdated: (updatedPatient: Patient) => void;
  onNavigateToDashboard: () => void;
}

// Warm, culturally respectful, encouraging positive affirmations for adherence
const POSITIVE_AFFIRMATIONS = [
  {
    titleAr: 'ما شاء الله تبارك الله، عافاك الله وحفظك! 🌿',
    titleEn: 'Wonderful job! May health and vitality be yours always! 🌿',
    bodyAr: 'تم تسجيل جرعتك بنجاح. حرصك والتزامك بمواعيد دوائك هو استثمارك الأغلى في صحتك وراحة بالك ونشاطك اليومي.',
    bodyEn: 'Your dose has been successfully recorded. Your daily dedication is your best investment in sustained health and energy.',
    tipAr: 'نصيحة اليوم: تذكر شرب كوب ماء نقي للمساعدة على امتصاص الدواء بصورة مثالية.',
    tipEn: 'Daily tip: Remember to drink a full glass of fresh water to support optimal absorption.'
  },
  {
    titleAr: 'إنجاز رائع يا بطل! فخورون بحرصك واهتمامك 🌟',
    titleEn: 'Outstanding dedication! We are proud of your adherence 🌟',
    bodyAr: 'كل حبة تأخذها في موعدها تحمي قلبك وتضبط مؤشراتك الحيوية وتبعد عنك أي مضاعفات بإذن الله.',
    bodyEn: 'Every dose taken on schedule actively protects your cardiovascular stability and shields against complications.',
    tipAr: 'نصيحة اليوم: المشي الخفيف وتناول وجبات متوازنة يعزز من فاعلية خطتك العلاجية.',
    tipEn: 'Daily tip: Gentle walking and balanced meals amplify the therapeutic benefit of your treatment plan.'
  },
  {
    titleAr: 'بارك الله في صحتك وعافيتك! 💚',
    titleEn: 'Blessings of health and wellness! 💚',
    bodyAr: 'تم تحديث سجلك الطبي فوراً وإشعار فريقك الصيدلي بالتزامك. استمرارك على هذا الانضباط يصنع فارقاً حقيقياً.',
    bodyEn: 'Your medical record is instantly updated and your clinical pharmacy team notified. Your consistency makes all the difference.',
    tipAr: 'نصيحة اليوم: احرص على تخزين أدويتك في مكان جاف ومعتدل بعيداً عن حرارة الشمس المباشرة.',
    tipEn: 'Daily tip: Keep medications stored in a cool, dry place away from direct sunlight.'
  },
  {
    titleAr: 'خطوة ممتازة نحو عافية دائمة! 👏',
    titleEn: 'A magnificent step toward lasting wellness! 👏',
    bodyAr: 'أنت الآن في المسار الصحيح تماماً. ثباتك اليومي يبني درع أمان لصحتك وصحة أسرتك.',
    bodyEn: 'You are on the ideal track. Your daily rhythm builds a steadfast shield for your health and your family.',
    tipAr: 'نصيحة اليوم: استمتع بقسط كافٍ من النوم المريح لإعادة شحن طاقة جسمك.',
    tipEn: 'Daily tip: Prioritize quality restful sleep to recharge your body resilience.'
  }
];

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  patient,
  patients,
  onSelectPatient,
  lang,
  onPatientUpdated,
  onNavigateToDashboard
}) => {
  const isAr = lang === 'ar';
  const doses = patient.doseSchedule || [];

  const [loggingDoseId, setLoggingDoseId] = useState<string | null>(null);
  const [successAffirmation, setSuccessAffirmation] = useState<{
    show: boolean;
    dose: DoseScheduleItem;
    affirmationIndex: number;
    timestamp: string;
  } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioFeedbackText, setAudioFeedbackText] = useState<string | null>(null);

  // Play gentle celebratory chime
  const playPositiveChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major triad flourish)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.06, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch {
      // Audio context might be restricted before interaction; ignore safely
    }
  };

  // Text to speech for elderly/visually impaired patients
  const handleSpeakInstruction = (textAr: string, textEn: string) => {
    if (!('speechSynthesis' in window)) {
      setAudioFeedbackText(isAr ? 'القراءة الصوتية غير مدعومة في هذا المتصفح' : 'Speech synthesis not supported in this browser');
      setTimeout(() => setAudioFeedbackText(null), 3000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(isAr ? textAr : textEn);
      utterance.lang = isAr ? 'ar-SA' : 'en-US';
      utterance.rate = 0.9; // Calm, clear tempo
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  // Identify next pending dose to spotlight
  const nextPendingDose = useMemo(() => {
    return doses.find((d) => d.status === 'pending') || null;
  }, [doses]);

  // Dose statistics
  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === 'taken').length;
  const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
  const isAllTakenToday = totalDoses > 0 && takenDoses === totalDoses;

  // Single-Click Take Dose Action
  const handleTakeDoseSingleClick = async (dose: DoseScheduleItem) => {
    try {
      setLoggingDoseId(dose.id);
      playPositiveChime();

      const res = await api.logPatientDose(patient.id, dose.id, {
        status: 'taken',
        vitalValue: dose.vitalRequired && dose.vitalRequired !== 'none' ? 'مؤشر سليم' : undefined
      });

      const updatedPatient = res.patient || {
        ...patient,
        doseSchedule: (patient.doseSchedule || []).map((d) =>
          d.id === dose.id ? { ...d, status: 'taken' as const, loggedAt: new Date().toISOString() } : d
        ),
        engagement: {
          ...patient.engagement,
          confirmedDosesLast7Days: (patient.engagement.confirmedDosesLast7Days || 0) + 1,
          lastAppActivity: 'الآن (تسجيل جرعة)'
        }
      };

      onPatientUpdated(updatedPatient);

      // Select randomized or cyclical positive affirmation
      const affirmationIdx = Math.floor(Math.random() * POSITIVE_AFFIRMATIONS.length);
      const now = new Date();
      const formattedTime = now.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      setSuccessAffirmation({
        show: true,
        dose: { ...dose, status: 'taken', loggedAt: now.toISOString() },
        affirmationIndex: affirmationIdx,
        timestamp: formattedTime
      });
    } catch (err) {
      console.error('Failed to log dose:', err);
    } finally {
      setLoggingDoseId(null);
    }
  };

  const getTimeOfDayBadge = (time: DoseScheduleItem['timeOfDay']) => {
    switch (time) {
      case 'morning':
        return {
          labelAr: 'جرعة الصباح 🌅',
          labelEn: 'Morning Dose 🌅',
          bg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'afternoon':
        return {
          labelAr: 'جرعة الظهيرة ☀️',
          labelEn: 'Afternoon Dose ☀️',
          bg: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'evening':
        return {
          labelAr: 'جرعة المساء 🌇',
          labelEn: 'Evening Dose 🌇',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
        };
      case 'bedtime':
        return {
          labelAr: 'قبل النوم 🌙',
          labelEn: 'Bedtime Dose 🌙',
          bg: 'bg-purple-50 text-purple-800 border-purple-200'
        };
      default:
        return {
          labelAr: 'جرعة اليوم',
          labelEn: 'Scheduled Dose',
          bg: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Patient Bar with Switcher & Back to Clinician Dashboard */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider font-mono">
                {isAr ? 'بوابة المريض اليومية' : 'Patient Daily Portal'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {isAr ? patient.healthCluster : patient.healthClusterEn}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {isAr ? `مرحباً بك يا عم ${patient.nameAr.split(' ')[0]}` : `Welcome, ${patient.nameEn.split(' ')[0]}`} 👋
            </h2>
            <p className="text-xs text-slate-500">
              {isAr ? 'عافيتك تهمنا ونسعد بمتابعة التزامك العلاجي خطوة بخطوة' : 'Your wellness is our utmost priority. Keeping you healthy every day.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Patient Switcher for Easy Testing/Demonstration */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-sm px-2.5 py-1.5">
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'المريض:' : 'Patient:'}</span>
            <select
              id="patient-portal-select"
              value={patient.id}
              onChange={(e) => {
                const found = patients.find((p) => p.id === e.target.value);
                if (found) onSelectPatient(found);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {isAr ? p.nameAr : p.nameEn} ({isAr ? p.healthCluster.split(' ')[1] : p.healthClusterEn})
                </option>
              ))}
            </select>
          </div>

          <button
            id="back-to-clinician-dashboard-btn"
            onClick={onNavigateToDashboard}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-sm border border-slate-200 transition-colors font-medium"
          >
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{isAr ? 'لوحة الأطباء والصيدلي' : 'Clinician View'}</span>
          </button>
        </div>
      </div>

      {/* Hero Spotlight: Next Due Dose Card with ONE-CLICK Big Action Button */}
      {nextPendingDose ? (
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/40 border-2 border-emerald-500 rounded-sm p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          {/* Subtle decorative background watermark */}
          <div className="absolute end-4 -bottom-6 text-emerald-100/50 pointer-events-none select-none">
            <Sparkles className="w-48 h-48" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-2 rounded-sm bg-emerald-600 text-white shadow-xs">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  {isAr ? 'الجرعة المستحقة القادمة الآن' : 'Your Next Due Medication Now'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {isAr ? `الموعد المحدد: ${nextPendingDose.scheduledTime}` : `Scheduled Time: ${nextPendingDose.scheduledTime}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(() => {
                const badge = getTimeOfDayBadge(nextPendingDose.timeOfDay);
                return (
                  <span className={`text-xs px-2.5 py-1 rounded-sm border font-bold ${badge.bg}`}>
                    {isAr ? badge.labelAr : badge.labelEn}
                  </span>
                );
              })()}

              <button
                id="listen-instruction-btn"
                onClick={() =>
                  handleSpeakInstruction(
                    `موعد دواء ${nextPendingDose.tradeName}. الجرعة: ${nextPendingDose.dose}. ${nextPendingDose.instructionsAr}`,
                    `Time for ${nextPendingDose.tradeNameEn}. Dose: ${nextPendingDose.dose}. ${nextPendingDose.instructionsEn}`
                  )
                }
                className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-sm transition-colors font-medium"
                title={isAr ? 'استمع للإرشاد الدوائي بصوت واضح' : 'Read dose instructions aloud'}
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-blue-900' : ''}`} />
                <span>{isAr ? 'استمع للتعليمات' : 'Read Aloud'}</span>
              </button>
            </div>
          </div>

          {audioFeedbackText && (
            <div className="bg-amber-50 text-amber-900 text-xs px-3 py-2 rounded-sm border border-amber-200">
              {audioFeedbackText}
            </div>
          )}

          {/* Medication Big Display */}
          <div className="space-y-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isAr ? nextPendingDose.tradeName : nextPendingDose.tradeNameEn}
                </h3>
                <p className="text-sm font-mono text-slate-600 mt-1 flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{nextPendingDose.genericName}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-sm border border-slate-200 font-bold text-slate-800">
                    {nextPendingDose.dose}
                  </span>
                </p>
              </div>

              <div className="text-start sm:text-end">
                <span className="text-xs text-slate-400 block font-medium">{isAr ? 'طريقة الاستخدام' : 'Instructions'}</span>
                <span className="text-sm font-bold text-slate-800">
                  {isAr ? 'قرص واحد عن طريق الفم' : 'One tablet orally'}
                </span>
              </div>
            </div>

            {/* Clear, Patient-Friendly Instructions Box */}
            <div className="p-4 rounded-sm bg-white border border-emerald-200 shadow-xs flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-800 leading-relaxed font-medium">
                {isAr ? nextPendingDose.instructionsAr : nextPendingDose.instructionsEn}
              </div>
            </div>
          </div>

          {/* THE BIG ONE-CLICK ACTION BUTTON */}
          <div className="pt-2 relative z-10">
            <button
              id="one-click-take-dose-btn"
              onClick={() => handleTakeDoseSingleClick(nextPendingDose)}
              disabled={loggingDoseId === nextPendingDose.id}
              className="w-full py-4 sm:py-5 px-6 rounded-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-lg sm:text-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 group border border-emerald-700"
            >
              {loggingDoseId === nextPendingDose.id ? (
                <>
                  <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isAr ? 'جارٍ تسجيل جرعتك وتحديث ملفك...' : 'Logging your dose & updating file...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-7 h-7 text-emerald-100 group-hover:scale-110 transition-transform shrink-0" />
                  <span>{isAr ? '✅ أخذت الدواء الآن (ضغطة واحدة)' : '✅ Taken Now (Single Click)'}</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              {isAr
                ? 'بمجرد الضغط يتم توثيق الجرعة فوراً في سجلك الطبي وإشعار طبيبك المعالج وصيدلي التجمع'
                : 'Single click records the dose in your unified medical file and notifies your care team'}
            </p>
          </div>
        </div>
      ) : (
        /* All Doses Completed Banner */
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-2 border-emerald-500 rounded-sm p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-2 border-emerald-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-900">
              {isAr ? 'ما شاء الله! اكتملت جميع جرعاتك المقررة لليوم 🎉' : 'Outstanding! All scheduled doses completed today 🎉'}
            </h3>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              {isAr
                ? 'نفخر بالتزامك التام اليوم. انتظامك هو خط الدفاع الأول عن صحتك وسر استقرار ضغطك وسكرك وعافيتك المستمرة.'
                : 'Your dedication is exemplary. Full adherence safeguards your cardiovascular health and vitality.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-900 font-bold text-sm">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'سلسلة الالتزام: ٦ أيام متتالية بدون انقطاع! 🌟' : 'Adherence Streak: 6 consecutive days! 🌟'}</span>
          </div>
        </div>
      )}

      {/* POSITIVE CONFIRMATION MODAL / CELEBRATORY CARD (When Dose Is Taken) */}
      {successAffirmation && (
        <div
          id="positive-affirmation-overlay"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSuccessAffirmation(null)}
        >
          <div
            id="positive-affirmation-modal"
            className="bg-white border-2 border-emerald-500 rounded-sm p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Celebration Icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-4 border-emerald-300 shadow-inner">
                <Sparkles className="w-10 h-10 text-emerald-600 animate-bounce" />
              </div>
              <span className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            {/* Affirmation Title & Message */}
            {(() => {
              const currentAff = POSITIVE_AFFIRMATIONS[successAffirmation.affirmationIndex] || POSITIVE_AFFIRMATIONS[0];
              return (
                <div className="space-y-3">
                  <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider font-mono">
                    {isAr ? 'تم تأكيد تناول الجرعة بنجاح' : 'Dose Confirmed Successfully'}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {isAr ? currentAff.titleAr : currentAff.titleEn}
                  </h3>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-sm text-xs font-mono text-slate-700 flex items-center justify-center gap-2">
                    <span className="font-bold text-slate-900">
                      {isAr ? successAffirmation.dose.tradeName : successAffirmation.dose.tradeNameEn}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      {isAr ? `سُجلت في تمام الساعة ${successAffirmation.timestamp}` : `Logged at ${successAffirmation.timestamp}`}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isAr ? currentAff.bodyAr : currentAff.bodyEn}
                  </p>

                  {/* Daily Care Tip Box */}
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-sm text-xs text-emerald-900 leading-relaxed font-medium text-start flex items-start gap-2">
                    <Heart className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>{isAr ? currentAff.tipAr : currentAff.tipEn}</div>
                  </div>
                </div>
              );
            })()}

            {/* Stats & Progress Impact */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-start">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isAr ? 'التزام اليوم' : 'Today Adherence'}
                </span>
                <span className="font-mono font-extrabold text-emerald-700 text-lg">
                  {adherencePercent}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {takenDoses} {isAr ? 'من' : 'of'} {totalDoses} {isAr ? 'جرعات' : 'doses'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isAr ? 'الفريق المعالج' : 'Care Team'}
                </span>
                <span className="font-bold text-slate-800 text-xs block truncate" title={isAr ? patient.healthCluster : patient.healthClusterEn}>
                  {isAr ? patient.healthCluster : patient.healthClusterEn}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium block">
                  {isAr ? 'السجل الطبي مُحدّث فوراً ✅' : 'Unified EMR synced ✅'}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              id="close-affirmation-modal-btn"
              onClick={() => setSuccessAffirmation(null)}
              className="w-full py-3 px-4 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-xs"
            >
              {isAr ? 'الحمد لله، ومستمر بحرص على صحتي 💚' : 'Great! Keeping up my health commitment'}
            </button>
          </div>
        </div>
      )}

      {/* Adherence Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isAr ? 'الجرعات المكتملة اليوم' : 'Doses Taken Today'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-bold text-slate-900">{takenDoses}</span>
              <span className="text-xs text-slate-500 font-medium">/ {totalDoses}</span>
              <span className="text-xs font-bold text-emerald-700 ms-1 font-mono">({adherencePercent}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isAr ? 'سلسلة الالتزام المتواصل' : 'Current Adherence Streak'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-bold text-slate-900">6</span>
              <span className="text-xs text-slate-500 font-medium">{isAr ? 'أيام متتالية' : 'days streak'}</span>
              <span className="text-xs text-amber-600 font-bold">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isAr ? 'التجمع الصحي المتابع' : 'Monitored By Cluster'}
            </span>
            <span className="text-xs font-bold text-slate-900 block truncate" title={isAr ? patient.healthCluster : patient.healthClusterEn}>
              {isAr ? patient.healthCluster : patient.healthClusterEn}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {isAr ? patient.careJourney.hospitalNameAr : patient.careJourney.hospitalNameEn}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Full Dose Schedule with One-Click Actions */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              {isAr ? 'جدول جرعاتك المقررة لليوم' : 'Today Scheduled Doses'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {isAr ? 'اضغط «أخذت الجرعة» لتوثيق أي دواء' : 'Click "Taken" to log any dose'}
          </span>
        </div>

        <div className="space-y-3">
          {doses.map((dose) => {
            const isTaken = dose.status === 'taken';
            const isPending = dose.status === 'pending';
            const badge = getTimeOfDayBadge(dose.timeOfDay);

            return (
              <div
                key={dose.id}
                className={`p-4 rounded-sm border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isTaken
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-sm border font-bold ${badge.bg}`}>
                      {isAr ? badge.labelAr : badge.labelEn}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      {dose.scheduledTime}
                    </span>
                    {dose.criticality === 'critical' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-red-50 text-red-700 border border-red-200 font-bold">
                        {isAr ? 'دواء أساسي' : 'Essential Med'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    <h4 className="text-base font-bold text-slate-900">
                      {isAr ? dose.tradeName : dose.tradeNameEn}
                    </h4>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded-sm font-bold text-slate-700">
                      {dose.dose}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {isAr ? dose.instructionsAr : dose.instructionsEn}
                  </p>

                  {isTaken && dose.loggedAt && (
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {isAr
                          ? `تم تناول الجرعة وتوثيقها في تمام: ${new Date(dose.loggedAt).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`
                          : `Taken & logged at: ${new Date(dose.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* One-Click Action on Individual Card */}
                <div className="sm:shrink-0">
                  {isTaken ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{isAr ? 'تم أخذها بنجاح ✅' : 'Taken Successfully ✅'}</span>
                    </div>
                  ) : (
                    <button
                      id={`dose-take-btn-${dose.id}`}
                      onClick={() => handleTakeDoseSingleClick(dose)}
                      disabled={loggingDoseId === dose.id}
                      className="w-full sm:w-auto px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {loggingDoseId === dose.id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isAr ? 'تسجيل...' : 'Logging...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAr ? 'أخذت الجرعة (ضغطة واحدة)' : 'Log Taken (Single Click)'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Help & Pharmacist Direct Line */}
      <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">
              {isAr ? 'هل تشعر بأي أعراض جانبية أو لديك سؤال عن دوائك؟' : 'Experiencing side effects or have questions?'}
            </span>
            <span className="text-slate-500">
              {isAr
                ? 'الصيدلي السريري المتابع بتجمعك الصحي متاح لتقديم الإرشاد فوراً'
                : 'Your cluster clinical pharmacist is on standby to assist you'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-sm bg-white border border-slate-200 font-bold text-slate-800">
            {isAr ? 'هاتف الاستشارة السريعة: 937' : 'MOH Hotline: 937'}
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'علبة الدواء الذكية متصلة 📦' : 'Smart Box Connected 📦'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
