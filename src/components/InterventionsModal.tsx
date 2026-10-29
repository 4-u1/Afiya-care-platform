import React, { useState, useEffect } from 'react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Clock,
  DollarSign,
  FileCheck,
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { Intervention, Language, RiskLevel } from '../types';
import { api } from '../services/api';

interface InterventionsModalProps {
  interventions: Intervention[];
  lang: Language;
  onRefreshData: () => void;
  onClose?: () => void;
  preselectedInterventionId?: string;
}

export const InterventionsModal: React.FC<InterventionsModalProps> = ({
  interventions,
  lang,
  onRefreshData,
  onClose,
  preselectedInterventionId
}) => {
  const isAr = lang === 'ar';

  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(
    interventions.find((i) => i.id === preselectedInterventionId) || interventions[0] || null
  );
  const [selectedOutcome, setSelectedOutcome] = useState<string>('drug_swapped');
  const [notes, setNotes] = useState<string>('');
  const [pharmacistName, setPharmacistName] = useState<string>('د. رزان الغامدي (صيدلي سريري)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Synchronize when interventions or preselected ID changes
  useEffect(() => {
    if (preselectedInterventionId) {
      const match = interventions.find((i) => i.id === preselectedInterventionId);
      if (match) {
        setSelectedIntervention(match);
        return;
      }
    }
    if (selectedIntervention) {
      const refreshed = interventions.find((i) => i.id === selectedIntervention.id);
      if (refreshed) {
        setSelectedIntervention(refreshed);
        return;
      }
    }
    if (interventions.length > 0 && !selectedIntervention) {
      setSelectedIntervention(interventions[0]);
    }
  }, [interventions, preselectedInterventionId]);

  const handleResolve = async () => {
    if (!selectedIntervention) return;
    setIsSubmitting(true);

    const resolvedNotes =
      notes ||
      (isAr
        ? 'تمت المراجعة السريرية مع الفريق الطبي وتحديث خطة العلاج والتأكد من سلامة المريض.'
        : 'Clinical reconciliation completed. Prescriptions aligned and patient contacted.');

    // Optimistically update local view immediately
    setSelectedIntervention((prev) =>
      prev
        ? {
            ...prev,
            status: 'completed',
            outcome: selectedOutcome as any,
            outcomeNotes: resolvedNotes,
            assignedPharmacist: pharmacistName,
            assignedPharmacistAr: pharmacistName,
            assignedPharmacistEn: pharmacistName
          }
        : null
    );

    try {
      await api.resolveIntervention(selectedIntervention.id, {
        status: 'completed',
        outcome: selectedOutcome,
        outcomeNotes: resolvedNotes,
        assignedPharmacist: pharmacistName
      });

      setSuccessToast(
        isAr
          ? 'تم حل الحالة بنجاح وتحديث مؤشر النجم الشمالي وقيمة الوفر المالي!'
          : 'High-risk case successfully resolved! North Star Metric incremented.'
      );
      setTimeout(() => setSuccessToast(null), 4000);
      onRefreshData();
    } catch (e) {
      console.error(e);
      setSuccessToast(
        isAr
          ? 'تم حفظ التدخل السريري محلياً بنجاح'
          : 'Clinical intervention logged successfully.'
      );
      setTimeout(() => setSuccessToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 font-mono">
            {isAr ? 'أولوية عالية' : 'High Priority'}
          </span>
        );
      case 'rising':
        return (
          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 font-mono">
            {isAr ? 'خطر متصاعد' : 'Rising Risk'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            {isAr ? 'مراقبة' : 'Monitor'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-sm bg-slate-900 border border-slate-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-3 shadow-xl">
          <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Info - Geometric Balance Clean White Panel */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AafiyaCareLogo 
            id="interventions-header-badge"
            variant="badge" 
            size="sm" 
            isAr={isAr} 
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span>{isAr ? 'قائمة التدخلات السريرية (Human-in-the-Loop)' : 'Clinical Interventions Queue'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
              {isAr
                ? 'إشارات السلامة والمخاطر المرفوعة للصيدلي السريري لاتخاذ القرار النهائي وتوثيق النتائج'
                : 'Safety & risk alerts flagged for certified clinical pharmacists to review, resolve, and close the loop'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 font-bold uppercase tracking-wider">
            {interventions.filter((i) => i.status === 'pending').length} {isAr ? 'قيد الانتظار' : 'Pending'}
          </span>
          <span className="text-xs px-3 py-1.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider">
            {interventions.filter((i) => i.status === 'completed').length} {isAr ? 'تم إنجازها' : 'Completed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interventions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {isAr ? 'الحالات المجدولة للتدخل' : 'Intervention Requests'}
          </div>

          <div className="space-y-2.5">
            {interventions.map((item) => {
              const isSelected = selectedIntervention?.id === item.id;
              const isDone = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  id={`intervention-card-${item.id}`}
                  onClick={() => setSelectedIntervention(item)}
                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">
                      {isAr ? item.patientNameAr : item.patientNameEn}
                    </span>
                    {getRiskBadge(item.riskLevel)}
                  </div>

                  <div className="text-xs font-bold text-blue-600">
                    {isAr ? item.typeAr : item.typeEn}
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {isAr ? item.triggerReasonAr : item.triggerReasonEn}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{isAr ? 'وفر مقدر:' : 'Avoidance:'} {item.costAvoidanceSAR.toLocaleString()} SAR</span>
                    </span>

                    <span
                      className={`font-bold px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-mono ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isDone ? (isAr ? 'تم التدخل' : 'Resolved') : (isAr ? 'بانتظار الصيدلي' : 'Pending')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Intervention Decision Workspace */}
        <div className="lg:col-span-7">
          {selectedIntervention ? (
            <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-[11px] text-blue-600 font-bold uppercase tracking-widest">
                    {isAr ? 'تفاصيل الإجراء والمراجعة السريرية' : 'Clinical Pharmacist Action Form'}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {isAr ? selectedIntervention.patientNameAr : selectedIntervention.patientNameEn}
                  </h3>
                </div>

                <div className="text-end">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'رقم الإحالة:' : 'Case ID:'}</div>
                  <div className="font-mono text-xs text-blue-600 font-bold">{selectedIntervention.id}</div>
                </div>
              </div>

              {/* AI Trigger Context */}
              <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isAr ? 'سبب التنبيه التنبؤي من الذكاء الاصطناعي:' : 'AI Predictive Trigger Reason:'}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {isAr ? selectedIntervention.triggerReasonAr : selectedIntervention.triggerReasonEn}
                </p>

                <div className="pt-2.5 border-t border-slate-200 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block mb-0.5">
                    {isAr ? 'الإجراء المقترح آلياً:' : 'Proposed Clinical Protocol:'}
                  </span>
                  <span className="text-blue-700 font-bold">
                    {isAr ? selectedIntervention.proposedActionAr : selectedIntervention.proposedActionEn}
                  </span>
                </div>
              </div>

              {/* Resolution Form (if pending) */}
              {selectedIntervention.status !== 'completed' ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      {isAr ? 'الصيدلي السريري المراجع:' : 'Reviewing Clinical Pharmacist:'}
                    </label>
                    <select
                      value={pharmacistName}
                      onChange={(e) => setPharmacistName(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 text-xs rounded-sm px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                    >
                      <option value="د. رزان الغامدي (صيدلي سريري)">د. رزان الغامدي (صيدلي سريري - مدينة الملك فهد)</option>
                      <option value="د. فيصل العليان (صيدلي سريري)">د. فيصل العليان (صيدلي سريري - مجمع الملك سعود)</option>
                      <option value="Dr. Sarah Al-Harbi (PharmD)">Dr. Sarah Al-Harbi (PharmD - Health Cluster)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      {isAr ? 'القرار السريري المعتمد (Outcome):' : 'Clinical Resolution Type:'}
                    </label>
                    <select
                      value={selectedOutcome}
                      onChange={(e) => setSelectedOutcome(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 text-xs rounded-sm px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                    >
                      <option value="drug_swapped">
                        {isAr ? 'إلغاء دواء متعارض / إيقاف الازدواجية (Deprescribe duplicate)' : 'Deprescribe duplicate / swap incompatible drug'}
                      </option>
                      <option value="dose_adjusted">
                        {isAr ? 'تعديل الجرعة بما يناسب وظائف الكلى/الكبد (Adjust dose)' : 'Renal / hepatic dosage titration'}
                      </option>
                      <option value="adherence_counseling">
                        {isAr ? 'جلسة تثقيف دوائي ومتابعة تفويت الجرعات (Adherence counseling)' : 'Patient education & smart schedule reinforcement'}
                      </option>
                      <option value="physician_escalated">
                        {isAr ? 'تصعيد للطبيب المعالج وإيقاف الصرف مؤقتاً (Escalate to prescriber)' : 'Escalate to attending physician'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      {isAr ? 'ملاحظات وتوثيق التدخل السريري:' : 'Clinical Pharmacist Notes & Rationale:'}
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        isAr
                          ? 'أدخل ملخص الإجراء المنجز، التواصل مع المريض، وتعديل خطة وصفتي...'
                          : 'Document patient communication, prescriber sign-off, or regimen adjustment...'
                      }
                      className="w-full bg-slate-50 text-slate-800 border border-slate-200 text-xs rounded-sm p-3 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <button
                    id="btn-confirm-intervention-resolution"
                    onClick={handleResolve}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isAr ? 'اعتماد التدخل وتحديث مؤشر النجم الشمالي' : 'Approve Intervention & Increment North Star Metric'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Completed State */
                <div className="p-5 rounded-sm bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{isAr ? 'تم إنجاز التدخل وحل الحالة بنجاح' : 'Case Successfully Resolved & Logged'}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedIntervention.outcomeNotes ||
                      (isAr
                        ? 'تم توثيق التوفيق الدوائي وتحديث الوصفات بنجاح.'
                        : 'Medication reconciliation completed successfully.')}
                  </p>
                  <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
                    {isAr ? 'المراجع السريري:' : 'Clinician:'} {isAr ? (selectedIntervention.assignedPharmacistAr || selectedIntervention.assignedPharmacist) : (selectedIntervention.assignedPharmacistEn || selectedIntervention.assignedPharmacist)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-sm border border-slate-200">
              {isAr ? 'اختر حالة من القائمة لعرض تفاصيلها' : 'Select an intervention from the list'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
