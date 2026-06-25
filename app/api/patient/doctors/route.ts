import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Doctor } from '@/models/Doctor';
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

    if (decoded.role !== 'patient') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || '';
    const specialization = searchParams.get('specialization') || '';
    const city = searchParams.get('city') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination parameters
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 50); // Max 50 items per page

    // Build query - only return verified doctors
    const query: any = { verified: true };
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Count total doctors matching criteria
    const totalDoctors = await Doctor.countDocuments(query);
    
    // Calculate pagination values
    const totalPages = Math.ceil(totalDoctors / limitNum);
    const skip = (pageNum - 1) * limitNum;

    // Find doctors matching the criteria with pagination
    const doctors = await Doctor.find(query)
      .select('name nmcRegistrationNumber specialization phone city state address pincode')
      .skip(skip)
      .limit(limitNum);

    // Log the number of doctors found for debugging
    console.log(`Found ${doctors.length} verified doctors matching criteria (page ${pageNum} of ${totalPages})`);

    return NextResponse.json({
      doctors: doctors.map(doctor => ({
        id: (doctor._id as any).toString(),
        name: doctor.name,
        nmcRegistrationNumber: doctor.nmcRegistrationNumber,
        specialization: doctor.specialization,
        phone: doctor.phone,
        city: doctor.city,
        state: doctor.state,
        address: doctor.address,
        pincode: doctor.pincode
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalDoctors: totalDoctors,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}