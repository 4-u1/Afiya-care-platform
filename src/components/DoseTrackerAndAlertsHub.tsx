import React, { useState } from 'react';
import {
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Heart,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Info,
  Send,
  UserCheck,
  Zap,
  Plus,
  ArrowUpRight,
  Check,
  RotateCcw,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { Patient, DoseScheduleItem, SmartAlert, SkipReason, DoseStatus } from '../types';
import { api } from '../services/api';

interface DoseTrackerAndAlertsHubProps {
  patient: Patient;
  isAr: boolean;
  initialSubTab?: 'doses' | 'alerts' | 'schedule_new';
  onPatientUpdated: (updatedPatient: Patient) => void;
  onOpenInterventions?: () => void;
  onSubTabChange?: (tab: 'doses' | 'alerts' | 'schedule_new') => void;
}

export const DoseTrackerAndAlertsHub: React.FC<DoseTrackerAndAlertsHubProps> = ({
  patient,
  isAr,
  initialSubTab,
  onPatientUpdated,
  onOpenInterventions,
  onSubTabChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'doses' | 'alerts' | 'schedule_new'>(initialSubTab || 'doses');

  // Synchronize when initialSubTab changes from parent
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSwitchTab = (tab: 'doses' | 'alerts' | 'schedule_new') => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };
  const [selectedSkipDoseId, setSelectedSkipDoseId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState<SkipReason>('side_effect');
  const [skipReasonNotes, setSkipReasonNotes] = useState<string>('');
  const [vitalInputs, setVitalInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [escalationFeedback, setEscalationFeedback] = useState<{
    show: boolean;
    title: string;
    message: string;
    severity: 'critical' | 'success';
  } | null>(null);

  // New dose form state
  const [newDoseMedName, setNewDoseMedName] = useState('');
  const [newDoseMedNameEn, setNewDoseMedNameEn] = useState('');
  const [newDoseAmount, setNewDoseAmount] = useState('');
  const [newDoseTime, setNewDoseTime] = useState('08:00');
  const [newDoseTimeOfDay, setNewDoseTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'bedtime'>('morning');
  const [newDoseInstructions, setNewDoseInstructions] = useState('');
  const [newDoseCriticality, setNewDoseCriticality] = useState<'critical' | 'moderate' | 'routine'>('routine');
  const [newDoseVital, setNewDoseVital] = useState<'none' | 'heart_rate' | 'blood_pressure' | 'blood_sugar'>('none');

  const doses = patient.doseSchedule || [];
  const alerts = patient.smartAlerts || [];

  // Stats calculation
  const totalDosesToday = doses.length;
  const takenDosesCount = doses.filter(d => d.status === 'taken').length;
  const skippedDosesCount = doses.filter(d => d.status === 'skipped').length;
  const pendingDosesCount = doses.filter(d => d.status === 'pending').length;
  const todayAdherencePercent = totalDosesToday > 0 ? Math.round((takenDosesCount / totalDosesToday) * 100) : 100;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  // Handle Vital input change
  const handleVitalChange = (doseId: string, val: string) => {
    setVitalInputs(prev => ({ ...prev, [doseId]: val }));
  };

  // Handle Confirm Taken
  const handleTakeDose = async (dose: DoseScheduleItem) => {
    try {
      setIsSubmitting(true);
      const vitalVal = vitalInputs[dose.id] || dose.vitalValue;
      const res = await api.logPatientDose(patient.id, dose.id, {
        status: 'taken',
        vitalValue: vitalVal
      });

      if (res.patient) {
        onPatientUpdated(res.patient);
        setEscalationFeedback({
          show: true,
          title: isAr ? 'تم تأكيد تناول الجرعة بنجاح' : 'Dose Confirmed Successfully',
          message: isAr 
            ? `تم تسجيل جرعة ${dose.tradeName} وتحديث مؤشر الالتزام في السجل الطبي الموحد.`
            : `Logged dose of ${dose.tradeNameEn}. Adherence score updated in unified registry.`,
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Failed to log dose taken:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Skip Dose with Root-Cause Escalation
  const handleConfirmSkipDose = async (dose: DoseScheduleItem) => {
    try {
      setIsSubmitting(true);
      const res = await api.logPatientDose(patient.id, dose.id, {
        status: 'skipped',
        skipReason,
        skipReasonDetails: skipReasonNotes
      });

      setSelectedSkipDoseId(null);
      setSkipReasonNotes('');

      if (res.patient) {
        onPatientUpdated(res.patient);

        if (res.safetySignalAdded || res.interventionAdded) {
          setEscalationFeedback({
            show: true,
            title: isAr 
              ? 'تم تصعيد الحالة سريرياً إلى الصيدلي (الحلقة المغلقة)' 
              : 'Escalated to Clinical Pharmacist (Closed-Loop)',
            message: isAr
              ? `نظراً لأهمية دواء (${dose.tradeName}) أو تسجيل سبب طبي للتخطي، تم إنشاء بلاغ عاجل في قائمة تدخلات الصيدلي السريري لمتابعة سلامة المريض ومنع التنويم الطارئ.`
              : `Critical dose skip logged for (${dose.tradeNameEn}). A high-priority intervention was dispatched to the clinical pharmacist.`,
            severity: 'critical'
          });
        } else {
          setEscalationFeedback({
            show: true,
            title: isAr ? 'تم توثيق تخطي الجرعة' : 'Dose Skip Logged',
            message: isAr
              ? `تم حفظ سبب عدم تناول الجرعة في السجل الطبي.`
              : `Reason for skipping dose was recorded in clinical record.`,
            severity: 'success'
          });
        }
      }
    } catch (err) {
      console.error('Failed to skip dose:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Acknowledge Alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await api.acknowledgeSmartAlert(patient.id, alertId);
      if (res.patient) {
        onPatientUpdated(res.patient);
      }
    } catch (err) {
      console.error('Failed to ack alert:', err);
    }
  };

  // Handle Add New Scheduled Dose
  const handleCreateDose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoseMedName.trim()) return;

    try {
      setIsSubmitting(true);
      const formattedTime = isAr ? `${newDoseTime} ص/م` : newDoseTime;
      const res = await api.addPatientDose(patient.id, {
        tradeName: newDoseMedName,
        tradeNameEn: newDoseMedNameEn || newDoseMedName,
        dose: newDoseAmount || '1 قرص',
        scheduledTime: formattedTime,
        timeOfDay: newDoseTimeOfDay,
        instructionsAr: newDoseInstructions || 'تناول الجرعة حسب التعليمات الطبية',
        instructionsEn: 'Take according to medical instructions',
        criticality: newDoseCriticality,
        vitalRequired: newDoseVital
      });

      if (res.patient) {
        onPatientUpdated(res.patient);
        setActiveSubTab('doses');
        setNewDoseMedName('');
        setNewDoseMedNameEn('');
        setNewDoseAmount('');
        setNewDoseInstructions('');
        setEscalationFeedback({
          show: true,
          title: isAr ? 'تمت إضافة جدول الجرعة بنجاح' : 'Dose Scheduled Successfully',
          message: isAr ? 'أصبح التنبيه السريري فعالاً في جدول اليوم.' : 'Clinical reminder is now active.',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Failed to add dose:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="dose-tracker-and-alerts-hub" className="space-y-6">
      {/* Differentiation Banner from Consumer Apps (Sehhaty) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/60 rounded-sm p-4 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-sm bg-blue-600/30 border border-blue-500/40 text-blue-400 mt-0.5">
            <Zap className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest">
                {isAr ? 'الفارق السريري عن تطبيق صحتي' : 'Clinical Distinction vs. Consumer Apps'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {isAr ? 'نظام الحلقة المغلقة (Closed-Loop)' : 'Hospital-Integrated Closed Loop'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              {isAr ? (
                <>
                  <strong className="text-white">عافية كير ليست مجرد منبه تقليدي لتناول الحبوب:</strong> عند تخطي أي جرعة حرجة أو تسجيل عارض جانبي، يقوم محرك الأمان فوراً بـ <span className="text-amber-300 font-semibold">تصعيد الحالة تلقائياً للصيدلي السريري بالمستشفى</span> لإجراء تدخل استباقي لمنع تفاقم المرض أو دخول الطوارئ.
                </>
              ) : (
                <>
                  <strong className="text-white">AafiyaCare is NOT a simple consumer pill alarm:</strong> Missed critical doses or reported side effects instantly trigger an <span className="text-amber-300 font-semibold">automated closed-loop escalation</span> directly into the hospital pharmacist's intervention queue.
                </>
              )}
            </p>
          </div>
        </div>

        {onOpenInterventions && (
          <button
            id="btn-jump-to-interventions"
            onClick={onOpenInterventions}
            className="px-3.5 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer self-stretch md:self-auto justify-center"
          >
            <UserCheck className="w-4 h-4 text-white" />
            <span>{isAr ? 'قائمة تدخلات الصيدلي السريري' : 'Pharmacist Queue'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-200" />
          </button>
        )}
      </div>

      {/* Real-Time Adherence & Safety Metric Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Today's Adherence Rate */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'التزام اليوم' : "Today's Adherence"}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {todayAdherencePercent}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({takenDosesCount} {isAr ? 'من' : 'of'} {totalDosesToday})
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                todayAdherencePercent >= 80 ? 'bg-emerald-600' :
                todayAdherencePercent >= 50 ? 'bg-amber-500' : 'bg-rose-600'
              }`}
              style={{ width: `${todayAdherencePercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Pending Doses */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'جرعات متبقية اليوم' : 'Pending Today'}
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-blue-950 font-mono">
              {pendingDosesCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {isAr ? 'جرعة مجدولة' : 'scheduled'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isAr ? 'تتطلب فحص العلامات الحيوية' : 'Vital signs check enabled'}
          </span>
        </div>

        {/* Metric 3: Active Smart Alerts */}
        <div className={`border rounded-sm p-4 shadow-sm transition-colors ${
          unacknowledgedAlerts.length > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isAr ? 'التنبيهات السريرية الذكية' : 'Smart Clinical Alerts'}
            </span>
            <Bell className={`w-4 h-4 ${unacknowledgedAlerts.length > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-bold font-mono ${
              unacknowledgedAlerts.length > 0 ? 'text-rose-700' : 'text-slate-800'
            }`}>
              {alerts.length}
            </span>
            {unacknowledgedAlerts.length > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-200 text-rose-800">
                {unacknowledgedAlerts.length} {isAr ? 'بحاجة لمتابعة' : 'unreviewed'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isAr ? 'تنبؤ بنفاد الدواء وتفاعلات الأغذية' : 'Refill prediction & interactions'}
          </span>
        </div>

        {/* Metric 4: Closed-Loop Safeguard */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? 'حماية الحلقة المغلقة' : 'Closed Loop Engine'}
            </span>
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-sm font-bold text-indigo-900">
              {isAr ? 'مربوط بالصيدلي السريري' : 'Active Pharmacist Link'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {isAr ? 'تصعيد فوري عند التخطي الحرج' : 'Instant auto-escalation active'}
          </span>
        </div>
      </div>

      {/* Escalation or Action Feedback Notification Banner */}
      {escalationFeedback && escalationFeedback.show && (
        <div
          className={`p-4 rounded-sm border flex items-start justify-between gap-3 shadow-sm animate-fadeIn ${
            escalationFeedback.severity === 'critical'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {escalationFeedback.severity === 'critical' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-bold">{escalationFeedback.title}</h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                {escalationFeedback.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEscalationFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded-sm border border-slate-300 bg-white"
          >
            {isAr ? 'إخفاء' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Sub-Tabs Selector */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            id="tab-dose-schedule"
            onClick={() => handleSwitchTab('doses')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'doses'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'جدول الجرعات اليومي وفحص المؤشرات' : 'Daily Doses & Vital Checks'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px]">
              {doses.length}
            </span>
          </button>

          <button
            id="tab-smart-alerts"
            onClick={() => handleSwitchTab('alerts')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'alerts'
                ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isAr ? 'مركز التنبيهات السريرية الاستباقية' : 'Proactive Clinical Alerts'}</span>
            {unacknowledgedAlerts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[10px]">
                {unacknowledgedAlerts.length}
              </span>
            )}
          </button>

          <button
            id="tab-schedule-new-dose"
            onClick={() => handleSwitchTab('schedule_new')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'schedule_new'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'جدولة جرعة جديدة للمريض' : 'Schedule Custom Dose'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DAILY DOSE LOGGING TIMELINE WITH CLINICAL PRE-CHECKS */}
      {/* ========================================================================= */}
      {activeSubTab === 'doses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              {isAr ? 'بروتوكول الجرعات اليومي المحدد سريرياً لمريض الخروج:' : "Patient's Clinical Post-Discharge Dosing Protocol:"}
            </span>
            <span className="text-[11px] font-mono text-slate-600">
              {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {doses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-sm p-12 text-center text-slate-500">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">
                {isAr ? 'لا توجد جرعات مجدولة لهذا المريض حالياً' : 'No scheduled doses found for this patient.'}
              </p>
              <button
                onClick={() => setActiveSubTab('schedule_new')}
                className="mt-3 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-bold uppercase tracking-wider"
              >
                {isAr ? 'إضافة موعد جرعة الآن' : 'Schedule First Dose'}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {doses.map(dose => {
                const isTaken = dose.status === 'taken';
                const isSkipped = dose.status === 'skipped';
                const isPending = dose.status === 'pending';
                const isCritical = dose.criticality === 'critical';

                return (
                  <div
                    key={dose.id}
                    id={`dose-card-${dose.id}`}
                    className={`bg-white border rounded-sm p-4 transition-all shadow-sm ${
                      isTaken ? 'border-emerald-300 bg-emerald-50/20' :
                      isSkipped ? 'border-rose-300 bg-rose-50/30' :
                      isCritical ? 'border-amber-300 bg-amber-50/10' :
                      'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Dose details & time */}
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Time of Day Icon */}
                        <div
                          className={`p-3 rounded-sm border text-center min-w-[72px] flex-shrink-0 ${
                            isTaken ? 'bg-emerald-100 border-emerald-300 text-emerald-800' :
                            isSkipped ? 'bg-rose-100 border-rose-300 text-rose-800' :
                            isCritical ? 'bg-amber-100 border-amber-300 text-amber-900' :
                            'bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold tracking-wider block">
                            {dose.timeOfDay === 'morning' ? (isAr ? 'الصباح' : 'Morning') :
                             dose.timeOfDay === 'afternoon' ? (isAr ? 'الظهيرة' : 'Afternoon') :
                             dose.timeOfDay === 'evening' ? (isAr ? 'المساء' : 'Evening') :
                             (isAr ? 'النوم' : 'Bedtime')}
                          </span>
                          <span className="text-xs font-mono font-bold block mt-0.5">
                            {dose.scheduledTime}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">
                              {isAr ? dose.tradeName : dose.tradeNameEn}
                            </h4>
                            <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold">
                              {dose.dose}
                            </span>

                            {/* Criticality Pill */}
                            {isCritical && (
                              <span className="px-2 py-0.5 rounded-sm bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>{isAr ? 'دواء حرج (High Risk)' : 'Critical Medication'}</span>
                              </span>
                            )}

                            {/* Status Pill */}
                            {isTaken && (
                              <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isAr ? 'تم أخذ الجرعة' : 'Taken'}</span>
                              </span>
                            )}

                            {isSkipped && (
                              <span className="px-2 py-0.5 rounded-sm bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>{isAr ? 'تم التخطي وتصعيد الحالة' : 'Skipped & Escalated'}</span>
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-mono text-slate-500 block">
                            {dose.genericName}
                          </span>

                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                            {isAr ? dose.instructionsAr : dose.instructionsEn}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Vital sign requirement if applicable */}
                      {dose.vitalRequired && dose.vitalRequired !== 'none' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-sm p-2.5 min-w-[200px] space-y-1.5 flex-shrink-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {dose.vitalRequired === 'heart_rate' ? (isAr ? 'فحص النبض قبل الجرعة:' : 'Pre-Dose Pulse Check:') :
                               dose.vitalRequired === 'blood_pressure' ? (isAr ? 'فحص ضغط الدم:' : 'Pre-Dose BP Check:') :
                               (isAr ? 'فحص السكر قبل الجرعة:' : 'Pre-Dose Glucose:')}
                            </span>
                          </div>

                          {isTaken && dose.vitalValue ? (
                            <span className="text-xs font-mono font-bold text-emerald-700 block bg-emerald-50 px-2 py-1 rounded-sm border border-emerald-200">
                              {dose.vitalValue}
                            </span>
                          ) : (
                            <input
                              type="text"
                              disabled={!isPending || isSubmitting}
                              value={vitalInputs[dose.id] || ''}
                              onChange={e => handleVitalChange(dose.id, e.target.value)}
                              placeholder={
                                dose.vitalRequired === 'heart_rate' ? 'مثال: 72 bpm' :
                                dose.vitalRequired === 'blood_pressure' ? 'مثال: 120/80 mmHg' :
                                'مثال: 115 mg/dL'
                              }
                              className="w-full text-xs font-mono px-2 py-1 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                            />
                          )}
                          <span className="text-[10px] text-slate-500 block">
                            {dose.vitalRequired === 'heart_rate' ? (isAr ? 'إذا كان < 55 bpm لا تأخذ الجرعة' : 'Hold if < 55 bpm') :
                             dose.vitalRequired === 'blood_pressure' ? (isAr ? 'لتفادي الهبوط الحاد' : 'To prevent hypotension') :
                             (isAr ? 'لتفادي هبوط السكر' : 'Prevent hypoglycemia')}
                          </span>
                        </div>
                      )}

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-2 self-stretch lg:self-center justify-end">
                        {isPending && (
                          <>
                            <button
                              id={`btn-take-dose-${dose.id}`}
                              disabled={isSubmitting}
                              onClick={() => handleTakeDose(dose)}
                              className="px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                              title={isAr ? 'تسجيل تناول الجرعة في الموعد' : 'Confirm Dose Taken'}
                            >
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>{isAr ? 'أخذت الجرعة' : 'Take Dose'}</span>
                            </button>

                            <button
                              id={`btn-skip-dose-${dose.id}`}
                              disabled={isSubmitting}
                              onClick={() => setSelectedSkipDoseId(dose.id)}
                              className="px-3 py-1.5 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                              title={isAr ? 'تسجيل سبب التخطي وتصعيده للصيدلي' : 'Skip Dose with Root Cause'}
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{isAr ? 'تخطي مع تسجيل السبب' : 'Skip Dose'}</span>
                            </button>
                          </>
                        )}

                        {isTaken && (
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {isAr ? 'تم التأكيد' : 'Logged'}
                            </span>
                            {dose.loggedAt && (
                              <span className="text-[10px] font-mono text-slate-500 block">
                                {new Date(dose.loggedAt).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        )}

                        {isSkipped && (
                          <div className="text-right">
                            <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              {isAr ? 'مرفوع للصيدلي' : 'Escalated'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {dose.skipReason === 'side_effect' ? (isAr ? 'أعراض جانبية' : 'Side effect') :
                               dose.skipReason === 'out_of_med' ? (isAr ? 'نفاد الدواء' : 'Out of medication') :
                               (isAr ? 'سبب سريري' : 'Clinical reason')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Skip Reason Selector Modal/Drawer */}
                    {selectedSkipDoseId === dose.id && (
                      <div className="mt-4 pt-4 border-t border-rose-200 bg-rose-50/50 p-3 rounded-sm space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-700" />
                            <h5 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                              {isAr ? 'تسجيل سبب عدم تناول الجرعة (تفعيل نظام الحماية والمتابعة):' : 'Specify Clinical Skip Reason (Closed-Loop Escalation):'}
                            </h5>
                          </div>
                          <button
                            onClick={() => setSelectedSkipDoseId(null)}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {[
                            { id: 'side_effect', labelAr: 'أعراض جانبية (دوخة، غثيان، هبوط)', labelEn: 'Adverse side effect (dizziness, nausea)' },
                            { id: 'out_of_med', labelAr: 'نفاد العبوة قبل موعد إعادة الصرف', labelEn: 'Out of medication / Supply depleted' },
                            { id: 'confusion', labelAr: 'شك في الجرعة أو خوف من تفاعل دوائي', labelEn: 'Confusion or fear of drug interaction' },
                            { id: 'fasting', labelAr: 'صيام أو عدم تناول وجبة مرافقة', labelEn: 'Fasting / No meal companion' },
                            { id: 'forgot', labelAr: 'نسيان أو خارج المنزل حالياً', labelEn: 'Forgot / Away from home' },
                            { id: 'other', labelAr: 'سبب آخر غير مسجل', labelEn: 'Other clinical reason' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSkipReason(opt.id as SkipReason)}
                              className={`px-2.5 py-1.5 text-xs text-right rounded-sm border transition-all ${
                                skipReason === opt.id
                                  ? 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {isAr ? opt.labelAr : opt.labelEn}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 block">
                            {isAr ? 'ملاحظات إضافية للصيدلي السريري (اختياري):' : 'Additional clinical notes for pharmacist:'}
                          </label>
                          <input
                            type="text"
                            value={skipReasonNotes}
                            onChange={e => setSkipReasonNotes(e.target.value)}
                            placeholder={isAr ? 'مثال: شعرت بدوار شديد بعد الجرعة السابقة...' : 'e.g. Felt dizzy after previous dose...'}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[11px] text-rose-800 font-semibold">
                            {isAr
                              ? '⚡ سيتم فتح تدخل عاجل في شاشة الصيدلي السريري فوراً للاتصال بك.'
                              : '⚡ This triggers an immediate clinical pharmacist intervention call.'}
                          </p>

                          <button
                            id="btn-confirm-skip-submit"
                            disabled={isSubmitting}
                            onClick={() => handleConfirmSkipDose(dose)}
                            className="px-4 py-1.5 rounded-sm bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                          >
                            {isAr ? 'تأكيد التخطي وتصعيد البلاغ' : 'Confirm Skip & Escalate'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SMART CLINICAL ALERTS HUB */}
      {/* ========================================================================= */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              {isAr ? 'التنبيهات الاستباقية المولدة بواسطة محرك الذكاء الاصطناعي:' : 'AI Engine Proactive Clinical Safety Alerts:'}
            </span>
            <span className="text-[11px] font-mono text-slate-600">
              {alerts.length} {isAr ? 'تنبيه مسجل' : 'alerts cataloged'}
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-sm p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                {isAr ? 'لا توجد تنبيهات نشطة حالياً، خطة المريض مستقرة بنسبة ١٠٠٪' : 'No active alerts. Regimen is 100% stable.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';

                return (
                  <div
                    key={alert.id}
                    id={`smart-alert-${alert.id}`}
                    className={`bg-white border rounded-sm p-4 transition-all shadow-sm ${
                      alert.acknowledged
                        ? 'border-slate-200 opacity-75'
                        : isCritical
                        ? 'border-rose-400 bg-rose-50/20'
                        : isWarning
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-blue-300 bg-blue-50/20'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2 rounded-sm mt-0.5 ${
                            isCritical ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                            isWarning ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-blue-100 text-blue-700 border border-blue-300'
                          }`}
                        >
                          {isCritical ? <ShieldAlert className="w-4 h-4" /> :
                           isWarning ? <AlertTriangle className="w-4 h-4" /> :
                           <Info className="w-4 h-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {isAr ? alert.titleAr : alert.titleEn}
                            </h4>

                            <span
                              className={`px-2 py-0.2 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                isWarning ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {alert.type === 'refill_prediction' ? (isAr ? 'تنبؤ بنفاد الدواء' : 'Refill Prediction') :
                               alert.type === 'clinical_adherence_lapse' ? (isAr ? 'انقطاع التزام حرج' : 'Adherence Lapse') :
                               alert.type === 'food_interaction' ? (isAr ? 'تداخل غذائي-دوائي' : 'Food Interaction') :
                               alert.type === 'vital_check' ? (isAr ? 'فحص علامات حيوية' : 'Vital Sign Protocol') :
                               (isAr ? 'متابعة سريرية' : 'Clinical Triage')}
                            </span>

                            {alert.escalatedToPharmacist && (
                              <span className="px-2 py-0.2 rounded-sm bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
                                {isAr ? '⚡ متصل بالصيدلي السريري' : '⚡ Pharmacist Escalated'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                            {isAr ? alert.messageAr : alert.messageEn}
                          </p>

                          {/* Clinical Justification Box */}
                          <div className="bg-slate-50 border border-slate-200 rounded-sm p-2 text-slate-600 text-[11px] leading-relaxed mt-2">
                            <span className="font-bold text-slate-700">
                              {isAr ? 'السياق السريري للمحرك: ' : 'Clinical Context: '}
                            </span>
                            {isAr ? alert.clinicalContextAr : alert.clinicalContextEn}
                          </div>

                          {/* Action Required */}
                          <div className="text-[11px] text-blue-900 font-semibold mt-1">
                            <span>{isAr ? 'الإجراء الموصى به: ' : 'Recommended Action: '}</span>
                            <span>{isAr ? alert.actionRequiredAr : alert.actionRequiredEn}</span>
                          </div>
                        </div>
                      </div>

                      {/* Acknowledge Button */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        {!alert.acknowledged ? (
                          <button
                            id={`btn-ack-alert-${alert.id}`}
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3.5 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isAr ? 'تأكيد الاطلاع وتطبيق الإجراء' : 'Acknowledge'}</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            {isAr ? 'تم الاطلاع والتوثيق' : 'Acknowledged'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: SCHEDULE NEW CUSTOM DOSE FORM */}
      {/* ========================================================================= */}
      {activeSubTab === 'schedule_new' && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm max-w-3xl space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? 'جدولة جرعة جديدة وتحديد بروتوكول الفحص السريري' : 'Schedule New Dose with Pre-Condition Verification'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? 'إضافة دواء إلى جدول الجرعات اليومي مع تحديد العلامة الحيوية المطلوبة قبل التناول'
                : 'Add a medication to the daily schedule with mandatory pre-dose clinical vital signs verification.'}
            </p>
          </div>

          <form onSubmit={handleCreateDose} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'اسم الدواء التجاري (عربي): *' : 'Trade Name (Arabic): *'}
                </label>
                <input
                  type="text"
                  required
                  value={newDoseMedName}
                  onChange={e => setNewDoseMedName(e.target.value)}
                  placeholder="مثال: كونكور (Concor)"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'اسم الدواء بالإنجليزي:' : 'Trade Name (English):'}
                </label>
                <input
                  type="text"
                  value={newDoseMedNameEn}
                  onChange={e => setNewDoseMedNameEn(e.target.value)}
                  placeholder="e.g. Concor 5mg"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'الجرعة المقررة: *' : 'Dose / Strength: *'}
                </label>
                <input
                  type="text"
                  required
                  value={newDoseAmount}
                  onChange={e => setNewDoseAmount(e.target.value)}
                  placeholder="مثال: 5 mg أو قرص واحد"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'وقت الجرعة اليومي: *' : 'Scheduled Daily Time: *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    required
                    value={newDoseTime}
                    onChange={e => setNewDoseTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newDoseTimeOfDay}
                    onChange={e => setNewDoseTimeOfDay(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="morning">{isAr ? 'الصباح' : 'Morning'}</option>
                    <option value="afternoon">{isAr ? 'الظهيرة' : 'Afternoon'}</option>
                    <option value="evening">{isAr ? 'المساء' : 'Evening'}</option>
                    <option value="bedtime">{isAr ? 'قبل النوم' : 'Bedtime'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'درجة الخطورة السريرية للدواء:' : 'Clinical Criticality:'}
                </label>
                <select
                  value={newDoseCriticality}
                  onChange={e => setNewDoseCriticality(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="routine">{isAr ? 'روتيني (أمان قياسي)' : 'Routine'}</option>
                  <option value="moderate">{isAr ? 'متوسط الحرج (مثل المسكنات أو منظمات الهضم)' : 'Moderate'}</option>
                  <option value="critical">{isAr ? 'عالي الحرج (وارفارين، مدرات، حاصرات بيتا)' : 'Critical / High Risk'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'فحص العلامات الحيوية المشروط قبل الجرعة:' : 'Pre-Dose Vital Sign Check:'}
                </label>
                <select
                  value={newDoseVital}
                  onChange={e => setNewDoseVital(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="none">{isAr ? 'لا يتطلب فحص حيوي' : 'None Required'}</option>
                  <option value="heart_rate">{isAr ? 'فحص نبضات القلب (HR - النبض)' : 'Heart Rate / Pulse'}</option>
                  <option value="blood_pressure">{isAr ? 'فحص ضغط الدم (BP)' : 'Blood Pressure (BP)'}</option>
                  <option value="blood_sugar">{isAr ? 'فحص سكر الدم (Glucose)' : 'Blood Glucose'}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {isAr ? 'إرشادات التناول والتوقيت السريري:' : 'Clinical Timing & Food Instructions:'}
              </label>
              <input
                type="text"
                value={newDoseInstructions}
                onChange={e => setNewDoseInstructions(e.target.value)}
                placeholder={isAr ? 'مثال: تؤخذ صباحاً على معدة فارغة مع شرب كوب ماء كامل...' : 'e.g. Take on empty stomach with a full glass of water...'}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveSubTab('doses')}
                className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                id="btn-submit-new-dose"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>{isAr ? 'حفظ الجرعة وتفعيل التنبيه' : 'Save & Activate Reminder'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
