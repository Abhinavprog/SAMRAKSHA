import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get doctor's appointments
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

    // Get doctor's appointments
    const appointments = await Appointment.find({ doctorId: decoded.id })
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return NextResponse.json({
      appointments: appointments.map(appointment => ({
        id: appointment._id,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt,
        doctorCity: appointment.doctorCity,
        doctorState: appointment.doctorState,
        doctorAddress: appointment.doctorAddress,
        doctorPincode: appointment.doctorPincode
      }))
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update appointment status
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
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Appointment ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find appointment and verify it belongs to this doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: decoded.id
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Update appointment status
    appointment.status = status as 'approved' | 'rejected' | 'completed';
    await appointment.save();

    return NextResponse.json({
      message: `Appointment ${status} successfully`,
      appointment: {
        id: appointment._id,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt,
        doctorCity: appointment.doctorCity,
        doctorState: appointment.doctorState,
        doctorAddress: appointment.doctorAddress,
        doctorPincode: appointment.doctorPincode
      }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}