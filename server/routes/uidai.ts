import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { store } from '../data/store';

const router = Router();

interface OtpSession {
  requestId: string;
  aadhaarLastFour: string;
  phone: string;
  otp: string;
  expiresAt: number;
  mockCitizen: {
    fullName: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    address: string;
    state: string;
    pincode: string;
  };
}

const activeOtpSessions = new Map<string, OtpSession>();

// Step 1: Request Aadhaar OTP for e-KYC & ABHA Generation
router.post('/generate-otp', (req: Request, res: Response) => {
  const { aadhaarNumber, phone } = req.body;

  const cleanAadhaar = String(aadhaarNumber || '').replace(/\D/g, '');
  if (cleanAadhaar.length !== 12) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Aadhaar number. A 12-digit UIDAI number is required.',
    });
  }

  const requestId = `UIDAI-REQ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const otp = '123456'; // Standard sandbox/test OTP
  const lastFour = cleanAadhaar.slice(-4);
  const userPhone = phone || '+91 98401 23456';

  activeOtpSessions.set(requestId, {
    requestId,
    aadhaarLastFour: lastFour,
    phone: userPhone,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    mockCitizen: {
      fullName: 'Rajesh V. Sharma',
      dob: '1980-04-12',
      gender: 'Male',
      bloodGroup: 'O+',
      address: 'Flat 4B, Emerald Towers, Greams Road, Thousand Lights, Chennai',
      state: 'Tamil Nadu',
      pincode: '600006',
    },
  });

  return res.json({
    success: true,
    requestId,
    maskedAadhaar: `XXXX-XXXX-${lastFour}`,
    maskedPhone: userPhone.replace(/(\+?\d{2})\d+(\d{4})/, '$1 XXXXX $2'),
    message: `Aadhaar OTP sent to linked mobile number ending with ${userPhone.slice(-4)}. (Use demo OTP: 123456)`,
    testOtpHint: '123456',
  });
});

// Step 2: Verify OTP & Return e-KYC Data
router.post('/verify-otp', (req: Request, res: Response) => {
  const { requestId, otp } = req.body;

  if (!requestId || !otp) {
    return res.status(400).json({ success: false, message: 'requestId and otp are required' });
  }

  const session = activeOtpSessions.get(requestId);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Invalid or expired Aadhaar OTP request ID.' });
  }

  if (Date.now() > session.expiresAt) {
    activeOtpSessions.delete(requestId);
    return res.status(400).json({ success: false, message: 'Aadhaar OTP has expired. Please request a new OTP.' });
  }

  if (otp !== session.otp && otp !== '123456') {
    return res.status(401).json({ success: false, message: 'Incorrect Aadhaar OTP. Please re-enter.' });
  }

  const kycToken = `EKYC-TOKEN-${crypto.randomBytes(8).toString('hex')}`;

  return res.json({
    success: true,
    message: 'UIDAI Aadhaar e-KYC verification successful.',
    kycToken,
    citizenData: {
      ...session.mockCitizen,
      aadhaarMasked: `XXXX-XXXX-${session.aadhaarLastFour}`,
      verificationAuthority: 'UIDAI Sub-AUA Node (Govt. of India)',
      verifiedAt: new Date().toISOString(),
    },
  });
});

// Step 3: Link/Generate 14-digit ABHA ID from Verified Aadhaar
router.post('/create-abha', (req: Request, res: Response) => {
  const { kycToken, abhaAddressAlias, preferredPhone } = req.body;

  if (!kycToken) {
    return res.status(400).json({ success: false, message: 'kycToken is required from verified Aadhaar step.' });
  }

  const p1 = Math.floor(10 + Math.random() * 89);
  const p2 = Math.floor(1000 + Math.random() * 8999);
  const p3 = Math.floor(1000 + Math.random() * 8999);
  const p4 = Math.floor(1000 + Math.random() * 8999);
  const abhaNumber = `${p1}-${p2}-${p3}-${p4}`;
  const abhaAddress = `${(abhaAddressAlias || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}@abdm`;

  // Register into store
  const newPatient = store.addPatient({
    abhaId: abhaNumber,
    name: 'Rajesh V. Sharma',
    age: 46,
    gender: 'Male',
    bloodGroup: 'O+ (Positive)',
    dob: '1980-04-12',
    phone: preferredPhone || '+91 98401 23456',
    address: 'Greams Road, Chennai - 600006',
    emergencyContact: {
      name: 'Sunita Sharma',
      relationship: 'Spouse',
      phone: '+91 98401 88776',
    },
    allergies: ['Penicillin'],
    chronicConditions: ['Type 2 Diabetes'],
    currentMedications: ['Metformin 500mg'],
    organDonor: true,
    insuranceScheme: {
      schemeName: 'Ayushman Bharat PM-JAY',
      policyNumber: `PMJAY-${Date.now().toString().slice(-6)}`,
      status: 'Active',
      coverageLimit: '₹5,00,000 / year',
    },
    vitals: {
      bp: '124/80 mmHg',
      heartRate: 76,
      spo2: 99,
      temperature: '98.4 °F',
      lastUpdated: new Date().toLocaleString(),
    },
    medicalHistory: [],
  });

  return res.status(201).json({
    success: true,
    message: 'National ABHA Health Card successfully created via UIDAI e-KYC gateway.',
    abhaNumber,
    abhaAddress,
    patientRecord: newPatient,
    vaultStatus: 'Level-4 ABDM Certified',
  });
});

export default router;
