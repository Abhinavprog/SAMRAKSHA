# Samraksha

Secure digital prescription platform with separate portals for doctors, patients, and pharmacists.

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

- MongoDB
- Mongoose

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
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AES_ENCRYPTION_KEY=your_32_character_aes_key_here
```

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. Defaults to `mongodb://localhost:27017/samraksha` if unset. |
| `JWT_SECRET` | Secret used to sign auth tokens for doctors, patients, and pharmacists. Use a long random string in production. |
| `AES_ENCRYPTION_KEY` | Key used to encrypt/decrypt prescription QR payloads. **Must stay the same** across deploys or existing QR codes will fail verification. |

Do not commit `.env.local`. For production, set the same variables in your hosting provider's dashboard.

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

This is a Next.js 16 app with API routes and MongoDB. [Vercel](https://vercel.com) is the recommended host.

### 1. Prepare MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add a database user and copy the connection string.
3. Under **Network Access**, allow your deployment IP or `0.0.0.0/0` for development/testing.

Use a connection string like:

```text
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/samraksha?retryWrites=true&w=majority
```

### 2. Deploy to Vercel

1. Push this project to GitHub (or GitLab/Bitbucket).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add environment variables in the Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `AES_ENCRYPTION_KEY`
4. Deploy. Vercel detects Next.js automatically and runs `npm run build`.

Or deploy from the CLI:

```bash
npx vercel login
npx vercel
```

For a production URL:

```bash
npx vercel --prod
```

When prompted, add the three environment variables for the Production environment.

### 3. Verify the deployment

After deploy, open your Vercel URL and check:

- Home page loads at `/`
- Doctor signup/login at `/doctor/signup` and `/doctor/login`
- Patient signup/login at `/patient/signup` and `/patient/login`
- Pharmacist signup/login at `/pharmacist/signup` and `/pharmacist/login`

Demo pages (no auth required) are available under `/demo/*` for local testing flows.

### Deployment notes

- **QR compatibility**: If you change `AES_ENCRYPTION_KEY` after prescriptions are issued, old QR codes will no longer decrypt. Rotate keys only with a migration plan.
- **Camera access**: Pharmacist QR scanning requires HTTPS in production; Vercel provides this by default.
- **Cold starts**: Serverless functions may add a short delay on first API request after idle time.

## Verification Flow (High Level)

1. Doctor creates prescription.
2. Server encrypts payload and generates QR.
3. Patient presents QR at pharmacy.
4. Pharmacist scans/uploads QR.
5. Server decrypts, validates, checks expiry/usage, then marks valid Rx as used.

## Notes

- For best camera scan reliability, use newly generated QR images and good lighting/focus.
- Upload-based verification remains available when camera scan is not practical.
