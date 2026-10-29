import React, { useState } from 'react';
import {
  GripVertical,
  RotateCcw,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  TrendingUp,
  Activity,
  Compass,
  FileSpreadsheet,
  Zap,
  ArrowUpDown,
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Language } from '../types';

export type DashboardSectionId =
  | 'north_star_hero'
  | 'kpi_grid'
  | 'risk_alerts'
  | 'analytics_charts'
  | 'patient_triage_table';

export interface SectionMeta {
  id: DashboardSectionId;
  titleAr: string;
  titleEn: string;
  shortLabelAr: string;
  shortLabelEn: string;
  tagAr: string;
  tagEn: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export const DASHBOARD_SECTIONS_META: Record<DashboardSectionId, SectionMeta> = {
  north_star_hero: {
    id: 'north_star_hero',
    titleAr: 'مؤشر النجم الشمالي وركائز الحلقة المغلقة',
    titleEn: 'North Star Metric & Closed-Loop Flywheel',
    shortLabelAr: 'النجم الشمالي',
    shortLabelEn: 'North Star',
    tagAr: 'الحالات المحلولة والوفر',
    tagEn: 'Resolved Cases & ROI',
    icon: Compass,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  kpi_grid: {
    id: 'kpi_grid',
    titleAr: 'مؤشرات الأداء السريرية والمالية الخمسة',
    titleEn: 'Vital KPI Cards & Impact Grid',
    shortLabelAr: 'بطاقات المؤشرات (KPIs)',
    shortLabelEn: 'KPI Cards',
    tagAr: 'المخاطر والسلامة والالتزام',
    tagEn: 'Risk, Safety & Adherence',
    icon: Activity,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  risk_alerts: {
    id: 'risk_alerts',
    titleAr: 'نظام الإنذار المبكر للمخاطر الدوائية',
    titleEn: 'Early Risk Alert System & Safety Signals',
    shortLabelAr: 'تنبيهات المخاطر المبكرة',
    shortLabelEn: 'Early Risk Alerts',
    tagAr: 'الإشارات الحرجة والتفاعلات',
    tagEn: 'Critical Signals & Interactions',
    icon: AlertTriangle,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200'
  },
  analytics_charts: {
    id: 'analytics_charts',
    titleAr: 'التحليلات السريرية والرسوم البيانية التفاعلية',
    titleEn: 'Clinical Analytics & Recharts Visuals',
    shortLabelAr: 'الرسوم البيانية والتحليلات',
    shortLabelEn: 'Analytics Charts',
    tagAr: 'التوزيع ومصفوفة الخطورة',
    tagEn: 'Distributions & Matrices',
    icon: TrendingUp,
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  },
  patient_triage_table: {
    id: 'patient_triage_table',
    titleAr: 'جدول فرز المرضى حسب درجة الخطورة السريرية',
    titleEn: 'Patient Predictive Risk Triage Table',
    shortLabelAr: 'جدول فرز المرضى',
    shortLabelEn: 'Patient Triage Table',
    tagAr: 'قائمة المرضى والإجراءات السريرية',
    tagEn: 'Cohort List & Interventions',
    icon: FileSpreadsheet,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200'
  }
};

export const DEFAULT_SECTION_ORDER: DashboardSectionId[] = [
  'north_star_hero',
  'kpi_grid',
  'risk_alerts',
  'analytics_charts',
  'patient_triage_table'
];

export const PRESET_LAYOUTS = [
  {
    id: 'default',
    labelAr: 'الترتيب القياسي الموصى به',
    labelEn: 'Standard Recommended',
    descriptionAr: 'النجم الشمالي ← المؤشرات ← التنبيهات ← الرسوم ← جدول المرضى',
    descriptionEn: 'North Star → KPIs → Alerts → Charts → Patient Triage',
    order: [
      'north_star_hero',
      'kpi_grid',
      'risk_alerts',
      'analytics_charts',
      'patient_triage_table'
    ] as DashboardSectionId[]
  },
  {
    id: 'alerts_first',
    labelAr: 'أولوية الإنذار المبكر والتنبيهات',
    labelEn: 'Alerts & Safety First',
    descriptionAr: 'التنبيهات الحرجة أولاً تليها الحالات وجدول الفرز',
    descriptionEn: 'Critical alerts & triage table at the very top for emergency shifts',
    order: [
      'risk_alerts',
      'patient_triage_table',
      'kpi_grid',
      'north_star_hero',
      'analytics_charts'
    ] as DashboardSectionId[]
  },
  {
    id: 'charts_first',
    labelAr: 'أولوية التحليلات والرسوم البيانية',
    labelEn: 'Analytics & Trends First',
    descriptionAr: 'الرسوم البيانية والتحليلات العميقة في الصدارة لدعم القرار الإكلينيكي',
    descriptionEn: 'Clinical analytics & trend charts placed ahead for review rounds',
    order: [
      'analytics_charts',
      'kpi_grid',
      'patient_triage_table',
      'risk_alerts',
      'north_star_hero'
    ] as DashboardSectionId[]
  },
  {
    id: 'triage_first',
    labelAr: 'أولوية جدول فرز ومتابعة المرضى',
    labelEn: 'Patient Triage Priority',
    descriptionAr: 'قائمة المرضى السريرية والتدخل الفوري في أعلى الصفحة',
    descriptionEn: 'Direct patient cohort list on top for daily clinical rounds',
    order: [
      'patient_triage_table',
      'risk_alerts',
      'kpi_grid',
      'analytics_charts',
      'north_star_hero'
    ] as DashboardSectionId[]
  }
];

interface DashboardLayoutToolbarProps {
  sectionOrder: DashboardSectionId[];
  lang: Language;
  isCustomOrder: boolean;
  onReorder: (newOrder: DashboardSectionId[]) => void;
  onApplyPreset: (presetOrder: DashboardSectionId[]) => void;
  onReset: () => void;
}

export const DashboardLayoutToolbar: React.FC<DashboardLayoutToolbarProps> = ({
  sectionOrder,
  lang,
  isCustomOrder,
  onReorder,
  onApplyPreset,
  onReset
}) => {
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [draggedChipIndex, setDraggedChipIndex] = useState<number | null>(null);
  const [dragOverChipIndex, setDragOverChipIndex] = useState<number | null>(null);

  const handleChipDragStart = (e: React.DragEvent, index: number) => {
    setDraggedChipIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleChipDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverChipIndex !== index) {
      setDragOverChipIndex(index);
    }
  };

  const handleChipDragLeave = (e: React.DragEvent, index: number) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    if (dragOverChipIndex === index) {
      setDragOverChipIndex(null);
    }
  };

  const handleChipDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('text/plain');
    const sourceIndex = draggedChipIndex !== null ? draggedChipIndex : parseInt(rawData, 10);

    if (isNaN(sourceIndex) || sourceIndex === targetIndex || sourceIndex < 0 || sourceIndex >= sectionOrder.length) {
      setDraggedChipIndex(null);
      setDragOverChipIndex(null);
      return;
    }

    const updated = [...sectionOrder];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);

    onReorder(updated);
    setDraggedChipIndex(null);
    setDragOverChipIndex(null);
  };

  const handleMoveChip = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const updated = [...sectionOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    onReorder(updated);
  };

  return (
    <div
      id="dashboard-layout-toolbar"
      className="bg-white border border-slate-200 rounded-sm shadow-xs p-3.5 sm:p-4 text-xs transition-all"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left info & toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-7 h-7 rounded-sm bg-slate-900 text-white flex items-center justify-center shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {isAr ? 'تخصيص ترتيب مكونات اللوحة' : 'Custom Dashboard Layout'}
              </span>
              {isCustomOrder ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  {isAr ? 'ترتيب مخصص ومحفوظ' : 'Custom Order Active'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                  {isAr ? 'الترتيب الافتراضي' : 'Default Order'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAr
                ? 'يمكنك سحب وإفلات الأقسام من المقبض ⠿ لتقديم التنبيهات أو الرسوم البيانية حسب أولوياتك السريرية (يحفظ تلقائياً في المتصفح)'
                : 'Drag & drop sections via ⠿ handle to prioritize alerts, charts, or triage for your clinical workflow (auto-saved locally)'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            id="btn-toggle-layout-organizer"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1.5 rounded-sm border text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              isOpen
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>{isOpen ? (isAr ? 'إخفاء المنظم السريع' : 'Hide Organizer') : (isAr ? 'منظم الترتيب والقوالب' : 'Presets & Organizer')}</span>
          </button>

          {isCustomOrder && (
            <button
              id="btn-reset-dashboard-layout"
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-sm border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title={isAr ? 'إعادة الترتيب القياسي الافتراضي' : 'Restore standard layout'}
            >
              <RotateCcw className="w-3 h-3 text-slate-400 hover:text-rose-600" />
              <span>{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Quick Reordering Panel & Presets */}
      {isOpen && (
        <div className="mt-4 pt-3.5 border-t border-slate-200 space-y-4 animate-fadeIn">
          {/* Quick Presets row */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{isAr ? 'قوالب الترتيب السريرية الجاهزة:' : 'Clinical Layout Presets:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_LAYOUTS.map((preset) => {
                const isActive =
                  JSON.stringify(preset.order) === JSON.stringify(sectionOrder);

                return (
                  <button
                    key={preset.id}
                    id={`btn-preset-${preset.id}`}
                    onClick={() => onApplyPreset(preset.order)}
                    className={`p-2.5 rounded-sm border text-start transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400 text-blue-900 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs">
                        {isAr ? preset.labelAr : preset.labelEn}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {isAr ? preset.descriptionAr : preset.descriptionEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop Reorderable Chip Ribbon */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GripVertical className="w-3 h-3 text-slate-400" />
                <span>{isAr ? 'الترتيب الحالي للأقسام (اسحب البطاقة لتغيير مكانها):' : 'Current Section Order (Drag card to reposition):'}</span>
              </div>
              <span className="text-[10px] font-normal text-slate-400">
                {isAr ? 'الأعلى أولوية ◄ الأقل أولوية' : 'High Priority → Low Priority'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sectionOrder.map((sectionId, idx) => {
                const meta = DASHBOARD_SECTIONS_META[sectionId];
                const Icon = meta.icon;
                const isDragging = draggedChipIndex === idx;
                const isOver = dragOverChipIndex === idx;

                return (
                  <div
                    key={sectionId}
                    id={`reorder-chip-${sectionId}`}
                    draggable
                    onDragStart={(e) => handleChipDragStart(e, idx)}
                    onDragOver={(e) => handleChipDragOver(e, idx)}
                    onDragLeave={(e) => handleChipDragLeave(e, idx)}
                    onDrop={(e) => handleChipDrop(e, idx)}
                    onDragEnd={() => {
                      setDraggedChipIndex(null);
                      setDragOverChipIndex(null);
                    }}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-sm border transition-all select-none cursor-grab active:cursor-grabbing ${
                      isDragging
                        ? 'opacity-40 border-blue-400 dashed bg-blue-50/40'
                        : isOver
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      #{idx + 1}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-600" />
                    <span className="font-bold text-xs text-slate-800 whitespace-nowrap">
                      {isAr ? meta.shortLabelAr : meta.shortLabelEn}
                    </span>

                    {/* Step Up / Step Down quick nudge buttons with unique IDs */}
                    <div className="flex items-center gap-0.5 ms-1 border-s border-slate-200 ps-1">
                      <button
                        type="button"
                        id={`btn-chip-move-prev-${sectionId}`}
                        disabled={idx === 0}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChip(idx, 'prev');
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title={isAr ? 'تقديم الأولوية للأعلى (#1)' : 'Increase priority'}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        id={`btn-chip-move-next-${sectionId}`}
                        disabled={idx === sectionOrder.length - 1}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveChip(idx, 'next');
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title={isAr ? 'تأخير الأولوية للأسفل' : 'Lower priority'}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
