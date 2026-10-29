/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AafiyaCareLogo } from './components/AafiyaCareLogo';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MedicationPassportView } from './components/MedicationPassportView';
import { RiskEngineView } from './components/RiskEngineView';
import { InterventionsModal } from './components/InterventionsModal';
import { EnterpriseMetricsView } from './components/EnterpriseMetricsView';
import { TeamAndSecurityView } from './components/TeamAndSecurityView';
import { PatientPortalView } from './components/PatientPortalView';
import { ProjectTourModal } from './components/ProjectTourModal';
import { ProjectSummaryModal } from './components/ProjectSummaryModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { Patient, Intervention, PlatformKPIs, Language } from './types';
import { initialPatients, initialInterventions, initialKPIs } from './data/mockData';
import { api } from './services/api';
import { generatePatientRiskAlerts, HealthRiskAlert } from './services/riskAlertEngine';
import { Activity, ShieldCheck, HeartHandshake, Sparkles, Compass, FileText, Bell, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(initialPatients[0]);
  const [interventions, setInterventions] = useState<Intervention[]>(initialInterventions);
  const [kpis, setKPIs] = useState<PlatformKPIs>(initialKPIs);
  const [preselectedInterventionId, setPreselectedInterventionId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<Set<string>>(new Set());
  const [escalatedAlertIds, setEscalatedAlertIds] = useState<Set<string>>(new Set());
  const [simulatedAlerts, setSimulatedAlerts] = useState<HealthRiskAlert[]>([]);
  const [realTimeToastAlert, setRealTimeToastAlert] = useState<HealthRiskAlert | null>(null);

  const isAr = lang === 'ar';

  // Compute live risk alerts from patient cohort data combined with live simulated signals
  const riskAlerts = useMemo(() => {
    const rawAlerts = [...simulatedAlerts, ...generatePatientRiskAlerts(patients)];
    return rawAlerts.map(alert => ({
      ...alert,
      status: acknowledgedAlertIds.has(alert.id)
        ? ('acknowledged' as const)
        : escalatedAlertIds.has(alert.id)
        ? ('escalated' as const)
        : alert.status
    }));
  }, [patients, acknowledgedAlertIds, escalatedAlertIds, simulatedAlerts]);

  const activeRiskAlertsCount = useMemo(() => {
    return riskAlerts.filter(a => a.status !== 'acknowledged').length;
  }, [riskAlerts]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAcknowledgedAlertIds(prev => new Set(prev).add(alertId));
  };

  const handleEscalateAlert = (alertId: string) => {
    setEscalatedAlertIds(prev => new Set(prev).add(alertId));
  };

  const handleOpenRiskAlerts = () => {
    setIsNotificationCenterOpen(true);
  };

  // Simulate an incoming live clinical risk alert for demo and live test
  const handleSimulateNewAlert = () => {
    const targetPatient = patients[1] || patients[0];
    const newAlert: HealthRiskAlert = {
      id: `LIVE-RISK-${Date.now()}`,
      patientId: targetPatient.id,
      patientNameAr: targetPatient.nameAr,
      patientNameEn: targetPatient.nameEn,
      mrn: targetPatient.mrn,
      age: targetPatient.age,
      gender: targetPatient.gender,
      healthClusterAr: targetPatient.healthCluster,
      healthClusterEn: targetPatient.healthClusterEn,
      riskLevel: 'high',
      category: 'vital_warning',
      severity: 'critical',
      titleAr: 'تنبيه سريري فوري: رصد ارتفاع حرج في ضغط الدم (182/105) مع تفويت علاج الضغط',
      titleEn: 'Stat Clinical Alert: Hypertensive Crisis (182/105) with Antihypertensive Non-Adherence',
      descriptionAr: `تم التقاط مؤشر حيوي حرج وارد من جهاز المريض (${targetPatient.nameAr}) بالتزامن مع عدم تأكيد جرعة الضغط الصباحية.`,
      descriptionEn: `Critical vitals telemetry captured from patient (${targetPatient.nameEn}) home sensor with omitted morning antihypertensive dose.`,
      clinicalRationaleAr: 'ارتفاع الضغط الانقباضي فوق 180 مع عدم الالتزام الدوائي يرفع خطر الحوادث الوعائية الدماغية الحادة.',
      clinicalRationaleEn: 'Severe systolic spike >180 mmHg accompanied by dose cessation risks acute ischemic stroke.',
      earlyDetectionWindowAr: 'رصد فوري: نافذة تدخل عاجلة (خلال 60 دقيقة)',
      earlyDetectionWindowEn: 'Immediate interception: 60-minute golden window',
      recommendedActionAr: 'الاتصال الفوري بالمريض للتحقق من تناول الجرعة، وتوجيهه لأقرب مركز رعاية عاجلة إذا استمرت القراءة مرتفعة.',
      recommendedActionEn: 'Stat patient outreach, re-evaluate dose adherence, route to urgent care if BP remains elevated.',
      evidenceTags: ['ضغط دم 182/105', 'أميلوديبين تفويت', 'خطر سكتة'],
      detectedAt: new Date().toISOString(),
      status: 'active',
      potentialCostAvoidanceSAR: 35000,
      medicationNames: ['Amlodipine 10mg', 'Cozaar 50mg']
    };

    setSimulatedAlerts((prev) => [newAlert, ...prev]);
    setRealTimeToastAlert(newAlert);

    // Auto dismiss toast after 8 seconds
    setTimeout(() => {
      setRealTimeToastAlert((prev) => (prev?.id === newAlert.id ? null : prev));
    }, 8000);
  };

  // Load live data from Cloud Express backend
  const loadData = async () => {
    try {
      const [ptsData, kpisData, intData] = await Promise.all([
        api.getPatients(),
        api.getKPIs(),
        api.getInterventions()
      ]);
      if (ptsData?.patients) {
        setPatients(ptsData.patients);
        // Retain current selected patient or update
        setSelectedPatient((prev) => {
          const found = ptsData.patients.find((p) => p.id === prev.id);
          return found || ptsData.patients[0];
        });
      }
      if (kpisData) setKPIs(kpisData);
      if (intData?.interventions) setInterventions(intData.interventions);
    } catch (e) {
      console.warn('API sync warning, using local state fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Set document title and direction
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  const handleSelectPatientForPassport = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentTab('passport');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenInterventionForPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    let matching = interventions.find((i) => i.patientId === patient.id);
    if (!matching) {
      const newIntervention: Intervention = {
        id: `INT-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        patientNameAr: patient.nameAr,
        patientNameEn: patient.nameEn,
        signalId: `SIG-${Date.now().toString().slice(-4)}`,
        riskLevel: patient.riskLevel,
        typeAr: 'مراجعة سريرية طارئة لمخاطر التداخلات والالتزام',
        typeEn: 'Urgent Clinical Pharmacist Risk Intervention',
        triggerReasonAr: patient.riskDriversAr?.[0] || 'تم رصد مؤشر خطورة يستدعي تدخل الصيدلي السريري فوراً',
        triggerReasonEn: patient.riskDriversEn?.[0] || 'Clinical risk trigger flagged requiring immediate pharmacist review',
        proposedActionAr: 'مراجعة التوفيق الدوائي واستشارة الطبيب المعالج والاتصال بالمريض',
        proposedActionEn: 'Perform medication reconciliation, notify attending physician, and counsel patient',
        costAvoidanceSAR: patient.riskScore > 75 ? 24500 : 12000,
        status: 'pending',
        assignedPharmacistAr: 'د. رزان الغامدي (صيدلي سريري)',
        assignedPharmacistEn: 'Dr. Razan Al-Ghamdi (Clinical Pharmacist)',
        createdAt: new Date().toISOString()
      };
      setInterventions((prev) => [newIntervention, ...prev]);
      matching = newIntervention;
    }
    setPreselectedInterventionId(matching.id);
    setCurrentTab('interventions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
    if (selectedPatient?.id === updatedPatient.id) {
      setSelectedPatient(updatedPatient);
    }
  };

  const pendingInterventionsCount = interventions.filter((i) => i.status === 'pending').length;

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 ${isAr ? 'font-sans' : 'font-sans'}`}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        pendingInterventionsCount={pendingInterventionsCount}
        activeRiskAlertsCount={activeRiskAlertsCount}
        onOpenRiskAlerts={handleOpenRiskAlerts}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            patients={patients}
            kpis={kpis}
            lang={lang}
            alerts={riskAlerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onSelectPatient={handleSelectPatientForPassport}
            onOpenIntervention={handleOpenInterventionForPatient}
            onOpenTour={() => setIsTourOpen(true)}
            onOpenSummary={() => setIsSummaryOpen(true)}
            onOpenNotificationCenter={handleOpenRiskAlerts}
            onOpenPatientPortal={(patient) => {
              setSelectedPatient(patient);
              setCurrentTab('patient-portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'passport' && (
          <MedicationPassportView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            lang={lang}
            onRefreshData={loadData}
            onOpenInterventions={() => {
              setCurrentTab('interventions');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPatientPortal={() => {
              setCurrentTab('patient-portal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'risk-engine' && <RiskEngineView lang={lang} />}

        {currentTab === 'interventions' && (
          <InterventionsModal
            interventions={interventions}
            lang={lang}
            onRefreshData={loadData}
            preselectedInterventionId={preselectedInterventionId}
          />
        )}

        {currentTab === 'patient-portal' && (
          <PatientPortalView
            patient={selectedPatient || patients[0]}
            patients={patients}
            onSelectPatient={setSelectedPatient}
            lang={lang}
            onPatientUpdated={handlePatientUpdated}
            onNavigateToDashboard={() => {
              setCurrentTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'enterprise' && <EnterpriseMetricsView kpis={kpis} lang={lang} />}

        {currentTab === 'team-security' && <TeamAndSecurityView lang={lang} />}
      </main>

      {/* Interactive Project Tour Modal */}
      <ProjectTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        lang={lang}
        currentTab={currentTab}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSummary={() => {
          setIsTourOpen(false);
          setIsSummaryOpen(true);
        }}
      />

      {/* Comprehensive Project Summary Dossier Modal */}
      <ProjectSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        lang={lang}
        onStartTour={() => {
          setIsSummaryOpen(false);
          setIsTourOpen(true);
        }}
      />

      {/* Pop-up Clinical Risk Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        alerts={riskAlerts}
        patients={patients}
        lang={lang}
        onSelectPatient={handleSelectPatientForPassport}
        onOpenIntervention={handleOpenInterventionForPatient}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onSimulateNewAlert={handleSimulateNewAlert}
        onEscalateAlert={handleEscalateAlert}
      />

      {/* Real-Time Incoming Risk Alert Toast Banner */}
      {realTimeToastAlert && (
        <div
          id="realtime-incoming-alert-toast"
          role="alert"
          aria-live="assertive"
          className="fixed bottom-20 md:bottom-6 start-4 sm:start-6 z-50 max-w-sm sm:max-w-md bg-slate-950 text-white border-2 border-rose-500 shadow-2xl rounded-sm p-4 animate-bounce-short transition-all cursor-pointer"
          onClick={() => {
            setIsNotificationCenterOpen(true);
            setRealTimeToastAlert(null);
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-4 h-4 animate-ping" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded-sm bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                    {isAr ? 'إنذار خطر فوري' : 'Live Risk Trigger'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isAr ? 'الآن' : 'Just now'}
                  </span>
                </div>
                <h5 className="font-bold text-xs sm:text-sm text-white leading-snug">
                  {isAr ? realTimeToastAlert.titleAr : realTimeToastAlert.titleEn}
                </h5>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {isAr ? realTimeToastAlert.descriptionAr : realTimeToastAlert.descriptionEn}
                </p>
                <div className="pt-1.5 flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300">
                  <span>{isAr ? 'انقر لفتح مركز الإشعارات والتفاعل السريري ←' : 'Click to open Notification Center & respond →'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              id="btn-dismiss-toast"
              onClick={(e) => {
                e.stopPropagation();
                setRealTimeToastAlert(null);
              }}
              className="w-6 h-6 rounded-sm text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title={isAr ? 'إغلاق' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Persistent Footer with Official Branding & Geometric Balance Aesthetics */}
      <footer className="border-t border-slate-200 bg-white py-6 pb-24 md:pb-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <AafiyaCareLogo 
              id="footer-brand-logo"
              variant="horizontal" 
              size="sm" 
              theme="light-bg" 
              isAr={isAr} 
            />
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-[11px]">
              {isAr
                ? 'نكتشف الخطر قبل أن يصبح أزمة • برنامج تحول القطاع الصحي 2030'
                : 'Early Risk Intelligence • Health Sector Transformation 2030'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-slate-500 flex-wrap justify-end">
            <button
              id="footer-btn-tour"
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold px-2 py-1 rounded-sm bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'جولة المشروع التفاعلية' : 'Guided Tour'}</span>
            </button>

            <button
              id="footer-btn-summary"
              onClick={() => setIsSummaryOpen(true)}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-bold px-2 py-1 rounded-sm bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? 'ملخص المشروع كاملاً' : 'Full Dossier'}</span>
            </button>

            <span className="text-slate-300">|</span>
            <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200 font-medium">
              {isAr ? 'معايير FHIR R4 ومجلس الضمان' : 'FHIR R4 & CHI Standards'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-600 font-mono font-bold">MVP v2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
