import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import { Doctor } from '@/models/Doctor';
import { tryDecryptData } from '@/lib/encryption';
import {
  extractEncryptedPayload,
  buildCipherTextVariants,
  isDecryptedPrescriptionShape,
} from '@/lib/prescriptionPayload';
import { decryptedPayloadToPharmacistView } from '@/lib/pharmacistPrescriptionView';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const CRYPTO_PREFIX = 'U2FsdGVkX';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Exact DB match, then whitespace-normalized match (scan/paste often breaks exact string equality). */
async function findPrescriptionByCipherVariants(variants: string[]) {
  const uniq = [...new Set(variants.filter(Boolean))];
  for (const v of uniq) {
    const p = await Prescription.findOne({ encryptedQRData: v });
    if (p) return p;
  }
  const norm = (s: string) => s.replace(/[\r\n\t ]/g, '');
  const targetNorms = [...new Set(uniq.map(norm))];
  const count = await Prescription.countDocuments();
  if (count === 0) return null;
  if (count <= 800) {
    const all = await Prescription.find().select('encryptedQRData _id').lean();
    for (const row of all) {
      if (targetNorms.includes(norm(row.encryptedQRData))) {
        return await Prescription.findById(row._id);
      }
    }
    return null;
  }
  for (const t of targetNorms) {
    if (t.length < 16) continue;
    const prefix = t.slice(0, 16);
    const approx = await Prescription.find({
      encryptedQRData: { $regex: new RegExp('^' + escapeRegExp(prefix)) },
    })
      .limit(40)
      .select('encryptedQRData');
    for (const doc of approx) {
      if (norm(doc.encryptedQRData) === t) {
        return Prescription.findById(doc._id);
      }
    }
  }
  return null;
}

// Add this to verify the encryption key is loaded
console.log('AES_ENCRYPTION_KEY from env (verify):', process.env.AES_ENCRYPTION_KEY);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Verify pharmacist authentication
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

    if (decoded.role !== 'pharmacist') {
      return NextResponse.json(
        { error: 'Forbidden: Only pharmacists can verify prescriptions' },
        { status: 403 }
      );
    }

    const pharmacistId = String(decoded.id ?? '');

    const body = await req.json();
    const { encryptedData } = body;

    if (!encryptedData) {
      return NextResponse.json(
        { error: 'Encrypted data is required' },
        { status: 400 }
      );
    }

    const extracted = extractEncryptedPayload(String(encryptedData));

    if (!extracted.startsWith(CRYPTO_PREFIX)) {
      console.log('Invalid format after extract; first 60 chars:', extracted.substring(0, 60));
      return NextResponse.json(
        {
          valid: false,
          error:
            'Could not read encrypted prescription data. Use the QR image from Download QR (not a photo of the screen if possible), paste the ciphertext only, or if you scanned a link, ensure it includes the data= parameter.',
          reason: 'INVALID_FORMAT',
        },
        { status: 200 }
      );
    }

    const decryptVariants = [...new Set(buildCipherTextVariants(extracted))];
    let prescriptionData: Record<string, unknown> | null = null;
    let cipherUsed = '';

    for (const v of decryptVariants) {
      const d = tryDecryptData(v);
      if (d && isDecryptedPrescriptionShape(d)) {
        prescriptionData = d;
        cipherUsed = v;
        break;
      }
    }

    if (!prescriptionData || !cipherUsed) {
      return NextResponse.json(
        {
          valid: false,
          error:
            'Decryption failed or payload is not a prescription. Confirm the app uses the same AES_ENCRYPTION_KEY on doctor and server, and paste or scan the full QR payload.',
          reason: 'TAMPERED_DATA',
        },
        { status: 200 }
      );
    }

    const fromQR = decryptedPayloadToPharmacistView(prescriptionData);

    const lookupVariants = [...new Set([cipherUsed, ...decryptVariants])];
    const prescription = await findPrescriptionByCipherVariants(lookupVariants);

    console.log('🔍 Verify: decrypt ok; DB match:', prescription ? String(prescription._id) : 'none');

    if (!prescription) {
      const totalPrescriptions = await Prescription.countDocuments();
      return NextResponse.json(
        {
          valid: false,
          error:
            'This QR decrypts correctly but no matching prescription is stored in this database (demo prescriptions are often not saved, or the server encryption key / database differs from the doctor portal you used).',
          reason: 'NOT_FOUND',
          hint:
            'Use the same deployed app URL for doctor and pharmacist, confirm MongoDB has the prescription row, and avoid re-encoding the QR in external tools.',
          fromQR,
          debug: {
            cipherLength: cipherUsed.length,
            totalPrescriptions,
          },
        },
        { status: 200 }
      );
    }

    // Record that this pharmacist has scanned this prescription
    // Initialize scanStats if not present
    prescription.scanStats = prescription.scanStats || {
      totalScans: 0,
      validScans: 0,
      invalidScans: 0,
      expiredScans: 0,
      duplicateScans: 0
    };
    
    // Check if prescription is expired
    const now = new Date();
    if (new Date(prescription.expiryDate) < now) {
      console.log('⚠️ Case 2: Prescription EXPIRED');
      
      // Record this expired scan
      const pharmacistScanRecord = {
        pharmacistId,
        pharmacistName: decoded.name,
        pharmacyName: decoded.pharmacyName,
        scannedAt: new Date(),
        scanResult: 'EXPIRED' as const
      };
      
      try {
        prescription.scannedBy = prescription.scannedBy || [];
        prescription.scannedBy.push(pharmacistScanRecord);
        prescription.scanStats.totalScans = (prescription.scanStats.totalScans || 0) + 1;
        prescription.scanStats.expiredScans = (prescription.scanStats.expiredScans || 0) + 1;
        prescription.scanStats.invalidScans = (prescription.scanStats.invalidScans || 0) + 1;
        await prescription.save();
        console.log('✅ Recorded expired prescription scan');
      } catch (saveError: any) {
        console.error('❌ Failed to save expired prescription scan:', saveError.message);
      }
      
      return NextResponse.json(
        { 
          valid: false,
          error: 'Prescription has expired',
          reason: 'EXPIRED',
          fromQR,
          prescriptionData: {
            patientName: prescription.patientName,
            doctorName: prescription.doctorName,
            expiryDate: prescription.expiryDate
          },
          scanStats: prescription.scanStats
        },
        { status: 200 }
      );
    }

    // Check if prescription has been used
    if (prescription.isUsed) {
      console.log('⚠️ Case 3: Already Used Prescription');
      
      // Determine if it was used by same or different pharmacy
      const usedByDifferentPharmacy = prescription.usedBy !== decoded.pharmacyName;
      const scanResult = usedByDifferentPharmacy ? 'ALREADY_DISPENSED_BY_OTHER' : 'ALREADY_USED';
      
      // Record this duplicate scan
      const pharmacistScanRecord = {
        pharmacistId,
        pharmacistName: decoded.name,
        pharmacyName: decoded.pharmacyName,
        scannedAt: new Date(),
        scanResult: scanResult as 'ALREADY_DISPENSED_BY_OTHER' | 'ALREADY_USED'
      };
      
      try {
        prescription.scannedBy = prescription.scannedBy || [];
        prescription.scannedBy.push(pharmacistScanRecord);
        prescription.scanStats.totalScans = (prescription.scanStats.totalScans || 0) + 1;
        prescription.scanStats.duplicateScans = (prescription.scanStats.duplicateScans || 0) + 1;
        prescription.scanStats.invalidScans = (prescription.scanStats.invalidScans || 0) + 1;
        await prescription.save();
        console.log('✅ Recorded duplicate prescription scan');
      } catch (saveError: any) {
        console.error('❌ Failed to save duplicate prescription scan:', saveError.message);
      }
      
      // If the prescription has been used by a different pharmacy, count it as invalid for this pharmacist
      if (usedByDifferentPharmacy) {
        return NextResponse.json(
          { 
            valid: false,
            error: `This prescription has already been verified by ${prescription.usedBy}. It cannot be scanned again.`,
            reason: 'ALREADY_DISPENSED_BY_OTHER',
            fromQR,
            usedAt: prescription.usedAt,
            usedBy: prescription.usedBy,
            prescriptionData: {
              patientName: prescription.patientName,
              doctorName: prescription.doctorName
            },
            scanStats: prescription.scanStats
          },
          { status: 200 }
        );
      } else {
        // If the prescription has been used by the same pharmacy, show appropriate message
        return NextResponse.json(
          { 
            valid: false,
            error: 'This prescription has already been verified by your pharmacy. It cannot be scanned again.',
            reason: 'ALREADY_USED',
            fromQR,
            usedAt: prescription.usedAt,
            usedBy: prescription.usedBy,
            prescriptionData: {
              patientName: prescription.patientName,
              doctorName: prescription.doctorName
            },
            scanStats: prescription.scanStats
          },
          { status: 200 }
        );
      }
    }

    // Verify doctor exists and is verified
    const doctor = await Doctor.findById(prescription.doctorId);
    if (!doctor || !doctor.verified) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Issuing doctor is not verified or does not exist',
          reason: 'INVALID_DOCTOR',
          fromQR,
        },
        { status: 200 }
      );
    }

    // Case 1: Prescription is VALID - automatically mark as verified when scanned
    console.log('✅ Case 1: Valid Prescription - Marking as verified');
    
    try {
      prescription.isUsed = true;
      prescription.usedAt = new Date();
      prescription.usedBy = decoded.pharmacyName;
      
      // Record the valid scan
      const pharmacistScanRecord = {
        pharmacistId,
        pharmacistName: decoded.name,
        pharmacyName: decoded.pharmacyName,
        scannedAt: new Date(),
        scanResult: 'VALID' as const
      };
      
      prescription.scannedBy = prescription.scannedBy || [];
      prescription.scannedBy.push(pharmacistScanRecord);
      prescription.scanStats.totalScans = (prescription.scanStats.totalScans || 0) + 1;
      prescription.scanStats.validScans = (prescription.scanStats.validScans || 0) + 1;
      
      await prescription.save();
      console.log('✅ Prescription automatically verified on scan:', prescription._id);
    } catch (saveError: any) {
      console.error('❌ Failed to save prescription verification:', saveError.message);
      // Return success anyway - the scan was valid even if save failed
    }
    
    return NextResponse.json({
      valid: true,
      message: 'Prescription is valid and authentic',
      used: prescription.isUsed,
      scanStats: prescription.scanStats,
      fromQR,
      prescription: {
        id: prescription._id,
        doctorName: prescription.doctorName,
        doctorNMC: prescription.doctorNMC,
        patientName: prescription.patientName,
        patientAge: prescription.patientAge,
        patientGender: prescription.patientGender,
        diagnosis: prescription.diagnosis,
        medicines: prescription.medicines,
        notes: prescription.notes,
        issuedAt: prescription.createdAt,
        expiryDate: prescription.expiryDate
      }
    });

  } catch (error) {
    console.error('Prescription verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark prescription as used
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
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

    if (decoded.role !== 'pharmacist') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const pharmacistId = String(decoded.id ?? '');

    const body = await req.json();
    const { prescriptionId, pharmacyName } = body;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    if (prescription.isUsed) {
      // Even though the prescription is already used, we still need to record this scan
      // for proper invalid count tracking
      const pharmacistScanRecord = {
        pharmacistId,
        pharmacistName: decoded.name,
        pharmacyName: pharmacyName,
        scannedAt: new Date(),
        scanResult: 'ALREADY_USED' as const
      };
      
      const alreadyScanned = prescription.scannedBy?.some(
        scan => String(scan.pharmacistId) === pharmacistId
      );
      
      if (!alreadyScanned) {
        prescription.scannedBy = prescription.scannedBy || [];
        prescription.scannedBy.push(pharmacistScanRecord);
        await prescription.save();
        console.log('Recorded duplicate pharmacist scan for already used prescription:', prescription._id);
      }
      
      return NextResponse.json(
        { error: 'Prescription already verified' },
        { status: 400 }
      );
    }

    // Record this pharmacist's scan before marking as used
    const pharmacistScanRecord = {
      pharmacistId,
      pharmacistName: decoded.name,
      pharmacyName: pharmacyName,
      scannedAt: new Date(),
      scanResult: 'VALID' as const
    };
    
    // Check if already scanned (reuse the same check from above)
    const wasAlreadyScanned = prescription.scannedBy?.some(
      scan => String(scan.pharmacistId) === pharmacistId
    );
    
    if (!wasAlreadyScanned) {
      prescription.scannedBy = prescription.scannedBy || [];
      prescription.scannedBy.push(pharmacistScanRecord);
    }
    
    prescription.isUsed = true;
    prescription.usedAt = new Date();
    prescription.usedBy = pharmacyName;
    await prescription.save();

    return NextResponse.json({
      message: 'Prescription marked as verified',
      prescription: {
        id: prescription._id,
        usedAt: prescription.usedAt
      }
    });

  } catch (error) {
    console.error('========================================');
    console.error('❌ VERIFY ENDPOINT ERROR:');
    console.error('Error type:', error instanceof Error ? 'Error' : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('========================================');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
