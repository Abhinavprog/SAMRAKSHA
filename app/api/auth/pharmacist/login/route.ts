import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pharmacist } from '@/models/Pharmacist';
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
    const pharmacist = await Pharmacist.findOne({ email });

    if (!pharmacist) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const hashedPassword = hashPassword(password);
    if (pharmacist.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { 
        id: pharmacist._id,
        email: pharmacist.email,
        role: 'pharmacist',
        name: pharmacist.name,
        pharmacyName: pharmacist.pharmacyName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: pharmacist._id,
        name: pharmacist.name,
        email: pharmacist.email,
        role: 'pharmacist',
        pharmacyName: pharmacist.pharmacyName,
        city: pharmacist.city,
        state: pharmacist.state,
        address: pharmacist.address,
        pincode: pharmacist.pincode
      }
    });
  } catch (error) {
    console.error('Pharmacist login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}