import {
  PatientRecord,
  Doctor,
  EmergencyWardBed,
  PharmacyItem,
  EmergencyAlert,
  initialPatients,
  initialDoctors,
  initialBeds,
  initialPharmacy,
  initialEmergencyAlerts,
} from './mockData';

class EkavachDataStore {
  private patients: PatientRecord[] = JSON.parse(JSON.stringify(initialPatients));
  private doctors: Doctor[] = JSON.parse(JSON.stringify(initialDoctors));
  private beds: EmergencyWardBed[] = JSON.parse(JSON.stringify(initialBeds));
  private pharmacy: PharmacyItem[] = JSON.parse(JSON.stringify(initialPharmacy));
  private alerts: EmergencyAlert[] = JSON.parse(JSON.stringify(initialEmergencyAlerts));
  private appointments: Array<{
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    type: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
  }> = [
    {
      id: 'apt-1',
      patientId: 'pat-1',
      patientName: 'Rajesh V. Sharma',
      doctorId: 'doc-1',
      doctorName: 'Dr. Kavitha Menon',
      date: '2026-09-10',
      time: '10:30 AM',
      type: 'Post-Cardiac Angiography Follow-up',
      status: 'Scheduled',
    },
    {
      id: 'apt-2',
      patientId: 'pat-2',
      patientName: 'Pooja Anand Kulkarni',
      doctorId: 'doc-1',
      doctorName: 'Dr. Kavitha Menon',
      date: '2026-09-11',
      time: '02:00 PM',
      type: 'Pulmonary Assessment',
      status: 'Scheduled',
    },
  ];

  // Patients
  getAllPatients(): PatientRecord[] {
    return this.patients;
  }

  getPatientById(id: string): PatientRecord | undefined {
    return this.patients.find((p) => p.id === id || p.abhaId.toLowerCase() === id.toLowerCase());
  }

  getPatientByAbha(abhaId: string): PatientRecord | undefined {
    const clean = abhaId.trim().toLowerCase();
    return this.patients.find(
      (p) => p.abhaId.toLowerCase() === clean || p.abhaId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === clean.replace(/[^a-zA-Z0-9]/g, '')
    );
  }

  addPatient(patient: Omit<PatientRecord, 'id'>): PatientRecord {
    const newPatient: PatientRecord = {
      ...patient,
      id: `pat-${Date.now()}`,
    };
    this.patients.push(newPatient);
    return newPatient;
  }

  updatePatientVitals(id: string, vitals: Partial<PatientRecord['vitals']>): PatientRecord | null {
    const patient = this.getPatientById(id);
    if (!patient) return null;
    patient.vitals = {
      ...patient.vitals,
      ...vitals,
      lastUpdated: new Date().toLocaleString(),
    };
    return patient;
  }

  // Doctors
  getAllDoctors(): Doctor[] {
    return this.doctors;
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.doctors.find((d) => d.id === id);
  }

  // Beds
  getAllBeds(): EmergencyWardBed[] {
    return this.beds;
  }

  updateBedStatus(bedId: string, status: EmergencyWardBed['status'], patientName?: string, severity?: EmergencyWardBed['severity']): EmergencyWardBed | null {
    const bed = this.beds.find((b) => b.id === bedId);
    if (!bed) return null;
    bed.status = status;
    if (patientName !== undefined) bed.patientName = patientName;
    if (severity !== undefined) bed.severity = severity;
    if (status === 'Available') {
      bed.patientId = undefined;
      bed.patientName = undefined;
      bed.admittedAt = undefined;
      bed.severity = undefined;
    }
    return bed;
  }

  // Pharmacy
  getPharmacyItems(): PharmacyItem[] {
    return this.pharmacy;
  }

  updatePharmacyStock(id: string, unitsDelta: number): PharmacyItem | null {
    const item = this.pharmacy.find((p) => p.id === id);
    if (!item) return null;
    item.unitsAvailable = Math.max(0, item.unitsAvailable + unitsDelta);
    if (item.unitsAvailable <= Math.floor(item.threshold * 0.5)) {
      item.status = 'Critical Shortage';
    } else if (item.unitsAvailable <= item.threshold) {
      item.status = 'Low Stock';
    } else {
      item.status = 'Adequate';
    }
    return item;
  }

  // Alerts
  getEmergencyAlerts(): EmergencyAlert[] {
    return this.alerts;
  }

  createEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp'>): EmergencyAlert {
    const newAlert: EmergencyAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  // Appointments
  getAppointments(filters?: { patientId?: string; doctorId?: string }) {
    return this.appointments.filter((apt) => {
      if (filters?.patientId && apt.patientId !== filters.patientId) return false;
      if (filters?.doctorId && apt.doctorId !== filters.doctorId) return false;
      return true;
    });
  }

  createAppointment(data: Omit<typeof this.appointments[0], 'id'>) {
    const newApt = {
      ...data,
      id: `apt-${Date.now()}`,
    };
    this.appointments.push(newApt);
    return newApt;
  }

  // Reset to initial
  resetData(): void {
    this.patients = JSON.parse(JSON.stringify(initialPatients));
    this.doctors = JSON.parse(JSON.stringify(initialDoctors));
    this.beds = JSON.parse(JSON.stringify(initialBeds));
    this.pharmacy = JSON.parse(JSON.stringify(initialPharmacy));
    this.alerts = JSON.parse(JSON.stringify(initialEmergencyAlerts));
  }
}

export const store = new EkavachDataStore();
