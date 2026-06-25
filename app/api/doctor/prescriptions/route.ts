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

    // Get recent prescriptions by this doctor
    const recentPrescriptions = await Prescription.find({ 
      doctorId: decoded.id 
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    return NextResponse.json({
      prescriptions: recentPrescriptions.map(p => ({
        id: (p._id as any).toString(),
        patientName: p.patientName,
        patientPhone: p.patientPhone,
        diagnosis: p.diagnosis,
        isUsed: p.isUsed,
        expiryDate: p.expiryDate,
        createdAt: p.createdAt
      }))
    });

  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}