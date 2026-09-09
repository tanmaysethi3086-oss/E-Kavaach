import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

// Get emergency alerts
router.get('/alerts', (_req: Request, res: Response) => {
  const alerts = store.getEmergencyAlerts();
  res.json({ success: true, count: alerts.length, data: alerts });
});

// Broadcast new ambulance / trauma alert
router.post('/alerts', (req: Request, res: Response) => {
  const { patientAbhaId, patientName, triagePriority, incident, vitals, responder, etaMinutes } = req.body;

  if (!patientName || !incident) {
    return res.status(400).json({ success: false, message: 'Patient name and incident description are required' });
  }

  const alert = store.createEmergencyAlert({
    patientAbhaId: patientAbhaId || 'UNVERIFIED-EMERGENCY',
    patientName,
    triagePriority: triagePriority || 'YELLOW',
    incident,
    vitals: vitals || { bp: '120/80', heartRate: 80, spo2: 98 },
    responder: responder || '108 Rapid Triage Ambulance',
    status: 'En Route',
    etaMinutes: Number(etaMinutes) || 5,
  });

  return res.status(201).json({ success: true, message: 'Emergency alert dispatched to trauma ward', data: alert });
});

// Ward bed statuses
router.get('/beds', (_req: Request, res: Response) => {
  const beds = store.getAllBeds();
  const summary = {
    total: beds.length,
    occupied: beds.filter((b) => b.status === 'Occupied').length,
    available: beds.filter((b) => b.status === 'Available').length,
    sanitizing: beds.filter((b) => b.status === 'Sanitizing').length,
  };
  res.json({ success: true, summary, data: beds });
});

// Update bed status (Admit patient or discharge)
router.put('/beds/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, patientName, severity } = req.body;

  const updated = store.updateBedStatus(id, status, patientName, severity);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Bed not found' });
  }
  return res.json({ success: true, message: 'Bed status updated', data: updated });
});

// Process Triage QR Scan
router.post('/triage-scan', (req: Request, res: Response) => {
  const { qrPayload } = req.body;
  if (!qrPayload) {
    return res.status(400).json({ success: false, message: 'QR Payload is required' });
  }

  // Find patient by ABHA contained in payload or match sample
  const patient = store.getPatientByAbha(qrPayload) || store.getPatientById('pat-1');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'No patient record found for scanned ABHA QR code',
    });
  }

  // Calculate emergency risk flags
  const hasPenicillinAllergy = patient.allergies.some((a) => a.toLowerCase().includes('penicillin'));
  const hasDiabetes = patient.chronicConditions.some((c) => c.toLowerCase().includes('diabetes'));

  return res.json({
    success: true,
    scannedAt: new Date().toISOString(),
    match: {
      abhaId: patient.abhaId,
      name: patient.name,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions,
      currentMedications: patient.currentMedications,
      emergencyContact: patient.emergencyContact,
      vitals: patient.vitals,
      organDonor: patient.organDonor,
    },
    criticalAlerts: [
      ...(hasPenicillinAllergy ? ['CRITICAL: Penicillin anaphylaxis risk. Do NOT administer Beta-lactam antibiotics.'] : []),
      ...(hasDiabetes ? ['CAUTION: Patient has Diabetes Mellitus. Check capillary blood glucose stat.'] : []),
    ],
  });
});

export default router;
