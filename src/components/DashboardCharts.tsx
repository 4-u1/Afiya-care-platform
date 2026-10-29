import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Patient, Language, PlatformKPIs } from '../types';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  HeartPulse,
  UserCheck,
  Stethoscope,
  Info,
  ChevronRight,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardChartsProps {
  patients: Patient[];
  kpis: PlatformKPIs;
  lang: Language;
  onSelectPatient: (patient: Patient) => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  patients,
  kpis,
  lang,
  onSelectPatient
}) => {
  const isAr = lang === 'ar';
  const [selectedChartTab, setSelectedChartTab] = useState<'all' | 'adherence' | 'risk_signals' | 'conditions'>('all');

  // 1. Calculate Risk Levels Distribution for Pie/Donut Chart
  const riskCounts = {
    high: patients.filter(p => p.riskLevel === 'high').length,
    rising: patients.filter(p => p.riskLevel === 'rising').length,
    monitor: patients.filter(p => p.riskLevel === 'monitor').length,
    low: patients.filter(p => p.riskLevel === 'low').length,
  };

  const riskPieData = [
    { name: isAr ? 'أولوية قصوى (High Risk)' : 'High Risk', value: riskCounts.high, color: '#E11D48' },
    { name: isAr ? 'خطر متصاعد (Rising Risk)' : 'Rising Risk', value: riskCounts.rising, color: '#F59E0B' },
    { name: isAr ? 'قيد المراقبة (Monitor)' : 'Monitor', value: riskCounts.monitor, color: '#3B82F6' },
    { name: isAr ? 'منخفض الخطورة (Low Risk)' : 'Low Risk', value: riskCounts.low, color: '#10B981' },
  ].filter(d => d.value > 0);

  // 2. Calculate Patient Adherence Data for Doctor's Adherence Chart
  const patientAdherenceData = patients.map((patient) => {
    const avgAdherence = patient.medications.length > 0
      ? Math.round(patient.medications.reduce((sum, m) => sum + m.adherenceRate, 0) / patient.medications.length)
      : 0;

    let adherenceCategory = 'optimal';
    let barColor = '#10B981'; // Emerald >= 80%
    if (avgAdherence < 60) {
      adherenceCategory = 'critical';
      barColor = '#E11D48'; // Rose < 60%
    } else if (avgAdherence < 80) {
      adherenceCategory = 'suboptimal';
      barColor = '#F59E0B'; // Amber 60-79%
    }

    const shortName = isAr
      ? patient.nameAr.split(' ').slice(0, 2).join(' ')
      : patient.nameEn.split(' ').slice(0, 2).join(' ');

    return {
      id: patient.id,
      patientObj: patient,
      name: shortName,
      fullName: isAr ? patient.nameAr : patient.nameEn,
      mrn: patient.mrn,
      adherence: avgAdherence,
      barColor,
      category: adherenceCategory,
      riskScore: patient.riskScore,
      riskLevel: patient.riskLevel,
      confirmedDoses: patient.engagement?.confirmedDosesLast7Days || 0,
      scheduledDoses: patient.engagement?.scheduledDosesLast7Days || 0,
    };
  });

  // Sort by adherence ascending so doctor immediately sees lowest-adhering patients first!
  const sortedAdherenceData = [...patientAdherenceData].sort((a, b) => a.adherence - b.adherence);

  // 3. Calculate Active Chronic Conditions Distribution
  const conditionsMap: Record<string, number> = {};
  patients.forEach(p => {
    const list = isAr ? p.chronicConditionsAr : p.chronicConditionsEn;
    list.forEach(c => {
      conditionsMap[c] = (conditionsMap[c] || 0) + 1;
    });
  });

  const conditionsBarData = Object.entries(conditionsMap)
    .map(([condition, count]) => ({
      condition,
      count,
      percentage: Math.round((count / patients.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // 4. Detected Safety Signals Breakdown
  const signalTypeCounts: Record<string, { labelAr: string; labelEn: string; count: number; color: string }> = {
    drug_interaction: { labelAr: 'تداخلات دوائية (DDI)', labelEn: 'Drug Interactions', count: 0, color: '#E11D48' },
    duplicate_therapy: { labelAr: 'ازدواجية علاجية', labelEn: 'Duplicate Therapy', count: 0, color: '#F59E0B' },
    refill_lapse: { labelAr: 'انقطاع أو نفاد الجرعات', labelEn: 'Refill Lapse', count: 0, color: '#3B82F6' },
    contraindication: { labelAr: 'موانع استخدام سريرية', labelEn: 'Contraindications', count: 0, color: '#8B5CF6' },
    dosage_anomaly: { labelAr: 'خلل تركيز / وظائف كلى', labelEn: 'Dosage Anomalies', count: 0, color: '#EC4899' },
  };

  patients.forEach(p => {
    p.safetySignals.forEach(s => {
      if (signalTypeCounts[s.type]) {
        signalTypeCounts[s.type].count += 1;
      }
    });
  });

  const signalsBarData = Object.values(signalTypeCounts)
    .map(s => ({
      name: isAr ? s.labelAr : s.labelEn,
      count: s.count,
      color: s.color
    }))
    .filter(s => s.count > 0);

  // Summary adherence metrics for doctor:
  const criticalAdherenceCount = patientAdherenceData.filter(p => p.adherence < 60).length;
  const suboptimalAdherenceCount = patientAdherenceData.filter(p => p.adherence >= 60 && p.adherence < 80).length;
  const optimalAdherenceCount = patientAdherenceData.filter(p => p.adherence >= 80).length;

  return (
    <div id="dashboard-clinical-charts-section" className="space-y-6">
      {/* Section Header with Tabs */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-none" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{isAr ? 'التحليلات البيانية السريرية ومؤشرات التزام المرضى' : 'Clinical Visual Analytics & Patient Adherence Intelligence'}</span>
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              Recharts Visual Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'رؤية بيانية فورية لتوزيع المخاطر السريرية، انتشار الأمراض المزمنة، ونسب التزام المرضى بالأدوية لمساعدة الطبيب في التدخل الاستباقي'
              : 'Real-time charts of cohort risk stratification, chronic condition prevalence, and clinician patient-level adherence monitoring'}
          </p>
        </div>

        {/* Filter View Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto self-start sm:self-auto">
          {[
            { id: 'all', labelAr: 'الكل (شامل)', labelEn: 'All Views' },
            { id: 'adherence', labelAr: 'التزام المرضى', labelEn: 'Adherence' },
            { id: 'risk_signals', labelAr: 'المخاطر والإشارات', labelEn: 'Risks & Signals' },
            { id: 'conditions', labelAr: 'الأمراض المزمنة', labelEn: 'Conditions' }
          ].map(tab => (
            <button
              key={tab.id}
              id={`chart-tab-${tab.id}`}
              onClick={() => setSelectedChartTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedChartTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor's Adherence Quick Triage Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border-l-4 border-rose-600 border border-slate-200 p-3.5 rounded-sm flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAr ? 'مرضى بحاجة لتدخل عاجل (< 60% التزام)' : 'Urgent Intervention (<60% Adherence)'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-rose-700">{criticalAdherenceCount}</span>
              <span className="text-xs text-rose-800 font-semibold">{isAr ? 'مرضى في خطر الانتكاس' : 'Patients at risk'}</span>
            </div>
          </div>
          <div className="p-2 rounded-sm bg-rose-50 text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border-l-4 border-amber-500 border border-slate-200 p-3.5 rounded-sm flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAr ? 'التزام متوسط يحتاج متابعة (60-79%)' : 'Suboptimal Adherence (60-79%)'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-700">{suboptimalAdherenceCount}</span>
              <span className="text-xs text-amber-800 font-semibold">{isAr ? 'يحتاجون تثقيف دوائي' : 'Need counseling'}</span>
            </div>
          </div>
          <div className="p-2 rounded-sm bg-amber-50 text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border-l-4 border-emerald-600 border border-slate-200 p-3.5 rounded-sm flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAr ? 'التزام سريري مثالي (≥ 80%)' : 'Optimal Adherence (≥80%)'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-700">{optimalAdherenceCount}</span>
              <span className="text-xs text-emerald-800 font-semibold">{isAr ? 'حماية مستقرة من التنويم' : 'Readmission-safe'}</span>
            </div>
          </div>
          <div className="p-2 rounded-sm bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* CHART 1: Doctor's Patient Adherence Monitor (Full or Half Width) */}
        {/* ========================================================================= */}
        {(selectedChartTab === 'all' || selectedChartTab === 'adherence') && (
          <div className={`bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex flex-col justify-between ${
            selectedChartTab === 'adherence' ? 'lg:col-span-12' : 'lg:col-span-8'
          }`}>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'مؤشر نسبة التزام المرضى بالأدوية (خاص بالطبيب)' : 'Clinician Patient Adherence Benchmark'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isAr
                      ? 'مقارنة نسبة الالتزام لكل مريض بالحد السريري الأدنى الآمن (٨٠٪) مع إمكانية الضغط على اسم المريض لفتح ملفه فوراً'
                      : 'Individual patient adherence mapped against the 80% clinical safety threshold. Click any bar to view patient.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                    <span>{isAr ? 'مثالي (≥80%)' : '≥80%'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                    <span>{isAr ? 'متوسط (60-79%)' : '60-79%'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                    <span>{isAr ? 'حرج (<60%)' : '<60%'}</span>
                  </div>
                </div>
              </div>

              {/* Recharts BarChart */}
              <div className="w-full h-72 sm:h-80" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedAdherenceData}
                    margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        const pt = e.activePayload[0].payload.patientObj;
                        if (pt) onSelectPatient(pt);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      angle={-18}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-sm text-xs shadow-xl border border-slate-700 min-w-[200px]" dir={isAr ? 'rtl' : 'ltr'}>
                              <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-1.5">
                                <span className="font-bold text-white text-sm">{data.fullName}</span>
                                <span className="text-[10px] font-mono text-slate-400">{data.mrn}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">{isAr ? 'نسبة الالتزام:' : 'Adherence:'}</span>
                                  <span className="font-bold text-base font-mono" style={{ color: data.barColor }}>
                                    {data.adherence}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">{isAr ? 'مؤشر الخطر:' : 'Risk Score:'}</span>
                                  <span className="font-mono text-slate-200">{data.riskScore} / 100</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">{isAr ? 'الجرعات المؤكدة (٧ أيام):' : 'Confirmed Doses:'}</span>
                                  <span className="font-mono text-emerald-400">{data.confirmedDoses} / {data.scheduledDoses}</span>
                                </div>
                              </div>
                              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-blue-300 flex items-center justify-between">
                                <span>{isAr ? 'اضغط لفتح الملف الدوائي' : 'Click to inspect passport'}</span>
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Clinical 80% Safety Benchmark Line */}
                    <ReferenceLine
                      y={80}
                      stroke="#2563EB"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: isAr ? 'الحد السريري الآمن (80%)' : 'Safety Benchmark (80%)',
                        fill: '#2563EB',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    <Bar
                      dataKey="adherence"
                      radius={[3, 3, 0, 0]}
                      cursor="pointer"
                    >
                      {sortedAdherenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.barColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'تحديث حي من تطبيق المريض والصيدليات المشاركة' : 'Synchronized with patient logbooks and cluster e-prescriptions'}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Avg: {kpis.averageAdherenceRate}%
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 2: Risk Stratification Donut Chart */}
        {/* ========================================================================= */}
        {(selectedChartTab === 'all' || selectedChartTab === 'risk_signals') && (
          <div className={`bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex flex-col justify-between ${
            selectedChartTab === 'risk_signals' ? 'lg:col-span-6' : 'lg:col-span-4'
          }`}>
            <div>
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-rose-600" />
                  <span>{isAr ? 'توزيع مستويات الخطر السريري' : 'Clinical Risk Stratification'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? 'تصنيف الفوج الحالي حسب مقياس LACE+ و RAM' : 'Cohort distribution by validated LACE+ & RAM algorithms'}
                </p>
              </div>

              {/* Recharts PieChart */}
              <div className="w-full h-56 flex items-center justify-center" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-sm text-xs shadow-lg border border-slate-700" dir={isAr ? 'rtl' : 'ltr'}>
                              <div className="font-bold text-white mb-1">{data.name}</div>
                              <div className="flex items-center justify-between gap-3 text-slate-300">
                                <span>{isAr ? 'عدد الحالات:' : 'Patient Count:'}</span>
                                <span className="font-mono font-bold text-white">{data.value} {isAr ? 'مرضى' : 'patients'}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {Math.round(((data.value as number) / patients.length) * 100)}% {isAr ? 'من إجمالي الفوج' : 'of monitored cohort'}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="space-y-1.5 mt-2">
                {riskPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700 px-2 py-1 rounded-xs bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{isAr ? 'إجمالي المرضى المشمولين:' : 'Total Active Patients:'}</span>
              <span className="font-bold font-mono text-slate-800">{patients.length}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 3: Detected Clinical Safety Signals */}
        {/* ========================================================================= */}
        {(selectedChartTab === 'all' || selectedChartTab === 'risk_signals') && (
          <div className={`bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex flex-col justify-between ${
            selectedChartTab === 'risk_signals' ? 'lg:col-span-6' : 'lg:col-span-6'
          }`}>
            <div>
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>{isAr ? 'المخاطر السريرية وإشارات الأمان المكتشفة' : 'Detected Clinical Safety Risks & Signals'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? 'تصنيف إشارات الأمان المحللة بواسطة محرك المخاطر المغلق' : 'Stratification of active signals intercepted by the clinical safety engine'}
                </p>
              </div>

              {/* Horizontal BarChart */}
              <div className="w-full h-64" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={signalsBarData}
                    margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#64748B"
                      fontSize={11}
                      width={130}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-sm text-xs shadow-lg border border-slate-700" dir={isAr ? 'rtl' : 'ltr'}>
                              <div className="font-bold text-white">{data.name}</div>
                              <div className="text-amber-400 font-mono mt-1 font-bold">
                                {data.count} {isAr ? 'إشارات نشطة' : 'active signals'}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 3, 3, 0]}
                    >
                      {signalsBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{isAr ? 'مجموع الإشارات النشطة المكتشفة:' : 'Total Active Safety Signals:'}</span>
              <span className="font-mono font-bold text-rose-600">{kpis.activeSafetyAlerts}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHART 4: Active Chronic Conditions Prevalence */}
        {/* ========================================================================= */}
        {(selectedChartTab === 'all' || selectedChartTab === 'conditions') && (
          <div className={`bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex flex-col justify-between ${
            selectedChartTab === 'conditions' ? 'lg:col-span-12' : 'lg:col-span-6'
          }`}>
            <div>
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-indigo-600" />
                  <span>{isAr ? 'توزيع الحالات الصحية المزمنة النشطة' : 'Prevalence of Active Chronic Conditions'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? 'نسبة انتشار الأمراض المزمنة في الفوج الخاضع للرعاية الممتدة' : 'Prevalence and multi-morbidity burden across the monitored cohort'}
                </p>
              </div>

              {/* Recharts BarChart */}
              <div className="w-full h-64" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conditionsBarData}
                    margin={{ top: 15, right: 15, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="condition"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-sm text-xs shadow-lg border border-slate-700" dir={isAr ? 'rtl' : 'ltr'}>
                              <div className="font-bold text-white">{data.condition}</div>
                              <div className="flex items-center justify-between gap-3 text-slate-300 mt-1">
                                <span>{isAr ? 'عدد الحالات:' : 'Patient Cases:'}</span>
                                <span className="font-mono font-bold text-white">{data.count}</span>
                              </div>
                              <div className="text-[10px] text-indigo-300 mt-0.5">
                                {data.percentage}% {isAr ? 'من إجمالي الفوج' : 'of patient cohort'}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#4F46E5"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{isAr ? 'أعلى الحالات انتشاراً:' : 'Most Prevalent Diagnosis:'}</span>
              <span className="font-bold text-slate-800">
                {conditionsBarData[0]?.condition || (isAr ? 'فشل القلب والاحتقان' : 'Congestive Heart Failure')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
