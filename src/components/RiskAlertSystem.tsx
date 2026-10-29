import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  User,
  Pill,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Zap,
  Activity,
  Stethoscope,
  HeartPulse,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Patient, Language } from '../types';
import { HealthRiskAlert } from '../services/riskAlertEngine';

interface RiskAlertSystemProps {
  alerts: HealthRiskAlert[];
  patients: Patient[];
  lang: Language;
  onSelectPatient: (patient: Patient) => void;
  onOpenIntervention: (patient: Patient) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onOpenNotificationCenter?: () => void;
}

export const RiskAlertSystem: React.FC<RiskAlertSystemProps> = ({
  alerts,
  patients,
  lang,
  onSelectPatient,
  onOpenIntervention,
  onAcknowledgeAlert,
  onOpenNotificationCenter
}) => {
  const isAr = lang === 'ar';
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'watch'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  // Handle local acknowledgment
  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAcknowledgedIds(prev => new Set(prev).add(id));
    onAcknowledgeAlert(id);
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const isAck = acknowledgedIds.has(alert.id) || alert.status === 'acknowledged';

    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = alert.patientNameAr.toLowerCase().includes(q) || alert.patientNameEn.toLowerCase().includes(q);
      const matchMrn = alert.mrn.toLowerCase().includes(q);
      const matchTitle = alert.titleAr.toLowerCase().includes(q) || alert.titleEn.toLowerCase().includes(q);
      const matchMeds = alert.medicationNames?.some(m => m.toLowerCase().includes(q));
      if (!matchName && !matchMrn && !matchTitle && !matchMeds) return false;
    }

    return true;
  });

  const activeAlertsCount = alerts.filter(a => !acknowledgedIds.has(a.id) && a.status !== 'acknowledged').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !acknowledgedIds.has(a.id)).length;
  const totalCostAvoidance = alerts.reduce((sum, a) => sum + (a.potentialCostAvoidanceSAR || 0), 0);

  // Helper to find patient object
  const getPatient = (patientId: string) => {
    return patients.find(p => p.id === patientId) || patients[0];
  };

  return (
    <section id="dashboard-risk-alert-system" className="space-y-6">
      {/* Risk Alert System Banner & Notification Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-sm p-6 text-white shadow-md relative overflow-hidden">
        {/* Subtle geometric grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Pulsing Notification Indicator Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {isAr ? 'نظام الإنذار المبكر للمخاطر' : 'Early Risk Alert System'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono">
                  {activeAlertsCount} {isAr ? 'نشط' : 'Active'}
                </span>
              </div>

              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? 'خوارزميات الفرز الاستباقي FHIR R4' : 'Proactive FHIR Triage Engine'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
              <span>
                {isAr
                  ? 'رصد المخاطر السريرية قبل تفاقمها إلى أزمات طارئة'
                  : 'Early Clinical Risk Interception & Hazard Flagging'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isAr
                ? 'يقوم النظام بتحليل بيانات المريض الحالية (التداخلات الدوائية، الالتزام، خروج المستشفى، المخزون، والوظائف الحيوية) لالتقاط إشارات الخطر قبل 24-72 ساعة من حدوث انتكاسة تستدعي الطوارئ.'
                : 'Scans live patient regimens, medication non-adherence, recent discharge vulnerabilities, and vital signals to neutralize clinical hazards 24-72 hours prior to emergency decompensation.'}
            </p>

            {onOpenNotificationCenter && (
              <div className="pt-1.5">
                <button
                  type="button"
                  id="btn-banner-open-notification-center"
                  onClick={onOpenNotificationCenter}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow-rose-600/20"
                >
                  <Bell className="w-4 h-4 animate-bounce" />
                  <span>{isAr ? 'فتح مركز الإشعارات المنبثق والتفاعل المباشر' : 'Open Pop-up Notification Center'}</span>
                  <span className="bg-rose-950/80 border border-rose-400/40 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {activeAlertsCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Key Metric Pills */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
            <div className="bg-slate-800/80 border border-rose-500/40 rounded-sm px-4 py-3 min-w-[130px]">
              <div className="flex items-center justify-between text-[11px] text-rose-300 font-bold uppercase tracking-wider">
                <span>{isAr ? 'مخاطر وشيكة' : 'Critical'}</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {criticalCount}
              </div>
              <div className="text-[10px] text-rose-200 mt-0.5">
                {isAr ? 'تستوجب تدخلاً فورياً' : 'Urgent clinician action'}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-sm px-4 py-3 min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold uppercase tracking-wider">
                <span>{isAr ? 'وقت الاستباق' : 'Lead Time'}</span>
                <Clock className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                36-72h
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isAr ? 'قبل تدهور الحالة' : 'Pre-crisis window'}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-sm px-4 py-3 min-w-[150px]">
              <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                <span>{isAr ? 'وفر مالي محمي' : 'Cost Avoided'}</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {(totalCostAvoidance / 1000).toFixed(1)}k
                <span className="text-xs text-slate-400 font-normal ms-1">SAR</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isAr ? 'تكاليف تنويم ملغاة' : 'Avoided readmissions'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar inside banner */}
        <div className="mt-6 pt-5 border-t border-slate-700/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>{isAr ? 'مستوى الخطر:' : 'Severity:'}</span>
            </span>

            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All', count: alerts.length },
              { id: 'critical', labelAr: 'حرج وشيك', labelEn: 'Critical', count: alerts.filter(a => a.severity === 'critical').length, color: 'text-rose-400' },
              { id: 'warning', labelAr: 'تحذيري', labelEn: 'Warning', count: alerts.filter(a => a.severity === 'warning').length, color: 'text-amber-400' },
              { id: 'watch', labelAr: 'متابعة مبكرة', labelEn: 'Early Watch', count: alerts.filter(a => a.severity === 'watch').length, color: 'text-blue-400' }
            ].map(f => (
              <button
                key={f.id}
                id={`risk-filter-${f.id}`}
                onClick={() => setSeverityFilter(f.id as any)}
                className={`px-3 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  severityFilter === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{isAr ? f.labelAr : f.labelEn}</span>
                <span className="text-[10px] opacity-75 font-mono">({f.count})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs rounded-sm px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{isAr ? 'جميع الفئات السريرية' : 'All Clinical Categories'}</option>
              <option value="drug_interaction">{isAr ? 'تداخلات دوائية DDI' : 'Drug Interactions'}</option>
              <option value="duplicate_therapy">{isAr ? 'ازدواجية علاجية' : 'Duplicate Therapy'}</option>
              <option value="adherence_drop">{isAr ? 'تراجع حرج بالالتزام' : 'Adherence Drops'}</option>
              <option value="discharge_vulnerability">{isAr ? 'فجوة خروج المستشفى' : 'Discharge Transition Gap'}</option>
              <option value="refill_depletion">{isAr ? 'نفاد مخزون الدواء' : 'Supply Depletion'}</option>
              <option value="geriatric_beers">{isAr ? 'معايير بييرز لكبار السن' : 'Beers Criteria'}</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، السجل، الدواء...' : 'Search patient, MRN, med...'}
                className="w-full bg-slate-800/90 text-white text-xs rounded-sm ps-8 pe-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards Container */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-sm p-8 text-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              {isAr ? 'لا توجد إنذارات مخاطر معلقة ضمن هذا الفلتر' : 'No Active Impending Risks Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {isAr
                ? 'تم فحص جميع أدوية ومؤشرات المرضى، والنظام تحت المراقبة المستقرة.'
                : 'All patient regimens scanned and verified under continuous closed-loop safety surveillance.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAck = acknowledgedIds.has(alert.id) || alert.status === 'acknowledged';
            const patient = getPatient(alert.patientId);

            const severityBorder = alert.severity === 'critical'
              ? 'border-l-4 border-rose-600'
              : alert.severity === 'warning'
              ? 'border-l-4 border-amber-500'
              : 'border-l-4 border-blue-500';

            const severityBadge = alert.severity === 'critical' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>{isAr ? 'خطر حرج وشيك' : 'Critical Hazard'}</span>
              </span>
            ) : alert.severity === 'warning' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{isAr ? 'تحذير استباقي' : 'Proactive Warning'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{isAr ? 'متابعة مبكرة' : 'Early Watch'}</span>
              </span>
            );

            return (
              <div
                key={alert.id}
                id={`risk-alert-card-${alert.id}`}
                className={`bg-white border border-slate-200 rounded-sm shadow-xs transition-all hover:shadow-md ${severityBorder} ${
                  isAck ? 'opacity-70 bg-slate-50/60' : ''
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {severityBadge}

                      <span className="text-xs px-2.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-mono font-bold">
                        {alert.category.replace('_', ' ').toUpperCase()}
                      </span>

                      {/* Patient Identity Tag */}
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                        title={isAr ? 'فتح ملف المريض' : 'Open patient profile'}
                      >
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{isAr ? alert.patientNameAr : alert.patientNameEn}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({alert.mrn})</span>
                      </button>

                      <span className="text-[11px] text-slate-500">
                        {alert.age} {isAr ? 'سنة' : 'y/o'} • {isAr ? alert.healthClusterAr : alert.healthClusterEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isAr ? 'رصد آلي بواسطة محرك الأمان' : 'Automated Triage'}</span>
                    </div>
                  </div>

                  {/* Core Alert Content */}
                  <div className="space-y-2.5">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {isAr ? alert.titleAr : alert.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {isAr ? alert.descriptionAr : alert.descriptionEn}
                    </p>

                    {/* Early Detection Window Banner */}
                    <div className="flex items-start sm:items-center gap-2 p-2.5 rounded-sm bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900">
                      <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                      <span className="font-bold">{isAr ? 'نافذة التدخل الاستباقي:' : 'Early Interception Window:'}</span>
                      <span>{isAr ? alert.earlyDetectionWindowAr : alert.earlyDetectionWindowEn}</span>
                    </div>

                    {/* Clinical Rationale */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-sm border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                        {isAr ? 'التعليل الطبي والفسيولوجي:' : 'Clinical & Pharmacological Rationale:'}
                      </span>
                      <p className="italic leading-relaxed">
                        « {isAr ? alert.clinicalRationaleAr : alert.clinicalRationaleEn} »
                      </p>
                    </div>

                    {/* Evidence Tags */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {isAr ? 'القرائن المرصودة:' : 'Signal Evidence:'}
                      </span>
                      {alert.evidenceTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Recommended Action Box */}
                    <div className="p-3 rounded-sm bg-amber-50/60 border border-amber-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <Activity className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isAr ? 'الإجراء الوقائي الموصى به فوراً:' : 'Recommended Immediate Action:'}</span>
                        </span>
                        <p className="text-amber-800 font-medium">
                          {isAr ? alert.recommendedActionAr : alert.recommendedActionEn}
                        </p>
                      </div>

                      {alert.potentialCostAvoidanceSAR > 0 && (
                        <div className="shrink-0 text-end">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                            {isAr ? 'وفر مالي محقق' : 'Avoided Cost'}
                          </span>
                          <span className="font-mono font-bold text-emerald-700 text-sm">
                            +{alert.potentialCostAvoidanceSAR.toLocaleString()} SAR
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Button 1: Inspect Patient & Passport */}
                      <button
                        id={`btn-inspect-patient-${alert.id}`}
                        onClick={() => onSelectPatient(patient)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>{isAr ? 'معاينة جواز الدواء وفحص الجرعات' : 'Inspect Passport & Regimen'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {/* Button 2: Escalate to Clinical Pharmacist */}
                      <button
                        id={`btn-escalate-pharmacist-${alert.id}`}
                        onClick={() => onOpenIntervention(patient)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isAr ? 'تصعيد فوري لتدخل صيدلي' : 'Escalate to Pharmacist'}</span>
                      </button>
                    </div>

                    {/* Acknowledge Button */}
                    <div>
                      {isAck ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-sm border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{isAr ? 'تمت المراجعة والإقرار السريري' : 'Reviewed & Acknowledged'}</span>
                        </div>
                      ) : (
                        <button
                          id={`btn-ack-alert-${alert.id}`}
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-600 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
                          title={isAr ? 'إقرار مراجعة التنبيه' : 'Acknowledge alert'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600" />
                          <span>{isAr ? 'إقرار ومراجعة التنبيه' : 'Acknowledge Alert'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
