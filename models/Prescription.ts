import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface IPrescription extends Document {
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  doctorNMC: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  medicines: IMedicine[];
  diagnosis: string;
  notes?: string;
  encryptedQRData: string;
  expiryDate: Date;
  isUsed: boolean;
  usedAt?: Date;
  usedBy?: string;
  scanStats?: {
    totalScans: number;
    validScans: number;
    invalidScans: number;
    expiredScans: number;
    duplicateScans: number;
  };
  scannedBy?: Array<{
    pharmacistId: string;
    pharmacistName: string;
    pharmacyName: string;
    scannedAt: Date;
    scanResult: 'VALID' | 'EXPIRED' | 'ALREADY_USED' | 'ALREADY_DISPENSED_BY_OTHER' | 'INVALID';
  }>;
  createdAt: Date;
}

const MedicineSchema = new Schema<IMedicine>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true }
}, { _id: false });

const PrescriptionSchema = new Schema<IPrescription>({
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  doctorNMC: { type: String, required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  patientAge: { type: Number, required: true },
  patientGender: { type: String, required: true },
  medicines: [MedicineSchema],
  diagnosis: { type: String, required: true },
  notes: { type: String },
  encryptedQRData: { type: String, required: true, unique: true },
  expiryDate: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  usedBy: { type: String },
  scannedBy: [{
    pharmacistId: String,
    pharmacistName: String,
    pharmacyName: String,
    scannedAt: { type: Date, default: Date.now },
    scanResult: { 
      type: String, 
      enum: ['VALID', 'EXPIRED', 'ALREADY_USED', 'ALREADY_DISPENSED_BY_OTHER', 'INVALID'],
      default: 'INVALID'
    }
  }],
  scanStats: {
    totalScans: { type: Number, default: 0 },
    validScans: { type: Number, default: 0 },
    invalidScans: { type: Number, default: 0 },
    expiredScans: { type: Number, default: 0 },
    duplicateScans: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

export const Prescription: Model<IPrescription> = mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
