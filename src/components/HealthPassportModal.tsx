import React, { useRef, useState, useEffect } from 'react';
import { Patient, Language } from '../types';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import { downloadHealthPassportHtml, downloadHealthPassportFHIR } from '../utils/exportPassport';
import {
  Printer,
  Download,
  FileCode,
  X,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle2,
  Share2,
  Info
} from 'lucide-react';

interface HealthPassportModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HealthPassportModal: React.FC<HealthPassportModalProps> = ({
  patient,
  isOpen,
  onClose,
  lang
}) => {
  const isAr = lang === 'ar';
  const printableRef = useRef<HTMLDivElement>(null);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-dismiss feedback message after 5 seconds
  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  if (!isOpen) return null;

  const handlePrint = () => {
    try {
      window.print();
      setActionFeedback({
        message: isAr
          ? 'تم إرسال أمر الطباعة. في حال كان المتصفح يقيّد الطباعة داخل إطار المعاينة، استخدم زر "تحميل كملف (.HTML)" للطباعة المباشرة.'
          : 'Print dialog requested. If blocked by sandbox iframe, use "Download (.HTML)" for immediate local printing.',
        type: 'info'
      });
    } catch (err) {
      console.warn('Direct print blocked by sandbox iframe:', err);
      // Fallback: trigger HTML download so user has the file immediately
      downloadHealthPassportHtml(patient, lang);
      setActionFeedback({
        message: isAr
          ? 'نظراً لقيود إطار المعاينة، تم تنزيل وثيقة الجواز المجهزة للطباعة تلقائياً (.HTML)'
          : 'Due to sandbox constraints, the printable passport HTML document was downloaded automatically.',
        type: 'success'
      });
    }
  };

  const handleDownloadHtml = () => {
    const ok = downloadHealthPassportHtml(patient, lang);
    setActionFeedback({
      message: ok
        ? (isAr ? 'تم تنزيل وثيقة الجواز الصحي (.HTML) بنجاح للاحتفاظ والطباعة' : 'Health Passport HTML document downloaded successfully.')
        : (isAr ? 'تعذر التنزيل المباشر' : 'Download could not be initiated.'),
      type: ok ? 'success' : 'error'
    });
  };

  const handleDownloadFHIR = () => {
    const ok = downloadHealthPassportFHIR(patient);
    setActionFeedback({
      message: ok
        ? (isAr ? 'تم تنزيل ملف السجل الطبي الموحد القياسي (HL7 FHIR R4 .JSON) بنجاح' : 'Standard HL7 FHIR R4 JSON bundle downloaded successfully.')
        : (isAr ? 'تعذر تنزيل الملف الطبي' : 'FHIR export could not be completed.'),
      type: ok ? 'success' : 'error'
    });
  };

  const passportNumber = `AC-MEDPASS-${patient.mrn}-${new Date().getFullYear()}`;
  const issueDate = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Control Bar - Hidden on print */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <AafiyaCareLogo id="passport-modal-logo" variant="icon-only" size="xs" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'تصدير وثيقة الجواز الصحي الرقمي' : 'Export Digital Health Passport'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-blue-500/20 text-blue-300 font-mono">
                  {passportNumber}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isAr
                  ? 'وثيقة موحدة معتمدة لبيانات المريض والأدوية والتنبيهات الدوائية'
                  : 'Certified unified document of patient regimen, adherence, and clinical flags'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Print / Save as PDF Button */}
            <button
              id="btn-print-passport"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              title={isAr ? 'طباعة أو حفظ كـ PDF' : 'Print or Save as PDF'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>

            {/* Download Standalone HTML */}
            <button
              id="btn-download-passport-html"
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title={isAr ? 'تحميل ملف تفاعلي بصيغة HTML' : 'Download standalone HTML document'}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'تحميل كملف (.HTML)' : 'Download (.HTML)'}</span>
            </button>

            {/* Download FHIR R4 JSON */}
            <button
              id="btn-download-passport-fhir"
              onClick={handleDownloadFHIR}
              className="px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title={isAr ? 'تصدير بصيغة HL7 FHIR R4 القياسية' : 'Export HL7 FHIR R4 JSON standard'}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'ملف طبي (.JSON)' : 'FHIR (.JSON)'}</span>
            </button>

            {/* Close Modal */}
            <button
              id="btn-close-passport-modal"
              onClick={onClose}
              className="p-1.5 rounded-sm bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors ml-1 cursor-pointer"
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className={`p-3 text-xs font-bold flex items-center gap-2 border-b print:hidden ${
            actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            actionFeedback.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            {actionFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> :
             actionFeedback.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /> :
             <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            <span>{actionFeedback.message}</span>
          </div>
        )}

        {/* Printable Passport Body */}
        <div ref={printableRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white print:p-0 print:overflow-visible">
          
          {/* Top National Accreditation Strip */}
          <div className="bg-[#0A2550] text-white px-5 py-2.5 rounded-sm flex items-center justify-between text-xs font-bold tracking-wide border-b-2 border-emerald-500">
            <span>{isAr ? 'المملكة العربية السعودية • برنامج تحول القطاع الصحي' : 'Kingdom of Saudi Arabia • Health Sector Transformation'}</span>
            <span className="text-emerald-300 font-mono">{isAr ? patient.healthCluster : patient.healthClusterEn}</span>
          </div>

          {/* Header with Official Logo & Verification Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <AafiyaCareLogo id="passport-document-header-logo" variant="vertical" size="sm" isAr={isAr} />
              <div>
                <div className="text-xl font-extrabold text-[#0C3B7C] tracking-tight">
                  {isAr ? 'الجواز الصحي والدوائي الموحد' : 'Digital Health & Medication Passport'}
                </div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                  {isAr ? 'منصة عافية كير للذكاء المبكر ومطابقة الأدوية' : 'AafiyaCare Unified Medication Safety & Adherence'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>{isAr ? 'حالة الوثيقة:' : 'Document Status:'} <strong className="text-emerald-600 font-semibold">{isAr ? 'سارية ومعتمدة' : 'Valid & Certified'}</strong></span>
                  <span>•</span>
                  <span>{isAr ? 'تاريخ التوثيق:' : 'Issued:'} {issueDate}</span>
                </div>
              </div>
            </div>

            <div className="text-start sm:text-end space-y-1">
              <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-mono text-xs font-bold rounded-sm">
                {passportNumber}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                HL7 FHIR R4 COMPLIANT
              </div>
            </div>
          </div>

          {/* Patient Demographic Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {isAr ? 'اسم المستفيد / المريض' : 'Patient Name'}
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {isAr ? patient.nameAr : patient.nameEn}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {isAr ? 'رقم السجل الطبي (MRN)' : 'MRN'}
              </span>
              <span className="text-sm font-mono font-bold text-blue-700 block">
                {patient.mrn}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {isAr ? 'الهوية الوطنية' : 'National ID'}
              </span>
              <span className="text-sm font-mono text-slate-700 block">
                {patient.nationalIdMasked}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {isAr ? 'العمر / الجنس' : 'Age / Gender'}
              </span>
              <span className="text-sm font-bold text-slate-800 block">
                {patient.age} {isAr ? 'سنة' : 'yrs'} • {patient.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {isAr ? 'التشخيص والأمراض المزمنة' : 'Chronic Diagnoses'}
              </span>
              <span className="text-slate-800 font-semibold">
                {(isAr ? patient.chronicConditionsAr : patient.chronicConditionsEn).join(' • ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {isAr ? 'مؤشر خطورة إعادة التنويم' : 'Readmission Risk'}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-bold uppercase font-mono ${
                patient.riskLevel === 'high' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                patient.riskLevel === 'rising' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {patient.riskLevel.toUpperCase()} ({patient.riskScore}/100)
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                {isAr ? 'تاريخ الخروج الأخير' : 'Last Discharge'}
              </span>
              <span className="text-slate-700 font-mono">
                {patient.careJourney.dischargeDate}
              </span>
            </div>
          </div>

          {/* Active Medications Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600" />
                <span>{isAr ? 'جدول الأدوية والجرعات اليومية المعتمدة' : 'Active Prescriptions & Regimen Schedule'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {patient.medications.length} {isAr ? 'أدوية نشطة' : 'Active Meds'}
              </span>
            </div>

            <div className="border border-slate-200 rounded-sm overflow-hidden">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-start">#</th>
                    <th className="p-2.5 text-start">{isAr ? 'الدواء والمادة الفعالة' : 'Medication & Generic'}</th>
                    <th className="p-2.5 text-start">{isAr ? 'الجرعة' : 'Dose'}</th>
                    <th className="p-2.5 text-start">{isAr ? 'جدول التناول' : 'Schedule'}</th>
                    <th className="p-2.5 text-start">{isAr ? 'دواعي الاستعمال' : 'Indication'}</th>
                    <th className="p-2.5 text-start">{isAr ? 'الالتزام' : 'Adherence'}</th>
                    <th className="p-2.5 text-start">{isAr ? 'إعادة الصرف' : 'Refill Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.medications.map((med, idx) => (
                    <tr key={med.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="p-2.5 font-mono text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900 text-xs">
                          {isAr ? med.tradeName : med.tradeNameEn}
                        </div>
                        <div className="text-[10px] text-slate-500">{med.genericName}</div>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 font-mono font-bold text-[11px] border border-blue-200">
                          {med.dose}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-slate-800">
                        {isAr ? med.frequency : med.frequencyEn}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {isAr ? med.indication : med.indicationEn}
                      </td>
                      <td className="p-2.5">
                        <span className={`font-bold font-mono text-xs ${
                          med.adherenceRate >= 80 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {med.adherenceRate}%
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">
                        {med.refillDueDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Signals / Precautions Warning */}
          {patient.safetySignals.length > 0 && (
            <div className="p-4 rounded-sm bg-amber-50 border border-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'تنبيهات السلامة والتعارضات المرصودة' : 'Safety Signals & Interaction Precautions'}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {patient.safetySignals.map((sig) => (
                  <div key={sig.id} className="text-amber-950">
                    <strong>• {isAr ? sig.titleAr : sig.titleEn}:</strong>{' '}
                    <span>{isAr ? sig.descriptionAr : sig.descriptionEn}</span>
                    <div className="text-[11px] text-amber-800 mt-0.5 ps-3 font-medium">
                      {isAr ? 'الإجراء السريري:' : 'Clinical Action:'} {isAr ? sig.recommendedActionAr : sig.recommendedActionEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Verification, Pharmacist Signature & Stamp Footer */}
          <div className="pt-6 border-t border-slate-200 print-signature-section">
            {/* Pharmacist Signature Box */}
            <div className="print-signature-box space-y-1 text-xs text-slate-500 w-full sm:w-auto">
              <div className="print-signature-title">
                {isAr ? 'اعتماد الصيدلي الإكلينيكي المسؤول' : 'Certified Clinical Pharmacist'}
              </div>
              <div className="print-signature-subtitle font-semibold text-slate-700">
                {isAr ? 'د. سارة المنصور (ترخيص هيئة التخصصات #48291)' : 'Dr. Sarah Al-Mansoor, PharmD (SCFHS #48291)'}
              </div>
              <div className="print-signature-line" />
              <div className="print-signature-date">
                {isAr ? 'تاريخ التوثيق:' : 'Attestation Date:'} {issueDate}
              </div>
            </div>

            {/* Official Digital Seal / Stamp */}
            <div className="print-stamp-placeholder">
              <div className="stamp-inner-circle">
                <span className="text-[7px] font-black text-emerald-700">★ MOH / KSA ★</span>
                <span className="text-[7.5px] font-extrabold my-0.5 leading-tight text-[#0A2550]">
                  AAFIYACARE
                </span>
                <span className="text-[6.5px] font-bold text-slate-600">
                  {isAr ? 'معتمد رسمياً' : 'VERIFIED'}
                </span>
                <span className="text-[6px] font-mono text-slate-400 mt-0.5">MOH-READY</span>
              </div>
            </div>

            {/* Patient / Guardian Receipt Signature */}
            <div className="print-signature-box space-y-1 text-xs text-slate-500 w-full sm:w-auto text-start">
              <div className="print-signature-title">
                {isAr ? 'إقرار وتوقيع المريض أو الوكيل' : 'Patient / Guardian Signature'}
              </div>
              <div className="print-signature-subtitle font-semibold text-slate-700">
                {isAr ? patient.nameAr : patient.nameEn}
              </div>
              <div className="print-signature-line" />
              <div className="print-signature-date">
                {isAr ? 'تاريخ الاستلام:' : 'Receipt Date:'} ______________
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {isAr
                ? 'يمكنك تنزيل الوثيقة للاحتفاظ بها دون إنترنت أو طباعتها كـ PDF للمراجعة الطبية'
                : 'Download for offline use or print as official PDF for clinical appointments'}
            </span>
          </div>

          <button
            id="btn-close-passport-modal-bottom"
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
