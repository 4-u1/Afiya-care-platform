import { Patient, Intervention, AuditLog, PlatformKPIs } from '../types';

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getKPIs(): Promise<PlatformKPIs> {
    const res = await fetch('/api/kpis');
    return res.json();
  },

  async getPatients(risk?: string, search?: string): Promise<{ patients: Patient[]; total: number }> {
    const params = new URLSearchParams();
    if (risk && risk !== 'all') params.append('risk', risk);
    if (search) params.append('search', search);
    const res = await fetch(`/api/patients?${params.toString()}`);
    return res.json();
  },

  async getPatient(id: string): Promise<Patient> {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch patient');
    return res.json();
  },

  async addMedication(patientId: string, medData: any): Promise<{ patient: Patient; medication: any }> {
    const res = await fetch(`/api/patients/${patientId}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medData)
    });
    if (!res.ok) throw new Error('Failed to add medication');
    return res.json();
  },

  async removeMedication(patientId: string, medId: string): Promise<{ success: boolean; patient: Patient }> {
    const res = await fetch(`/api/patients/${patientId}/medications/${medId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove medication');
    return res.json();
  },

  async scanMedicationWithAI(params: {
    imageBase64?: string;
    sampleId?: string;
    patientId?: string;
  }): Promise<{
    success: boolean;
    scannedData?: any;
    potentialInteractions?: any[];
    modelUsed?: string;
    isRealAiScan?: boolean;
    unrecognized?: boolean;
    messageAr?: string;
    messageEn?: string;
    error?: string;
  }> {
    const res = await fetch('/api/medications/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('AI Scan failed');
    return res.json();
  },

  async getInterventions(status?: string): Promise<{ interventions: Intervention[]; count: number }> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    const res = await fetch(`/api/interventions?${params.toString()}`);
    return res.json();
  },

  async resolveIntervention(id: string, payload: {
    status: 'completed' | 'in_progress' | 'deferred';
    outcome?: string;
    outcomeNotes?: string;
    assignedPharmacist?: string;
  }): Promise<{ success: boolean; intervention: Intervention; updatedKPIs: PlatformKPIs }> {
    const res = await fetch(`/api/interventions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update intervention');
    return res.json();
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  async logPatientDose(patientId: string, doseId: string, payload: {
    status: 'taken' | 'skipped' | 'delayed';
    skipReason?: string;
    skipReasonDetails?: string;
    vitalValue?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    patient: Patient;
    dose: any;
    safetySignalAdded?: any;
    interventionAdded?: any;
    alertAdded?: any;
  }> {
    const res = await fetch(`/api/patients/${patientId}/doses/${doseId}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to log dose');
    return res.json();
  },

  async acknowledgeSmartAlert(patientId: string, alertId: string): Promise<{ success: boolean; patient: Patient; alert: any }> {
    const res = await fetch(`/api/patients/${patientId}/alerts/${alertId}/ack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  async addPatientDose(patientId: string, doseData: any): Promise<{ success: boolean; patient: Patient; dose: any }> {
    const res = await fetch(`/api/patients/${patientId}/doses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doseData)
    });
    if (!res.ok) throw new Error('Failed to schedule dose');
    return res.json();
  }
};
