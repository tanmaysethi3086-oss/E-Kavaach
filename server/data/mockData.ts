export interface PatientRecord {
  id: string;
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  dob: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  organDonor: boolean;
  insuranceScheme: {
    schemeName: string;
    policyNumber: string;
    status: 'Active' | 'Pending' | 'Expired';
    coverageLimit: string;
  };
  vitals: {
    bp: string;
    heartRate: number;
    spo2: number;
    temperature: string;
    lastUpdated: string;
  };
  medicalHistory: Array<{
    date: string;
    diagnosis: string;
    hospital: string;
    doctor: string;
    prescription: string[];
  }>;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialization: string;
  nmcRegistration: string;
  hospital: string;
  available: boolean;
  activePatients: number;
}

export interface EmergencyWardBed {
  id: string;
  bedNumber: string;
  wardType: 'Trauma ICU' | 'Red Triage' | 'Yellow Observation' | 'Green Minor';
  status: 'Occupied' | 'Available' | 'Sanitizing';
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
  severity?: 'CRITICAL' | 'SERIOUS' | 'STABLE';
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: 'Critical Emergency' | 'Analgesic' | 'Antibiotic' | 'Blood Product' | 'IV Fluid';
  unitsAvailable: number;
  threshold: number;
  status: 'Adequate' | 'Low Stock' | 'Critical Shortage';
  dosage: string;
}

export interface EmergencyAlert {
  id: string;
  timestamp: string;
  patientAbhaId: string;
  patientName: string;
  triagePriority: 'RED' | 'YELLOW' | 'GREEN';
  incident: string;
  vitals: {
    bp: string;
    heartRate: number;
    spo2: number;
  };
  responder: string;
  status: 'En Route' | 'Arrived' | 'In Surgery' | 'Stabilized';
  etaMinutes?: number;
}

export const initialPatients: PatientRecord[] = [
  {
    id: 'pat-1',
    abhaId: 'ABHA-9824-8819-TN',
    name: 'Rajesh V. Sharma',
    age: 46,
    gender: 'Male',
    bloodGroup: 'O+ (Positive)',
    dob: '1980-04-12',
    phone: '+91 98401 23456',
    address: 'Flat 4B, Emerald Towers, Greams Road, Chennai - 600006',
    emergencyContact: {
      name: 'Sunita Sharma',
      relationship: 'Spouse',
      phone: '+91 98401 88776',
    },
    allergies: ['Penicillin', 'Sulfa Drugs'],
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Stage 1 Hypertension'],
    currentMedications: ['Metformin 500mg BD', 'Telmisartan 40mg OD'],
    organDonor: true,
    insuranceScheme: {
      schemeName: 'Ayushman Bharat PM-JAY / Chief Minister Comprehensive Scheme',
      policyNumber: 'PMJAY-TN-2024-899120',
      status: 'Active',
      coverageLimit: '₹5,00,000 / year',
    },
    vitals: {
      bp: '128/82 mmHg',
      heartRate: 74,
      spo2: 98,
      temperature: '98.6 °F',
      lastUpdated: '2026-09-09 10:30 AM',
    },
    medicalHistory: [
      {
        date: '2026-07-14',
        diagnosis: 'Acute Coronary Syndrome Rule-Out',
        hospital: 'Apollo Greams Trauma Hub',
        doctor: 'Dr. Kavitha Menon',
        prescription: ['Aspirin 75mg', 'Atorvastatin 40mg'],
      },
      {
        date: '2025-11-20',
        diagnosis: 'Diabetic Retinopathy Screen',
        hospital: 'Sankara Nethralaya',
        doctor: 'Dr. S. Narayanan',
        prescription: ['Lubricant Eye Drops'],
      },
    ],
  },
  {
    id: 'pat-2',
    abhaId: 'ABHA-1102-4432-MH',
    name: 'Pooja Anand Kulkarni',
    age: 29,
    gender: 'Female',
    bloodGroup: 'B- (Negative)',
    dob: '1997-09-22',
    phone: '+91 98200 55431',
    address: 'B-12 Nilgiri Apts, Dadar, Mumbai - 400014',
    emergencyContact: {
      name: 'Anand Kulkarni',
      relationship: 'Father',
      phone: '+91 98200 11223',
    },
    allergies: ['NSAIDs (Ibuprofen, Aspirin)'],
    chronicConditions: ['Asthma (Mild Persistent)'],
    currentMedications: ['Budesonide/Formoterol Inhaler 200mcg SOS'],
    organDonor: true,
    insuranceScheme: {
      schemeName: 'Mahatma Jyotirao Phule Jan Arogya Yojana',
      policyNumber: 'MJPJAY-MH-2025-11209',
      status: 'Active',
      coverageLimit: '₹5,00,000 / year',
    },
    vitals: {
      bp: '116/74 mmHg',
      heartRate: 82,
      spo2: 97,
      temperature: '98.4 °F',
      lastUpdated: '2026-09-08 04:15 PM',
    },
    medicalHistory: [
      {
        date: '2026-04-10',
        diagnosis: 'Bronchospasm Attack Triggered by Dust',
        hospital: 'Apollo Greams Trauma Hub',
        doctor: 'Dr. Kavitha Menon',
        prescription: ['Nebulization Levosalbutamol', 'Prednisolone 20mg taper'],
      },
    ],
  },
];

export const initialDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Kavitha Menon',
    title: 'Chief Interventional Cardiologist',
    specialization: 'Trauma & Emergency Cardiology',
    nmcRegistration: 'NMC: MD-44912-TN',
    hospital: 'Apollo Greams Trauma Hub',
    available: true,
    activePatients: 7,
  },
  {
    id: 'doc-2',
    name: 'Dr. R. Vignesh',
    title: 'Senior Neurotrauma Surgeon',
    specialization: 'Neurological Critical Care',
    nmcRegistration: 'NMC: MS-89102-TN',
    hospital: 'Apollo Greams Trauma Hub',
    available: true,
    activePatients: 4,
  },
  {
    id: 'doc-3',
    name: 'Dr. Ananya Sundaram',
    title: 'Emergency Medicine Lead',
    specialization: 'Acute Resuscitation & Toxic Triage',
    nmcRegistration: 'NMC: MD-33419-TN',
    hospital: 'Apollo Greams Trauma Hub',
    available: false,
    activePatients: 9,
  },
];

export const initialBeds: EmergencyWardBed[] = [
  { id: 'bed-1', bedNumber: 'TR-ICU-01', wardType: 'Trauma ICU', status: 'Occupied', patientId: 'pat-1', patientName: 'Rajesh V. Sharma', admittedAt: '2026-09-09 08:45 AM', severity: 'SERIOUS' },
  { id: 'bed-2', bedNumber: 'TR-ICU-02', wardType: 'Trauma ICU', status: 'Available' },
  { id: 'bed-3', bedNumber: 'RED-01', wardType: 'Red Triage', status: 'Occupied', patientName: 'Unknown Male (Trauma 108)', admittedAt: '2026-09-09 12:15 PM', severity: 'CRITICAL' },
  { id: 'bed-4', bedNumber: 'RED-02', wardType: 'Red Triage', status: 'Available' },
  { id: 'bed-5', bedNumber: 'YEL-01', wardType: 'Yellow Observation', status: 'Occupied', patientId: 'pat-2', patientName: 'Pooja Anand Kulkarni', admittedAt: '2026-09-09 11:10 AM', severity: 'STABLE' },
  { id: 'bed-6', bedNumber: 'YEL-02', wardType: 'Yellow Observation', status: 'Sanitizing' },
  { id: 'bed-7', bedNumber: 'GRN-01', wardType: 'Green Minor', status: 'Available' },
  { id: 'bed-8', bedNumber: 'GRN-02', wardType: 'Green Minor', status: 'Available' },
];

export const initialPharmacy: PharmacyItem[] = [
  { id: 'ph-1', name: 'Epinephrine Injection 1mg/mL', category: 'Critical Emergency', unitsAvailable: 140, threshold: 30, status: 'Adequate', dosage: '1:1000 IV/IM' },
  { id: 'ph-2', name: 'Atropine Sulfate 0.6mg/mL', category: 'Critical Emergency', unitsAvailable: 85, threshold: 25, status: 'Adequate', dosage: 'IV bolus' },
  { id: 'ph-3', name: 'Packed Red Blood Cells (O Negative)', category: 'Blood Product', unitsAvailable: 4, threshold: 10, status: 'Critical Shortage', dosage: 'Universal Emergency Unit' },
  { id: 'ph-4', name: 'Packed Red Blood Cells (O Positive)', category: 'Blood Product', unitsAvailable: 18, threshold: 12, status: 'Adequate', dosage: 'Unit Bag 350mL' },
  { id: 'ph-5', name: 'Normal Saline 0.9% (500mL)', category: 'IV Fluid', unitsAvailable: 340, threshold: 50, status: 'Adequate', dosage: 'IV Infusion' },
  { id: 'ph-6', name: 'Tranexamic Acid (TXA) 500mg', category: 'Critical Emergency', unitsAvailable: 62, threshold: 20, status: 'Adequate', dosage: 'IV Slow Push' },
  { id: 'ph-7', name: 'Morphine Sulfate 10mg/mL', category: 'Analgesic', unitsAvailable: 9, threshold: 15, status: 'Low Stock', dosage: 'Schedule II IV/IM' },
];

export const initialEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'alt-101',
    timestamp: '2026-09-09T13:10:00Z',
    patientAbhaId: 'ABHA-9824-8819-TN',
    patientName: 'Rajesh V. Sharma',
    triagePriority: 'RED',
    incident: 'Suspected Acute Anterior STEMI with severe chest tightness & diaphoresis',
    vitals: { bp: '90/60', heartRate: 118, spo2: 92 },
    responder: '108 Advanced Cardiac Life Support (Unit TN-01-G-9912)',
    status: 'Arrived',
    etaMinutes: 0,
  },
  {
    id: 'alt-102',
    timestamp: '2026-09-09T13:25:00Z',
    patientAbhaId: 'ABHA-4412-9901-KA',
    patientName: 'Karthik Raja',
    triagePriority: 'YELLOW',
    incident: 'Highway Two-Wheeler Collision with right femur closed fracture',
    vitals: { bp: '130/84', heartRate: 94, spo2: 98 },
    responder: 'Apollo Rescue Mobile Trauma Van #3',
    status: 'En Route',
    etaMinutes: 6,
  },
];
