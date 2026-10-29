import React from 'react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import {
  Activity,
  ShieldCheck,
  Pill,
  BrainCircuit,
  Building2,
  Users,
  Globe,
  Sparkles,
  Layers,
  Compass,
  FileText,
  Bell,
  HeartHandshake
} from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  pendingInterventionsCount: number;
  activeRiskAlertsCount?: number;
  onOpenRiskAlerts?: () => void;
  onOpenTour: () => void;
  onOpenSummary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  pendingInterventionsCount,
  activeRiskAlertsCount = 0,
  onOpenRiskAlerts,
  onOpenTour,
  onOpenSummary
}) => {
  const isAr = lang === 'ar';

  const navItems = [
    {
      id: 'dashboard',
      labelAr: 'لوحة التحكم',
      labelFullAr: 'لوحة التحكم السريرية',
      labelEn: 'Dashboard',
      labelFullEn: 'Clinical Dashboard',
      icon: Activity
    },
    {
      id: 'passport',
      labelAr: 'الملف الدوائي',
      labelFullAr: 'الملف الدوائي وفحص AI',
      labelEn: 'Med Passport',
      labelFullEn: 'Medication Passport & AI',
      icon: Pill
    },
    {
      id: 'risk-engine',
      labelAr: 'محرك المخاطر',
      labelFullAr: 'محرك المخاطر المغلق',
      labelEn: 'Risk Engine',
      labelFullEn: 'Risk Engine & Signals',
      icon: BrainCircuit
    },
    {
      id: 'interventions',
      labelAr: 'التدخلات',
      labelFullAr: 'التدخلات السريرية',
      labelEn: 'Interventions',
      labelFullEn: 'Interventions Queue',
      icon: ShieldCheck,
      badge: pendingInterventionsCount
    },
    {
      id: 'patient-portal',
      labelAr: 'واجهة المريض',
      labelFullAr: 'واجهة المريض اليومية (ضغطة واحدة)',
      labelEn: 'Patient Portal',
      labelFullEn: 'Patient Portal (One-Click)',
      icon: HeartHandshake
    },
    {
      id: 'enterprise',
      labelAr: 'مؤشرات التجمع',
      labelFullAr: 'مؤشرات التجمع الصحي',
      labelEn: 'Cluster KPIs',
      labelFullEn: 'Health Cluster KPIs',
      icon: Building2
    },
    {
      id: 'team-security',
      labelAr: 'الأمن والفريق',
      labelFullAr: 'الفريق والأمن السحابي',
      labelEn: 'Team & Security',
      labelFullEn: 'Team & Security',
      icon: Users
    }
  ];

  return (
    <>
      <header className="border-b border-slate-800 bg-[#0F172A] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Top bar with Branding and Badges */}
          <div className="flex items-center justify-between h-15 sm:h-16 border-b border-slate-800/80 gap-2">
            <div
              className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse cursor-pointer shrink-0"
              onClick={() => setCurrentTab('dashboard')}
            >
              <AafiyaCareLogo 
                id="navbar-brand-logo"
                variant="horizontal" 
                size="sm" 
                theme="dark-bg" 
                isAr={isAr}
                showSubtext={true}
                subtext={isAr ? 'منصة الذكاء المبكر للمخاطر الصحية والدوائية' : 'Medication Risk Intelligence'}
              />
              <span className="hidden xl:inline-flex text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold">
                {isAr ? 'طبقة الذكاء الدوائي' : 'Medication Intelligence'}
              </span>
            </div>

            {/* Status Indicators, Project Tour, Project Summary & Language Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Risk Alert System Notification Indicator */}
              {onOpenRiskAlerts && (
                <button
                  id="navbar-btn-risk-alerts"
                  onClick={onOpenRiskAlerts}
                  className={`relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 min-h-[38px] rounded-sm border text-xs font-bold transition-all uppercase tracking-wider cursor-pointer shadow-xs ${
                    activeRiskAlertsCount > 0
                      ? 'bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 border-rose-700/70'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={
                    isAr
                      ? `مركز الإشعارات المنبثق: ${activeRiskAlertsCount} تنبيهات مخاطر نشطة`
                      : `Notification Center: ${activeRiskAlertsCount} active risk alerts`
                  }
                >
                  <div className="relative">
                    <Bell
                      className={`w-3.5 h-3.5 ${
                        activeRiskAlertsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'
                      }`}
                    />
                    {activeRiskAlertsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-[11px]">{isAr ? 'مركز الإشعارات' : 'Notifications'}</span>
                  {activeRiskAlertsCount > 0 && (
                    <span className="flex items-center justify-center min-w-[17px] h-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">
                      {activeRiskAlertsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Interactive Project Tour Button */}
              <button
                id="navbar-btn-tour"
                onClick={onOpenTour}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 min-h-[38px] rounded-sm bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 hover:text-white border border-blue-500/50 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer shadow-xs"
                title={isAr ? 'جولة المشروع التفاعلية' : 'Interactive Guided Tour'}
              >
                <Compass className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span className="hidden xs:inline sm:inline text-[11px]">{isAr ? 'جولة تفاعلية' : 'Tour'}</span>
              </button>

              {/* Patient Portal One-Click Quick Access */}
              <button
                id="navbar-btn-patient-portal"
                onClick={() => setCurrentTab('patient-portal')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 min-h-[38px] rounded-sm border text-xs font-bold transition-all uppercase tracking-wider cursor-pointer shadow-xs ${
                  currentTab === 'patient-portal'
                    ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border-emerald-700/70'
                }`}
                title={isAr ? 'واجهة المريض اليومية: تسجيل الدواء بضغطة زر واحدة' : 'Patient View: One-click medication dose logging'}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline sm:inline text-[11px] font-bold">
                  {isAr ? 'واجهة المريض' : 'Patient View'}
                </span>
              </button>

              {/* Full Project Summary Button */}
              <button
                id="navbar-btn-summary"
                onClick={onOpenSummary}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 min-h-[38px] rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer shadow-xs"
                title={isAr ? 'ملخص المشروع كاملاً والوثيقة السريرية' : 'Full Project Summary & Clinical Dossier'}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">{isAr ? 'الملخص' : 'Dossier'}</span>
              </button>

              {/* Geometric Cloud & System Status Badge */}
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-sm bg-slate-800/50 border border-slate-700 text-xs">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 font-medium text-[11px] uppercase tracking-wider">
                  {isAr ? 'محمي' : 'Secure'}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300 text-[10px] font-mono">FHIR R4</span>
              </div>

              {/* Language toggle button - Geometric styled */}
              <button
                id="lang-toggle-btn"
                onClick={() => {
                  const nextLang = isAr ? 'en' : 'ar';
                  setLang(nextLang);
                  document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
                  document.documentElement.lang = nextLang;
                }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 min-h-[38px] rounded-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
                title="Toggle Language"
              >
                <div className="w-2 h-2 border border-slate-400 transform rotate-45 shrink-0" />
                <span className="font-mono text-xs">{isAr ? 'EN' : 'عربي'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Top Bar for Tablet & Desktop with horizontal scroll for mobile) */}
          <div className="flex items-center space-x-1 rtl:space-x-reverse overflow-x-auto scrollbar-none py-1 sm:py-0">
            {navItems.map((item, index) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs whitespace-nowrap transition-colors rounded-none border-b-2 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border-blue-500 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-rose-600 text-white font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 📱 MOBILE DEDICATED BOTTOM NAVIGATION BAR (Fixed at screen bottom on small devices) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-1.5 px-1 shadow-2xl safe-area-inset-bottom"
        aria-label="Mobile Navigation"
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={`mob-${item.id}`}
              id={`mob-nav-btn-${item.id}`}
              onClick={() => {
                setCurrentTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 px-1 rounded-sm transition-all cursor-pointer relative ${
                isActive
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-tight text-center">
                {isAr ? item.labelAr : item.labelEn}
              </span>
              {isActive && (
                <span className="w-3 h-0.5 bg-blue-400 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
