# Samraksha

Secure digital prescription platform with separate portals for doctors, patients, and pharmacists.

## Live Deployment

The app is deployed on **Vercel** with **MongoDB Atlas** as the production database.

| | |
| --- | --- |
| **Production URL** | [https://samraksha-kappa.vercel.app](https://samraksha-kappa.vercel.app) |
| **Hosting** | [Vercel](https://vercel.com) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) |

**Portals**

- Doctor: [/doctor/login](https://samraksha-kappa.vercel.app/doctor/login) · [/doctor/signup](https://samraksha-kappa.vercel.app/doctor/signup)
- Patient: [/patient/login](https://samraksha-kappa.vercel.app/patient/login) · [/patient/signup](https://samraksha-kappa.vercel.app/patient/signup)
- Pharmacist: [/pharmacist/login](https://samraksha-kappa.vercel.app/pharmacist/login) · [/pharmacist/signup](https://samraksha-kappa.vercel.app/pharmacist/signup)

**Demo pages** (no auth): [/demo/doctor](https://samraksha-kappa.vercel.app/demo/doctor) · [/demo/patient](https://samraksha-kappa.vercel.app/demo/patient) · [/demo/pharmacist](https://samraksha-kappa.vercel.app/demo/pharmacist)

## What This Project Does

Samraksha helps issue, share, and verify prescriptions using encrypted QR codes.

- Doctors create prescriptions and generate QR codes.
- Patients view and download their prescription QR.
- Pharmacists scan or upload QR images to verify and dispense.
- The system blocks expired, tampered, and already-used prescriptions.

## Core Features

- Role-based auth for `doctor`, `patient`, and `pharmacist`
- JWT-based protected API routes
- AES-encrypted prescription payload inside QR codes
- Camera scan + image upload + manual encrypted payload verification
- Auto-mark as dispensed on valid pharmacist verification
- Dashboard stats and recent activity for each role
- Patient symptom → doctor matching (ML-based specialty prediction + verified doctor list)

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

### Backend

- Next.js API Routes
- JWT authentication
- `qrcode`
- `html5-qrcode`
- `jsqr`
- ZXing (`@zxing/browser`, `@zxing/library`)

### Database

- MongoDB Atlas (production)
- MongoDB / Mongoose (local development)

## Project Structure

```text
app/
  api/                # Backend routes (auth, doctor, patient, pharmacist, prescription)
  doctor/             # Doctor portal pages
  patient/            # Patient portal pages
  pharmacist/         # Pharmacist portal pages
components/           # Reusable UI components
lib/                  # DB, encryption, payload, QR decode utilities
data/                 # Local datasets (symptom ↔ specialty training examples)
models/               # Mongoose models
```

## Patient Symptom → Doctor Matching (ML)

The patient dashboard includes a section where a patient can enter symptoms and get:

- Top predicted specialties (with abbreviations like `GP`, `ENT`, `Peds Surg`, etc.)
- A list of **verified doctors** whose `specialization` matches the **top 3** predicted specialties

### How it works

- **Dataset**: `data/symptom-doctor-dataset.json`
  - Contains labeled training examples: `{ "symptoms": "...", "specialty": "..." }`
- **Classifier**: `lib/symptomDoctorMl.ts`
  - Multinomial Naive Bayes text classifier trained from the dataset
  - Returns top-k predictions with one-decimal confidence percentages that sum to **100.0**
- **Specialty → DB matching**: `lib/specialtyDoctorMatch.ts`
  - Maps the predicted specialty label to a MongoDB `$regex` so real-world strings match
  - Example: `Cardiology` matches `Cardiologist`, `cardio`, etc.
- **Specialty shortcuts**: `lib/specialtyShortcuts.ts`
  - Maps specialty names to abbreviations (and normalizes input so variants still resolve)
- **API**: `app/api/patient/symptom-doctors/route.ts`
  - `POST /api/patient/symptom-doctors` (patient JWT required)
  - Finds verified doctors matching the **top 3** predicted specialties

### API contract

Request:

```json
{ "symptoms": "chest tightness and shortness of breath while walking" }
```

Response (shape):

```json
{
  "predictions": [
    { "specialty": "Cardiology", "confidence": 63.2, "shortcut": "Cardio" }
  ],
  "doctors": [
    {
      "id": "...",
      "name": "...",
      "nmcRegistrationNumber": "...",
      "specialization": "...",
      "phone": "...",
      "city": "...",
      "state": "...",
      "address": "...",
      "pincode": "..."
    }
  ],
  "message": "No verified doctors matched your top three suggested specialties (...)." 
}
```

### Extending / customizing specialties

- **Add more training examples**: edit `data/symptom-doctor-dataset.json`
- **Add/adjust abbreviations**: edit `lib/specialtyShortcuts.ts`
- **Add/adjust DB matching patterns**: edit `lib/specialtyDoctorMatch.ts`

## Prerequisites

- Node.js 20+ (22 recommended)
- npm 10+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

## Environment Variables

Create `.env.local` in the project root for local development:

```env
MONGODB_URI=mongodb://localhost:27017/samraksha
JWT_SECRET=your_jwt_secret
AES_ENCRYPTION_KEY=your_32_character_aes_key_here
NMC_API_URL=https://nmc-api.example.com
```

For production on Vercel, set the same variables in **Project Settings → Environment Variables**. Use your MongoDB Atlas connection string for `MONGODB_URI`.

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. Use `mongodb://localhost:27017/samraksha` locally; use an Atlas `mongodb+srv://...` URI in production. |
| `JWT_SECRET` | Secret used to sign auth tokens for doctors, patients, and pharmacists. Use a long random string in production. |
| `AES_ENCRYPTION_KEY` | Key used to encrypt/decrypt prescription QR payloads. **Must stay the same** across deploys or existing QR codes will fail verification. |
| `NMC_API_URL` | External NMC verification API endpoint (placeholder in development). |

Do not commit `.env.local`.

## Local Development

```bash
npm install
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Production build (local)

```bash
npm run build
npm run start
```

## NPM Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server (after `build`) |
| `npm run lint` | Run ESLint |

## Deployment

This project is deployed with **Vercel** (frontend + API routes) and **MongoDB Atlas** (database).

### Architecture

```text
Browser  →  Vercel (Next.js 16)  →  MongoDB Atlas
              ├── Static pages
              └── API routes (/api/*)
```

### 1. MongoDB Atlas (production database)

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user with read/write privileges.
3. Under **Network Access**, allow `0.0.0.0/0` so Vercel serverless functions can connect.
4. Copy the connection string from **Connect → Drivers** and set the database name to `samraksha`:

```text
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/samraksha?retryWrites=true&w=majority
```

URL-encode special characters in the password (for example `@` → `%40`).

### 2. Vercel (hosting)

**Option A — GitHub import (recommended for CI/CD)**

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add environment variables under **Project Settings → Environment Variables** (Production):
   - `MONGODB_URI` — Atlas connection string from step 1
   - `JWT_SECRET`
   - `AES_ENCRYPTION_KEY`
   - `NMC_API_URL`
4. Deploy. Vercel detects Next.js automatically and runs `npm run build`.

**Option B — Vercel CLI**

```bash
npx vercel login
npx vercel link
npx vercel env add MONGODB_URI production
npx vercel env add JWT_SECRET production
npx vercel env add AES_ENCRYPTION_KEY production
npx vercel env add NMC_API_URL production
npx vercel deploy --prod
```

### 3. Verify the deployment

Open [https://samraksha-kappa.vercel.app](https://samraksha-kappa.vercel.app) and confirm:

- Home page loads at `/`
- Signup and login work for doctor, patient, and pharmacist portals
- API routes connect to Atlas (create a test account to verify)

### Deployment notes

- **MongoDB Atlas + Vercel**: Localhost MongoDB URIs do not work on Vercel; always use an Atlas `mongodb+srv://` string in production.
- **QR compatibility**: If you change `AES_ENCRYPTION_KEY` after prescriptions are issued, old QR codes will no longer decrypt. Rotate keys only with a migration plan.
- **Camera access**: Pharmacist QR scanning requires HTTPS in production; Vercel provides this by default.
- **Cold starts**: Serverless functions may add a short delay on the first API request after idle time.
- **Redeploy after env changes**: Run `npx vercel deploy --prod` or trigger a new deploy from the Vercel dashboard after updating environment variables.

## Verification Flow (High Level)

1. Doctor creates prescription.
2. Server encrypts payload and generates QR.
3. Patient presents QR at pharmacy.
4. Pharmacist scans/uploads QR.
5. Server decrypts, validates, checks expiry/usage, then marks valid Rx as used.

## Notes

- For best camera scan reliability, use newly generated QR images and good lighting/focus.
- Upload-based verification remains available when camera scan is not practical.
