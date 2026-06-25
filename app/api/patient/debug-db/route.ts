import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    console.log('🔍 Debug DB Request - Checking all prescriptions');
    
    // For debugging - skip auth temporarily
    // Get ALL prescriptions from database
    const allPrescriptions = await Prescription.find({}).select('_id patientName doctorName encryptedQRData createdAt patientPhone');
    
    console.log('📊 Database contains', allPrescriptions.length, 'prescriptions');
    allPrescriptions.forEach((p, i) => {
      console.log(`  [${i}] ID: ${String(p._id)}, Patient: ${p.patientName}, Phone: ${p.patientPhone}, Doctor: ${p.doctorName}, HasQR: ${!!p.encryptedQRData}`);
    });
    
    return NextResponse.json({
      total: allPrescriptions.length,
      prescriptions: allPrescriptions.map(p => ({
        id: String(p._id),
        patient: p.patientName,
        phone: p.patientPhone,
        doctor: p.doctorName,
        hasQR: !!p.encryptedQRData,
        createdAt: p.createdAt
      }))
    });

  } catch (error) {
    console.error('Debug DB error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
