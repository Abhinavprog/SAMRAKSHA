import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Doctor } from '@/models/Doctor';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Update doctor profile
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { city, state, address, pincode } = body;

    // Validate required fields
    if (!city || !state || !address || !pincode) {
      return NextResponse.json(
        { error: 'All location fields are required' },
        { status: 400 }
      );
    }
    
    // Validate city - only allow letters, spaces, and hyphens
    const cityRegex = /^[a-zA-Z\s\-]{2,50}$/;
    if (!cityRegex.test(city)) {
      return NextResponse.json(
        { error: 'Invalid city name. Only letters, spaces, and hyphens are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate state - only allow letters, spaces, and hyphens
    const stateRegex = /^[a-zA-Z\s\-]{2,50}$/;
    if (!stateRegex.test(state)) {
      return NextResponse.json(
        { error: 'Invalid state name. Only letters, spaces, and hyphens are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate address - only allow letters, numbers, spaces, hyphens, periods, commas, and common address symbols
    const addressRegex = /^[a-zA-Z0-9\s\-\,\.\(\)#\/]{5,200}$/;
    if (!addressRegex.test(address)) {
      return NextResponse.json(
        { error: 'Invalid address. Only letters, numbers, spaces, commas, hyphens, periods, and common address symbols are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate pincode format (6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { error: 'Pincode must be a 6-digit number' },
        { status: 400 }
      );
    }

    // Update doctor profile
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      decoded.id,
      {
        city: city.trim(),
        state: state.trim(),
        address: address.trim(),
        pincode: pincode.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      doctor: {
        id: updatedDoctor._id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        phone: updatedDoctor.phone,
        nmcRegistrationNumber: updatedDoctor.nmcRegistrationNumber,
        specialization: updatedDoctor.specialization,
        city: updatedDoctor.city,
        state: updatedDoctor.state,
        address: updatedDoctor.address,
        pincode: updatedDoctor.pincode
      }
    });

  } catch (error: any) {
    console.error('Update doctor profile error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const errors: string[] = [];
      Object.keys(error.errors).forEach(key => {
        errors.push(error.errors[key].message);
      });
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get doctor profile
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

    // Get doctor profile
    const doctor = await Doctor.findById(decoded.id)
      .select('-password');

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        nmcRegistrationNumber: doctor.nmcRegistrationNumber,
        specialization: doctor.specialization,
        city: doctor.city,
        state: doctor.state,
        address: doctor.address,
        pincode: doctor.pincode
      }
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}