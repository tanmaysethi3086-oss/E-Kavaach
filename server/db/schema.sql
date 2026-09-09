-- ============================================================================
-- E-KAVACH — Comprehensive Relational Database Schema (PostgreSQL / Cloud SQL)
-- Covering all Patient, Doctor, Hospital Admin, ABDM, UIDAI & Emergency modules
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'hospital')),
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. UIDAI AADHAAR E-KYC & VERIFICATION GATEWAY
CREATE TABLE IF NOT EXISTS aadhaar_verification_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aadhaar_last_four VARCHAR(4) NOT NULL,
    aadhaar_vault_token VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    status VARCHAR(20) DEFAULT 'OTP_SENT' CHECK (status IN ('OTP_SENT', 'VERIFIED', 'EXPIRED', 'FAILED')),
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ABHA HEALTH IDENTIFIERS & ABDM VAULT
CREATE TABLE IF NOT EXISTS abha_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    abha_number VARCHAR(17) UNIQUE NOT NULL, -- Format: 98-2488-1933-2011
    abha_address VARCHAR(100) UNIQUE NOT NULL, -- e.g. rajesh.sharma@abdm
    phr_address VARCHAR(100),
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    address_line TEXT,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'VERIFIED_LEVEL_4',
    qr_code_payload TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. EMERGENCY MEDICAL PASSPORTS (INSTANT RESCUE DATA)
CREATE TABLE IF NOT EXISTS emergency_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abha_id UUID REFERENCES abha_profiles(id) ON DELETE CASCADE,
    blood_group VARCHAR(10) NOT NULL,
    allergies JSONB DEFAULT '[]'::jsonb, -- e.g. ["Penicillin", "Sulfa"]
    chronic_conditions JSONB DEFAULT '[]'::jsonb, -- e.g. ["Diabetes Mellitus Type 2"]
    current_medications JSONB DEFAULT '[]'::jsonb,
    is_organ_donor BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_relationship VARCHAR(50) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    digital_signature VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. HOSPITALS & CLINICAL NODES
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    registration_code VARCHAR(50) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    emergency_hotline VARCHAR(20) NOT NULL,
    trauma_level VARCHAR(20) DEFAULT 'Level 1 Trauma Center',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. DOCTORS & HEALTHCARE PROFESSIONALS
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    nmc_registration VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    available_for_emergency BOOLEAN DEFAULT TRUE,
    is_on_duty BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. EMERGENCY WARD BEDS & REAL-TIME TRIAGE
CREATE TABLE IF NOT EXISTS emergency_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    bed_number VARCHAR(30) NOT NULL,
    ward_type VARCHAR(30) NOT NULL CHECK (ward_type IN ('Trauma ICU', 'Red Triage', 'Yellow Observation', 'Green Minor')),
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Sanitizing', 'Reserved')),
    current_patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_name VARCHAR(150),
    admitted_at TIMESTAMP WITH TIME ZONE,
    severity VARCHAR(20) CHECK (severity IN ('CRITICAL', 'SERIOUS', 'STABLE')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. 108 AMBULANCE DISPATCH & EMERGENCY ALERTS
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_abha_id VARCHAR(50),
    patient_name VARCHAR(150) NOT NULL,
    triage_priority VARCHAR(10) NOT NULL CHECK (triage_priority IN ('RED', 'YELLOW', 'GREEN')),
    incident_description TEXT NOT NULL,
    vitals JSONB NOT NULL DEFAULT '{}'::jsonb, -- {bp, heartRate, spo2}
    responder_unit VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'En Route' CHECK (status IN ('En Route', 'Arrived', 'In Surgery', 'Stabilized', 'Closed')),
    eta_minutes INTEGER DEFAULT 5,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. APPOINTMENTS & CONSULTATIONS
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    consultation_type VARCHAR(30) DEFAULT 'In-Person OPD' CHECK (consultation_type IN ('In-Person OPD', 'Emergency Resuscitation', 'Teleconsultation')),
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    reason_for_visit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. E-PRESCRIPTIONS & CLINICAL NOTES
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    medications JSONB NOT NULL, -- [{name, dosage, frequency, days}]
    instructions TEXT,
    digital_signature VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. EMERGENCY PHARMACY & BLOOD BANK INVENTORY
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Critical Emergency', 'Analgesic', 'Antibiotic', 'Blood Product', 'IV Fluid')),
    dosage_form VARCHAR(50) NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    units_available INTEGER NOT NULL DEFAULT 0,
    reorder_threshold INTEGER NOT NULL DEFAULT 20,
    status VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN units_available <= 5 THEN 'Critical Shortage'
            WHEN units_available <= reorder_threshold THEN 'Low Stock'
            ELSE 'Adequate'
        END
    ) STORED,
    expiry_date DATE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. GOVERNMENT HEALTH SCHEMES (PM-JAY / STATE POLICIES)
CREATE TABLE IF NOT EXISTS government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_code VARCHAR(50) UNIQUE NOT NULL,
    scheme_name VARCHAR(200) NOT NULL,
    coverage_limit DECIMAL(12, 2) NOT NULL DEFAULT 500000.00,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS patient_scheme_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES government_schemes(id) ON DELETE CASCADE,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Expired')),
    valid_until DATE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. HOSPITAL NETWORK MUTUAL AID
CREATE TABLE IF NOT EXISTS hospital_network_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hub_hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    affiliated_hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    distance_km DECIMAL(6, 2) NOT NULL,
    mutual_aid_active BOOLEAN DEFAULT TRUE,
    shared_blood_bank_access BOOLEAN DEFAULT TRUE
);
