import React from 'react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import {
  Building2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Award,
  Milestone,
  CheckCircle,
  CheckCircle2,
  BarChart3,
  Layers,
  Sparkles,
  Users,
  Target,
  MapPin,
  Activity
} from 'lucide-react';
import { PlatformKPIs, Language } from '../types';

interface EnterpriseMetricsViewProps {
  kpis: PlatformKPIs;
  lang: Language;
}

export const EnterpriseMetricsView: React.FC<EnterpriseMetricsViewProps> = ({ kpis, lang }) => {
  const isAr = lang === 'ar';

  return (
    <div className="space-y-8">
      {/* Header Banner - Geometric Balance White Panel */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AafiyaCareLogo 
            id="enterprise-header-badge"
            variant="badge" 
            size="sm" 
            isAr={isAr} 
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAr ? 'لوحة تحكم التجمعات الصحية وشركات التأمين' : 'Health Cluster & Enterprise Intelligence'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
              {isAr
                ? 'قياس الأثر الصحي، تقليص الهدر الدوائي، ومؤشرات الجدوى الاقتصادية للنموذج التجريبي'
                : 'Health impact quantification, cost avoidance analytics, and B2B SaaS economics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-wider font-mono">
            B2B SaaS • Cluster Ready
          </span>
        </div>
      </div>

      {/* 4 Stakeholder Value Propositions (Slide 11) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <div className="w-2 h-2 bg-blue-600 rounded-none" />
          <span>{isAr ? 'القيمة المقترحة لكل طرف معني (Value Proposition)' : 'Multi-Stakeholder Value Proposition'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-6 h-6 rounded-none bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {isAr ? 'المريض وأسرته' : 'Patient & Family'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'رعاية استباقية، ملف دوائي موحد ودقيق، ومتابعة مستمرة بعد الخروج تغلق نقطة العمى.'
                : 'Proactive safety net, unified digital medication passport, continuous post-discharge monitoring.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-6 h-6 rounded-none bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {isAr ? 'الصيدلي وفريق الرعاية' : 'Pharmacist & Care Team'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'توجيه الجهد والوقت للمرضى ذوي الأولوية القصوى بدلاً من المتابعة العشوائية أو إرهاق التنبيهات.'
                : 'Prioritize high-risk cohorts with actionable triage instead of random follow-up or alert fatigue.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-6 h-6 rounded-none bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {isAr ? 'المستشفى / التجمع الصحي' : 'Hospital / Health Cluster'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'إدارة المخاطر بعد الخروج، تقليص نسب إعادة التنويم خلال ٣٠ يوماً، وتخفيف الضغط على الطوارئ.'
                : 'Manage post-discharge risks, curtail 30-day preventable readmissions, ease ER overload.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-6 h-6 rounded-none bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {isAr ? 'شركات التأمين والإدارة المالية' : 'Payers & Financial Mgmt'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'الحد المباشر من الهدر الدوائي والصرف المزدوج، وتقليص تكاليف علاج المضاعفات الحرجة.'
                : 'Eradicate duplicate dispensing, minimize drug surplus waste, and slash ICU complication costs.'}
            </p>
          </div>
        </div>
      </div>

      {/* Pilot KPIs & Evaluation Metrics (Slide 17) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isAr ? 'مؤشرات نجاح التجربة التشغيلية (Pilot KPIs)' : 'Operational Pilot Success Benchmarks'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
              {isAr ? 'المعايير المعتمدة لتقييم كفاءة المنصة مع الجهة الصحية' : 'Key Performance Indicators agreed in Health Cluster Pilot'}
            </p>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider font-mono">
            Target Met: 94.2%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'نسبة قبول التدخلات السريرية' : 'Clinician Acceptance Rate'}</div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">94.2%</div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">
              {isAr ? 'من أصل 150 تدخل تم اقتراحه عبر AI' : '142 of 150 proposed interventions accepted'}
            </div>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'متوسط زمن التدخل بعد التقاط الإشارة' : 'Time-to-Intervene'}</div>
            <div className="text-2xl font-bold font-mono text-blue-600 mt-2">42 {isAr ? 'دقيقة' : 'min'}</div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">
              {isAr ? 'مقارنة بـ 4 أيام في النظام المعتاد' : 'Down from 4.2 days in standard care'}
            </div>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'تجنب تكاليف الطوارئ والمضاعفات' : 'Direct Cost Avoidance'}</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {kpis.estimatedMedicationWasteSavedSAR.toLocaleString()} SAR
            </div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">
              {isAr ? 'عبر منع 28 حالة نزيف وتسمم دوائي' : 'Prevented 28 acute ER bleed/toxicity events'}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Health Clusters Pilot & Scaling Network */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'شبكة التجمعات الصحية المنضمة لمنظومة عافية كير' : 'Connected Health Clusters Network'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
              {isAr
                ? 'تكامل البيانات السريرية، ومتابعة مرضى تعدد الأدوية في المراكز والمستشفيات التابعة لكل تجمع'
                : 'Clinical data integration & polypharmacy risk monitoring across participating regional health clusters'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-wider font-mono">
              {isAr ? '٥ تجمعات صحية متكاملة' : '5 Integrated Clusters'}
            </span>
          </div>
        </div>

        {/* Health Clusters Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 🌟 1. Taif Health Cluster - Prominently Highlighted */}
          <div className="p-5 rounded-sm bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border-2 border-blue-600 shadow-xs space-y-3 relative">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-600 text-white font-bold uppercase tracking-wider font-mono">
                  {isAr ? 'منضم حديثاً • تجريبي' : 'New Pilot Onboarded'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isAr ? 'تجمع الطائف الصحي' : 'Taif Health Cluster'}</span>
                </h4>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Connected" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'مجمع الملك فيصل الطبي بالطائف • مستشفى الملك عبد العزيز التخصصي • مستشفى الأطفال'
                : 'King Faisal Medical Complex Taif • King Abdulaziz Specialist Hospital • Pediatric Hospital'}
            </p>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'المرضى المشمولون' : 'Cohort Size'}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">840 {isAr ? 'مريض' : 'pts'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'قبول التوصيات' : 'Acceptance'}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">95.8%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الوفر المحقق' : 'Cost Saved'}</span>
                <span className="font-mono font-bold text-slate-900 text-xs">96,400 SAR</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الصيدلي المنسق' : 'Lead Pharm'}</span>
                <span className="font-medium text-slate-700 text-xs truncate block" title={isAr ? 'د. سارة القرشي' : 'Dr. Sarah Al-Qurashi'}>
                  {isAr ? 'د. سارة القرشي' : 'Dr. Sarah Al-Qurashi'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-sm border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{isAr ? 'تكامل نشط مع وصفتي ونفيس والسجلات الطبية EMR' : 'Active sync: Wasfaty, NPHIES & Hospital EMR'}</span>
            </div>
          </div>

          {/* 2. Riyadh Health Cluster 2 */}
          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-bold uppercase tracking-wider font-mono">
                  {isAr ? 'تكامل كامل' : 'Full Integration'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'تجمع الرياض الصحي الثاني' : 'Riyadh Health Cluster 2'}</span>
                </h4>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Connected" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'مدينة الملك فهد الطبية • مستشفى الملك فيصل التخصصي ومراكز الرعاية الأولية'
                : 'King Fahad Medical City • King Faisal Specialist Hospital & Primary Centers'}
            </p>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'المرضى المشمولون' : 'Cohort Size'}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">1,250 {isAr ? 'مريض' : 'pts'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'قبول التوصيات' : 'Acceptance'}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">96.1%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الوفر المحقق' : 'Cost Saved'}</span>
                <span className="font-mono font-bold text-slate-900 text-xs">152,000 SAR</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الصيدلي المنسق' : 'Lead Pharm'}</span>
                <span className="font-medium text-slate-700 text-xs truncate block">
                  {isAr ? 'د. رزان الغامدي' : 'Dr. Razan Al-Ghamdi'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-sm border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? 'ربط مباشر مع منصة صحتي وسجل الخروج' : 'Direct integration with Sehhaty & Discharge'}</span>
            </div>
          </div>

          {/* 3. Riyadh Health Cluster 1 */}
          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-bold uppercase tracking-wider font-mono">
                  {isAr ? 'تكامل كامل' : 'Full Integration'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'تجمع الرياض الصحي الأول' : 'Riyadh Health Cluster 1'}</span>
                </h4>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Connected" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'مدينة الملك سعود الطبية (الشميسي) • مستشفى الإيمان العام ومراكز وسط الرياض'
                : 'King Saud Medical City • Al-Iman General Hospital & Central Centers'}
            </p>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'المرضى المشمولون' : 'Cohort Size'}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">1,120 {isAr ? 'مريض' : 'pts'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'قبول التوصيات' : 'Acceptance'}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">94.2%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الوفر المحقق' : 'Cost Saved'}</span>
                <span className="font-mono font-bold text-slate-900 text-xs">135,000 SAR</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الصيدلي المنسق' : 'Lead Pharm'}</span>
                <span className="font-medium text-slate-700 text-xs truncate block">
                  {isAr ? 'د. فيصل العليان' : 'Dr. Faisal Al-Olayan'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-sm border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? 'تنسيق صيدلاني استباقي لمنع الازدواجية' : 'Proactive duplicate deprescribing protocol'}</span>
            </div>
          </div>

          {/* 4. Makkah Health Cluster */}
          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-bold uppercase tracking-wider font-mono">
                  {isAr ? 'تكامل كامل' : 'Full Integration'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'تجمع مكة المكرمة الصحي' : 'Makkah Health Cluster'}</span>
                </h4>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Connected" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'مدينة الملك عبد الله الطبية بمكة • مستشفى النور التخصصي ومستشفى حراء'
                : 'King Abdullah Medical City Makkah • Al Noor Specialist Hospital'}
            </p>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'المرضى المشمولون' : 'Cohort Size'}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">910 {isAr ? 'مريض' : 'pts'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'قبول التوصيات' : 'Acceptance'}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">93.8%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الوفر المحقق' : 'Cost Saved'}</span>
                <span className="font-mono font-bold text-slate-900 text-xs">102,800 SAR</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'التخصص المستهدف' : 'Target Care'}</span>
                <span className="font-medium text-slate-700 text-xs truncate block">
                  {isAr ? 'أمراض القلب والأورام' : 'Cardiology & Oncology'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-sm border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? 'بروتوكول متابعة مرضى الأمراض المزمنة المعقدة' : 'Complex chronic disease pathway active'}</span>
            </div>
          </div>

          {/* 5. Asir Health Cluster */}
          <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-bold uppercase tracking-wider font-mono">
                  {isAr ? 'تكامل كامل' : 'Full Integration'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'تجمع عسير الصحي' : 'Asir Health Cluster'}</span>
                </h4>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Connected" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? 'مستشفى عسير المركزي • مستشفى خميس مشيط العام ومراكز الرعاية الطرفية'
                : 'Asir Central Hospital • Khamis Mushayt General Hospital & Rural Centers'}
            </p>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'المرضى المشمولون' : 'Cohort Size'}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">760 {isAr ? 'مريض' : 'pts'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'قبول التوصيات' : 'Acceptance'}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">92.5%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الوفر المحقق' : 'Cost Saved'}</span>
                <span className="font-mono font-bold text-slate-900 text-xs">84,200 SAR</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isAr ? 'الهدف السريري' : 'Clinical Aim'}</span>
                <span className="font-medium text-slate-700 text-xs truncate block">
                  {isAr ? 'سد فجوة المناطق الطرفية' : 'Closing Rural Follow-up Gaps'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-sm border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? 'توصيل العلاج للمنازل عبر الربط مع البريد الدوائي' : 'Integrated home delivery via pharma courier'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* B2B Enterprise SaaS Model (Slide 14) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {isAr ? 'نموذج الإيرادات والأعمال' : 'Business Model'}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            B2B Enterprise SaaS • {isAr ? 'شريحة الانطلاق: مرضى تعدد الأدوية وحديثو الخروج' : 'Target: Polypharmacy & Post-Discharge'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Platform Subscription</span>
            <div className="text-sm font-bold text-slate-900">{isAr ? 'الاشتراك الأساسي' : 'Base Subscription'}</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isAr ? 'رخصة سنوية للجهة الصحية للوصول للمنصة الأساسية ومحرك السلامة.' : 'Annual tier licensing for hospital clusters to access core engine.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Enterprise Modules</span>
            <div className="text-sm font-bold text-slate-900">{isAr ? 'الوحدات الإضافية' : 'Advanced Modules'}</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isAr ? 'وحدات ذكية مثل: Waste Intelligence و Population Intelligence.' : 'Specialized analytics modules for waste minimization & cohorts.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Integration Fees</span>
            <div className="text-sm font-bold text-slate-900">{isAr ? 'رسوم التكامل' : 'Interoperability Setup'}</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isAr ? 'رسوم ربط وتنفيذ مع أنظمة المستشفى (Epic, Cerner, Wasfaty).' : 'One-time onboarding & HL7/FHIR EMR integration fee.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Advanced Analytics</span>
            <div className="text-sm font-bold text-slate-900">{isAr ? 'تحليلات متقدمة' : 'Population Insights'}</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isAr ? 'تقارير وتحليلات مؤسسية مجمعة ومجهلة وفق لوائح الحوكمة.' : 'Aggregated, de-identified population health intelligence reports.'}
            </p>
          </div>
        </div>
      </div>

      {/* Go-To-Market Roadmap (Slide 15 & 16) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {isAr ? 'خارطة الطريق التنفيذية' : 'Execution Roadmap'}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            {isAr ? 'من نموذج العمل الأولي إلى التوسع الوطني' : 'From MVP & Pilot to National Scale'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-sm bg-white border-2 border-blue-600 shadow-sm relative">
            <span className="text-[9px] px-2 py-0.5 rounded-none bg-blue-600 text-white font-bold uppercase tracking-wider absolute top-3 end-3 font-mono">
              {isAr ? 'المرحلة الحالية' : 'Current'}
            </span>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">1. MVP (١ - ٣ أشهر)</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{isAr ? 'بناء وتجهيز' : 'Build & Prepare'}</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isAr
                ? 'بناء Medication Passport و AI Vision و Risk Engine وتوقيع اتفاقية MOU مع جهة صحية.'
                : 'Medication Passport, AI Vision, Risk Engine, and health partner MOU.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">2. Pilot (٤ - ٦ أشهر)</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{isAr ? 'التشغيل التجريبي' : 'Pilot Operation'}</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isAr
                ? 'قياس Baseline ثم تشغيل النظام على عينة محددة من مرضى الخروج وتقييم مؤشرات النجاح.'
                : 'Establish baseline, deploy on cohort of post-discharge patients, evaluate KPIs.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">3. Commercial (٧ - ١٢ شهر)</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{isAr ? 'الإطلاق التجاري' : 'Commercialization'}</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isAr
                ? 'تحويل Pilot لعقد مدفوع وتوسيع النظام لأقسام طبية ومستشفيات إضافية.'
                : 'Convert pilot to paid contract, expand to additional clinical departments.'}
            </p>
          </div>

          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">4. Expansion (السنة الثانية)</div>
            <div className="text-sm font-bold text-slate-900 mt-1">{isAr ? 'التوسع الاستراتيجي' : 'Scale & Payers'}</div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isAr
                ? 'تجمعات صحية كاملة، شراكات التأمين، شبكات الصيدليات، وذكاء صحة المجتمع.'
                : 'Full Health Clusters, insurance networks, community pharmacy syndicates.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
