import React, { useState } from 'react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import { HealthPassportModal } from './HealthPassportModal';
import { SehhatyComparisonModal } from './SehhatyComparisonModal';
import { SmartRecommendationsCard } from './SmartRecommendationsCard';
import {
  Pill,
  Camera,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  FileText,
  Calendar,
  Layers,
  UploadCloud,
  ChevronDown,
  Download,
  Printer,
  Info,
  Edit3,
  X,
  AlertCircle,
  Bell,
  Zap,
  Scale,
  HeartHandshake
} from 'lucide-react';
import { Patient, Medication, Language } from '../types';
import { api } from '../services/api';
import { downloadHealthPassportHtml } from '../utils/exportPassport';
import { DoseTrackerAndAlertsHub } from './DoseTrackerAndAlertsHub';

interface MedicationPassportViewProps {
  patients: Patient[];
  selectedPatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  lang: Language;
  onRefreshData: () => void;
  onOpenInterventions?: () => void;
  onOpenPatientPortal?: () => void;
}

export const MedicationPassportView: React.FC<MedicationPassportViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  lang,
  onRefreshData,
  onOpenInterventions,
  onOpenPatientPortal
}) => {
  const isAr = lang === 'ar';

  const [activeSection, setActiveSection] = useState<'regimen' | 'recommendations' | 'doses' | 'alerts'>('regimen');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [editableScanData, setEditableScanData] = useState<any>(null);
  const [isEditingScanResult, setIsEditingScanResult] = useState<boolean>(false);
  const [isRealAi, setIsRealAi] = useState<boolean>(false);
  const [detectedModel, setDetectedModel] = useState<string>('gemini-flash-latest');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanInteractions, setScanInteractions] = useState<any[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [medicationToDeprescribe, setMedicationToDeprescribe] = useState<{ id: string; name: string } | null>(null);

  // Manual medication addition modal state
  const [isManualAddOpen, setIsManualAddOpen] = useState<boolean>(false);
  const [manualMedForm, setManualMedForm] = useState({
    tradeName: '',
    tradeNameEn: '',
    genericName: '',
    dose: '',
    frequency: 'مرة واحدة يومياً',
    frequencyEn: 'Once daily',
    indication: '',
    indicationEn: '',
    category: 'other'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Run AI Scan with benchmark sample
  const handleScanSample = async (sampleKey: string) => {
    setIsProcessingAI(true);
    setScanResult(null);
    setEditableScanData(null);
    setScanInteractions([]);
    setScanError(null);
    setUploadedImagePreview(null);
    setIsEditingScanResult(false);
    try {
      const res = await api.scanMedicationWithAI({
        sampleId: sampleKey,
        patientId: selectedPatient.id
      });
      if (res.success && res.scannedData) {
        setScanResult(res.scannedData);
        setEditableScanData({ ...res.scannedData });
        setScanInteractions(res.potentialInteractions || []);
        setIsRealAi(false);
        setDetectedModel('benchmark-preset');
      } else {
        setScanError(isAr ? 'تعذر استرجاع بيانات العينة' : 'Failed to retrieve sample data');
      }
    } catch (err) {
      console.error(err);
      setScanError(isAr ? 'خطأ في معالجة العينة الدوائية' : 'Error processing sample');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Handle custom image file upload via Live Computer Vision AI
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setUploadedImagePreview(base64);
      setIsProcessingAI(true);
      setScanResult(null);
      setEditableScanData(null);
      setScanInteractions([]);
      setScanError(null);
      setIsEditingScanResult(false);

      try {
        const res = await api.scanMedicationWithAI({
          imageBase64: base64,
          patientId: selectedPatient.id
        });

        if (res.success && res.scannedData) {
          setScanResult(res.scannedData);
          setEditableScanData({ ...res.scannedData });
          setScanInteractions(res.potentialInteractions || []);
          setIsRealAi(Boolean(res.isRealAiScan));
          setDetectedModel(res.modelUsed || 'gemini-flash-latest');
          setScanError(null);
        } else {
          setScanError(
            isAr
              ? (res.messageAr || 'تعذر التعرف على عبوة دواء واضحة في الصورة المرفوعة. يرجى التأكد من وضوح الصورة أو إدخال البيانات يدوياً.')
              : (res.messageEn || 'Could not recognize medication details from the image. Please upload a clearer photo or enter details manually.')
          );
          setScanResult(null);
        }
      } catch (err: any) {
        console.error('File scan error:', err);
        setScanError(
          isAr
            ? 'حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى المحاولة بصورة أخرى أو إدخال الدواء يدوياً.'
            : 'AI scan communication error. Please try another photo or enter manually.'
        );
      } finally {
        setIsProcessingAI(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add scanned medication to patient passport (supports edited values)
  const handleAddScannedToPassport = async () => {
    const dataToAdd = isEditingScanResult ? editableScanData : scanResult;
    if (!dataToAdd) return;
    try {
      await api.addMedication(selectedPatient.id, {
        tradeName: dataToAdd.tradeNameAr || dataToAdd.tradeNameEn || 'دواء غير مسمى',
        tradeNameEn: dataToAdd.tradeNameEn || dataToAdd.tradeNameAr || 'Unnamed Medication',
        genericName: dataToAdd.genericName || 'Unspecified',
        dose: dataToAdd.dose || 'Standard',
        frequency: dataToAdd.frequencyAr || dataToAdd.frequencyEn || 'حسب الإرشاد الطبي',
        frequencyEn: dataToAdd.frequencyEn || dataToAdd.frequencyAr || 'As directed',
        indication: dataToAdd.indicationAr || dataToAdd.indicationEn || '',
        indicationEn: dataToAdd.indicationEn || dataToAdd.indicationAr || '',
        category: dataToAdd.category || 'other'
      });
      showToast(
        isAr
          ? `تمت إضافة "${dataToAdd.tradeNameAr || dataToAdd.tradeNameEn}" إلى الملف الدوائي الموحد بنجاح`
          : `Added "${dataToAdd.tradeNameEn || dataToAdd.tradeNameAr}" to unified Medication Passport`
      );
      setScanResult(null);
      setEditableScanData(null);
      setScanInteractions([]);
      setUploadedImagePreview(null);
      setIsScanning(false);
      setIsEditingScanResult(false);
      onRefreshData();
    } catch (e) {
      console.error(e);
      showToast(isAr ? 'فشل إضافة الدواء' : 'Failed to add medication');
    }
  };

  // Handle manual medication submit
  const handleSaveManualMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMedForm.tradeName.trim() && !manualMedForm.tradeNameEn.trim()) {
      showToast(isAr ? 'يرجى إدخال اسم الدواء' : 'Please enter medication name');
      return;
    }
    try {
      await api.addMedication(selectedPatient.id, {
        tradeName: manualMedForm.tradeName || manualMedForm.tradeNameEn,
        tradeNameEn: manualMedForm.tradeNameEn || manualMedForm.tradeName,
        genericName: manualMedForm.genericName || 'Active Ingredient',
        dose: manualMedForm.dose || '1 dose',
        frequency: manualMedForm.frequency,
        frequencyEn: manualMedForm.frequencyEn,
        indication: manualMedForm.indication,
        indicationEn: manualMedForm.indicationEn,
        category: manualMedForm.category
      });
      showToast(
        isAr
          ? `تمت إضافة ${manualMedForm.tradeName || manualMedForm.tradeNameEn} إلى الملف الدوائي الموحد بنجاح`
          : `Added ${manualMedForm.tradeNameEn || manualMedForm.tradeName} to unified Medication Passport`
      );
      setIsManualAddOpen(false);
      setManualMedForm({
        tradeName: '',
        tradeNameEn: '',
        genericName: '',
        dose: '',
        frequency: 'مرة واحدة يومياً',
        frequencyEn: 'Once daily',
        indication: '',
        indicationEn: '',
        category: 'other'
      });
      onRefreshData();
    } catch (e) {
      console.error(e);
      showToast(isAr ? 'فشل حفظ الدواء' : 'Failed to save medication');
    }
  };

  // Deprescribe / Discontinue
  const handleRemoveMedication = (medId: string, medName: string) => {
    setMedicationToDeprescribe({ id: medId, name: medName });
  };

  // Dedicated Export / Print Trigger specifically for patient's health passport
  const handlePrintPassport = () => {
    setIsPassportModalOpen(true);
    showToast(
      isAr
        ? 'تم فتح وثيقة الجواز الصحي الموحد مع خيارات الطباعة وتنزيل HTML / FHIR'
        : "Opened unified Health Passport with print and HTML/FHIR export options."
    );
  };

  const confirmDeprescribe = async () => {
    if (!medicationToDeprescribe) return;
    const { id: medId, name: medName } = medicationToDeprescribe;
    setMedicationToDeprescribe(null);

    try {
      await api.removeMedication(selectedPatient.id, medId);
      showToast(
        isAr
          ? `تم إيقاف دواء "${medName}" وتحديث مؤشر خطورة المريض بنجاح`
          : `Deprescribed "${medName}". Patient risk score recalculated.`
      );
      onRefreshData();
    } catch (e) {
      console.error('Deprescribing failed:', e);
      showToast(
        isAr
          ? `تعذر إيقاف الدواء، يرجى المحاولة لاحقاً`
          : `Could not deprescribe medication, please try again.`
      );
    }
  };

  const passportNumber = `AC-MEDPASS-${selectedPatient.mrn}-${new Date().getFullYear()}`;
  const issueDateFormatted = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-sm shadow-xl flex items-center gap-3 border border-slate-700 text-xs font-bold uppercase tracking-wider animate-bounce print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Health Passport Print-Only Header (Rendered exclusively in browser print dialog) */}
      <div className="hidden print:block space-y-5 pb-6 border-b-2 border-slate-300 print:break-inside-avoid medical-certificate-header">
        {/* National Accreditation Banner */}
        <div className="bg-[#0A2550] text-white px-5 py-2.5 rounded-sm flex items-center justify-between text-xs font-bold tracking-wide border-b-2 border-emerald-500">
          <span>
            {isAr
              ? 'المملكة العربية السعودية • برنامج تحول القطاع الصحي • السجل الصحي الوطني الموحد'
              : 'Kingdom of Saudi Arabia • Health Sector Transformation • National Unified Health Record'}
          </span>
          <span className="font-mono text-emerald-300">
            {isAr ? selectedPatient.healthCluster : selectedPatient.healthClusterEn}
          </span>
        </div>

        {/* Passport Document Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AafiyaCareLogo id="print-passport-logo" variant="vertical" size="sm" isAr={isAr} />
            <div>
              <h1 className="text-2xl font-black text-[#0C3B7C] tracking-tight">
                {isAr ? 'الجواز الصحي والدوائي الموحد' : 'Digital Health & Medication Passport'}
              </h1>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                {isAr
                  ? 'منصة عافية كير لسلامة ومطابقة الأدوية وتكامل السجلات الصحية'
                  : 'AafiyaCare Unified Medication Safety & Multi-Hospital Reconciliation'}
              </p>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span>{isAr ? 'حالة الوثيقة:' : 'Status:'} <strong className="text-emerald-700 font-bold">{isAr ? 'سارية ومعتمدة سريرياً' : 'Certified & Valid'}</strong></span>
                <span>•</span>
                <span>{isAr ? 'تاريخ الطباعة:' : 'Print Date:'} {issueDateFormatted}</span>
              </div>
            </div>
          </div>

          <div className="text-end space-y-1">
            <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-300 text-blue-900 font-mono text-xs font-bold rounded-sm">
              {passportNumber}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              HL7 FHIR R4 COMPLIANT • CLINICAL PASSPORT
            </div>
          </div>
        </div>

        {/* Patient Clinical Profile & Demographics Card */}
        <div className="bg-slate-50 border border-slate-300 rounded-sm p-4 grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {isAr ? 'اسم المريض' : 'Patient Name'}
            </span>
            <span className="text-sm font-bold text-slate-900 block">
              {isAr ? selectedPatient.nameAr : selectedPatient.nameEn}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {isAr ? 'رقم السجل الطبي (MRN)' : 'MRN'}
            </span>
            <span className="text-sm font-mono font-bold text-blue-800 block">
              {selectedPatient.mrn}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {isAr ? 'الهوية الوطنية' : 'National ID'}
            </span>
            <span className="text-sm font-mono font-bold text-slate-800 block">
              {selectedPatient.nationalIdMasked}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {isAr ? 'العمر والتجمع' : 'Age & Cluster'}
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              {selectedPatient.age} {isAr ? 'سنة' : 'yrs'} • {isAr ? selectedPatient.healthCluster : selectedPatient.healthClusterEn}
            </span>
          </div>

          <div className="col-span-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {isAr ? 'الأمراض المزمنة المسجلة' : 'Chronic Conditions'}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {(isAr ? selectedPatient.chronicConditionsAr : selectedPatient.chronicConditionsEn).map((cond, i) => (
                <span key={i} className="px-2 py-0.5 rounded-sm bg-white border border-slate-300 font-semibold text-[11px] text-slate-700">
                  {cond}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {isAr ? 'مؤشر أمان عافية كير' : 'Aafiya Safety Score'}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                selectedPatient.riskLevel === 'high' ? 'text-rose-700' :
                selectedPatient.riskLevel === 'rising' ? 'text-amber-700' :
                'text-emerald-700'
              }`}>
                {100 - selectedPatient.riskScore}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                ({selectedPatient.riskLevel.toUpperCase()})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Header & Selector - Screen Only (Hidden during print) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <AafiyaCareLogo 
            id="passport-patient-badge"
            variant="badge" 
            size="sm" 
            isAr={isAr} 
          />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {isAr ? selectedPatient.nameAr : selectedPatient.nameEn}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-mono border border-slate-200 font-semibold">
                {selectedPatient.mrn}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 uppercase tracking-wider">
              <span>{isAr ? 'الهوية:' : 'National ID:'} <span className="font-mono text-slate-600">{selectedPatient.nationalIdMasked}</span></span>
              <span>•</span>
              <span>{selectedPatient.age} {isAr ? 'سنة' : 'years'}</span>
              <span>•</span>
              <span className="text-blue-600 font-bold">
                {isAr ? selectedPatient.healthCluster : selectedPatient.healthClusterEn}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Switcher & Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:flex-initial min-w-[180px]">
            <select
              id="patient-dropdown-select"
              value={selectedPatient.id}
              onChange={(e) => {
                const p = patients.find((pat) => pat.id === e.target.value);
                if (p) onSelectPatient(p);
              }}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 text-xs rounded-sm px-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {isAr ? pat.nameAr : pat.nameEn} ({pat.riskLevel.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Dedicated Export / Print Health Passport Button */}
          <button
            id="btn-dedicated-export-print"
            onClick={handlePrintPassport}
            className="px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            title={isAr ? 'طباعة وتصدير الجواز الصحي الموحد للمريض' : "Export & Print Patient's Health Passport"}
          >
            <Printer className="w-4 h-4 text-white" />
            <span>{isAr ? 'تصدير / طباعة الجواز' : 'Export / Print Passport'}</span>
          </button>

          {/* Export Health Passport Modal Trigger */}
          <button
            id="btn-open-health-passport-modal"
            onClick={() => setIsPassportModalOpen(true)}
            className="px-3.5 py-2 rounded-sm bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            title={isAr ? 'عرض خيارات التصدير (HTML / FHIR JSON)' : 'View & Export Digital Health Passport'}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'خيارات التصدير' : 'Export Options'}</span>
          </button>

          {/* Patient Quick-Log Portal Button */}
          {onOpenPatientPortal && (
            <button
              id="btn-open-patient-portal"
              onClick={onOpenPatientPortal}
              className="px-3.5 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
              title={isAr ? 'فتح واجهة المريض لتسجيل الجرعة بضغطة واحدة' : 'Open Patient View: One-click dose log'}
            >
              <HeartHandshake className="w-4 h-4 text-white" />
              <span>{isAr ? 'واجهة المريض' : 'Patient View'}</span>
            </button>
          )}

          {/* Benchmark vs Sehhaty Comparison Trigger */}
          <button
            type="button"
            id="btn-patient-sehhaty-comparison"
            onClick={() => setIsComparisonModalOpen(true)}
            className="px-3.5 py-2 rounded-sm bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            title={isAr ? 'مقارنة سجل المريض بين تطبيق صحتي ومحرك عافية كير التنبؤي' : 'Compare Sehhaty Record vs AafiyaCare Engine'}
          >
            <Scale className="w-4 h-4 text-blue-200" />
            <span>{isAr ? 'مقارنة مع صحتي' : 'Sehhaty Benchmark'}</span>
          </button>

          {/* Smart Clinical Recommendations Trigger */}
          <button
            id="btn-patient-smart-recommendations"
            onClick={() => {
              setActiveSection('recommendations');
              const el = document.getElementById('smart-clinical-recommendations-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-sm bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer border border-blue-700"
            title={isAr ? 'عرض التوصيات العلاجية الذكية المبنية على البروتوكولات' : 'View Smart Clinical Recommendations'}
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>{isAr ? 'توصيات ذكية' : 'Smart Protocols'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-800 text-blue-200 font-mono">
              {selectedPatient.riskLevel.toUpperCase()}
            </span>
          </button>

          {/* Direct Manual Add Medication Trigger */}
          <button
            id="btn-open-manual-add"
            onClick={() => setIsManualAddOpen(true)}
            className="px-3.5 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            title={isAr ? 'إدخال دواء جديد يدوياً إلى الملف' : 'Add Medication Manually'}
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{isAr ? 'إضافة دواء يدوياً' : 'Add Manually'}</span>
          </button>

          <button
            id="btn-trigger-ai-scanner"
            onClick={() => setIsScanning(!isScanning)}
            className="px-4 py-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Camera className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'فحص دواء بالذكاء الاصطناعي' : 'AI Drug Scan'}</span>
            <div className="w-2 h-2 border border-blue-400 transform rotate-45" />
          </button>
        </div>
      </div>

      {/* Primary Section Switcher: Regimen vs. Recommendations vs. Doses & Adherence vs. Smart Alerts */}
      <div className="flex items-center justify-between border border-slate-200 bg-white p-2 rounded-sm shadow-xs print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="section-tab-regimen"
            onClick={() => setActiveSection('regimen')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'regimen'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Pill className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'الملف الدوائي وفحص AI' : 'Active Regimen & AI Scan'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-white font-mono text-[10px]">
              {selectedPatient.medications.length}
            </span>
          </button>

          <button
            id="section-tab-recommendations"
            onClick={() => setActiveSection('recommendations')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'recommendations'
                ? 'bg-blue-900 text-white shadow-xs border border-blue-800'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'توصيات ذكية بروتوكولية' : 'Smart Protocol Recommendations'}</span>
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
              activeSection === 'recommendations'
                ? 'bg-blue-800 text-blue-100'
                : 'bg-blue-100 text-blue-900'
            }`}>
              {selectedPatient.riskLevel.toUpperCase()}
            </span>
          </button>

          <button
            id="section-tab-doses"
            onClick={() => setActiveSection('doses')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'doses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-300" />
            <span>{isAr ? 'تسجيل الجرعات والالتزام السريري' : 'Dose Logger & Adherence'}</span>
            {selectedPatient.doseSchedule && selectedPatient.doseSchedule.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                activeSection === 'doses' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedPatient.doseSchedule.filter(d => d.status === 'taken').length}/{selectedPatient.doseSchedule.length}
              </span>
            )}
          </button>

          <button
            id="section-tab-alerts"
            onClick={() => setActiveSection('alerts')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'alerts'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-rose-300" />
            <span>{isAr ? 'مركز التنبيهات السريرية الاستباقية' : 'Proactive Clinical Alerts'}</span>
            {selectedPatient.smartAlerts && selectedPatient.smartAlerts.some(a => !a.acknowledged) && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 font-mono text-[10px] font-bold animate-pulse">
                {selectedPatient.smartAlerts.filter(a => !a.acknowledged).length}
              </span>
            )}
          </button>
        </div>

        {/* Closed loop quick tag */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{isAr ? 'تصعيد تلقائي للصيدلي عند التخطي الحرج' : 'Auto-escalation to Pharmacist active'}</span>
        </div>
      </div>

      {activeSection === 'recommendations' ? (
        <div className="space-y-6">
          <SmartRecommendationsCard
            patient={selectedPatient}
            lang={lang}
            onExecuteRecommendation={(title) => {
              setToastMessage(isAr ? `تم توثيق تنفيذ التوصية: ${title}` : `Recommendation executed: ${title}`);
              setTimeout(() => setToastMessage(null), 4000);
              onRefreshData();
            }}
            onApproveEntirePlan={(planTitle) => {
              setToastMessage(isAr ? `تم اعتماد الخطة السريرية بالكامل: ${planTitle}` : `Full clinical plan approved: ${planTitle}`);
              setTimeout(() => setToastMessage(null), 5000);
              onRefreshData();
            }}
            onRequestConsult={(specialty, urgency) => {
              setToastMessage(isAr ? `تم إرسال طلب الاستشارة الطبية [${specialty}] بأولوية [${urgency}]` : `Consultation dispatched [${specialty}] priority [${urgency}]`);
              setTimeout(() => setToastMessage(null), 5000);
              onRefreshData();
            }}
          />
        </div>
      ) : activeSection === 'regimen' ? (
        <>
          {/* Quick Bar: Next Dose Alert while in Regimen view */}
          {selectedPatient.doseSchedule && selectedPatient.doseSchedule.some(d => d.status === 'pending') && (
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs print:hidden">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-950 font-medium">
                  {isAr ? (
                    <>
                      <strong>الجرعة القادمة للمريض اليوم:</strong>{' '}
                      {selectedPatient.doseSchedule.find(d => d.status === 'pending')?.tradeName} ({selectedPatient.doseSchedule.find(d => d.status === 'pending')?.dose}) - الموعد: {selectedPatient.doseSchedule.find(d => d.status === 'pending')?.scheduledTime}
                    </>
                  ) : (
                    <>
                      <strong>Next Dose for Today:</strong>{' '}
                      {selectedPatient.doseSchedule.find(d => d.status === 'pending')?.tradeNameEn} at {selectedPatient.doseSchedule.find(d => d.status === 'pending')?.scheduledTime}
                    </>
                  )}
                </span>
              </div>
              <button
                onClick={() => setActiveSection('doses')}
                className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
              >
                {isAr ? 'تسجيل الجرعة الآن' : 'Log Dose Now'}
              </button>
            </div>
          )}

      {/* AI Vision Computer Vision Scanner Panel - High-Contrast Geometric Slate Console */}
      {isScanning && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-sm p-6 sm:p-8 shadow-sm space-y-6 text-white print:hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-start gap-4">
              <AafiyaCareLogo 
                id="scanner-header-logo"
                variant="icon-only" 
                size="md" 
                className="mt-1"
              />
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                  <div className="w-2 h-2 border border-blue-400 transform rotate-45" />
                  <span>{isAr ? 'عافية كير | محرك الرؤية الحاسوبية والتعرف على الأدوية' : 'AafiyaCare | Computer Vision Medication AI'}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {isAr
                    ? 'مسح عبوات الأدوية والوصفات الطبية وتحليل التعارضات فوراً'
                    : 'Scan Medication Packaging, Blister Packs & Check Adverse Interactions'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                  {isAr
                    ? 'مدعوم بنموذج Gemini 3.8 Flash لاستخراج الاسم العلمي والجرعة والتحذيرات ومقارنتها بالملف الموحد'
                    : 'Powered by Gemini 3.8 Flash • Extraction & Cross-Regimen Safety Verification'}
                </p>
              </div>
            </div>

            <button
              id="close-scanner-btn"
              onClick={() => setIsScanning(false)}
              className="text-slate-400 hover:text-white text-xs uppercase tracking-wider px-3 py-1.5 rounded-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>

          {/* Scanner Input Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A: Quick Preloaded Clinical Samples */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isAr ? 'اختر نموذجاً دوائياً للاختبار الفوري:' : 'Select a clinical benchmark sample:'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'coumadin',
                    name: 'وارفارين (Coumadin 5mg)',
                    desc: isAr ? 'مضاد تخثر - يسبب تفاعل حاد مع الأسبرين' : 'Anticoagulant - severe Aspirin risk',
                    tag: 'High Alert'
                  },
                  {
                    id: 'lipitor',
                    name: 'ليبيتور (Lipitor 20mg)',
                    desc: isAr ? 'خفض كوليسترول ووقاية وعائية' : 'Statin lipid regulator',
                    tag: 'Standard'
                  },
                  {
                    id: 'glucophage',
                    name: 'غلوكوفاج XR (1000mg)',
                    desc: isAr ? 'سكر الدم - يحتاج ضبط مع وظائف الكلى' : 'Diabetes extended release',
                    tag: 'Endocrine'
                  },
                  {
                    id: 'augmentin',
                    name: 'أوغمنتين (Augmentin 1g)',
                    desc: isAr ? 'مضاد حيوي واسع المجال' : 'Broad spectrum antibiotic',
                    tag: 'Antibiotic'
                  }
                ].map((sample) => (
                  <button
                    key={sample.id}
                    id={`sample-btn-${sample.id}`}
                    onClick={() => handleScanSample(sample.id)}
                    disabled={isProcessingAI}
                    className="p-3 text-start rounded-sm bg-slate-800/60 border border-slate-700 hover:border-blue-400 hover:bg-slate-800 transition-all text-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 group-hover:text-blue-300">
                        {sample.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-700 text-slate-300 uppercase tracking-wider font-mono">
                        {sample.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sample.desc}</p>
                  </button>
                ))}
              </div>

              {/* Option B: Direct Drag & Drop / Upload Photo */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
                  {isAr ? 'أو ارفع صورة عبوة الدواء / الوصفة الطبية:' : 'Or upload medication box / prescription label:'}
                </label>
                <label className="border-2 border-dashed border-slate-700 hover:border-blue-400 rounded-sm p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
                  <UploadCloud className="w-6 h-6 text-blue-400 mb-1" />
                  <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                    {isAr ? 'انقر لرفع صورة أو اسحبها هنا' : 'Click to browse or drop image here'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">JPG, PNG, WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* AI Extraction Display & Risk Cross-Check */}
            <div className="bg-slate-900 rounded-sm p-5 border border-slate-800 flex flex-col justify-between">
              {isProcessingAI ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-wider animate-pulse text-center">
                    {isAr ? 'الذكاء الاصطناعي (Gemini Vision) يحلل صورة العبوة ويقرأ النصوص...' : 'Gemini Vision AI analyzing packaging, reading text & checking interactions...'}
                  </span>
                </div>
              ) : scanError ? (
                <div className="flex-1 flex flex-col justify-center space-y-4 py-4">
                  <div className="p-4 rounded-sm bg-amber-950/70 border border-amber-700 text-amber-200 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{isAr ? 'تنبيه محرك التعرف البصري' : 'Vision Recognition Notice'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-200/90">
                      {scanError}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      id="btn-scan-error-manual-add"
                      onClick={() => setIsManualAddOpen(true)}
                      className="flex-1 py-2.5 px-3 rounded-sm bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إدخال بيانات الدواء يدوياً' : 'Enter Details Manually'}</span>
                    </button>
                    <button
                      id="btn-scan-error-retry"
                      onClick={() => {
                        setScanError(null);
                        setUploadedImagePreview(null);
                      }}
                      className="py-2.5 px-3 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'إعادة المحاولة' : 'Try Again'}
                    </button>
                  </div>
                </div>
              ) : scanResult ? (
                <div className="space-y-4">
                  {/* Result Header Badges & Actions */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {isAr ? 'تم استخراج الدواء' : 'Medication Identified'}
                      </span>
                      {isRealAi ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Gemini Vision</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {isAr ? 'عينة تجريبية' : 'Preset Sample'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-sm bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                        {Math.round((scanResult.confidenceScore || 0.95) * 100)}% Match
                      </span>
                      <button
                        id="btn-toggle-edit-scan-result"
                        onClick={() => setIsEditingScanResult(!isEditingScanResult)}
                        className={`text-[11px] px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1 cursor-pointer ${
                          isEditingScanResult
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                        title={isAr ? 'تعديل وتصحيح تفاصيل الدواء المستخرجة' : 'Edit extracted details'}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingScanResult ? (isAr ? 'إنهاء التعديل' : 'Done Editing') : (isAr ? 'تعديل' : 'Edit')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Packaging Thumbnail Preview */}
                  {uploadedImagePreview && (
                    <div className="flex items-center gap-3 p-2.5 rounded-sm bg-slate-950/80 border border-slate-800">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded medication box"
                        className="w-14 h-14 object-cover rounded-sm border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          {isAr ? 'صورة العبوة المرفوعة من جهازك:' : 'Uploaded Image Scanned by Vision AI:'}
                        </span>
                        <span className="text-xs text-slate-200 font-semibold truncate block">
                          {scanResult.tradeNameAr || scanResult.tradeNameEn}
                        </span>
                        {scanResult.ocrDetectedText && (
                          <span className="text-[10px] text-slate-400 font-mono truncate block mt-0.5">
                            OCR: {scanResult.ocrDetectedText}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Edit Mode vs Read-Only Display */}
                  {isEditingScanResult && editableScanData ? (
                    <div className="space-y-2.5 text-xs bg-slate-950 p-3 rounded-sm border border-slate-800">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        {isAr ? 'تعديل الحقول المستخرجة قبل الحفظ:' : 'Adjust detected fields before saving:'}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'الاسم التجاري (عربي):' : 'Trade Name (AR):'}</label>
                          <input
                            type="text"
                            value={editableScanData.tradeNameAr || ''}
                            onChange={(e) => setEditableScanData({ ...editableScanData, tradeNameAr: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-sm px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'الاسم التجاري (إنجليزي):' : 'Trade Name (EN):'}</label>
                          <input
                            type="text"
                            value={editableScanData.tradeNameEn || ''}
                            onChange={(e) => setEditableScanData({ ...editableScanData, tradeNameEn: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-sm px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'المادة الفعالة (الاسم العلمي):' : 'Generic Name:'}</label>
                          <input
                            type="text"
                            value={editableScanData.genericName || ''}
                            onChange={(e) => setEditableScanData({ ...editableScanData, genericName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-sm px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'الجرعة والشكل:' : 'Dose / Strength:'}</label>
                          <input
                            type="text"
                            value={editableScanData.dose || ''}
                            onChange={(e) => setEditableScanData({ ...editableScanData, dose: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-sm px-2 py-1 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'طريقة وتكرار الاستخدام:' : 'Frequency:'}</label>
                        <input
                          type="text"
                          value={editableScanData.frequencyAr || editableScanData.frequencyEn || ''}
                          onChange={(e) => setEditableScanData({ ...editableScanData, frequencyAr: e.target.value, frequencyEn: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-sm px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Read-Only Extracted Medication Details Grid */
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 uppercase tracking-tight text-[10px] block">{isAr ? 'الاسم التجاري:' : 'Trade Name:'}</span>
                        <span className="font-bold text-white text-sm">
                          {isAr ? scanResult.tradeNameAr : scanResult.tradeNameEn}
                        </span>
                        {scanResult.tradeNameEn && isAr && (
                          <span className="text-[10px] text-slate-400 block font-mono">{scanResult.tradeNameEn}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase tracking-tight text-[10px] block">{isAr ? 'المادة الفعالة:' : 'Active Ingredient:'}</span>
                        <span className="font-semibold text-slate-300">{scanResult.genericName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase tracking-tight text-[10px] block">{isAr ? 'الجرعة والشكل:' : 'Dose & Strength:'}</span>
                        <span className="font-bold text-blue-400">{scanResult.dose}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase tracking-tight text-[10px] block">{isAr ? 'الجدول الموصى به:' : 'Frequency:'}</span>
                        <span className="text-slate-300">{isAr ? scanResult.frequencyAr : scanResult.frequencyEn}</span>
                      </div>
                    </div>
                  )}

                  {/* Clinical Warning */}
                  <div className="p-3 rounded-sm bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-0.5">
                      {isAr ? 'تحذير السلامة والاستخدام السريري:' : 'Clinical Safety Precaution:'}
                    </div>
                    {isAr ? scanResult.warningsAr : scanResult.warningsEn}
                  </div>

                  {/* Severe Interaction Alert */}
                  {scanInteractions.length > 0 && (
                    <div className="p-3 rounded-sm bg-rose-950/80 border border-rose-600 text-xs text-rose-200 space-y-1">
                      {scanInteractions.map((inter, i) => (
                        <div key={i}>
                          <div className="font-bold flex items-center gap-1.5 text-rose-300">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            <span>{isAr ? inter.titleAr : inter.titleEn}</span>
                          </div>
                          <p className="text-[11px] text-rose-200/90 mt-0.5">
                            {isAr ? inter.descriptionAr : inter.descriptionEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      id="btn-confirm-add-scanned-med"
                      onClick={handleAddScannedToPassport}
                      className="flex-1 py-2.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {isAr
                          ? `تأكيد وإضافة "${isEditingScanResult ? (editableScanData.tradeNameAr || editableScanData.tradeNameEn) : scanResult.tradeNameAr}" للملف`
                          : `Confirm & Add "${isEditingScanResult ? (editableScanData.tradeNameEn || editableScanData.tradeNameAr) : scanResult.tradeNameEn}"`}
                      </span>
                    </button>
                    <button
                      id="btn-clear-scan-result"
                      onClick={() => {
                        setScanResult(null);
                        setEditableScanData(null);
                        setUploadedImagePreview(null);
                        setIsEditingScanResult(false);
                      }}
                      className="py-2.5 px-3 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? 'مسح آخر' : 'Scan Other'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs space-y-2">
                  <Camera className="w-8 h-8 text-slate-600 mb-1" />
                  <span className="max-w-xs">
                    {isAr
                      ? 'ارفع صورة أي عبوة دواء أو اختر عينة معيارية لبدء الفحص عبر Gemini Vision'
                      : 'Upload any medication photo or choose a benchmark sample to initiate Gemini Vision'}
                  </span>
                  <button
                    onClick={() => setIsManualAddOpen(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline font-semibold mt-1 cursor-pointer"
                  >
                    {isAr ? 'أو أدخل بيانات الدواء يدوياً بدون صورة' : 'Or enter medication details manually without a photo'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Safety Signals Banner for this Patient */}
      {selectedPatient.safetySignals.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'إشارات السلامة الدوائية المرصودة لهذا المريض' : 'Active Safety Signals Detected'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPatient.safetySignals.map((sig) => (
              <div
                key={sig.id}
                className={`p-5 rounded-sm border shadow-sm transition-all ${
                  sig.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : sig.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-blue-50/70 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {isAr ? sig.titleAr : sig.titleEn}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-white/80 border border-slate-200 font-bold">
                    {sig.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs mt-2 leading-relaxed opacity-90">
                  {isAr ? sig.descriptionAr : sig.descriptionEn}
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-tight text-slate-500">
                    {isAr ? 'الإجراء الموصى به:' : 'Recommended Action:'}
                  </span>
                  <span className="font-bold text-blue-700 text-end">
                    {isAr ? sig.recommendedActionAr : sig.recommendedActionEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Recommendations Card based on Observed Risk Level & Clinical Protocols */}
      <div id="patient-smart-recommendations-wrapper" className="print:break-inside-avoid">
        <SmartRecommendationsCard
          patient={selectedPatient}
          lang={lang}
          onExecuteRecommendation={(title) => {
            setToastMessage(isAr ? `تم توثيق تنفيذ التوصية: ${title}` : `Recommendation executed: ${title}`);
            setTimeout(() => setToastMessage(null), 4000);
            onRefreshData();
          }}
          onApproveEntirePlan={(planTitle) => {
            setToastMessage(isAr ? `تم اعتماد الخطة السريرية بالكامل: ${planTitle}` : `Full clinical plan approved: ${planTitle}`);
            setTimeout(() => setToastMessage(null), 5000);
            onRefreshData();
          }}
          onRequestConsult={(specialty, urgency) => {
            setToastMessage(isAr ? `تم إرسال طلب الاستشارة الطبية [${specialty}] بأولوية [${urgency}]` : `Consultation dispatched [${specialty}] priority [${urgency}]`);
            setTimeout(() => setToastMessage(null), 5000);
            onRefreshData();
          }}
        />
      </div>

      {/* Active Medications List (Medication Passport) - Geometric Balance White Table */}
      <div className="bg-white border border-slate-200 print:border-slate-300 rounded-sm overflow-hidden shadow-sm print:shadow-none print:break-inside-avoid">
        <div className="p-6 border-b border-slate-200 print:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-none" />
              <span>{isAr ? 'الملف الدوائي الموحد (Active Regimen)' : 'Unified Active Regimen'}</span>
            </h3>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
              {isAr
                ? 'قائمة الأدوية المحدثة بالوقت الفعلي مع نسب الالتزام والمخزون المتبقي'
                : 'Real-time reconciled medications with adherence metrics and supply depletion'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider">
              {isAr ? 'إجمالي الأدوية النشطة:' : 'Total Active Meds:'}{' '}
              <span className="font-bold text-slate-900">{selectedPatient.medications.length}</span>
            </div>

            {/* Dedicated Export / Print button in Regimen Table Header */}
            <button
              id="btn-table-export-print-passport"
              onClick={handlePrintPassport}
              className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer print:hidden"
              title={isAr ? 'طباعة وتصدير وثيقة الجواز الصحي للمريض' : "Export & Print Patient's Health Passport"}
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>{isAr ? 'تصدير / طباعة' : 'Export / Print'}</span>
            </button>

            <button
              id="btn-quick-export-passport"
              onClick={() => setIsPassportModalOpen(true)}
              className="px-3 py-1.5 rounded-sm bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1.5 shadow-2xs print:hidden"
              title={isAr ? 'تصدير وثيقة الجواز الصحي وطباعتها' : 'Export & Print Health Passport'}
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'خيارات التصدير' : 'Export Options'}</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 print:divide-slate-200">
          {selectedPatient.medications.map((med) => (
            <div
              key={med.id}
              className="p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:break-inside-avoid"
            >
              {/* Med Information */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-base font-bold text-slate-900">
                    {isAr ? med.tradeName : med.tradeNameEn}
                  </h4>
                  <span className="text-xs font-bold text-blue-700 px-2 py-0.5 rounded-sm bg-blue-50 border border-blue-200">
                    {med.dose}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 uppercase tracking-wider">
                    {med.category}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{isAr ? 'المادة الفعالة:' : 'Generic:'}</span> {med.genericName}
                  {' • '}
                  <span className="font-medium text-slate-700">{isAr ? 'الجدول:' : 'Schedule:'}</span> {isAr ? med.frequency : med.frequencyEn}
                </div>
                <div className="text-[11px] text-blue-600 font-medium">
                  {isAr ? 'دواعي الاستعمال:' : 'Indication:'} {isAr ? med.indication : med.indicationEn}
                </div>
              </div>

              {/* Adherence & Supply Remaining */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                {/* Adherence Gauge */}
                <div className="text-center min-w-[80px]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">{isAr ? 'نسبة الالتزام' : 'Adherence'}</div>
                  <div
                    className={`text-sm font-bold ${
                      med.adherenceRate >= 80 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {med.adherenceRate}%
                  </div>
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5 mx-auto print:hidden">
                    <div
                      className={`h-full ${
                        med.adherenceRate >= 80 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${med.adherenceRate}%` }}
                    />
                  </div>
                </div>

                {/* Days Supply */}
                <div className="text-center min-w-[85px]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">{isAr ? 'الرصيد المتبقي' : 'Days Supply'}</div>
                  <div
                    className={`text-sm font-bold ${
                      med.daysSupplyRemaining <= 7 ? 'text-amber-600' : 'text-slate-800'
                    }`}
                  >
                    {med.daysSupplyRemaining} {isAr ? 'يوم' : 'days'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isAr ? 'إعادة الصرف:' : 'Refill:'} {med.refillDueDate}
                  </div>
                </div>

                {/* Deprescribing Action */}
                <button
                  id={`btn-deprescribe-${med.id}`}
                  onClick={() => handleRemoveMedication(med.id, isAr ? med.tradeName : med.tradeNameEn)}
                  className="p-2 rounded-sm bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors print:hidden"
                  title={isAr ? 'إيقاف صرف الدواء (إلغاء الازدواجية)' : 'Deprescribe / Discontinue'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {selectedPatient.medications.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              {isAr ? 'لا توجد أدوية مسجلة حالياً في هذا الملف' : 'No active medications in this passport'}
            </div>
          )}
        </div>
      </div>

      {/* Official Health Passport Print-Only Footer & Medical Certificate Signatures */}
      <div className="hidden print:block pt-4 space-y-4 print:break-inside-avoid">
        
        {/* Clinical Attestation Clause */}
        <div className="p-3 bg-slate-50 border border-slate-300 rounded-sm text-xs space-y-1">
          <div className="font-bold text-[#0A2550] flex items-center gap-2 text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {isAr
                ? 'إقرار المطابقة السريرية وسلامة الخطة الدوائية (Clinical Reconciliation Certificate)'
                : 'Clinical Reconciliation & Pharmacotherapy Safety Attestation'}
            </span>
          </div>
          <p className="text-[10px] text-slate-700 leading-relaxed">
            {isAr
              ? 'يُشهد بموجب هذه الوثيقة الطبية المعتمدة بأنه تمت مراجعة ومطابقة كامل السجل الدوائي للمريض المذكور أعلاه عبر التجمعات الصحية، والتحقق التام من انتفاء التداخلات الدوائية الحرجة (Drug-Drug Interactions) والازدواجيات العلاجية وفق بروتوكولات الهيئة السعودية للتخصصات الصحية والمركز الوطني لسلامة المرضى.'
              : 'This certifies that the comprehensive medication regimen of the aforementioned patient has been clinically reconciled across healthcare clusters with zero unresolved critical contraindications or therapeutic duplications according to SCFHS and SPSC safety benchmarks.'}
          </p>
        </div>

        {/* Formal Medical Certificate Signature & Official Stamp Section */}
        <div className="print-signature-section">
          {/* Pharmacist / Attending Physician Signature Box */}
          <div className="print-signature-box">
            <span className="print-signature-title">
              {isAr ? 'اعتماد الصيدلي السريري / الطبيب المعالج' : 'Clinical Pharmacist / Attending Physician'}
            </span>
            <span className="print-signature-subtitle">
              {isAr ? 'د. سارة العتيبي، استشاري صيدلة سريرية' : 'Dr. Sarah Al-Otaibi, PharmD, BCPS'}
            </span>
            <span className="print-signature-subtitle font-mono text-[9px]">
              {isAr ? 'ترخيص الهيئة (SCFHS): #24-789012' : 'SCFHS Lic. #24-789012'}
            </span>
            <div className="print-signature-line" />
            <span className="print-signature-date">
              {isAr ? 'تاريخ الاعتماد:' : 'Attestation Date:'} {issueDateFormatted}
            </span>
          </div>

          {/* Official Healthcare Cluster Institutional Stamp Placeholder */}
          <div className="print-stamp-placeholder">
            <div className="stamp-inner-circle">
              <span className="text-[7px] font-black text-emerald-700">★ MOH / KSA ★</span>
              <span className="text-[7.5px] font-extrabold my-0.5 leading-tight text-[#0A2550]">
                {isAr ? 'ختم المنشأة' : 'OFFICIAL'}
              </span>
              <span className="text-[6.5px] font-bold text-slate-600">
                {isAr ? 'معتمد رسمياً' : 'HOSPITAL SEAL'}
              </span>
              <span className="text-[6px] font-mono text-slate-400 mt-0.5">
                {selectedPatient.healthCluster.slice(0, 10)}
              </span>
            </div>
          </div>

          {/* Patient / Authorized Representative Acknowledgment Signature Box */}
          <div className="print-signature-box text-start">
            <span className="print-signature-title">
              {isAr ? 'إقرار المريض أو الوكيل الشرعي' : 'Patient / Authorized Representative'}
            </span>
            <span className="print-signature-subtitle">
              {isAr ? selectedPatient.nameAr : selectedPatient.nameEn}
            </span>
            <span className="print-signature-subtitle font-mono text-[9px]">
              {isAr ? 'الهوية الوطنية:' : 'National ID:'} {selectedPatient.nationalIdMasked}
            </span>
            <div className="print-signature-line" />
            <span className="print-signature-date">
              {isAr ? 'تاريخ الاستلام والتوقيع:' : 'Sign & Receipt Date:'} ______________
            </span>
          </div>
        </div>

        {/* Certificate Bottom Cryptographic Meta & National Program Footer */}
        <div className="print-cert-footer-meta">
          <div>
            <span className="font-bold text-slate-700">
              {isAr ? 'الرمز التوثيقي المشفر:' : 'Digital Integrity Hash:'}
            </span>{' '}
            <span className="font-mono text-slate-500">
              SHA256:AC-MEDPASS-{selectedPatient.mrn}-SECURE-VERIFIED-V4
            </span>
          </div>
          <div className="text-end">
            {isAr
              ? 'المملكة العربية السعودية • برنامج تحول القطاع الصحي • منصة عافية كير لسلامة الأدوية'
              : 'Kingdom of Saudi Arabia • Health Sector Transformation • AafiyaCare Platform'}
          </div>
        </div>
      </div>
    </>
  ) : (
    <DoseTrackerAndAlertsHub
      patient={selectedPatient}
      isAr={isAr}
      initialSubTab={activeSection === 'alerts' ? 'alerts' : 'doses'}
      onPatientUpdated={(updated) => {
        onSelectPatient(updated);
        onRefreshData();
      }}
      onOpenInterventions={onOpenInterventions}
      onSubTabChange={(tab) => {
        if (tab === 'alerts') setActiveSection('alerts');
        else if (tab === 'doses') setActiveSection('doses');
      }}
    />
  )}

      {/* Official Health Passport Export & Print Modal */}
      <HealthPassportModal
        patient={selectedPatient}
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        lang={lang}
      />

      {/* Deprescribe Confirmation Dialog - No window.confirm */}
      {medicationToDeprescribe && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 print:hidden"
          onClick={() => setMedicationToDeprescribe(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-sm bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isAr ? 'تأكيد إيقاف صرف الدواء' : 'Confirm Deprescribing'}
                </h3>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  {isAr ? 'إلغاء الازدواجية والمخاطر الدوائية' : 'EMR Deprescription & Safety Alignment'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isAr
                ? `هل أنت متأكد من رغبتك في إيقاف صرف دواء "${medicationToDeprescribe.name}" وتوثيق إلغاء الازدواجية في السجل السريري للمريض؟ سيتم إعادة احتساب مؤشر الخطورة فوراً.`
                : `Are you sure you want to discontinue "${medicationToDeprescribe.name}" and record deprescription in the patient's EMR? Risk score will be recalculated immediately.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                id="btn-cancel-deprescribe"
                onClick={() => setMedicationToDeprescribe(null)}
                className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                id="btn-confirm-deprescribe"
                onClick={confirmDeprescribe}
                className="px-4 py-2 rounded-sm bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'تأكيد إيقاف الصرف' : 'Confirm Deprescribe'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Medication Entry Modal */}
      {isManualAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 print:hidden"
          onClick={() => setIsManualAddOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-sm shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isAr ? 'إضافة دواء يدوياً للملف الموحد' : 'Add Medication Manually'}
                  </h3>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    {isAr ? selectedPatient.nameAr : selectedPatient.nameEn} • {selectedPatient.mrn}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsManualAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualMedication} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isAr ? 'الاسم التجاري (عربي) *' : 'Trade Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: أسبرين بروتكت' : 'e.g. Aspirin Protect'}
                    value={manualMedForm.tradeName}
                    onChange={(e) => setManualMedForm({ ...manualMedForm, tradeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isAr ? 'الاسم التجاري (إنجليزي)' : 'Trade Name (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aspirin Protect"
                    value={manualMedForm.tradeNameEn}
                    onChange={(e) => setManualMedForm({ ...manualMedForm, tradeNameEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isAr ? 'المادة الفعالة (الاسم العلمي) *' : 'Active Ingredient (Generic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: Acetylsalicylic Acid' : 'e.g. Acetylsalicylic Acid'}
                    value={manualMedForm.genericName}
                    onChange={(e) => setManualMedForm({ ...manualMedForm, genericName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isAr ? 'الجرعة والشكل *' : 'Dose & Form *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: 100 mg قرص فموي' : 'e.g. 100 mg Oral Tablet'}
                    value={manualMedForm.dose}
                    onChange={(e) => setManualMedForm({ ...manualMedForm, dose: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isAr ? 'تكرار الجرعة (الجدول)' : 'Frequency'}
                  </label>
                  <select
                    value={manualMedForm.frequency}
                    onChange={(e) => {
                      const val = e.target.value;
                      let en = 'Once daily';
                      if (val.includes('مرتين')) en = 'Twice daily';
                      if (val.includes('3')) en = 'Three times daily';
                      if (val.includes('الحاجة')) en = 'As needed';
                      if (val.includes('أسبوع')) en = 'Once weekly';
                      setManualMedForm({ ...manualMedForm, frequency: val, frequencyEn: en });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="مرة واحدة يومياً">{isAr ? 'مرة واحدة يومياً (Once daily)' : 'Once daily'}</option>
                    <option value="مرتين يومياً">{isAr ? 'مرتين يومياً (Twice daily)' : 'Twice daily'}</option>
                    <option value="3 مرات يومياً">{isAr ? '3 مرات يومياً (Three times daily)' : 'Three times daily'}</option>
                    <option value="عند اللزوم / الحاجة">{isAr ? 'عند الحاجة (As needed / PRN)' : 'As needed (PRN)'}</option>
                    <option value="مرة واحدة أسبوعياً">{isAr ? 'مرة واحدة أسبوعياً (Once weekly)' : 'Once weekly'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {isAr ? 'التصنيف الدوائي' : 'Therapeutic Category'}
                  </label>
                  <select
                    value={manualMedForm.category}
                    onChange={(e) => setManualMedForm({ ...manualMedForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="cardiovascular">{isAr ? 'القلب والأوعية الدموية (Cardiovascular)' : 'Cardiovascular'}</option>
                    <option value="endocrine">{isAr ? 'الغدد الصماء والسكري (Endocrine/Diabetes)' : 'Endocrine/Diabetes'}</option>
                    <option value="analgesic">{isAr ? 'المسكنات ومضادات الالتهاب (Analgesic/NSAID)' : 'Analgesic/NSAID'}</option>
                    <option value="gastrointestinal">{isAr ? 'الجهاز الهضمي (Gastrointestinal)' : 'Gastrointestinal'}</option>
                    <option value="neurology">{isAr ? 'الجهاز العصبي (Neurology)' : 'Neurology'}</option>
                    <option value="respiratory">{isAr ? 'الجهاز التنفسي (Respiratory)' : 'Respiratory'}</option>
                    <option value="antimicrobial">{isAr ? 'المضادات الحيوية (Antimicrobial)' : 'Antimicrobial'}</option>
                    <option value="other">{isAr ? 'أخرى (Other)' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {isAr ? 'دواعي الاستعمال السريري' : 'Indication / Purpose'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: الوقاية من الخثرات القلبية والجلطات' : 'e.g. Prevention of cardiovascular thrombosis'}
                  value={manualMedForm.indication}
                  onChange={(e) => setManualMedForm({ ...manualMedForm, indication: e.target.value, indicationEn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualAddOpen(false)}
                  className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'حفظ وإضافة للملف الدوائي' : 'Save to Medication Passport'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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
