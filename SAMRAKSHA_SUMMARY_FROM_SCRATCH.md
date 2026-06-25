# Samraksha - Project Summary

## Executive Overview
Samraksha is a full-stack healthcare web platform designed to make prescriptions secure, traceable, and easy to verify.  
It connects three key stakeholders - doctors, patients, and pharmacists - through a role-based system powered by encrypted QR workflows.

In short, Samraksha transforms a fragile paper-based prescription process into a digital trust system.

---

## Problem Being Solved
Traditional prescription handling creates serious real-world risks:
- Fake prescriptions are difficult to detect quickly.
- The same prescription can be reused multiple times.
- Pharmacists often have no instant authenticity check.
- Patients lack a unified digital prescription record.
- Sensitive medical data is not always protected end-to-end.

Samraksha addresses these gaps with secure generation, controlled access, and real-time verification.

---

## Product Vision
Build a safe and reliable prescription lifecycle where:
- doctors issue digitally signed-style prescriptions,
- patients carry trusted digital proof,
- pharmacists verify before dispensing,
- and every critical action is auditable.

---

## How Samraksha Works
1. Doctor creates a prescription in the doctor portal.
2. System encrypts prescription data and generates a QR code.
3. Patient stores or downloads that QR from their portal.
4. Pharmacist scans/uploads QR at dispensing time.
5. Backend verifies authenticity, expiry, and previous usage.
6. Valid prescriptions are marked as dispensed to prevent reuse.

---

## Key Modules

### 1) Doctor Portal
- Registration and login
- Profile and location management
- Prescription creation with QR generation
- Appointment management
- Dashboard insights and activity stats

### 2) Patient Portal
- Registration and login
- Doctor discovery and verification
- Appointment booking and tracking
- Prescription history and QR download
- Symptom-based doctor recommendations

### 3) Pharmacist Portal
- Registration and login
- Camera scan and image upload verification
- Verification outcomes (valid/expired/already used)
- Verification history and statistics

---

## Security and Trust Architecture
- Role-based access control for `doctor`, `patient`, and `pharmacist`
- JWT-protected APIs for authenticated access
- AES-based encrypted prescription payloads inside QR codes
- Expiry validation to block outdated prescriptions
- One-time usage protection to prevent duplicate dispensing
- Verification logs for audit and accountability

---

## Technology Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, JWT middleware logic
- **Database:** MongoDB + Mongoose
- **QR and Scan Utilities:** `qrcode`, `html5-qrcode`, `jsqr`, ZXing
- **Core Utilities:** encryption, payload parsing, and verification helpers in `lib/`

---

## Intelligence Layer (Patient Assistance)
Samraksha includes an ML-assisted symptom workflow:
- Uses `data/symptom-doctor-dataset.json` as training input.
- Predicts likely specialties from symptom text.
- Recommends verified doctors aligned with top predictions.

This helps patients discover relevant doctors faster while keeping recommendations grounded in verified profiles.

---

## High-Level Architecture
- `app/` - UI routes and API route handlers
- `models/` - database schemas
- `lib/` - shared logic (DB, encryption, QR decode, matching)
- `components/` - reusable frontend components
- `data/` - ML support datasets

---

## Business and User Impact
Samraksha delivers value on multiple fronts:
- Reduces prescription fraud risk
- Improves dispensing safety
- Gives patients transparent access to their records
- Builds stronger trust between healthcare actors
- Creates a scalable foundation for future healthcare integrations

---

## Conclusion
Samraksha is a practical, security-first digital prescription ecosystem.  
By combining role-based workflows, encrypted QR verification, and real-time validation, it provides a modern and dependable framework for prescription management in real healthcare settings.
