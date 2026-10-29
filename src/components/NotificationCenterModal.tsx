import React, { useState, useMemo } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  X,
  ExternalLink,
  Pill,
  Sparkles,
  Stethoscope,
  PhoneCall,
  Zap,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  Radio,
  Filter,
  Search,
  Check,
  Send,
  UserCheck
} from 'lucide-react';
import { Patient, Language } from '../types';
import { HealthRiskAlert } from '../services/riskAlertEngine';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: HealthRiskAlert[];
  patients: Patient[];
  lang: Language;
  onSelectPatient: (patient: Patient) => void;
  onOpenIntervention: (patient: Patient) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onSimulateNewAlert?: () => void;
  onEscalateAlert?: (alertId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  alerts,
  patients,
  lang,
  onSelectPatient,
  onOpenIntervention,
  onAcknowledgeAlert,
  onSimulateNewAlert,
  onEscalateAlert
}) => {
  const isAr = lang === 'ar';

  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'watch'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAlertIds, setExpandedAlertIds] = useState<Set<string>>(new Set());
  const [escalatedAlertIds, setEscalatedAlertIds] = useState<Set<string>>(new Set());
  const [contactedPatientIds, setContactedPatientIds] = useState<Set<string>>(new Set());
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Keyboard navigation & ESC handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helper to get patient object
  const getPatientForAlert = (patientId: string): Patient => {
    return patients.find((p) => p.id === patientId) || patients[0];
  };

  // Toggle alert card expansion for deep clinical reasoning
  const toggleExpand = (alertId: string) => {
    setExpandedAlertIds((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };

  // Handle escalation to attending physician
  const handleEscalate = (alert: HealthRiskAlert) => {
    setEscalatedAlertIds((prev) => new Set(prev).add(alert.id));
    if (onEscalateAlert) {
      onEscalateAlert(alert.id);
    }
    showToast(
      isAr
        ? `تم تصعيد التنبيه بنجاح للاستشاري المعالج في ${alert.healthClusterAr}`
        : `Alert escalated to attending consultant at ${alert.healthClusterEn}`
    );
  };

  // Handle direct patient outreach via Sehhaty
  const handleOutreach = (patient: Patient, alert: HealthRiskAlert) => {
    setContactedPatientIds((prev) => new Set(prev).add(alert.id));
    showToast(
      isAr
        ? `تم إرسال إشعار توجيهي فوري للمريض عبر تطبيق صحتي وتثبيت الاتصال`
        : `Clinical guidance notification dispatched to patient via Sehhaty`
    );
  };

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 3500);
  };

  // Filtering alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const isResolved = alert.status === 'acknowledged';

      // Status filter
      if (statusFilter === 'unresolved' && isResolved) return false;
      if (statusFilter === 'resolved' && !isResolved) return false;

      // Severity filter
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          alert.patientNameAr.toLowerCase().includes(q) ||
          alert.patientNameEn.toLowerCase().includes(q);
        const matchMrn = alert.mrn.toLowerCase().includes(q);
        const matchTitle =
          alert.titleAr.toLowerCase().includes(q) ||
          alert.titleEn.toLowerCase().includes(q);
        const matchMeds = alert.medicationNames?.some((m) =>
          m.toLowerCase().includes(q)
        );
        if (!matchName && !matchMrn && !matchTitle && !matchMeds) return false;
      }

      return true;
    });
  }, [alerts, statusFilter, severityFilter, searchQuery]);

  // Statistics
  const activeUnresolvedCount = alerts.filter((a) => a.status !== 'acknowledged').length;
  const criticalUnresolvedCount = alerts.filter(
    (a) => a.status !== 'acknowledged' && a.severity === 'critical'
  ).length;
  const totalCostAvoidanceUnresolved = alerts
    .filter((a) => a.status !== 'acknowledged')
    .reduce((sum, a) => sum + (a.potentialCostAvoidanceSAR || 0), 0);

  if (!isOpen) return null;

  return (
    <div
      id="notification-center-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      {/* Slide-over Drawer Container */}
      <div
        id="notification-center-drawer"
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-s border-slate-200 overflow-hidden transform transition-transform"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Drawer Header with Real-Time Feed Status */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-sm bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {isAr ? 'مركز الإشعارات وتنبيهات المخاطر' : 'Clinical Risk Notification Center'}
                  </h2>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
                  <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-spin-slow" />
                    {isAr ? 'بث مباشر للإشارات السريرية' : 'Live Risk Signal Stream'}
                  </span>
                  <span>•</span>
                  <span>
                    {activeUnresolvedCount} {isAr ? 'تنبيهات نشطة' : 'active alerts'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Actions: Simulate Alert & Close */}
            <div className="flex items-center gap-2">
              {onSimulateNewAlert && (
                <button
                  type="button"
                  id="btn-simulate-incoming-alert"
                  onClick={onSimulateNewAlert}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title={isAr ? 'محاكاة وصول إشعار خطر فوري جديد للاختبار' : 'Simulate incoming live clinical alert'}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>{isAr ? 'محاكاة تنبيه فوري' : 'Simulate Alert'}</span>
                </button>
              )}

              <button
                type="button"
                id="btn-close-notification-center"
                onClick={onClose}
                className="w-8 h-8 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isAr ? 'إغلاق (Esc)' : 'Close (Esc)'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Summary Strip: Critical count & SAR Cost Avoidance */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-sm p-2 flex items-center justify-between">
              <span className="text-rose-300 font-medium text-[11px]">
                {isAr ? 'تنبيهات حرجة وشيكة:' : 'Imminent Critical:'}
              </span>
              <span className="font-mono font-bold text-white text-sm bg-rose-600/60 px-2 py-0.5 rounded-sm">
                {criticalUnresolvedCount}
              </span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-sm p-2 flex items-center justify-between">
              <span className="text-emerald-300 font-medium text-[11px]">
                {isAr ? 'وفر مالي محمي:' : 'Cost Avoidance:'}
              </span>
              <span className="font-mono font-bold text-emerald-300 text-sm">
                {totalCostAvoidanceUnresolved.toLocaleString()} <span className="text-[10px]">SAR</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Toast Feedback Banner */}
        {actionFeedback && (
          <div
            id="notification-center-action-feedback"
            className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-inner animate-fadeIn shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="notification-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث باسم المريض، الرقم الطبي، الدواء...' : 'Search patient, MRN, medication...'}
                className="w-full bg-white text-slate-800 text-xs rounded-sm ps-8 pe-3 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Simulate Button */}
            {onSimulateNewAlert && (
              <button
                type="button"
                id="btn-simulate-alert-mob"
                onClick={onSimulateNewAlert}
                className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-bold cursor-pointer shrink-0"
                title={isAr ? 'محاكاة تنبيه' : 'Simulate'}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? 'محاكاة' : 'Simulate'}</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Status Segmented Control */}
            <div className="inline-flex rounded-sm bg-slate-200/80 p-0.5 text-xs">
              <button
                type="button"
                id="filter-status-unresolved"
                onClick={() => setStatusFilter('unresolved')}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'unresolved'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? `النشطة (${activeUnresolvedCount})` : `Active (${activeUnresolvedCount})`}
              </button>
              <button
                type="button"
                id="filter-status-all"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? `الكل (${alerts.length})` : `All (${alerts.length})`}
              </button>
              <button
                type="button"
                id="filter-status-resolved"
                onClick={() => setStatusFilter('resolved')}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'resolved'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? 'المعتمدة' : 'Resolved'}
              </button>
            </div>

            {/* Severity Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => setSeverityFilter('all')}
                className={`px-2 py-0.5 rounded-sm border cursor-pointer ${
                  severityFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isAr ? 'كافة الدرجات' : 'All Tiers'}
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('critical')}
                className={`px-2 py-0.5 rounded-sm border cursor-pointer ${
                  severityFilter === 'critical'
                    ? 'bg-rose-600 text-white border-rose-600 font-bold'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {isAr ? 'حرجة' : 'Critical'}
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('warning')}
                className={`px-2 py-0.5 rounded-sm border cursor-pointer ${
                  severityFilter === 'warning'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {isAr ? 'تحذير' : 'Warning'}
              </button>
            </div>
          </div>
        </div>

        {/* Alerts Scrollable Feed List */}
        <div
          id="notification-center-feed"
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 divide-y divide-slate-100 bg-[#F8FAFC]"
        >
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {isAr ? 'لا توجد تنبيهات مخاطر مطابقة' : 'No matching risk alerts'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isAr
                  ? 'تمت مراجعة ومعالجة كافة الإشارات الحرجة أو لا توجد نتائج مطابقة لفلتر البحث المحدد.'
                  : 'All priority signals are reconciled or no alerts match the active filter.'}
              </p>
              {onSimulateNewAlert && (
                <button
                  type="button"
                  onClick={onSimulateNewAlert}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAr ? 'محاكاة وصول تنبيه لحظي' : 'Simulate incoming risk alert'}</span>
                </button>
              )}
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const patient = getPatientForAlert(alert.patientId);
              const isExpanded = expandedAlertIds.has(alert.id);
              const isResolved = alert.status === 'acknowledged';
              const isEscalated = escalatedAlertIds.has(alert.id) || alert.status === 'escalated';
              const isContacted = contactedPatientIds.has(alert.id);

              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  id={`notification-card-${alert.id}`}
                  className={`pt-3 first:pt-0 transition-all rounded-sm ${
                    isResolved
                      ? 'opacity-70 bg-white/70 border border-slate-200 p-3'
                      : isCritical
                      ? 'bg-white border-s-4 border-s-rose-600 border border-slate-200 p-3.5 shadow-sm'
                      : isWarning
                      ? 'bg-white border-s-4 border-s-amber-500 border border-slate-200 p-3.5 shadow-sm'
                      : 'bg-white border-s-4 border-s-blue-500 border border-slate-200 p-3.5 shadow-sm'
                  }`}
                >
                  {/* Alert Card Header: Patient Identity, Severity Badge & Timestamp */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Severity Pill */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider font-mono ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {isCritical ? (
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                        )}
                        <span>{isCritical ? (isAr ? 'حرج وشيك' : 'Critical') : (isAr ? 'تحذير' : 'Warning')}</span>
                      </span>

                      {/* Escalated or Resolved Status Pills */}
                      {isResolved && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3" />
                          <span>{isAr ? 'تم الاعتماد' : 'Resolved'}</span>
                        </span>
                      )}

                      {isEscalated && !isResolved && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                          <UserCheck className="w-3 h-3" />
                          <span>{isAr ? 'تم التصعيد للاستشاري' : 'Escalated to MD'}</span>
                        </span>
                      )}

                      {isContacted && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          <Send className="w-3 h-3" />
                          <span>{isAr ? 'تم إرسال توجيه صحتي' : 'Sehhaty Sent'}</span>
                        </span>
                      )}
                    </div>

                    {/* Time of detection */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{isAr ? 'تم الالتقاط: ' : 'Detected: '}</span>
                      <span>
                        {new Date(alert.detectedAt).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Patient Line: Name, MRN, Health Cluster */}
                  <div className="mt-2 flex items-baseline justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                        {isAr ? alert.patientNameAr : alert.patientNameEn}
                      </span>
                      <span className="text-slate-400 text-xs ms-2 font-mono">
                        ({alert.mrn})
                      </span>
                      <span className="text-slate-400 text-xs ms-2">• {alert.age} {isAr ? 'سنة' : 'yrs'}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                      {isAr ? alert.healthClusterAr : alert.healthClusterEn}
                    </span>
                  </div>

                  {/* Title & Description of Risk Alert */}
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5 leading-snug">
                    {isAr ? alert.titleAr : alert.titleEn}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isAr ? alert.descriptionAr : alert.descriptionEn}
                  </p>

                  {/* Early Interception Window Pill & Cost Avoidance */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap text-xs bg-slate-50 p-2 rounded-sm border border-slate-100">
                    <div className="flex items-center gap-1.5 text-blue-800 font-medium text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{isAr ? alert.earlyDetectionWindowAr : alert.earlyDetectionWindowEn}</span>
                    </div>
                    {alert.potentialCostAvoidanceSAR > 0 && (
                      <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold">
                        <DollarSign className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{isAr ? 'وفر متوقع:' : 'Cost saved:'} {alert.potentialCostAvoidanceSAR.toLocaleString()} SAR</span>
                      </div>
                    )}
                  </div>

                  {/* Expandable Clinical Rationale & Evidence Tags */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 text-xs animate-fadeIn">
                      <div>
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          {isAr ? 'التعليل السريري وآلية الخطر:' : 'Clinical Rationale & Mechanism:'}
                        </span>
                        <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 rounded-sm border border-slate-200">
                          {isAr ? alert.clinicalRationaleAr : alert.clinicalRationaleEn}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          {isAr ? 'التوجيه السريري الموصى به فوراً:' : 'Recommended Immediate Action:'}
                        </span>
                        <p className="text-slate-800 font-medium mt-0.5 bg-blue-50/70 p-2 rounded-sm border border-blue-200 text-blue-900">
                          {isAr ? alert.recommendedActionAr : alert.recommendedActionEn}
                        </p>
                      </div>

                      {alert.evidenceTags && alert.evidenceTags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-slate-400">{isAr ? 'إشارات الدليل:' : 'Evidence tags:'}</span>
                          {alert.evidenceTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded-sm bg-slate-200/70 text-slate-700 text-[10px] font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Direct Interactive Action Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    {/* Toggle Details Expand button */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(alert.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>{isAr ? 'إخفاء التعليل السريري' : 'Hide rationale'}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>{isAr ? 'عرض التعليل السريري' : 'View rationale'}</span>
                        </>
                      )}
                    </button>

                    {/* Interactive Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Action 1: Direct Clinical Intervention */}
                      <button
                        type="button"
                        id={`btn-alert-intervene-${alert.id}`}
                        onClick={() => {
                          onOpenIntervention(patient);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                        title={isAr ? 'بدء تدخل سريري فوري معتمد' : 'Launch clinical intervention'}
                      >
                        <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                        <span>{isAr ? 'تدخل سريري' : 'Intervene'}</span>
                      </button>

                      {/* Action 2: Open Medication Passport */}
                      <button
                        type="button"
                        id={`btn-alert-passport-${alert.id}`}
                        onClick={() => {
                          onSelectPatient(patient);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
                        title={isAr ? 'فتح الجواز الدوائي وفحص الذكاء الاصطناعي' : 'Open Medication Passport'}
                      >
                        <Pill className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span>{isAr ? 'الملف الدوائي' : 'Passport'}</span>
                      </button>

                      {/* Action 3: Escalate to MD */}
                      {!isEscalated && (
                        <button
                          type="button"
                          id={`btn-alert-escalate-${alert.id}`}
                          onClick={() => handleEscalate(alert)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors cursor-pointer"
                          title={isAr ? 'تصعيد للطبيب المعالج' : 'Escalate to Physician'}
                        >
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAr ? 'تصعيد' : 'Escalate'}</span>
                        </button>
                      )}

                      {/* Action 4: Sehhaty Guidance Message */}
                      {!isContacted && (
                        <button
                          type="button"
                          id={`btn-alert-outreach-${alert.id}`}
                          onClick={() => handleOutreach(patient, alert)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                          title={isAr ? 'إرسال توجيه فوري للمريض عبر صحتي' : 'Send Sehhaty Guidance'}
                        >
                          <Send className="w-3 h-3 shrink-0" />
                          <span>{isAr ? 'صحتي' : 'Sehhaty'}</span>
                        </button>
                      )}

                      {/* Action 5: Acknowledge / Resolve */}
                      {!isResolved ? (
                        <button
                          type="button"
                          id={`btn-alert-ack-${alert.id}`}
                          onClick={() => {
                            onAcknowledgeAlert(alert.id);
                            showToast(isAr ? 'تم اعتماد التنبيه وإغلاقه' : 'Alert acknowledged & resolved');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                          title={isAr ? 'إقرار واكتمال الإجراء' : 'Acknowledge alert'}
                        >
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>{isAr ? 'اعتماد' : 'Resolve'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 px-2 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'مكتمل' : 'Resolved'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with Benchmark & Quick Stats */}
        <div className="bg-slate-900 text-slate-300 p-3 sm:p-4 border-t border-slate-800 text-xs flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{isAr ? 'بروتوكول الرصد التنبؤي FHIR R4 متصل' : 'FHIR R4 Risk Feed Active'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-drawer-close-bottom"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              {isAr ? 'إغلاق النافذة' : 'Close Center'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
