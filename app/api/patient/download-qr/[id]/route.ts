import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Prescription } from '@/models/Prescription';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { use } from 'react';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  
  console.log('========================================');
  console.log('🔔 DOWNLOAD QR ENDPOINT HIT!');
  console.log('URL:', req.url);
  console.log('Resolved Params ID:', resolvedParams.id);
  console.log('Method:', req.method);
  console.log('========================================');
  
  try {
    await dbConnect();
    
    console.log('🔍 Download QR request for prescription ID:', resolvedParams.id);
    
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

    // Try to find the prescription using both _id and string comparison
    console.log('Searching for prescription with _id:', resolvedParams.id);
    
    let prescription;
    try {
      // First try with findById using mongoose.Types.ObjectId
      const mongoose = require('mongoose');
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(resolvedParams.id);
        console.log('Created ObjectId:', objectId);
      } catch (e) {
        console.error('Invalid ObjectId format:', resolvedParams.id, e);
        return NextResponse.json(
          { error: 'Invalid prescription ID format' },
          { status: 400 }
        );
      }
      
      prescription = await Prescription.findById(objectId);
      
      if (!prescription) {
        console.log('findById failed, trying with findOne...');
        prescription = await Prescription.findOne({ _id: objectId });
      }
      
      if (!prescription) {
        console.log('findOne failed, trying with string ID...');
        prescription = await Prescription.findOne({ _id: resolvedParams.id });
      }
    } catch (findError) {
      console.error('Error during prescription lookup:', findError);
      return NextResponse.json(
        { error: 'Failed to find prescription', details: findError instanceof Error ? findError.message : String(findError) },
        { status: 500 }
      );
    }

    if (!prescription) {
      console.error('❌ Prescription not found with ID:', resolvedParams.id);
      console.log('Available prescriptions in database:');
      const allPrescriptions = await Prescription.find({}, '_id patientName doctorName encryptedQRData').limit(10);
      console.log(allPrescriptions.map(p => ({ 
        id: String(p._id), 
        patient: p.patientName, 
        doctor: p.doctorName,
        hasQR: !!p.encryptedQRData
      })));
      
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    console.log('✅ Prescription found:', prescription._id);
    console.log('Prescription data:', {
      hasEncryptedData: !!prescription.encryptedQRData,
      doctorName: prescription.doctorName,
      patientName: prescription.patientName,
      encryptedDataLength: prescription.encryptedQRData?.length
    });

    // Check if prescription has encrypted QR data
    if (!prescription.encryptedQRData) {
      console.error('❌ Prescription missing encrypted QR data:', resolvedParams.id);
      return NextResponse.json(
        { error: 'QR code not available for this prescription' },
        { status: 404 }
      );
    }

    console.log('Generating QR code from encrypted data...');
    try {
      // Generate a lower-density QR for reliable live camera scanning
      const qrCodeDataURL = await QRCode.toDataURL(prescription.encryptedQRData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 1024,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log('QR code generated successfully');

      return NextResponse.json({
        prescription: {
          id: prescription._id,
          qrCode: qrCodeDataURL,
          encryptedData: prescription.encryptedQRData,
          doctorName: prescription.doctorName,
          patientName: prescription.patientName,
          diagnosis: prescription.diagnosis,
          medicines: prescription.medicines,
          createdAt: prescription.createdAt,
          expiryDate: prescription.expiryDate
        }
      });
    } catch (qrError) {
      console.error('❌ QR Code generation failed:', qrError);
      return NextResponse.json(
        { error: 'Failed to generate QR code', details: qrError instanceof Error ? qrError.message : String(qrError) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Download QR error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
