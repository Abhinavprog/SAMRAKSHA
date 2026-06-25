import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    console.log('📊 Pharmacist Stats Request');
    
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

    // JWT may stringify ObjectId; DB may store string — compare as strings
    const pharmacistKey = String(decoded.id ?? '');

    // Get all prescriptions
    const prescriptions = await Prescription.find({});
    
    console.log(`Total prescriptions in DB: ${prescriptions.length}`);
    
    // Calculate stats
    const totalPrescriptions = prescriptions.length;
    
    // Count scanned by this pharmacist
    const scannedByPharmacist = prescriptions.filter(p => 
      p.scannedBy && p.scannedBy.some(scan => String(scan.pharmacistId) === pharmacistKey)
    ).length;
    
    // Count verified today
    const currentDate = new Date();
    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const todayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    
    const verifiedToday = prescriptions.filter(p => {
      return p.isUsed && 
             p.usedBy === decoded.pharmacyName && 
             new Date(p.usedAt!) >= todayStart && 
             new Date(p.usedAt!) < todayEnd;
    }).length;
    
    // Count invalid prescriptions
    // Invalid includes ONLY:
    // 1. Expired prescriptions (scanResult = 'EXPIRED')
    // 2. Already used prescriptions - duplicate attempts (scanResult = 'ALREADY_USED' or 'ALREADY_DISPENSED_BY_OTHER')
    //
    // DO NOT count as invalid:
    // - Valid prescriptions we successfully verified ourselves (scanResult = 'VALID')
    // - Invalid/Not Found QR codes (these are just failed scans, not actual prescriptions)
    const invalid = prescriptions.filter(p => {
      const scannedByThisPharmacist = p.scannedBy && p.scannedBy.some(scan => String(scan.pharmacistId) === pharmacistKey);
      
      if (!scannedByThisPharmacist) return false;
      
      // Skip prescriptions with no valid doctor/patient data (Invalid/Not Found QR codes)
      // These are just failed scan attempts, not actual invalid prescriptions
      if (!p.doctorId && !p.patientName && p.encryptedQRData) return false;
      
      // Check the scan results for this pharmacist
      const scansByThisPharmacist = (p.scannedBy || []).filter(scan => String(scan.pharmacistId) === pharmacistKey);
      
      // Count as invalid if any scan was marked as EXPIRED, ALREADY_USED, or ALREADY_DISPENSED_BY_OTHER
      const hasInvalidScan = scansByThisPharmacist.some(scan => 
        scan.scanResult === 'EXPIRED' || 
        scan.scanResult === 'ALREADY_USED' || 
        scan.scanResult === 'ALREADY_DISPENSED_BY_OTHER'
      );
      
      return hasInvalidScan;
    }).length;

    console.log(`Stats for ${decoded.name}: verified=${verifiedToday}, scanned=${scannedByPharmacist}, invalid=${invalid}`);

    return NextResponse.json({
      verifiedToday,
      scanned: scannedByPharmacist,
      prescriptions: totalPrescriptions,
      invalid
    });

  } catch (error) {
    console.error('Get pharmacist stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}