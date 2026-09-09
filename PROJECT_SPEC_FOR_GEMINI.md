# E-KAVACH — Universal Emergency Health Access System
## Master Technical Architecture, Complete Database Schema, API Catalog & Gemini Master Prompt

---

## 1. Executive Summary & Core Requirements

**E-KAVACH** is an emergency healthcare ecosystem designed for India's digital health stack (ABDM, Ayushman Bharat PM-JAY, UIDAI Aadhaar e-KYC, and 108 Emergency Ambulance Trauma Networks).

### Core Constraint: Zero Frontend Disruption
- **All existing UI designs, layout hierarchies, color palettes, Tailwind tokens, and component JSX must remain intact.**
- Backend endpoints and database models are crafted to map cleanly into the current page states without requiring design rewrites.

---

## 2. Comprehensive Relational Database Schema (PostgreSQL / Cloud SQL)

The production-ready schema is located in `/server/db/schema.sql` and includes the following 13 core domains:

1. **`users`**: Patient, doctor, and hospital admin credentials, roles, and profiles.
2. **`aadhaar_verification_requests`**: UIDAI OTP session manager, expiration timers, and hash verifications.
3. **`abha_profiles`**: 14-digit ABHA numbers (`98-xxxx-xxxx-xxxx`), `@abdm` handles, and KYC statuses.
4. **`emergency_passports`**: Instant resuscitation data (Blood group, allergies, chronic conditions, organ donor status, ICE contact).
5. **`hospitals`**: National hospital registry, trauma level (e.g. Level 1 Trauma Center), geographic coordinates, emergency hotlines.
6. **`doctors`**: NMC registration credentials, specializations, departments, and on-duty statuses.
7. **`emergency_beds`**: Bed state across 4 trauma zones (`Trauma ICU`, `Red Triage`, `Yellow Observation`, `Green Minor`).
8. **`emergency_alerts`**: 108 ambulance dispatch queue, real-time vitals telemetry, triage priority (`RED`, `YELLOW`, `GREEN`).
9. **`appointments`**: OPD, Emergency, and Teleconsultation appointments with doctor schedules.
10. **`prescriptions`**: Digitally signed e-prescriptions with diagnostic notes and medication regimens.
11. **`pharmacy_inventory`**: Critical emergency medications (Epinephrine, TXA, Blood products, Saline) with real-time shortage thresholds.
12. **`government_schemes` & `patient_scheme_enrollments`**: PM-JAY coverage records, active balances, and policy validity.
13. **`hospital_network_nodes`**: Mutual aid inter-hospital bed and blood bank sharing network.

---

## 3. Implemented Backend Endpoints

### A. UIDAI Aadhaar e-KYC Gateway (`/api/uidai`)
- `POST /api/uidai/generate-otp`: Validates 12-digit Aadhaar, initiates 6-digit OTP delivery to linked mobile.
- `POST /api/uidai/verify-otp`: Validates OTP (`123456` in demo mode), returns authenticated e-KYC citizen profile.
- `POST /api/uidai/create-abha`: Issues verified 14-digit ABHA ID and provisions patient record into the emergency vault.

### B. Patient & Emergency Passport (`/api/patients`)
- `GET /api/patients`: All registered patient profiles.
- `GET /api/patients/abha/:abhaId`: Resolves optical QR code scans to live medical records.
- `GET /api/patients/:id/emergency-summary`: Returns instant triage passport for paramedics.
- `POST /api/patients`: Registers a new patient with auto-generated ABHA number.
- `PUT /api/patients/:id/vitals`: Updates real-time blood pressure, heart rate, and SpO2.

### C. Emergency Ward & Trauma Hub (`/api/emergency`)
- `GET /api/emergency/alerts`: Active 108 ambulance incoming calls.
- `POST /api/emergency/alerts`: Dispatches emergency alert to Trauma ICU.
- `GET /api/emergency/beds`: Live bed availability and occupancy status.
- `PUT /api/emergency/beds/:id`: Admits or discharges patient from trauma bed.
- `POST /api/emergency/triage-scan`: Analyzes scanned QR code and flags acute drug allergies (e.g. Penicillin).

### D. Clinical Decision Support & Gemini AI (`/api/ai`)
- `POST /api/ai/triage-insights`: Analyzes symptoms + vitals via Gemini 2.5 Flash, providing Emergency Severity Index (ESI) rating, stat actions, and contraindications, with automated deterministic clinical rules fallback.

### E. Hospital Logistics & Pharmacy (`/api/hospital`)
- `GET /api/hospital/overview`: Trauma command center metrics.
- `GET /api/hospital/pharmacy`: Medication inventory.
- `POST /api/hospital/pharmacy/:id/stock`: Real-time stock increments and decrements.
- `GET /api/hospital/staff`: On-duty doctors and trauma nurses.
- `GET /api/hospital/network`: Inter-hospital mutual aid capacity.

---

## 4. Page-by-Page Backend Integration Plan (Preserving All Frontend UI)

| Page Path | Target Backend Integration |
| :--- | :--- |
| **`/patient/abha`** | `ekavachApi.generateAadhaarOtp()`, `ekavachApi.verifyAadhaarOtp()`, `ekavachApi.createAbhaFromAadhaar()` |
| **`/patient/dashboard`** | `ekavachApi.getPatientByAbha()`, `ekavachApi.getEmergencyPassport()` |
| **`/patient/scan`** | `ekavachApi.processTriageScan()` with QR camera feed integration |
| **`/patient/history`** | `ekavachApi.getPatientById()` -> `patient.medicalHistory` |
| **`/patient/consult`** | `ekavachApi.getDoctors()`, `ekavachApi.getAppointments()` |
| **`/doctor/dashboard`** | `ekavachApi.getAlerts()`, `ekavachApi.getBeds()` |
| **`/doctor/scan`** | `ekavachApi.processTriageScan()`, `ekavachApi.getTriageInsights()` |
| **`/doctor/appointments`** | `ekavachApi.getAppointments({ doctorId })` |
| **`/doctor/credentials`** | `ekavachApi.getDoctorById('doc-1')` |
| **`/admin/dashboard`** | `ekavachApi.getHospitalOverview()`, `ekavachApi.getBeds()` |
| **`/admin/emergency-ward`** | `ekavachApi.getBeds()`, `ekavachApi.updateBed()` |
| **`/admin/pharmacy`** | `ekavachApi.getPharmacy()`, `ekavachApi.updatePharmacyStock()` |
| **`/admin/staff`** | `ekavachApi.getStaff()` |
| **`/admin/network`** | `ekavachApi.getHospitalNetwork()` |

---

## 5. Master Prompt for Your Gemini Chat Session

Copy and paste the prompt below into your new Gemini conversation:

```text
You are a senior full-stack healthcare systems architect and Node.js/PostgreSQL expert. 
You are working on "E-KAVACH — Universal Emergency Health Access System".

### CORE DIRECTIVE:
1. DO NOT change the existing frontend layouts, designs, Tailwind classes, or components. Keep all UI visual structures exactly as they are.
2. Connect each frontend page one by one to the working Express backend (`/server.ts` and `/server/routes/*`) using the pre-built service `/src/services/api.js`.
3. The database schema has already been designed in `/server/db/schema.sql`. Use this schema as the source of truth for all tables and relationships.

### ARCHITECTURE SPECIFICATIONS:
- Runtime: Express (TypeScript) running on port 3000 (0.0.0.0) with Vite SPA middleware.
- Database Schema: Defined in `/server/db/schema.sql` (13 tables covering users, aadhaar_verification_requests, abha_profiles, emergency_passports, hospitals, doctors, emergency_beds, emergency_alerts, appointments, prescriptions, pharmacy_inventory, government_schemes, hospital_network_nodes).
- Implemented API Modules:
  - `/api/uidai`: Real Aadhaar e-KYC simulation (generate OTP, verify OTP, auto-create ABHA ID).
  - `/api/patients`: ABHA lookup, emergency passport payloads, real-time vitals.
  - `/api/doctors`: Doctor roster, NMC verification, e-prescriptions with digital signatures.
  - `/api/emergency`: 108 ambulance dispatch, trauma ward bed allocation, optical QR triage processor.
  - `/api/hospital`: Command center KPIs, pharmacy stock with low-stock alerts, staff shifts, mutual aid network.
  - `/api/ai`: Gemini 2.5 Flash emergency clinical triage evaluator with clinical rule fallback.
- Client API Service: `/src/services/api.js` exposes `ekavachApi` covering all the above methods.

### PAGE IMPLEMENTATION ROADMAP:
We will connect pages to the backend sequentially, verifying each with `npm run build` / `npm run lint`:
- PHASE 1: Patient ABHA & ID Vault (`/src/pages/patient/AbhaHealthId.jsx`, `PatientDashboard.jsx`, `PatientScan.jsx`)
- PHASE 2: Doctor Triage & Clinical Care (`/src/pages/doctor/DoctorScan.jsx`, `DoctorDashboard.jsx`, `DoctorAppointments.jsx`)
- PHASE 3: Hospital Command Center (`/src/pages/admin/EmergencyWard.jsx`, `PharmacyManagement.jsx`, `StaffManagement.jsx`, `HospitalNetwork.jsx`)

Please confirm you understand these architectural requirements and let's begin with Phase 1: connecting `/src/pages/patient/AbhaHealthId.jsx` to `ekavachApi.generateAadhaarOtp()`, `verifyAadhaarOtp()`, and `createAbhaFromAadhaar()`.
```
