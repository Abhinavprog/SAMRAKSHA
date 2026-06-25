import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Doctor } from '@/models/Doctor';
import { hashPassword } from '@/lib/encryption';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find doctor
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const hashedPassword = hashPassword(password);
    if (doctor.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!doctor.verified) {
      return NextResponse.json(
        { error: 'Account not verified' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: doctor._id,
        email: doctor.email,
        role: 'doctor',
        nmcNumber: doctor.nmcRegistrationNumber
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor',
        nmcNumber: doctor.nmcRegistrationNumber,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}