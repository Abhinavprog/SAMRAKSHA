import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import { Doctor } from '@/models/Doctor';
import { Patient } from '@/models/Patient';
import { encryptData, hashPassword } from '@/lib/encryption';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/** Lets demo-doctor JWT prescriptions be verified by pharmacists against MongoDB. */
async function getOrCreateDemoIssuerDoctor() {
  const email = 'samraksha-internal-demo-issuer@local.invalid';
  const existing = await Doctor.findOne({ email });
  if (existing) return existing;
  const suffix = randomBytes(4).toString('hex');
  return Doctor.create({
    name: 'Demo issuer (Samraksha)',
    email,
    password: hashPassword(`internal-demo-${suffix}`),
    phone: '9999999999',
    aadhaar: `DEMO${suffix}00`.slice(0, 12),
    nmcRegistrationNumber: `DEMO-NMC-${suffix}`,
    specialization: 'General Medicine',
    city: '—',
    state: '—',
    address: '—',
    pincode: '000000',
    verified: true,
  });
}

// Add this to verify the encryption key is loaded
console.log('AES_ENCRYPTION_KEY from env:', process.env.AES_ENCRYPTION_KEY);

export async function POST(req: NextRequest) {
  try {
    // Verify doctor authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Forbidden: Only doctors can generate prescriptions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { patientName, patientPhone, patientAge, patientGender, medicines, diagnosis, notes, validityDays } = body;

    // Validate required fields
    if (!patientName || !patientPhone || !patientAge || !patientGender || !medicines || medicines.length === 0 || !diagnosis) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }
    
    // Validate medicine details - only allow alphanumeric characters, spaces, hyphens, and common medicine-related characters
    for (const medicine of medicines) {
      if (!medicine.name || !medicine.dosage || !medicine.frequency || !medicine.duration) {
        return NextResponse.json(
          { error: 'All medicine details must be provided' },
          { status: 400 }
        );
      }
      
      // Validate medicine name - only allow letters, numbers, spaces, hyphens, parentheses, and periods
      const medicineNameRegex = /^[a-zA-Z0-9\s\-\(\)\.]+$/;
      if (!medicineNameRegex.test(medicine.name)) {
        return NextResponse.json(
          { error: 'Invalid medicine name. Only letters, numbers, spaces, hyphens, parentheses, and periods are allowed.' },
          { status: 400 }
        );
      }
      
      // Validate dosage - only allow numbers, letters, spaces, hyphens, and common units
      const dosageRegex = /^[0-9\s\+\-\*\/\(\)\.a-zA-Z]+$/;
      if (!dosageRegex.test(medicine.dosage)) {
        return NextResponse.json(
          { error: 'Invalid dosage format. Only numbers, operators, and letters are allowed.' },
          { status: 400 }
        );
      }
      
      // Validate frequency - only allow letters, numbers, spaces, and common symbols
      const frequencyRegex = /^[a-zA-Z0-9\s\-\,\(\)\.\/]+$/;
      if (!frequencyRegex.test(medicine.frequency)) {
        return NextResponse.json(
          { error: 'Invalid frequency format. Only letters, numbers, spaces, commas, hyphens, and slashes are allowed.' },
          { status: 400 }
        );
      }
      
      // Validate duration - only allow letters, numbers, spaces, and common symbols
      const durationRegex = /^[a-zA-Z0-9\s\-\,\(\)\.\/]+$/;
      if (!durationRegex.test(medicine.duration)) {
        return NextResponse.json(
          { error: 'Invalid duration format. Only letters, numbers, spaces, commas, hyphens, and slashes are allowed.' },
          { status: 400 }
        );
      }
    }
    
    // Validate diagnosis - only allow letters, numbers, spaces, punctuation, and medical terms
    const diagnosisRegex = /^[a-zA-Z0-9\s\-\,\.\(\)\[\]\:\;\/\']+$/;
    if (!diagnosisRegex.test(diagnosis)) {
      return NextResponse.json(
        { error: 'Invalid diagnosis format. Only letters, numbers, spaces, and common punctuation are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate notes if provided
    if (notes && notes.trim()) {
      const notesRegex = /^[a-zA-Z0-9\s\-\,\.\(\)\[\]\:\;\/\'\"]+$/;
      if (!notesRegex.test(notes)) {
        return NextResponse.json(
          { error: 'Invalid notes format. Only letters, numbers, spaces, and common punctuation are allowed.' },
          { status: 400 }
        );
      }
    }
    
    // Validate patient name - only allow letters, spaces, hyphens, and apostrophes
    const patientNameRegex = /^[a-zA-Z\s\-\']{2,50}$/;
    if (!patientNameRegex.test(patientName)) {
      return NextResponse.json(
        { error: 'Invalid patient name. Only letters, spaces, hyphens, and apostrophes are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate patient phone number format (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(patientPhone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }
    
    // Validate patient age (1-120 years)
    const age = parseInt(patientAge);
    if (isNaN(age) || age < 1 || age > 120) {
      return NextResponse.json(
        { error: 'Invalid age. Please enter a valid age between 1 and 120 years.' },
        { status: 400 }
      );
    }
    
    // Validate patient gender
    if (!['male', 'female', 'other'].includes(patientGender.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid gender. Please select male, female, or other.' },
        { status: 400 }
      );
    }
    
    // Check if patient exists in the system and validate details match
    const registeredPatient = await Patient.findOne({ phone: patientPhone });
    
    if (!registeredPatient) {
      // Do not allow prescriptions for patients who have not signed up
      return NextResponse.json(
        { error: 'Patient is not registered in the system. Please ask the patient to sign up before generating a prescription.' },
        { status: 400 }
      );
    }
    
    // If patient is registered, verify that provided details match registered details
    if (registeredPatient.name.toLowerCase() !== patientName.toLowerCase()) {
      return NextResponse.json(
        { error: 'Patient name does not match registered details. Please verify patient information.' },
        { status: 400 }
      );
    }
    
    if (registeredPatient.age !== age) {
      return NextResponse.json(
        { error: 'Patient age does not match registered details. Please verify patient information.' },
        { status: 400 }
      );
    }
    
    if (registeredPatient.gender.toLowerCase() !== patientGender.toLowerCase()) {
      return NextResponse.json(
        { error: 'Patient gender does not match registered details. Please verify patient information.' },
        { status: 400 }
      );
    }

    // Check if this is a demo user (ID starts with 'demo-')
    const isDemoMode = decoded.id && decoded.id.startsWith('demo-');

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (validityDays || 7));

    // Demo doctor data
    const doctorData = {
      name: decoded.nmcNumber === 'NMC123456' ? 'Dr. Rajesh Kumar' : 'Doctor',
      nmcRegistrationNumber: decoded.nmcNumber || 'NMC123456'
    };

    // Create prescription data for encryption
    const prescriptionData = {
      doctorName: doctorData.name,
      doctorNMC: doctorData.nmcRegistrationNumber,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      medicines,
      diagnosis,
      notes: notes || '',
      issuedAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString()
    };

    // Encrypt prescription data
    const encryptedQRData = encryptData(prescriptionData);
    
    // CRITICAL: Verify encryption produced valid output
    if (!encryptedQRData || !encryptedQRData.startsWith('U2FsdGVkX')) {
      console.error('❌ Encryption failed - output does not start with U2FsdGVkX');
      return NextResponse.json(
        { error: 'Encryption failed. Please try again.' },
        { status: 500 }
      );
    }
    
    console.log('✅ Encryption successful');
    console.log('   Key prefix:', process.env.AES_ENCRYPTION_KEY?.substring(0, 10) + '...');
    console.log('   Encrypted length:', encryptedQRData.length);
    console.log('   Starts with U2FsdGVkX:', encryptedQRData.startsWith('U2FsdGVkX'));

    // Generate a lower-density QR for reliable live camera scanning
    const qrCodeDataURL = await QRCode.toDataURL(encryptedQRData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 1024,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    if (isDemoMode) {
      console.log('Prescription generated in demo mode');
      let persistedId: string | null = null;
      try {
        await dbConnect();
        const issuer = await getOrCreateDemoIssuerDoctor();
        const saved = await Prescription.create({
          doctorId: issuer._id,
          doctorName: doctorData.name,
          doctorNMC: doctorData.nmcRegistrationNumber,
          patientName,
          patientPhone,
          patientAge,
          patientGender,
          medicines,
          diagnosis,
          notes: notes || '',
          encryptedQRData,
          expiryDate,
          isUsed: false,
        });
        persistedId = String(saved._id);
        console.log('Demo prescription saved for verification:', persistedId);
      } catch (e) {
        console.warn('Demo prescription could not be saved; pharmacist verify may return NOT_FOUND:', e);
      }
      return NextResponse.json(
        {
          message: 'Prescription created successfully (Demo Mode)',
          prescription: {
            id: persistedId || 'demo-' + Date.now(),
            encryptedData: encryptedQRData,
            qrCode: qrCodeDataURL,
            expiryDate: expiryDate,
          },
        },
        { status: 201 }
      );
    }

    // Database mode: Try to save to MongoDB
    try {
      await dbConnect();
      const doctor = await Doctor.findById(decoded.id);
      
      if (!doctor || !doctor.verified) {
        return NextResponse.json(
          { error: 'Doctor not found or not verified' },
          { status: 403 }
        );
      }

      // Create prescription in database
      const prescription = await Prescription.create({
        doctorId: doctor._id,
        doctorName: doctor.name,
        doctorNMC: doctor.nmcRegistrationNumber,
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        medicines,
        diagnosis,
        notes: notes || '',
        encryptedQRData,
        expiryDate,
        isUsed: false
      });

      console.log('Prescription saved to database:', prescription._id);
      console.log('Encrypted data length:', encryptedQRData.length);
      console.log('Encrypted data preview:', encryptedQRData.substring(0, 50));

      // Verify the prescription was saved correctly by immediately retrieving it
      const savedPrescription = await Prescription.findById(prescription._id);
      console.log('Verification - Saved prescription found:', !!savedPrescription);
      if (savedPrescription) {
        console.log('Verification - Encrypted data match:', savedPrescription.encryptedQRData === encryptedQRData);
      }

      return NextResponse.json({
        message: 'Prescription created successfully',
        prescription: {
          id: prescription._id,
          encryptedData: encryptedQRData,
          qrCode: qrCodeDataURL,
          expiryDate: expiryDate
        }
      }, { status: 201 });
    } catch (dbError) {
      console.error('Database error, continuing in demo mode:', dbError);
      // Don't fallback to demo mode, show the actual error
      return NextResponse.json(
        { error: 'Failed to save prescription to database: ' + (dbError as Error).message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Prescription generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all prescriptions for a doctor
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if demo mode
    const isDemoMode = decoded.id && decoded.id.startsWith('demo-');

    if (isDemoMode) {
      // Demo mode: return empty array (no prescription history in demo)
      console.log('Prescription history requested in demo mode');
      return NextResponse.json({ prescriptions: [] });
    }

    // Database mode: fetch prescriptions
    try {
      await dbConnect();
      const prescriptions = await Prescription.find({ doctorId: decoded.id })
        .sort({ createdAt: -1 });

      return NextResponse.json({
        prescriptions: prescriptions.map(p => ({
          id: p._id,
          patientName: p.patientName,
          diagnosis: p.diagnosis,
          createdAt: p.createdAt,
          expiryDate: p.expiryDate,
          isUsed: p.isUsed
        }))
      });
    } catch (dbError) {
      console.error('Database error fetching prescriptions:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch prescriptions' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
