import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Doctor } from '@/models/Doctor';
import { Patient } from '@/models/Patient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a new appointment
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
    const { doctorId, appointmentDate, appointmentTime, reason } = body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate reason - only allow letters, numbers, spaces, and common punctuation
    const reasonRegex = /^[a-zA-Z0-9\s\-\,\.\(\)\[\]\:\;\/\'\"]{5,200}$/;
    if (!reasonRegex.test(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason. Only letters, numbers, spaces, and common punctuation are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate date format
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if appointment date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      );
    }

    // Get patient and doctor details
    const patient = await Patient.findById(decoded.id);
    const doctor = await Doctor.findById(doctorId);

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      patientName: patient.name,
      patientPhone: patient.phone,
      doctorName: doctor.name,
      doctorNMC: doctor.nmcRegistrationNumber,
      doctorSpecialization: doctor.specialization,
      doctorCity: doctor.city,
      doctorState: doctor.state,
      doctorAddress: doctor.address,
      doctorPincode: doctor.pincode,
      appointmentDate: date,
      appointmentTime,
      reason
    });

    return NextResponse.json({
      message: 'Appointment request sent successfully',
      appointment: {
        id: appointment._id,
        doctorName: appointment.doctorName,
        doctorNMC: appointment.doctorNMC,
        doctorSpecialization: appointment.doctorSpecialization,
        doctorCity: appointment.doctorCity,
        doctorState: appointment.doctorState,
        doctorAddress: appointment.doctorAddress,
        doctorPincode: appointment.doctorPincode,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get patient's appointments
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

    // Get patient's appointments
    const appointments = await Appointment.find({ patientId: decoded.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      appointments: appointments.map(appointment => ({
        id: appointment._id,
        doctorName: appointment.doctorName,
        doctorNMC: appointment.doctorNMC,
        doctorSpecialization: appointment.doctorSpecialization,
        doctorCity: appointment.doctorCity,
        doctorState: appointment.doctorState,
        doctorAddress: appointment.doctorAddress,
        doctorPincode: appointment.doctorPincode,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt
      }))
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}