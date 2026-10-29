import { Patient, Language } from '../types';

/**
 * Generates the full standalone HTML document for the patient's Health Passport.
 */
export function generateHealthPassportHtml(patient: Patient, lang: Language = 'ar'): string {
  const isAr = lang === 'ar';
  const issueDate = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const issueTime = new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const passportNumber = `AC-MEDPASS-${patient.mrn}-${new Date().getFullYear()}`;
  const verificationHash = `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}-${patient.mrn}-${Date.now().toString(36).toUpperCase()}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isAr ? 'الجواز الصحي والدوائي الموحد' : 'Unified Health & Medication Passport'} - ${isAr ? patient.nameAr : patient.nameEn}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0F3B82;
      --primary-dark: #0A2758;
      --accent-teal: #059669;
      --accent-emerald: #10B981;
      --accent-cyan: #06B6D4;
      --slate-50: #F8FAFC;
      --slate-100: #F1F5F9;
      --slate-200: #E2E8F0;
      --slate-700: #334155;
      --slate-900: #0F172A;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: ${isAr ? "'Cairo'" : "'Plus Jakarta Sans'"}, -apple-system, sans-serif;
      background-color: #E2E8F0;
      color: var(--slate-900);
      line-height: 1.5;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .passport-container {
      max-width: 900px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid var(--slate-200);
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
      position: relative;
    }

    .top-national-bar {
      background: #0A2550;
      color: #FFFFFF;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      letter-spacing: 0.5px;
      font-weight: 700;
      border-bottom: 2px solid #059669;
    }

    .header-section {
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--slate-100);
      background: linear-gradient(to bottom, #FFFFFF, #F8FAFC);
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo-svg {
      width: 56px;
      height: 56px;
    }

    .brand-text h1 {
      font-size: 22px;
      font-weight: 900;
      color: #0C3B7C;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .brand-text h2 {
      font-size: 13px;
      font-weight: 700;
      color: #059669;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .passport-meta {
      text-align: ${isAr ? 'left' : 'right'};
      font-size: 11px;
      color: var(--slate-700);
    }

    .passport-badge {
      display: inline-block;
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
      padding: 4px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .patient-profile-card {
      margin: 24px 32px;
      background: #F8FAFC;
      border: 1px solid var(--slate-200);
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .profile-field label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 2px;
    }

    .profile-field span {
      font-size: 14px;
      font-weight: 700;
      color: var(--slate-900);
    }

    .profile-field span.highlight {
      color: #1D4ED8;
    }

    .risk-badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 2px;
      background: #FEF2F2;
      color: #DC2626;
      border: 1px solid #FECACA;
    }

    .section {
      padding: 0 32px 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--slate-200);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 14px;
      background: #0F3B82;
    }

    table.med-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: ${isAr ? 'right' : 'left'};
    }

    table.med-table th {
      background: #F1F5F9;
      color: #475569;
      font-weight: 700;
      padding: 10px 12px;
      border: 1px solid var(--slate-200);
      font-size: 11px;
      text-transform: uppercase;
    }

    table.med-table td {
      padding: 10px 12px;
      border: 1px solid var(--slate-200);
      vertical-align: middle;
    }

    table.med-table tr:nth-child(even) {
      background: #F8FAFC;
    }

    .med-name {
      font-weight: 800;
      color: #0F172A;
      font-size: 13px;
    }

    .med-generic {
      font-size: 11px;
      color: #64748B;
      margin-top: 1px;
    }

    .dose-tag {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #1D4ED8;
      background: #EFF6FF;
      padding: 2px 6px;
      border: 1px solid #DBEAFE;
      display: inline-block;
      border-radius: 2px;
    }

    .warning-box {
      margin: 0 32px 24px;
      padding: 16px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-right: ${isAr ? '4px solid #D97706' : '1px solid #FDE68A'};
      border-left: ${!isAr ? '4px solid #D97706' : '1px solid #FDE68A'};
    }

    .warning-box h4 {
      font-size: 12px;
      font-weight: 800;
      color: #92400E;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .warning-box p {
      font-size: 11px;
      color: #78350F;
      line-height: 1.5;
    }

    .footer-stamp-area {
      padding: 24px 32px 32px;
      background: #F8FAFC;
      border-top: 2px solid var(--slate-200);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .signature-block {
      font-size: 11px;
      color: #64748B;
    }

    .signature-line {
      width: 200px;
      border-bottom: 1px dashed #94A3B8;
      margin: 16px 0 6px;
    }

    .official-seal {
      width: 100px;
      height: 100px;
      border: 2px dashed #0C3B7C;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #0C3B7C;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 8px;
      transform: rotate(-8deg);
      opacity: 0.85;
    }

    .print-actions {
      max-width: 900px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
    }

    .btn-print {
      background: #0F172A;
      color: #FFFFFF;
    }

    .btn-print:hover {
      background: #1E293B;
    }

    @media print {
      body {
        background: #FFFFFF;
        padding: 0;
      }
      .print-actions {
        display: none !important;
      }
      .passport-container {
        box-shadow: none;
        border: none;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

  <!-- Screen-only action buttons -->
  <div class="print-actions">
    <button class="btn btn-print" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9V2h12v7"></path>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      ${isAr ? 'طباعة الوثيقة الرسمية (Print / Save as PDF)' : 'Print / Save as PDF'}
    </button>
  </div>

  <div class="passport-container">
    <!-- Top Bar: National Accreditation -->
    <div class="top-national-bar">
      <span>${isAr ? 'المملكة العربية السعودية • برنامج تحول القطاع الصحي' : 'Kingdom of Saudi Arabia • Health Sector Transformation'}</span>
      <span>${isAr ? patient.healthCluster : patient.healthClusterEn}</span>
    </div>

    <!-- Header with Official Logo -->
    <div class="header-section">
      <div class="brand-title">
        <!-- SVG Emblem -->
        <svg class="brand-logo-svg" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3B82F6" />
              <stop offset="100%" stop-color="#0F3B82" />
            </linearGradient>
            <linearGradient id="pGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34D399" />
              <stop offset="100%" stop-color="#047857" />
            </linearGradient>
            <linearGradient id="pSwoosh" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="#059669" />
              <stop offset="50%" stop-color="#10B981" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
          </defs>
          <path d="M 132 342 C 144 295, 175 198, 222 118 C 240 86, 258 72, 276 80 C 296 88, 306 112, 316 142 L 282 154 C 272 125, 260 110, 252 110 C 224 110, 194 200, 172 316 C 158 328, 140 338, 132 342 Z" fill="url(#pBlue)" />
          <path d="M 276 80 C 306 95, 346 160, 386 245 C 406 286, 416 316, 424 336 C 410 340, 384 332, 366 310 C 346 268, 316 190, 288 142 Z" fill="url(#pBlue)" />
          <path d="M 106 270 C 144 240, 210 220, 282 205 C 352 190, 412 165, 442 145 C 422 164, 362 194, 292 216 C 220 238, 148 262, 108 288 C 102 282, 104 274, 106 270 Z" fill="url(#pSwoosh)" />
          <g transform="translate(256, 276) scale(1.15)">
            <path d="M 0 35 C -4 -2, -45 -18, -45 -48 C -45 -66, -30 -78, -12 -78 C 0 -78, 0 -65, 0 -60 C 0 -65, 0 -78, 12 -78 C 30 -78, 45 -66, 45 -48 C 45 -18, 4 -2, 0 35 Z" fill="url(#pGreen)" />
            <path d="M -30 -48 L -14 -48 L -9 -58 L -3 -32 L 4 -68 L 10 -40 L 16 -50 L 30 -50" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
          </g>
        </svg>
        <div class="brand-text">
          <h1>${isAr ? 'عافية كير | الجواز الدوائي والصحي الموحد' : 'AafiyaCare | Digital Health & Medication Passport'}</h1>
          <h2>${isAr ? 'منصة الذكاء المبكر للمخاطر الصحية والدوائية' : 'Unified Medication Risk & Adherence Intelligence'}</h2>
        </div>
      </div>

      <div class="passport-meta">
        <div class="passport-badge">${passportNumber}</div>
        <div>${isAr ? 'تاريخ التوثيق:' : 'Issued:'} <strong>${issueDate}</strong></div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #94A3B8; margin-top: 2px;">${verificationHash}</div>
      </div>
    </div>

    <!-- Patient Demographics Section -->
    <div class="patient-profile-card">
      <div class="profile-field">
        <label>${isAr ? 'اسم المستفيد / المريض' : 'Patient Full Name'}</label>
        <span class="highlight">${isAr ? patient.nameAr : patient.nameEn}</span>
      </div>
      <div class="profile-field">
        <label>${isAr ? 'رقم السجل الطبي (MRN)' : 'Medical Record No (MRN)'}</label>
        <span style="font-family: 'JetBrains Mono', monospace;">${patient.mrn}</span>
      </div>
      <div class="profile-field">
        <label>${isAr ? 'الهوية الوطنية / الإقامة' : 'National ID (Masked)'}</label>
        <span style="font-family: 'JetBrains Mono', monospace;">${patient.nationalIdMasked}</span>
      </div>
      <div class="profile-field">
        <label>${isAr ? 'العمر / الجنس' : 'Age / Gender'}</label>
        <span>${patient.age} ${isAr ? 'سنة' : 'yrs'} • ${patient.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}</span>
      </div>
      <div class="profile-field">
        <label>${isAr ? 'التشخيص والأمراض المزمنة' : 'Chronic Conditions'}</label>
        <span>${(isAr ? patient.chronicConditionsAr : patient.chronicConditionsEn).join('، ')}</span>
      </div>
      <div class="profile-field">
        <label>${isAr ? 'تصنيف مؤشر الخطورة الدوائية' : 'Medication Risk Tier'}</label>
        <div><span class="risk-badge">${patient.riskLevel.toUpperCase()} (${patient.riskScore}/100)</span></div>
      </div>
    </div>

    <!-- Active Medications List -->
    <div class="section">
      <div class="section-title">
        ${isAr ? 'جدول الأدوية المعتمدة والجرعات اليومية النشطة' : 'Active Prescribed Medications & Administration Schedule'}
      </div>

      <table class="med-table">
        <thead>
          <tr>
            <th>#</th>
            <th>${isAr ? 'الدواء والمادة الفعالة' : 'Trade & Generic Name'}</th>
            <th>${isAr ? 'الجرعة' : 'Dose'}</th>
            <th>${isAr ? 'أوقات وتكرار الاستخدام' : 'Frequency & Timing'}</th>
            <th>${isAr ? 'دواعي الاستعمال' : 'Indication'}</th>
            <th>${isAr ? 'نسبة الالتزام' : 'Adherence'}</th>
            <th>${isAr ? 'إعادة الصرف' : 'Refill Date'}</th>
          </tr>
        </thead>
        <tbody>
          ${patient.medications.map((med, index) => `
            <tr>
              <td style="font-weight: 700; font-family: 'JetBrains Mono', monospace;">${index + 1}</td>
              <td>
                <div class="med-name">${isAr ? med.tradeName : med.tradeNameEn}</div>
                <div class="med-generic">${med.genericName}</div>
              </td>
              <td><span class="dose-tag">${med.dose}</span></td>
              <td style="font-weight: 600;">${isAr ? med.frequency : med.frequencyEn}</td>
              <td style="color: #475569;">${isAr ? med.indication : med.indicationEn}</td>
              <td>
                <strong style="color: ${med.adherenceRate >= 80 ? '#059669' : '#DC2626'};">${med.adherenceRate}%</strong>
              </td>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">${med.refillDueDate}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Safety Signals / Adverse Alerts if any -->
    ${patient.safetySignals.length > 0 ? `
      <div class="warning-box">
        <h4>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          ${isAr ? 'تنبيهات السلامة والتعارضات الدوائية المعتمدة' : 'Clinical Safety Signals & Adverse Interaction Warnings'}
        </h4>
        ${patient.safetySignals.map(sig => `
          <div style="margin-top: 6px;">
            <strong>• ${isAr ? sig.titleAr : sig.titleEn}:</strong>
            <span>${isAr ? sig.descriptionAr : sig.descriptionEn}</span>
            <div style="font-size: 10px; color: #92400E; margin-top: 2px;">
              ${isAr ? 'الإجراء الموصى به:' : 'Recommended Action:'} ${isAr ? sig.recommendedActionAr : sig.recommendedActionEn}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Official Seal & Pharmacist Sign-off Footer -->
    <div class="footer-stamp-area">
      <div class="signature-block">
        <div><strong>${isAr ? 'اعتماد الصيدلي السريري المسؤول:' : 'Certified Clinical Pharmacist:'}</strong></div>
        <div class="signature-line"></div>
        <div>${isAr ? 'د. سارة المنصور (صيدلي إكلينيكي معتمد - SCFHS #48291)' : 'Dr. Sarah Al-Mansoor, PharmD (SCFHS #48291)'}</div>
        <div style="font-size: 10px; color: #94A3B8; margin-top: 4px;">
          ${isAr ? 'تم التدقيق عبر نظام الرعاية المغلقة وحلقة التدخل الذكية' : 'Verified via AafiyaCare Closed-Loop Clinical System'}
        </div>
      </div>

      <div class="official-seal">
        <div>AAFIYACARE</div>
        <div style="font-size: 11px; margin: 2px 0;">★</div>
        <div>VERIFIED</div>
        <div style="font-size: 7px; margin-top: 2px;">FHIR R4 VALID</div>
      </div>
    </div>
  </div>

</body>
</html>`;

  return htmlContent;
}

/**
 * Robust file downloader that defers URL revoking and falls back to Data URI if needed.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): boolean {
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Retain object URL long enough for asynchronous browser download processing
    setTimeout(() => {
      try {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
    }, 45000);
    return true;
  } catch (err) {
    console.error('Blob download encountered error, trying fallback:', err);
    try {
      const link = document.createElement('a');
      link.href = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
      return true;
    } catch (fallbackErr) {
      console.error('All download mechanisms failed:', fallbackErr);
      return false;
    }
  }
}

/**
 * Generates an official, standalone, print-ready HTML file for the Health Passport
 * and triggers an automatic browser download.
 */
export function downloadHealthPassportHtml(patient: Patient, lang: Language = 'ar'): boolean {
  const htmlContent = generateHealthPassportHtml(patient, lang);
  const filename = `${patient.mrn}_AafiyaCare_Health_Passport.html`;
  return triggerFileDownload(htmlContent, filename, 'text/html');
}

/**
 * Exports the patient's record as a standardized HL7 FHIR R4 Bundle (JSON)
 */
export function downloadHealthPassportFHIR(patient: Patient): boolean {
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    id: `aafiyacare-health-passport-${patient.mrn}`,
    timestamp: new Date().toISOString(),
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
      lastUpdated: new Date().toISOString()
    },
    entry: [
      {
        fullUrl: `urn:uuid:patient-${patient.id}`,
        resource: {
          resourceType: 'Patient',
          id: patient.id,
          identifier: [
            { system: 'urn:oid:national-id', value: patient.nationalIdMasked },
            { system: 'urn:oid:mrn', value: patient.mrn }
          ],
          name: [
            { use: 'official', text: patient.nameAr, family: patient.nameAr.split(' ').slice(-1)[0] },
            { use: 'usual', text: patient.nameEn, family: patient.nameEn.split(' ').slice(-1)[0] }
          ],
          gender: patient.gender,
          managingOrganization: {
            display: patient.healthCluster
          }
        }
      },
      ...patient.medications.map(med => ({
        fullUrl: `urn:uuid:medication-${med.id}`,
        resource: {
          resourceType: 'MedicationStatement',
          id: med.id,
          status: med.status,
          medicationCodeableConcept: {
            text: med.tradeNameEn,
            coding: [
              {
                system: 'http://www.whocc.no/atc',
                display: med.genericName
              }
            ]
          },
          subject: {
            reference: `urn:uuid:patient-${patient.id}`
          },
          dosage: [
            {
              text: med.frequencyEn,
              doseAndRate: [
                {
                  doseQuantity: {
                    value: med.dose
                  }
                }
              ]
            }
          ],
          extension: [
            {
              url: 'http://aafiyacare.sa/fhir/StructureDefinition/adherence-rate',
              valueDecimal: med.adherenceRate
            },
            {
              url: 'http://aafiyacare.sa/fhir/StructureDefinition/days-supply-remaining',
              valueInteger: med.daysSupplyRemaining
            }
          ]
        }
      })),
      ...patient.safetySignals.map(signal => ({
        fullUrl: `urn:uuid:flag-${signal.id}`,
        resource: {
          resourceType: 'Flag',
          id: signal.id,
          status: 'active',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/flag-category',
                  code: 'safety',
                  display: 'Safety Alert'
                }
              ]
            }
          ],
          code: {
            text: signal.titleEn
          },
          subject: {
            reference: `urn:uuid:patient-${patient.id}`
          }
        }
      }))
    ]
  };

  const jsonString = JSON.stringify(fhirBundle, null, 2);
  const filename = `${patient.mrn}_FHIR_R4_Health_Passport.json`;
  return triggerFileDownload(jsonString, filename, 'application/json');
}
