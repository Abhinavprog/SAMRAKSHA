import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pharmacist } from '@/models/Pharmacist';
import { hashPassword } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, pharmacyName, licenseNumber, city, state, address, pincode } = body;

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
        { error: 'Phone is required' },
        { status: 400 }
      );
    }

    if (!pharmacyName) {
      return NextResponse.json(
        { error: 'Pharmacy name is required' },
        { status: 400 }
      );
    }

    if (!licenseNumber) {
      return NextResponse.json(
        { error: 'License number is required' },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        { error: 'State is required' },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if pharmacist already exists
    const existingPharmacist = await Pharmacist.findOne({ email });
    if (existingPharmacist) {
      return NextResponse.json(
        { error: 'Pharmacist with this email already exists' },
        { status: 409 }
      );
    }

    // Check if license number already exists
    const existingLicense = await Pharmacist.findOne({ licenseNumber });
    if (existingLicense) {
      return NextResponse.json(
        { error: 'License number already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const newPharmacist = new Pharmacist({
      name,
      email,
      password: hashedPassword,
      phone,
      pharmacyName,
      licenseNumber,
      city,
      state,
      address,
      pincode
    });

    await newPharmacist.save();

    return NextResponse.json({
      message: 'Pharmacist registered successfully',
      pharmacist: {
        id: newPharmacist._id,
        name: newPharmacist.name,
        email: newPharmacist.email,
        pharmacyName: newPharmacist.pharmacyName
      }
    });
  } catch (error) {
    console.error('Pharmacist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}