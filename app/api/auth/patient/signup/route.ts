import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Patient } from '@/models/Patient';
import { hashPassword } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, password, phone, age, gender } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!age) {
      return NextResponse.json(
        { error: 'Age is required' },
        { status: 400 }
      );
    }
    if (!gender) {
      return NextResponse.json(
        { error: 'Gender is required' },
        { status: 400 }
      );
    }
    
    // Validate patient name - only allow letters, spaces, hyphens, and apostrophes
    const patientNameRegex = /^[a-zA-Z\s\-\']{2,50}$/;
    if (!patientNameRegex.test(name)) {
      return NextResponse.json(
        { error: 'Invalid patient name. Only letters, spaces, hyphens, and apostrophes are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate phone number - only allow 10 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }
    
    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return NextResponse.json(
        { error: 'Invalid age. Age must be between 1 and 120.' },
        { status: 400 }
      );
    }
    
    // Validate gender
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid gender. Please select male, female, or other.' },
        { status: 400 }
      );
    }

    const existingPatient = await Patient.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Patient with this email or phone already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const newPatient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      phone,
      age: ageNum,
      gender
    });

    return NextResponse.json({
      message: 'Patient registered successfully',
      patient: {
        id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Patient signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}