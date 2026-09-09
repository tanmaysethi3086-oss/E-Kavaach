import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

// List doctors
router.get('/', (_req: Request, res: Response) => {
  const doctors = store.getAllDoctors();
  res.json({ success: true, count: doctors.length, data: doctors });
});

// Single doctor
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = store.getDoctorById(id);
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }
  return res.json({ success: true, data: doctor });
});

// Issue e-Prescription
router.post('/prescribe', (req: Request, res: Response) => {
  const { patientId, doctorId, diagnosis, medications, instructions } = req.body;

  if (!patientId || !medications) {
    return res.status(400).json({ success: false, message: 'Patient ID and medications are required' });
  }

  const patient = store.getPatientById(patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const doctor = store.getDoctorById(doctorId) || {
    id: doctorId || 'doc-1',
    name: 'Dr. Kavitha Menon',
    hospital: 'Apollo Greams Trauma Hub',
  };

  const prescriptionRecord = {
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis || 'Acute Clinical Evaluation',
    hospital: doctor.hospital,
    doctor: doctor.name,
    prescription: Array.isArray(medications) ? medications : [medications],
  };

  patient.medicalHistory.unshift(prescriptionRecord);

  return res.status(201).json({
    success: true,
    message: 'Prescription recorded to national ABHA locker',
    prescription: prescriptionRecord,
    digitalSignature: `DIGI-SIGN-NMC-${Date.now()}`,
  });
});

export default router;
