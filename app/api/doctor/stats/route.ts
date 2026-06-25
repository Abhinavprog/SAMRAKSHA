import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
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

    if (decoded.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get doctor's prescriptions
    const prescriptions = await Prescription.find({ doctorId: decoded.id });
    
    // Calculate stats
    const totalPrescriptions = prescriptions.length;
    
    // Count verified today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const verifiedToday = prescriptions.filter(p => {
      return p.isUsed && new Date(p.usedAt!).toDateString() === today.toDateString();
    }).length;
    
    // Get unique patients
    const uniquePatients = new Set(prescriptions.map(p => p.patientName));
    const patientsServed = uniquePatients.size;

    return NextResponse.json({
      totalPrescriptions,
      verifiedToday,
      patientsServed
    });

  } catch (error) {
    console.error('Get doctor stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}