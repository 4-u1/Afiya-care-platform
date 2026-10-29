import React, { useState, useEffect } from 'react';
import { AafiyaCareLogo } from './AafiyaCareLogo';
import {
  Users,
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  FileCode,
  CheckCircle2,
  Cpu,
  Database,
  Terminal,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Language, AuditLog } from '../types';
import { api } from '../services/api';

interface TeamAndSecurityViewProps {
  lang: Language;
}

export const TeamAndSecurityView: React.FC<TeamAndSecurityViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const teamMembers = [
    {
      id: 1,
      nameAr: 'عبدالعزيز لاحق المطيري',
      nameEn: 'Abdulaziz Lahik Al-Mutairi',
      roleAr: 'قائد الفريق — تقنية معلومات',
      roleEn: 'Team Leader — Information Technology',
      descAr:
        'قيادة المشروع وإدارة الفريق، بناء نموذج العمل والشراكات مع الجهات الصحية، والإشراف على التكامل مع أنظمة المستشفيات، وتمثيل المشروع أمام لجنة التحكيم.',
      descEn:
        'Project leadership, business model & health sector partnerships, hospital integration supervision, and pitch representation.',
      tag: 'Leadership & Strategy'
    },
    {
      id: 2,
      nameAr: 'مشاري خالد العصيمي',
      nameEn: 'Mishari Khalid Al-Otaibi',
      roleAr: 'علوم حاسب — قائد الذكاء الاصطناعي',
      roleEn: 'Computer Science — AI & Risk Lead',
      descAr:
        'قيادة تطوير الذكاء الاصطناعي وبناء محرك المخاطر ونماذج التنبؤ، وتصميم منطق تصنيف المرضى حسب درجة الخطورة.',
      descEn:
        'AI engine engineering, predictive relapse models, risk stratification logic, and machine learning pipelines.',
      tag: 'AI & Prediction Engine'
    },
    {
      id: 3,
      nameAr: 'يزيد حمد الحارثي',
      nameEn: 'Yazeed Hamad Al-Harthi',
      roleAr: 'هندسة حاسب — البنية الآمنة والسيبرانية',
      roleEn: 'Computer Engineering — Backend & Security',
      descAr:
        'تصميم البنية الخلفية والبنية التحتية الآمنة، بناء واجهات برمجة التطبيقات، وتطبيق معايير الأمن السيبراني لحماية بيانات المرضى.',
      descEn:
        'Secure backend architecture, robust RESTful & FHIR APIs, end-to-end encryption, and patient health data protection.',
      tag: 'Secure Backend & Cyber'
    },
    {
      id: 4,
      nameAr: 'أصيل سمير الحارثي',
      nameEn: 'Aseel Samir Al-Harthi',
      roleAr: 'هندسة حاسب — تجربة المريض والرؤية الحاسوبية',
      roleEn: 'Computer Engineering — Frontend & Vision UI',
      descAr:
        'تطوير تطبيق المريض والواجهات الأمامية، بناء تجربة الملف الدوائي الرقمي، ودمج خاصية التعرف على الأدوية بالرؤية الحاسوبية.',
      descEn:
        'Medication Passport frontend engineering, computer vision drug packaging scanner integration, and clinical UX design.',
      tag: 'Med Passport & Vision UX'
    },
    {
      id: 5,
      nameAr: 'فهد تركي الخماش',
      nameEn: 'Fahad Turki Al-Khammash',
      roleAr: 'تقنية معلومات — السحابة وقواعد البيانات',
      roleEn: 'IT — Cloud & Database Architecture',
      descAr:
        'إدارة قواعد البيانات والبنية السحابية، والإشراف على تكامل البيانات مع الجهات الصحية وضمان استمرارية أداء المنصة.',
      descEn:
        'Cloud database administration, local health cloud compliance, high-availability infrastructure, and data pipeline ops.',
      tag: 'Cloud & Hospital Data'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Team Header - Geometric Balance White Panel */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AafiyaCareLogo 
            id="team-header-badge"
            variant="badge" 
            size="sm" 
            isAr={isAr} 
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAr ? 'فريق العمل والبنية السحابية الموثوقة' : 'Our Team & Secure Cloud Architecture'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
              {isAr
                ? 'فريق تقني متكامل يجمع بين الذكاء الاصطناعي، الأمن السيبراني، وهندسة النظم الصحية'
                : 'Multidisciplinary engineering team bridging Health Informatics, AI, and Cybersecurity'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider font-mono">
            NCA ECC-1:2018 Compliant
          </span>
        </div>
      </div>

      {/* Team Members Grid (Slide 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-sm bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-6 h-6 rounded-none bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                  0{member.id}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  {member.tag}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {isAr ? member.nameAr : member.nameEn}
              </h3>
              <div className="text-xs font-bold text-blue-600 mt-0.5">
                {isAr ? member.roleAr : member.roleEn}
              </div>

              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                {isAr ? member.descAr : member.descEn}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono uppercase">
              <span>{isAr ? 'عافية كير | AafiyaCare' : 'AafiyaCare Core Team'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Technical Architecture & Compliance (Slide 13) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {isAr ? 'البنية التقنية ولغات البرمجة والمعايير' : 'Technical Stack & Standards'}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Enterprise Healthcare Cloud & FHIR R4 Interoperability
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 font-mono uppercase tracking-wider font-bold">
              HL7 / FHIR R4 Compliant
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: AI & Data */}
          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'الذكاء الاصطناعي والبيانات' : 'AI & Data Engine'}</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1 font-mono">
              <li>• Google Gemini 2.5 Flash (Multimodal Vision OCR)</li>
              <li>• Clinical Risk Decision Classifier</li>
              <li>• Drug-Drug Interaction Knowledge Base</li>
              <li>• PostgreSQL & High-Speed Session Cache</li>
            </ul>
          </div>

          {/* Column 2: System & Frontend */}
          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Server className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'الواجهات والنظام الأساسي' : 'Platform & Runtime'}</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1 font-mono">
              <li>• TypeScript & Node.js Express REST API</li>
              <li>• React 19 + Tailwind CSS + Motion</li>
              <li>• Responsive RTL/LTR Internationalization</li>
              <li>• Microservices Gateway Ready</li>
            </ul>
          </div>

          {/* Column 3: Security & Interoperability */}
          <div className="p-5 rounded-sm bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'التكامل والأمن السيبراني' : 'Cybersecurity & Integration'}</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-1 font-mono">
              <li>• HL7 / FHIR R4 Resource Mapping</li>
              <li>• AES-256 GCM In-transit & At-Rest Encryption</li>
              <li>• Role-Based Access Control (RBAC)</li>
              <li>• Saudi Cloud Regulatory Compliance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live Cryptographic Audit Trail (Slide 2 & 13) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'سجل التدقيق الأمني المشفر (FHIR Cryptographic Audit Trail)' : 'Cryptographic Audit Trail (FHIR)'}
              </h3>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {isAr
                  ? 'بإشراف مهندس الأمن السيبراني يزيد الحارثي — توثيق مشفر لكل عملية وصول لبيانات المرضى'
                  : 'Immutable SHA-256 audit log protecting patient privacy & regulatory compliance'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-start font-bold uppercase">{isAr ? 'المعرف' : 'ID'}</th>
                <th className="px-3 py-2.5 text-start font-bold uppercase">{isAr ? 'التوقيت' : 'Timestamp'}</th>
                <th className="px-3 py-2.5 text-start font-bold uppercase">{isAr ? 'المستخدم / النظام' : 'Actor'}</th>
                <th className="px-3 py-2.5 text-start font-bold uppercase">{isAr ? 'العملية' : 'Action'}</th>
                <th className="px-3 py-2.5 text-start font-bold uppercase">{isAr ? 'مورد FHIR' : 'FHIR Resource'}</th>
                <th className="px-3 py-2.5 text-start font-bold uppercase">{isAr ? 'التوقيع المشفر' : 'Security Hash'}</th>
                <th className="px-3 py-2.5 text-end font-bold uppercase">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 text-slate-900 font-bold">{log.id}</td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2.5 text-blue-600 font-bold">{log.actor}</td>
                  <td className="px-3 py-2.5 text-slate-800">{log.action}</td>
                  <td className="px-3 py-2.5 text-slate-700">{log.fhirResourceId}</td>
                  <td className="px-3 py-2.5 text-slate-400 truncate max-w-[140px]">{log.securityHash}</td>
                  <td className="px-3 py-2.5 text-end">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
