import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Patient } from '@/models/Patient';
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
    const patient = await Patient.findOne({ email });

    if (!patient) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const hashedPassword = hashPassword(password);
    if (patient.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { 
        id: patient._id,
        email: patient.email,
        role: 'patient'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: 'patient',
        phone: patient.phone
      }
    });
  } catch (error) {
    console.error('Patient login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}