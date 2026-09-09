import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

// Hospital Ward Overview & Live KPIs
router.get('/overview', (_req: Request, res: Response) => {
  const beds = store.getAllBeds();
  const pharmacy = store.getPharmacyItems();
  const alerts = store.getEmergencyAlerts();
  const doctors = store.getAllDoctors();

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const criticalShortageItems = pharmacy.filter((p) => p.status === 'Critical Shortage');

  res.json({
    success: true,
    hospitalName: 'Apollo Greams Trauma Hub',
    city: 'Chennai, Tamil Nadu',
    nationalHospitalId: 'HSP-TN-CH-4401',
    kpis: {
      bedOccupancyRate: `${Math.round((occupiedBeds / totalBeds) * 100)}%`,
      activeRedAlerts: alerts.filter((a) => a.triagePriority === 'RED').length,
      criticalMedsShortages: criticalShortageItems.length,
      doctorsOnDuty: doctors.filter((d) => d.available).length,
    },
    traumaWards: {
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
    },
  });
});

// Pharmacy Inventory
router.get('/pharmacy', (_req: Request, res: Response) => {
  const items = store.getPharmacyItems();
  res.json({ success: true, count: items.length, data: items });
});

// Update pharmacy stock
router.post('/pharmacy/:id/stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const { delta } = req.body;
  const updated = store.updatePharmacyStock(id, Number(delta) || 0);

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Pharmacy item not found' });
  }
  return res.json({ success: true, message: 'Stock updated', data: updated });
});

// Staff Roster
router.get('/staff', (_req: Request, res: Response) => {
  const doctors = store.getAllDoctors();
  const nursesAndSupport = [
    { id: 'stf-1', name: 'Nurse Priya Selvam', role: 'Trauma ICU In-Charge', shift: 'Morning (07:00 - 15:00)', onDuty: true },
    { id: 'stf-2', name: 'Paramedic Arun Kumar', role: '108 Ambulance Field Lead', shift: '24h Emergency On-Call', onDuty: true },
    { id: 'stf-3', name: 'Pharmacist Deepa Rao', role: 'Chief Emergency Pharmacist', shift: 'General (09:00 - 18:00)', onDuty: true },
  ];

  res.json({
    success: true,
    doctors,
    supportStaff: nursesAndSupport,
  });
});

// Hospital Network / Mutual Aid Nodes
router.get('/network', (_req: Request, res: Response) => {
  res.json({
    success: true,
    localHub: 'Apollo Greams Trauma Hub (Zone Primary)',
    affiliatedNodes: [
      { id: 'net-1', name: 'Rajiv Gandhi Government General Hospital', distanceKm: 4.2, icuBedsAvailable: 14, bloodUnitsONeg: 28 },
      { id: 'net-2', name: 'Sri Ramachandra Medical Centre', distanceKm: 12.8, icuBedsAvailable: 6, bloodUnitsONeg: 12 },
      { id: 'net-3', name: 'Fortis Malar Hospital Adyar', distanceKm: 7.1, icuBedsAvailable: 3, bloodUnitsONeg: 5 },
    ],
  });
});

export default router;
