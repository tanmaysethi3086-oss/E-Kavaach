/**
 * E-KAVACH API Service
 * Connects the frontend to the Express backend endpoints.
 */

const API_BASE = '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'API request failed');
    }
    return await res.json();
  } catch (error) {
    console.warn(`[E-KAVACH API] ${endpoint} request failed:`, error.message);
    throw error;
  }
}

export const ekavachApi = {
  // System Health
  getHealth: () => fetchJson('/health'),
  resetData: () => fetchJson('/system/reset-data', { method: 'POST' }),

  // Auth
  getRoles: () => fetchJson('/auth/roles'),
  login: (role) => fetchJson('/auth/login', { method: 'POST', body: JSON.stringify({ role }) }),

  // Patients & ABHA
  getPatients: () => fetchJson('/patients'),
  getPatientById: (id) => fetchJson(`/patients/${id}`),
  getPatientByAbha: (abhaId) => fetchJson(`/patients/abha/${encodeURIComponent(abhaId)}`),
  getEmergencyPassport: (id) => fetchJson(`/patients/${id}/emergency-summary`),
  registerPatient: (patientData) => fetchJson('/patients', { method: 'POST', body: JSON.stringify(patientData) }),
  updateVitals: (id, vitals) => fetchJson(`/patients/${id}/vitals`, { method: 'PUT', body: JSON.stringify(vitals) }),

  // Doctors & Clinical
  getDoctors: () => fetchJson('/doctors'),
  getDoctorById: (id) => fetchJson(`/doctors/${id}`),
  issuePrescription: (data) => fetchJson('/doctors/prescribe', { method: 'POST', body: JSON.stringify(data) }),

  // Emergency & Trauma Ward
  getAlerts: () => fetchJson('/emergency/alerts'),
  createAlert: (alertData) => fetchJson('/emergency/alerts', { method: 'POST', body: JSON.stringify(alertData) }),
  getBeds: () => fetchJson('/emergency/beds'),
  updateBed: (bedId, bedData) => fetchJson(`/emergency/beds/${bedId}`, { method: 'PUT', body: JSON.stringify(bedData) }),
  processTriageScan: (qrPayload) => fetchJson('/emergency/triage-scan', { method: 'POST', body: JSON.stringify({ qrPayload }) }),

  // Hospital Network & Inventory
  getHospitalOverview: () => fetchJson('/hospital/overview'),
  getPharmacy: () => fetchJson('/hospital/pharmacy'),
  updatePharmacyStock: (id, delta) => fetchJson(`/hospital/pharmacy/${id}/stock`, { method: 'POST', body: JSON.stringify({ delta }) }),
  getStaff: () => fetchJson('/hospital/staff'),
  getHospitalNetwork: () => fetchJson('/hospital/network'),

  // AI Decision Engine
  getTriageInsights: (caseData) => fetchJson('/ai/triage-insights', { method: 'POST', body: JSON.stringify(caseData) }),

  // UIDAI Aadhaar Gateway & ABHA Creation
  generateAadhaarOtp: (aadhaarNumber, phone) => fetchJson('/uidai/generate-otp', { method: 'POST', body: JSON.stringify({ aadhaarNumber, phone }) }),
  verifyAadhaarOtp: (requestId, otp) => fetchJson('/uidai/verify-otp', { method: 'POST', body: JSON.stringify({ requestId, otp }) }),
  createAbhaFromAadhaar: (data) => fetchJson('/uidai/create-abha', { method: 'POST', body: JSON.stringify(data) }),
};
