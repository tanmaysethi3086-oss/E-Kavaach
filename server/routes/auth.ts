import { Router, Request, Response } from 'express';

const router = Router();

export const authProfiles = {
  patient: {
    role: 'patient',
    name: 'Rajesh V. Sharma',
    id: 'ABHA-9824-8819-TN',
    tag: 'Verified Health ID',
    hospital: 'Apollo Greams Trauma Hub',
    dashboardRoute: '/patient/dashboard',
  },
  doctor: {
    role: 'doctor',
    name: 'Dr. Kavitha Menon',
    title: 'Chief Interventional Cardio',
    id: 'NMC: MD-44912-TN',
    tag: 'ID-9942',
    hospital: 'Apollo Greams Trauma Hub',
    dashboardRoute: '/doctor/dashboard',
  },
  hospital: {
    role: 'hospital',
    name: 'Dr. R. K. Nambiar',
    title: 'Hospital Administrator',
    id: 'AP-HSP-842-TN',
    tag: 'VERIFIED ADMIN',
    hospital: 'Apollo Greams Trauma Hub',
    dashboardRoute: '/admin/dashboard',
  },
};

router.get('/roles', (_req: Request, res: Response) => {
  res.json({ success: true, roles: authProfiles });
});

router.post('/login', (req: Request, res: Response) => {
  const { role } = req.body;
  const user = authProfiles[role as keyof typeof authProfiles] || authProfiles.patient;
  res.json({
    success: true,
    user,
    token: `token_${user.role}_${Date.now()}`,
    redirect: user.dashboardRoute,
  });
});

export default router;
