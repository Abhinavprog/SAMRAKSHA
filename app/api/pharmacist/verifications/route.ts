import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    console.log('📋 Pharmacist Verifications Request');
    
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

    // Get recent verifications by this pharmacist
    const recentVerifications = await Prescription.find({ 
      isUsed: true, 
      usedBy: decoded.pharmacyName 
    })
    .sort({ usedAt: -1 })
    .limit(10);
    
    console.log(`Found ${recentVerifications.length} recent verifications`);
    
    return NextResponse.json({
      verifications: recentVerifications.map(p => ({
        id: (p._id as any).toString(),
        doctorName: p.doctorName,
        patientName: p.patientName,
        diagnosis: p.diagnosis,
        isUsed: p.isUsed,
        createdAt: p.usedAt
      }))
    });

  } catch (error) {
    console.error('Get pharmacist verifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}