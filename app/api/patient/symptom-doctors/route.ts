import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { Doctor } from '@/models/Doctor';
import { getSymptomClassifier } from '@/lib/symptomDoctorMl';
import { specialtyToMongoPattern } from '@/lib/specialtyDoctorMatch';
import { getSpecialtyShortcut } from '@/lib/specialtyShortcuts';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: JwtPayload & { role?: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { role?: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'patient') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const symptoms = typeof body.symptoms === 'string' ? body.symptoms.trim() : '';
    if (!symptoms) {
      return NextResponse.json({ error: 'Please describe your symptoms.' }, { status: 400 });
    }

    const classifier = getSymptomClassifier();
    const predictions = classifier.predictTop(symptoms, 5);

    if (predictions.length === 0) {
      return NextResponse.json({
        predictions: [],
        doctors: [],
        message: 'Could not analyze symptoms. Try adding more detail.',
      });
    }

    const topThree = predictions.slice(0, 3);
    const orConditions = topThree.map((p) => ({
      specialization: { $regex: specialtyToMongoPattern(p.specialty), $options: 'i' },
    }));

    // Match verified doctors against the top 3 ML specialties (any match counts).
    const doctors = await Doctor.find({
      verified: true,
      $or: orConditions,
    })
      .select('name nmcRegistrationNumber specialization phone city state address pincode')
      .limit(30)
      .lean();

    const mapped = doctors.map((doctor) => ({
      id: doctor._id.toString(),
      name: doctor.name,
      nmcRegistrationNumber: doctor.nmcRegistrationNumber,
      specialization: doctor.specialization,
      phone: doctor.phone,
      city: doctor.city,
      state: doctor.state,
      address: doctor.address,
      pincode: doctor.pincode,
    }));

    const predictionsWithShortcuts = predictions.map((p) => ({
      ...p,
      shortcut: getSpecialtyShortcut(p.specialty),
    }));

    const topThreeSummary = topThree
      .map((p) => {
        const s = getSpecialtyShortcut(p.specialty);
        return s !== p.specialty ? `${p.specialty} (${s})` : p.specialty;
      })
      .join(', ');

    return NextResponse.json({
      predictions: predictionsWithShortcuts,
      doctors: mapped,
      message:
        mapped.length === 0
          ? `No verified doctors matched your top three suggested specialties (${topThreeSummary}). Try Find Doctors or refine your symptoms.`
          : undefined,
    });
  } catch (error) {
    console.error('symptom-doctors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
