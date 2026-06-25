import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import { Doctor } from '@/models/Doctor';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get prescription history for a patient
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

    if (decoded.role !== 'patient') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get phone from query params
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const prescriptions = await Prescription.find({ patientPhone: phone })
      .sort({ createdAt: -1 });

    console.log(`Found ${prescriptions.length} prescriptions for phone ${phone}`);
    prescriptions.forEach((p, i) => {
      console.log(`Prescription ${i+1}: ID=${p._id}, Doctor=${p.doctorName}, Has QR=${!!p.encryptedQRData}`);
    });

    return NextResponse.json({
      prescriptions: prescriptions.map(p => ({
        id: p._id,
        doctorName: p.doctorName,
        doctorNMC: p.doctorNMC,
        patientName: p.patientName,
        diagnosis: p.diagnosis,
        medicines: p.medicines,
        notes: p.notes,
        isUsed: p.isUsed,
        usedAt: p.usedAt,
        usedBy: p.usedBy,
        expiryDate: p.expiryDate,
        createdAt: p.createdAt,
        encryptedData: p.encryptedQRData
      }))
    });

  } catch (error) {
    console.error('Get patient history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify doctor by NMC ID
export async function POST(req: NextRequest) {
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

    if (decoded.role !== 'patient') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nmcNumber } = body;

    if (!nmcNumber) {
      return NextResponse.json(
        { error: 'NMC number is required' },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findOne({ nmcRegistrationNumber: nmcNumber });

    if (!doctor) {
      return NextResponse.json({
        isValid: false,
        message: 'Doctor not found with this NMC number'
      });
    }

    if (!doctor.verified) {
      return NextResponse.json({
        isValid: false,
        message: 'Doctor is not verified in the system'
      });
    }

    return NextResponse.json({
      isValid: true,
      doctor: {
        name: doctor.name,
        nmcRegistrationNumber: doctor.nmcRegistrationNumber,
        specialization: doctor.specialization,
        phone: doctor.phone
      }
    });

  } catch (error) {
    console.error('Verify doctor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
