import React, { useState, useEffect } from 'react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import { HealthPassportModal } from './HealthPassportModal';
import { SehhatyComparisonCard } from './SehhatyComparisonCard';
import { SehhatyComparisonModal } from './SehhatyComparisonModal';
import { DashboardCharts } from './DashboardCharts';
import { RiskAlertSystem } from './RiskAlertSystem';
import { HealthRiskAlert, generatePatientRiskAlerts } from '../services/riskAlertEngine';
import {
  DashboardLayoutToolbar,
  DashboardSectionId,
  DEFAULT_SECTION_ORDER,
  DASHBOARD_SECTIONS_META
} from './DashboardLayoutToolbar';
import {
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Pill,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  HeartPulse,
  DollarSign,
  FileText,
  Bell,
  Compass,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Scale,
  HeartHandshake
} from 'lucide-react';
import { Patient, PlatformKPIs, Language, RiskLevel } from '../types';

const STORAGE_KEY = 'aafiyacare_dashboard_section_order_v1';

const getInitialSectionOrder = (): DashboardSectionId[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validSaved = parsed.filter((id): id is DashboardSectionId =>
            DEFAULT_SECTION_ORDER.includes(id as DashboardSectionId)
          );
          const missing = DEFAULT_SECTION_ORDER.filter((id) => !validSaved.includes(id));
          const merged = [...validSaved, ...missing];
          if (merged.length === DEFAULT_SECTION_ORDER.length) {
            return merged;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not read dashboard order from localStorage:', e);
  }
  return DEFAULT_SECTION_ORDER;
};

interface DashboardViewProps {
  patients: Patient[];
  kpis: PlatformKPIs;
  lang: Language;
  alerts?: HealthRiskAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onSelectPatient: (patient: Patient) => void;
  onOpenIntervention: (patient: Patient) => void;
  onOpenTour?: () => void;
  onOpenSummary?: () => void;
  onOpenNotificationCenter?: () => void;
  onOpenPatientPortal?: (patient: Patient) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  kpis,
  lang,
  alerts,
  onAcknowledgeAlert,
  onSelectPatient,
  onOpenIntervention,
  onOpenTour,
  onOpenSummary,
  onOpenNotificationCenter,
  onOpenPatientPortal
}) => {
  const isAr = lang === 'ar';
  const effectiveAlerts = alerts || generatePatientRiskAlerts(patients);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [passportModalPatient, setPassportModalPatient] = useState<Patient | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  // Section Ordering & Drag-and-Drop state with LocalStorage persistence
  const [sectionOrder, setSectionOrder] = useState<DashboardSectionId[]>(getInitialSectionOrder);
  const [draggedSectionId, setDraggedSectionId] = useState<DashboardSectionId | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<DashboardSectionId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isCustomOrder = JSON.stringify(sectionOrder) !== JSON.stringify(DEFAULT_SECTION_ORDER);

  const saveOrder = (newOrder: DashboardSectionId[], feedback?: string) => {
    setSectionOrder(newOrder);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
      }
    } catch (e) {
      console.warn('Failed to save dashboard order to localStorage:', e);
    }
    if (feedback) {
      setToastMessage(feedback);
      setTimeout(() => {
        setToastMessage((prev) => (prev === feedback ? null : prev));
      }, 3500);
    }
  };

  const handleSectionDragStart = (e: React.DragEvent, sectionId: DashboardSectionId) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.setData('text/plain', sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: DashboardSectionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSectionId !== sectionId) {
      setDragOverSectionId(sectionId);
    }
  };

  const handleSectionDragLeave = (e: React.DragEvent, sectionId: DashboardSectionId) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    if (dragOverSectionId === sectionId) {
      setDragOverSectionId(null);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: DashboardSectionId) => {
    e.preventDefault();
    const rawId = e.dataTransfer.getData('text/plain') as DashboardSectionId;
    const sourceSectionId = draggedSectionId || (DEFAULT_SECTION_ORDER.includes(rawId) ? rawId : null);

    if (!sourceSectionId || sourceSectionId === targetSectionId) {
      setDraggedSectionId(null);
      setDragOverSectionId(null);
      return;
    }

    const currentIndex = sectionOrder.indexOf(sourceSectionId);
    const targetIndex = sectionOrder.indexOf(targetSectionId);
    if (currentIndex === -1 || targetIndex === -1) return;

    const updated = [...sectionOrder];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);

    const movedMeta = DASHBOARD_SECTIONS_META[moved];
    saveOrder(
      updated,
      isAr
        ? `تم تقديم "${movedMeta.shortLabelAr}" إلى الموضع #${targetIndex + 1} وحفظ الترتيب في الذاكرة المحلية`
        : `Reordered: "${movedMeta.shortLabelEn}" placed at #${targetIndex + 1} (saved locally)`
    );

    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  const moveSectionByStep = (sectionId: DashboardSectionId, direction: 'up' | 'down') => {
    const index = sectionOrder.indexOf(sectionId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const updated = [...sectionOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const movedMeta = DASHBOARD_SECTIONS_META[moved];
    saveOrder(
      updated,
      isAr
        ? `تم نقل قسم "${movedMeta.shortLabelAr}" إلى الموضع #${targetIndex + 1}`
        : `Moved "${movedMeta.shortLabelEn}" to position #${targetIndex + 1}`
    );
  };

  const handleResetOrder = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to remove dashboard order from localStorage:', e);
    }
    saveOrder(
      DEFAULT_SECTION_ORDER,
      isAr ? 'تمت استعادة الترتيب القياسي الافتراضي' : 'Default layout restored'
    );
  };

  const handleApplyPreset = (presetOrder: DashboardSectionId[]) => {
    saveOrder(
      presetOrder,
      isAr ? 'تم تطبيق القالب وحفظ الترتيب في الذاكرة المحلية' : 'Preset layout applied & saved locally'
    );
  };

  const filteredPatients = patients.filter((p) => {
    const matchesRisk = selectedRiskFilter === 'all' || p.riskLevel === selectedRiskFilter;
    const matchesCluster =
      selectedClusterFilter === 'all' ||
      p.healthCluster === selectedClusterFilter ||
      p.healthClusterEn === selectedClusterFilter;
    const matchesSearch =
      searchQuery === '' ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalIdMasked.includes(searchQuery) ||
      p.healthCluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.healthClusterEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesCluster && matchesSearch;
  });

  const getRiskBadge = (level: RiskLevel, score: number) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 bg-rose-500 shrink-0" />
            {isAr ? 'أولوية عالية' : 'High Priority'} ({score})
          </span>
        );
      case 'rising':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 bg-amber-500 shrink-0" />
            {isAr ? 'خطر متصاعد' : 'Rising Risk'} ({score})
          </span>
        );
      case 'monitor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 bg-blue-500 shrink-0" />
            {isAr ? 'مراقبة' : 'Monitor'} ({score})
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 shrink-0" />
            {isAr ? 'منخفض' : 'Low Risk'} ({score})
          </span>
        );
    }
  };

  // Section Header Strip with Drag Handle & Step Controls
  const renderSectionHeader = (sectionId: DashboardSectionId, index: number) => {
    const meta = DASHBOARD_SECTIONS_META[sectionId];
    const Icon = meta.icon;

    return (
      <div
        id={`section-header-${sectionId}`}
        draggable
        onDragStart={(e) => handleSectionDragStart(e, sectionId)}
        onDragEnd={handleSectionDragEnd}
        className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/90 rounded-t-sm text-xs transition-colors mb-2 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap pointer-events-none">
          {/* Drag Handle */}
          <div
            id={`drag-handle-${sectionId}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs group"
            title={isAr ? 'اسحب هذا المقبض لإعادة ترتيب موضع القسم في لوحة القيادة' : 'Drag this handle to reorder section priority'}
          >
            <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
            <span className="font-mono text-[11px] font-bold text-slate-700">
              #{index + 1}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 hidden sm:inline">
              {isAr ? 'اسحب للترتيب' : 'Drag'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {isAr ? meta.titleAr : meta.titleEn}
            </span>
            <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] border font-semibold ${meta.colorClass}`}>
              {isAr ? meta.tagAr : meta.tagEn}
            </span>
          </div>
        </div>

        {/* Step Up / Step Down Movement Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            id={`btn-move-up-${sectionId}`}
            disabled={index === 0}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              moveSectionByStep(sectionId, 'up');
            }}
            className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors shadow-2xs"
            title={isAr ? 'تقديم القسم خطوة للأعلى' : 'Move section up'}
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            id={`btn-move-down-${sectionId}`}
            disabled={index === sectionOrder.length - 1}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              moveSectionByStep(sectionId, 'down');
            }}
            className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors shadow-2xs"
            title={isAr ? 'تأخير القسم خطوة للأسفل' : 'Move section down'}
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Section 1: North Star Hero
  const renderNorthStarHero = () => (
    <div className="relative rounded-sm bg-[#0F172A] border border-slate-800 p-4 sm:p-6 md:p-8 text-white shadow-sm overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3 flex-wrap">
            <AafiyaCareLogo 
              id="dashboard-hero-logo"
              variant="horizontal" 
              size="sm" 
              theme="dark-bg" 
              isAr={isAr} 
            />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-blue-600/20 border border-blue-500/30 text-xs font-semibold text-blue-400 uppercase tracking-wider font-mono">
              <span>{isAr ? 'مؤشر النجم الشمالي' : 'North Star Metric'}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            {isAr
              ? 'عدد الحالات عالية الخطورة التي تم اكتشافها وحلها بنجاح'
              : 'High-Risk Medication Cases Detected & Successfully Resolved'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isAr
              ? '« في النظام الصحي التقليدي نكتشف المشكلة عندما يصل المريض إلينا، في عافية كير نكتشف الإشارة قبل أن يصل المريض إلى الأزمة »'
              : '"In conventional care, we discover the issue when the patient reaches the ER. In AafiyaCare, we catch the signal before it becomes a crisis."'}
          </p>

          {/* Quick Access to Tour & Full Dossier */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onOpenTour && (
              <button
                id="dashboard-hero-btn-tour"
                onClick={onOpenTour}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer min-h-[40px]"
              >
                <Compass className="w-4 h-4 text-blue-200 animate-spin-slow" />
                <span>{isAr ? 'جولة تفاعلية' : 'Guided Tour'}</span>
              </button>
            )}
            {onOpenSummary && (
              <button
                id="dashboard-hero-btn-summary"
                onClick={onOpenSummary}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-sm bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 border border-slate-700 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer min-h-[40px]"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'ملخص المشروع' : 'Dossier'}</span>
              </button>
            )}

            {/* Benchmark vs Sehhaty Comparison Button */}
            <button
              type="button"
              id="dashboard-hero-btn-sehhaty-comparison"
              onClick={() => setIsComparisonModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-sm bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 active:from-blue-800 active:to-indigo-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer min-h-[40px]"
              title={isAr ? 'عرض جدول المقارنة بين سجل صحتي ومحرك عافية كير' : 'View Sehhaty vs AafiyaCare comparison matrix'}
            >
              <Scale className="w-4 h-4 text-blue-200" />
              <span>{isAr ? 'مقارنة مع صحتي' : 'Sehhaty Benchmark'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-slate-800/60 border border-slate-700 rounded-sm p-4 sm:px-6 sm:py-5 w-full md:w-auto shrink-0">
          <div className="text-start">
            <div className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              {kpis.northStarHighRiskResolved}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight mt-1">
              {isAr ? 'حالة تم حلها' : 'Cases Resolved'}
            </div>
          </div>
          <div className="h-10 sm:h-12 w-[1px] bg-slate-700" />
          <div className="text-start">
            <div className="text-xl sm:text-2xl md:text-3xl font-light text-emerald-400 tracking-tight">
              {kpis.estimatedMedicationWasteSavedSAR.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-1">
              {isAr ? 'ريال وفر وهدر ملغى' : 'SAR Cost Avoidance'}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Closed-Loop Flywheel with Geometric 01-04 Box Markers */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-sm bg-slate-800/40 border border-slate-700/80">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            01
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
              {isAr ? 'التقاط الإشارة' : 'Detect'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 truncate">
              {isAr ? 'رصد فوري للتغيرات' : 'Real-time Capture'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-sm bg-slate-800/40 border border-slate-700/80">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            02
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
              {isAr ? 'التنبؤ بالخطر' : 'Predict'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 truncate">
              {isAr ? 'تصنيف درجات الخطورة' : 'Predictive Triage'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-sm bg-slate-800/40 border border-slate-700/80">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            03
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
              {isAr ? 'التدخل السريري' : 'Intervene'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 truncate">
              {isAr ? 'توجيه الصيدلي والطبيب' : 'Clinical Action'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-sm bg-slate-800/40 border border-slate-700/80">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            04
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
              {isAr ? 'القياس والتغذية' : 'Measure'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 truncate">
              {isAr ? 'حلقة الذكاء المغلقة' : 'Closed-Loop Engine'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Section 2: Primary KPI Grid
  const renderKpiGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {/* KPI 1: Patient Risk */}
      <div className="bg-white p-4 sm:p-5 border border-slate-200 shadow-sm rounded-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              {isAr ? 'خطورة المرضى' : 'Patient Risk Tiers'}
            </p>
            <div className="w-6 h-6 rounded-sm bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-light text-slate-900 mt-2">
            {kpis.highPriorityCount}
            <span className="text-xs font-bold text-rose-600 ms-2 uppercase tracking-wider">
              {isAr ? 'أولوية قصوى' : 'High Priority'}
            </span>
          </p>
        </div>
        <div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 w-[65%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            +{kpis.risingRiskCount} {isAr ? 'خطر متصاعد يحتاج متابعة' : 'Rising Risk cohorts'}
          </p>
        </div>
      </div>

      {/* KPI 2: Medication Safety */}
      <div className="bg-white p-4 sm:p-5 border border-slate-200 shadow-sm rounded-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              {isAr ? 'السلامة الدوائية' : 'Medication Safety'}
            </p>
            <div className="w-6 h-6 rounded-sm bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-light text-slate-900 mt-2">
            {kpis.activeSafetyAlerts}
          </p>
        </div>
        <div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[82%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {isAr ? 'إشارات نشطة قيد المراجعة' : 'Signals in review queue'}
          </p>
        </div>
      </div>

      {/* KPI 3: Adherence */}
      <div className="bg-white p-4 sm:p-5 border border-slate-200 shadow-sm rounded-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              {isAr ? 'الالتزام الدوائي' : 'Med Adherence'}
            </p>
            <div className="w-6 h-6 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-light text-slate-900 mt-2">
            {kpis.averageAdherenceRate}%
          </p>
        </div>
        <div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[78%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {isAr ? 'متوسط معدل التزام المرضى' : 'Cohort adherence avg'}
          </p>
        </div>
      </div>

      {/* KPI 4: Waste Reduction */}
      <div className="bg-white p-4 sm:p-5 border border-slate-200 shadow-sm rounded-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              {isAr ? 'الحد من الهدر' : 'Waste Avoidance'}
            </p>
            <div className="w-6 h-6 rounded-sm bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-light text-slate-900 mt-2">
            486.2K <span className="text-xs font-bold text-slate-400">SAR</span>
          </p>
        </div>
        <div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[89%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {isAr ? 'تقليص أدوية فائضة وتكرار' : 'Surplus & duplication cut'}
          </p>
        </div>
      </div>

      {/* KPI 5: Alert Fatigue Reduction */}
      <div className="bg-white p-4 sm:p-5 border border-slate-200 shadow-sm rounded-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
              {isAr ? 'تقليل إرهاق التنبيهات' : 'Alert Fatigue Cut'}
            </p>
            <div className="w-6 h-6 rounded-sm bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-light text-slate-900 mt-2">
            78.5%
          </p>
        </div>
        <div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-[78.5%]"></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {isAr ? 'فلترة الإشارات غير الحرجة' : 'Precision triage filtering'}
          </p>
        </div>
      </div>
    </div>
  );

  // Section 3: Risk Alert System
  const renderRiskAlerts = () => (
    <RiskAlertSystem
      alerts={effectiveAlerts}
      patients={patients}
      lang={lang}
      onSelectPatient={onSelectPatient}
      onOpenIntervention={onOpenIntervention}
      onAcknowledgeAlert={onAcknowledgeAlert || (() => {})}
      onOpenNotificationCenter={onOpenNotificationCenter}
    />
  );

  // Section 4: Analytics Charts
  const renderDashboardCharts = () => (
    <DashboardCharts
      patients={patients}
      kpis={kpis}
      lang={lang}
      onSelectPatient={onSelectPatient}
    />
  );

  // Section 5: Patient Triage Table
  const renderPatientTriageTable = () => (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-none" />
              <span>{isAr ? 'فرز المرضى حسب درجة الخطورة' : 'Predictive Patient Risk Triage'}</span>
            </h2>
            <AafiyaCareLogo variant="stamp" size="xs" isAr={isAr} id="triage-stamp-logo" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
            {isAr
              ? 'تصنيف المرضى حسب نموذج التنبؤ السريري ومصادر الإشارات الثلاث'
              : 'Cohort prioritized by AI predictive risk engine across 3 signal sources'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Health Cluster Filter Dropdown */}
          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <select
              id="cluster-filter-select"
              value={selectedClusterFilter}
              onChange={(e) => setSelectedClusterFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-sm px-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white font-medium cursor-pointer"
              aria-label={isAr ? 'تصفية حسب التجمع الصحي' : 'Filter by Health Cluster'}
            >
              <option value="all">{isAr ? 'جميع التجمعات الصحية' : 'All Health Clusters'}</option>
              <option value="تجمع الطائف الصحي">{isAr ? '⭐ تجمع الطائف الصحي' : '⭐ Taif Health Cluster'}</option>
              <option value="تجمع الرياض الصحي الثاني">{isAr ? 'تجمع الرياض الصحي الثاني' : 'Riyadh Cluster 2'}</option>
              <option value="تجمع الرياض الصحي الأول">{isAr ? 'تجمع الرياض الصحي الأول' : 'Riyadh Cluster 1'}</option>
              <option value="تجمع مكة المكرمة الصحي">{isAr ? 'تجمع مكة المكرمة الصحي' : 'Makkah Cluster'}</option>
              <option value="تجمع عسير الصحي">{isAr ? 'تجمع عسير الصحي' : 'Asir Cluster'}</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              id="patient-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، السجل، التجمع...' : 'Search name, MRN, Cluster...'}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-sm ps-9 pe-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Risk Tier Filters with Geometric Balance Segmented Control */}
          <div className="flex items-center rounded-sm bg-slate-100 p-0.5 border border-slate-200 text-xs overflow-x-auto scrollbar-none max-w-full">
            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All' },
              { id: 'high', labelAr: 'عالية', labelEn: 'High' },
              { id: 'rising', labelAr: 'متصاعدة', labelEn: 'Rising' },
              { id: 'monitor', labelAr: 'مراقبة', labelEn: 'Monitor' },
              { id: 'low', labelAr: 'منخفضة', labelEn: 'Low' }
            ].map((filter) => (
              <button
                key={filter.id}
                id={`filter-${filter.id}`}
                onClick={() => setSelectedRiskFilter(filter.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-sm transition-colors text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                  selectedRiskFilter === filter.id
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? filter.labelAr : filter.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📱 MOBILE PATIENT CARDS VIEW (Clean, touch-friendly cards on screens < md) */}
      <div className="md:hidden divide-y divide-slate-100">
        {filteredPatients.map((patient) => {
          const unreviewedSignals = patient.safetySignals.filter(
            (s) => s.resolutionStatus === 'unreviewed'
          );
          const adhPct = Math.round(
            (patient.engagement.confirmedDosesLast7Days /
              (patient.engagement.scheduledDosesLast7Days || 1)) *
              100
          );
          const barColor = adhPct < 60 ? 'bg-rose-500' : adhPct < 80 ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <div
              key={`mob-patient-${patient.id}`}
              id={`mob-patient-card-${patient.id}`}
              className="p-4 space-y-3 bg-white hover:bg-slate-50/60 transition-colors"
            >
              {/* Header: Name & Risk Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {isAr ? patient.nameAr : patient.nameEn}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 flex-wrap">
                    <span className="font-mono font-semibold text-slate-700">{patient.mrn}</span>
                    <span>•</span>
                    <span>{patient.age} {isAr ? 'سنة' : 'yrs'}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">
                      {isAr ? patient.healthCluster : patient.healthClusterEn}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-end">
                  {getRiskBadge(patient.riskLevel, patient.riskScore)}
                </div>
              </div>

              {/* Chronic conditions */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-sm border border-slate-100">
                <span className="font-semibold text-slate-700">{isAr ? 'التشخيص المزمن:' : 'Conditions:'} </span>
                {isAr ? patient.chronicConditionsAr.join('، ') : patient.chronicConditionsEn.join(', ')}
              </div>

              {/* Active Signals Alert if any */}
              {unreviewedSignals.length > 0 && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-sm font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{unreviewedSignals.length} {isAr ? 'إشارات سريرية نشطة تتطلب مراجعة' : 'active signals require review'}</span>
                </div>
              )}

              {/* Risk Drivers */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'مسببات الخطر:' : 'Risk Drivers:'}</span>
                <ul className="space-y-0.5">
                  {(isAr ? patient.riskDriversAr : patient.riskDriversEn).map((driver, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Adherence & Medications */}
              <div className="bg-slate-50/80 p-2.5 rounded-sm border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {patient.medications.length} {isAr ? 'أدوية نشطة' : 'active meds'}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm border ${
                      adhPct < 60
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : adhPct < 80
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {adhPct}% {isAr ? 'نسبة الالتزام' : 'Adherence'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all`}
                    style={{ width: `${Math.min(adhPct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{patient.engagement.confirmedDosesLast7Days} / {patient.engagement.scheduledDosesLast7Days} {isAr ? 'جرعة مؤكدة' : 'doses'}</span>
                  <span>{isAr ? patient.careJourney.hospitalNameAr : patient.careJourney.hospitalNameEn}</span>
                </div>
              </div>

              {/* Action Buttons for Mobile */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  id={`mob-btn-export-passport-${patient.id}`}
                  onClick={() => setPassportModalPatient(patient)}
                  className="px-2 py-2 min-h-[40px] rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200 flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  title={isAr ? 'الجواز الصحي' : 'Passport'}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{isAr ? 'الجواز' : 'Passport'}</span>
                </button>

                <button
                  id={`mob-btn-open-passport-${patient.id}`}
                  onClick={() => onSelectPatient(patient)}
                  className="px-2 py-2 min-h-[40px] rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  title={isAr ? 'الملف الدوائي' : 'Medications'}
                >
                  <Pill className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="truncate">{isAr ? 'الأدوية' : 'Meds'}</span>
                </button>

                <button
                  id={`mob-btn-intervene-${patient.id}`}
                  onClick={() => onOpenIntervention(patient)}
                  className="px-2 py-2 min-h-[40px] rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  title={isAr ? 'تدخل سريري' : 'Intervene'}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="truncate">{isAr ? 'تدخل' : 'Action'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            {isAr ? 'لا توجد نتائج تطابق معايير البحث والفرز' : 'No patients found matching the criteria'}
          </div>
        )}
      </div>

      {/* 💻 DESKTOP & TABLET TABLE CONTENT (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-bold text-[11px]">
            <tr>
              <th className="px-5 py-3.5 text-start">{isAr ? 'المريض' : 'Patient'}</th>
              <th className="px-5 py-3.5 text-start">{isAr ? 'التصنيف والمخاطر' : 'Risk & Score'}</th>
              <th className="px-5 py-3.5 text-start">{isAr ? 'أهم مسببات الخطر' : 'Primary Risk Drivers'}</th>
              <th className="px-5 py-3.5 text-start">{isAr ? 'الأدوية ومعدل الالتزام' : 'Medications & Adherence'}</th>
              <th className="px-5 py-3.5 text-start">{isAr ? 'رحلة الرعاية' : 'Care Journey'}</th>
              <th className="px-5 py-3.5 text-end">{isAr ? 'الإجراء السريري' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => {
              const unreviewedSignals = patient.safetySignals.filter(
                (s) => s.resolutionStatus === 'unreviewed'
              );

              return (
                <tr
                  key={patient.id}
                  id={`patient-row-${patient.id}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Patient identity */}
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {isAr ? patient.nameAr : patient.nameEn}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono">{patient.mrn}</span>
                      <span>•</span>
                      <span>{patient.age} {isAr ? 'سنة' : 'yrs'}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">
                        {isAr ? patient.healthCluster : patient.healthClusterEn}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {isAr ? patient.chronicConditionsAr.join('، ') : patient.chronicConditionsEn.join(', ')}
                    </div>
                  </td>

                  {/* Risk Tier & Score */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getRiskBadge(patient.riskLevel, patient.riskScore)}
                    {unreviewedSignals.length > 0 && (
                      <div className="text-[10px] text-rose-600 mt-1.5 font-bold flex items-center gap-1 uppercase tracking-tight">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{unreviewedSignals.length} {isAr ? 'إشارات نشطة' : 'active signals'}</span>
                      </div>
                    )}
                  </td>

                  {/* Risk Drivers */}
                  <td className="px-5 py-4 max-w-xs">
                    <ul className="space-y-1">
                      {(isAr ? patient.riskDriversAr : patient.riskDriversEn).map((driver, idx) => (
                        <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Medications Count & Adherence */}
                  <td className="px-5 py-4 whitespace-nowrap min-w-[170px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800">
                        {patient.medications.length} {isAr ? 'أدوية نشطة' : 'active meds'}
                      </span>
                      {(() => {
                        const adhPct = Math.round(
                          (patient.engagement.confirmedDosesLast7Days /
                            (patient.engagement.scheduledDosesLast7Days || 1)) *
                            100
                        );
                        const isCritical = adhPct < 60;
                        const isSuboptimal = adhPct >= 60 && adhPct < 80;

                        return (
                          <span
                            className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-sm border ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isSuboptimal
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {adhPct}% {isAr ? 'التزام' : 'adh'}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Mini Visual Adherence Progress Bar */}
                    {(() => {
                      const adhPct = Math.round(
                        (patient.engagement.confirmedDosesLast7Days /
                          (patient.engagement.scheduledDosesLast7Days || 1)) *
                          100
                      );
                      const barColor = adhPct < 60 ? 'bg-rose-500' : adhPct < 80 ? 'bg-amber-500' : 'bg-emerald-500';

                      return (
                        <div className="mt-1.5">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all`}
                              style={{ width: `${Math.min(adhPct, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>{patient.engagement.confirmedDosesLast7Days} / {patient.engagement.scheduledDosesLast7Days} {isAr ? 'جرعة' : 'doses'}</span>
                            <span className={adhPct < 60 ? 'text-rose-600 font-semibold' : adhPct < 80 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                              {adhPct < 60 ? (isAr ? 'خطر انتكاس' : 'Critical') : adhPct < 80 ? (isAr ? 'متوسط' : 'Moderate') : (isAr ? 'ممتاز' : 'Optimal')}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {patient.doseSchedule && patient.doseSchedule.some(d => d.status === 'pending') && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-200 w-fit">
                        <Clock className="w-2.5 h-2.5" />
                        <span>
                          {patient.doseSchedule.filter(d => d.status === 'pending').length} {isAr ? 'جرعة بالانتظار' : 'pending'}
                        </span>
                      </div>
                    )}
                    {patient.smartAlerts && patient.smartAlerts.some(a => !a.acknowledged) && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded-sm border border-rose-200 w-fit">
                        <Bell className="w-2.5 h-2.5" />
                        <span>
                          {patient.smartAlerts.filter(a => !a.acknowledged).length} {isAr ? 'تنبيه سريري' : 'alert'}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Care Journey & Discharge */}
                  <td className="px-5 py-4">
                    <div className="text-[11px] font-bold text-slate-800">
                      {isAr ? patient.careJourney.hospitalNameAr : patient.careJourney.hospitalNameEn}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isAr ? 'خروج:' : 'Discharge:'} {patient.careJourney.dischargeDate}
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium">
                      {isAr ? patient.careJourney.primaryDiagnosisAr : patient.careJourney.primaryDiagnosisEn}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-end whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Quick Health Passport Export Button */}
                      <button
                        id={`btn-export-passport-${patient.id}`}
                        onClick={() => setPassportModalPatient(patient)}
                        className="px-2.5 py-1.5 rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1 shadow-2xs cursor-pointer"
                        title={isAr ? 'تصدير وثيقة الجواز الصحي وطباعتها' : 'Export & Print Health Passport'}
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isAr ? 'الجواز الصحي' : 'Passport'}</span>
                      </button>

                      {/* Quick Patient View Button */}
                      {onOpenPatientPortal && (
                        <button
                          id={`btn-patient-portal-${patient.id}`}
                          onClick={() => onOpenPatientPortal(patient)}
                          className="px-2.5 py-1.5 rounded-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200 flex items-center gap-1 shadow-2xs cursor-pointer"
                          title={isAr ? 'فتح واجهة المريض لتسجيل الجرعة بضغطة واحدة' : 'Open Patient View: One-click dose log'}
                        >
                          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isAr ? 'واجهة المريض' : 'Patient View'}</span>
                        </button>
                      )}

                      <button
                        id={`btn-open-passport-${patient.id}`}
                        onClick={() => onSelectPatient(patient)}
                        className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>{isAr ? 'الملف الدوائي' : 'Medications'}</span>
                      </button>

                      <button
                        id={`btn-intervene-${patient.id}`}
                        onClick={() => onOpenIntervention(patient)}
                        className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تدخل سريري' : 'Intervene'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  {isAr ? 'لا توجد نتائج تطابق معايير البحث والفرز' : 'No patients found matching the criteria'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSectionContent = (sectionId: DashboardSectionId) => {
    switch (sectionId) {
      case 'north_star_hero':
        return renderNorthStarHero();
      case 'kpi_grid':
        return renderKpiGrid();
      case 'risk_alerts':
        return renderRiskAlerts();
      case 'analytics_charts':
        return renderDashboardCharts();
      case 'patient_triage_table':
        return renderPatientTriageTable();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification for Layout Persistence */}
      {toastMessage && (
        <div
          id="dashboard-layout-toast"
          className="fixed bottom-6 end-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-sm shadow-xl border border-slate-700 flex items-center gap-2 animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clinician Layout Customization Toolbar & Presets (Drag & Drop) */}
      <DashboardLayoutToolbar
        sectionOrder={sectionOrder}
        lang={lang}
        isCustomOrder={isCustomOrder}
        onReorder={(newOrder) => {
          saveOrder(
            newOrder,
            isAr
              ? 'تم تحديث ترتيب الأقسام وحفظه في الذاكرة المحلية'
              : 'Dashboard section order updated and saved locally'
          );
        }}
        onApplyPreset={handleApplyPreset}
        onReset={handleResetOrder}
      />

      {/* Embedded Sehhaty vs AafiyaCare Comparison Component */}
      <div id="dashboard-sehhaty-comparison-section" className="transition-all">
        <SehhatyComparisonCard lang={lang} />
      </div>

      {/* Dynamically Rendered Sections by Priority Order */}
      <div className="space-y-6">
        {sectionOrder.map((sectionId, index) => {
          const isDragging = draggedSectionId === sectionId;
          const isOver = dragOverSectionId === sectionId;

          return (
            <div
              key={sectionId}
              id={`dashboard-section-${sectionId}`}
              onDragOver={(e) => handleSectionDragOver(e, sectionId)}
              onDragLeave={(e) => handleSectionDragLeave(e, sectionId)}
              onDrop={(e) => handleSectionDrop(e, sectionId)}
              className={`transition-all duration-150 rounded-sm relative ${
                isDragging
                  ? 'opacity-40 border-2 border-dashed border-blue-400 bg-blue-50/20'
                  : isOver
                  ? 'ring-2 ring-blue-500 shadow-md'
                  : ''
              }`}
            >
              {/* Drop target indicator guideline */}
              {isOver && !isDragging && (
                <div className="absolute -top-3 left-0 right-0 h-1 bg-blue-500 rounded-full animate-pulse z-20 flex items-center justify-center">
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {isAr ? 'إفلات هنا للتثبيت' : 'Drop here to place'}
                  </span>
                </div>
              )}

              {/* Section Header Controls */}
              {renderSectionHeader(sectionId, index)}

              {/* Section Body */}
              <div>
                {renderSectionContent(sectionId)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Health Passport Modal */}
      {passportModalPatient && (
        <HealthPassportModal
          patient={passportModalPatient}
          isOpen={!!passportModalPatient}
          onClose={() => setPassportModalPatient(null)}
          lang={lang}
        />
      )}

      {/* Sehhaty vs AafiyaCare Comparison Modal */}
      <SehhatyComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
