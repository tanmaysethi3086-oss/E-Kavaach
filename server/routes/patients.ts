import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

// List all patients
router.get('/', (_req: Request, res: Response) => {
  const patients = store.getAllPatients();
  res.json({ success: true, count: patients.length, data: patients });
});

// ABHA Quick Lookup (used by QR scanner & triage)
router.get('/abha/:abhaId', (req: Request, res: Response) => {
  const { abhaId } = req.params;
  const patient = store.getPatientByAbha(abhaId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: `No ABHA health profile found matching '${abhaId}'.`,
    });
  }
  return res.json({ success: true, data: patient });
});

// Single Patient Detail
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = store.getPatientById(id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }
  return res.json({ success: true, data: patient });
});

// Instant Emergency Passport / QR Payload for Responders
router.get('/:id/emergency-summary', (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = store.getPatientById(id) || store.getPatientByAbha(id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Emergency record not found' });
  }

  const emergencySummary = {
    patientName: patient.name,
    age: patient.age,
    gender: patient.gender,
    abhaId: patient.abhaId,
    bloodGroup: patient.bloodGroup,
    criticalAllergies: patient.allergies,
    chronicConditions: patient.chronicConditions,
    currentMedications: patient.currentMedications,
    organDonor: patient.organDonor,
    emergencyContact: patient.emergencyContact,
    recentVitals: patient.vitals,
    insuranceActive: patient.insuranceScheme.status === 'Active',
    insuranceScheme: patient.insuranceScheme.schemeName,
    verificationCode: `EKAVACH-SECURE-${patient.abhaId.replace(/[^0-9]/g, '')}`,
  };

  return res.json({ success: true, data: emergencySummary });
});

// Register new patient
router.post('/', (req: Request, res: Response) => {
  const { name, age, gender, bloodGroup, phone, allergies, chronicConditions, emergencyContact } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required.' });
  }

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const randomMid = Math.floor(1000 + Math.random() * 9000);
  const abhaId = `ABHA-${randomDigits}-${randomMid}-IN`;

  const newPatient = store.addPatient({
    abhaId,
    name,
    age: Number(age) || 30,
    gender: gender || 'Unspecified',
    bloodGroup: bloodGroup || 'Unknown',
    dob: '1995-01-01',
    phone,
    address: req.body.address || 'Address on file',
    emergencyContact: emergencyContact || {
      name: 'Primary Kin',
      relationship: 'Relative',
      phone,
    },
    allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
    chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : (chronicConditions ? [chronicConditions] : []),
    currentMedications: req.body.currentMedications || [],
    organDonor: Boolean(req.body.organDonor),
    insuranceScheme: {
      schemeName: 'Ayushman Bharat National Universal Health Protection',
      policyNumber: `PMJAY-${Date.now().toString().slice(-6)}`,
      status: 'Active',
      coverageLimit: '₹5,00,000 / year',
    },
    vitals: {
      bp: req.body.bp || '120/80 mmHg',
      heartRate: Number(req.body.heartRate) || 72,
      spo2: Number(req.body.spo2) || 99,
      temperature: '98.6 °F',
      lastUpdated: new Date().toLocaleString(),
    },
    medicalHistory: [],
  });

  return res.status(201).json({ success: true, message: 'Patient registered with ABHA ID', data: newPatient });
});

// Update vitals
router.put('/:id/vitals', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = store.updatePatientVitals(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }
  return res.json({ success: true, message: 'Vitals updated successfully', data: updated });
});

export default router;
