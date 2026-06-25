import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Doctor } from '@/models/Doctor';
import { hashPassword } from '@/lib/encryption';

// Mock NMC verification - Replace with actual NMC API
async function verifyNMC(nmcNumber: string, aadhaar: string): Promise<boolean> {
  // In production, this would call the actual NMC API
  // For demo purposes, we'll accept:
  // 1. Any NMC number (minimum 3 characters)
  // 2. Any Aadhaar that has 10-12 digits
  const nmcValid = Boolean(nmcNumber && nmcNumber.length >= 3);
  const aadhaarValid = Boolean(aadhaar && aadhaar.length >= 10 && aadhaar.length <= 12 && /^\d+$/.test(aadhaar));
  return nmcValid && aadhaarValid;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, password, phone, aadhaar, nmcRegistrationNumber, specialization, city, state, address, pincode } = body;

    // Validate required fields individually for better error messages
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
    if (!aadhaar) {
      return NextResponse.json(
        { error: 'Aadhaar number is required' },
        { status: 400 }
      );
    }
    if (!nmcRegistrationNumber) {
      return NextResponse.json(
        { error: 'NMC Registration Number is required' },
        { status: 400 }
      );
    }
    if (!specialization) {
      return NextResponse.json(
        { error: 'Specialization is required' },
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
    
    // Validate doctor name - only allow letters, spaces, hyphens, and apostrophes
    const doctorNameRegex = /^[a-zA-Z\s\-\']{2,50}$/;
    if (!doctorNameRegex.test(name)) {
      return NextResponse.json(
        { error: 'Invalid doctor name. Only letters, spaces, hyphens, and apostrophes are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate specialization - only allow letters, spaces, hyphens, and common medical terms
    const specializationRegex = /^[a-zA-Z\s\-\,\.\(\)]{2,100}$/;
    if (!specializationRegex.test(specialization)) {
      return NextResponse.json(
        { error: 'Invalid specialization. Only letters, spaces, commas, hyphens, and parentheses are allowed.' },
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
    
    // Validate pincode - only allow 6 digits
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode. Pincode must be 6 digits.' },
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
    
    // Validate Aadhaar - only allow 10-12 digits
    const aadhaarRegex = /^\d{10,12}$/;
    if (!aadhaarRegex.test(aadhaar)) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number. Aadhaar must be 10-12 digits.' },
        { status: 400 }
      );
    }
    
    // Validate NMC Registration Number - allow alphanumeric and hyphens
    const nmcRegex = /^[a-zA-Z0-9\-]{3,20}$/;
    if (!nmcRegex.test(nmcRegistrationNumber)) {
      return NextResponse.json(
        { error: 'Invalid NMC Registration Number format. Only letters, numbers, and hyphens are allowed.' },
        { status: 400 }
      );
    }

    // Check for existing doctor with same email, Aadhaar, or NMC number
    const existingDoctor = await Doctor.findOne({
      $or: [
        { email: email.trim() },
        { aadhaar: aadhaar.trim() },
        { nmcRegistrationNumber: nmcRegistrationNumber.trim() }
      ]
    });

    if (existingDoctor) {
      // Provide specific error message based on which field is duplicate
      if (existingDoctor.email === email.trim()) {
        return NextResponse.json(
          { error: 'Doctor with this email already exists' },
          { status: 400 }
        );
      } else if (existingDoctor.aadhaar === aadhaar.trim()) {
        return NextResponse.json(
          { error: 'Doctor with this Aadhaar number already exists' },
          { status: 400 }
        );
      } else if (existingDoctor.nmcRegistrationNumber === nmcRegistrationNumber.trim()) {
        return NextResponse.json(
          { error: 'Doctor with this NMC Registration Number already exists. NMC number must be unique for every doctor.' },
          { status: 400 }
        );
      }
    }

    // Verify NMC Registration
    const isVerified = await verifyNMC(nmcRegistrationNumber.trim(), aadhaar.trim());

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Invalid NMC Registration or Aadhaar. Verification failed.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create new doctor
    const newDoctor = await Doctor.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      phone: phone.trim(),
      aadhaar: aadhaar.trim(),
      nmcRegistrationNumber: nmcRegistrationNumber.trim(),
      specialization: specialization.trim(),
      city: city.trim(),
      state: state.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      verified: true // Set to true after NMC verification
    });

    return NextResponse.json({
      message: 'Doctor registered successfully',
      doctor: {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        nmcRegistrationNumber: newDoctor.nmcRegistrationNumber
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Doctor signup error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      if (duplicateField === 'nmcRegistrationNumber') {
        return NextResponse.json(
          { error: 'Doctor with this NMC Registration Number already exists. NMC number must be unique for every doctor.' },
          { status: 400 }
        );
      } else if (duplicateField === 'email') {
        return NextResponse.json(
          { error: 'Doctor with this email already exists' },
          { status: 400 }
        );
      } else if (duplicateField === 'aadhaar') {
        return NextResponse.json(
          { error: 'Doctor with this Aadhaar number already exists' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}