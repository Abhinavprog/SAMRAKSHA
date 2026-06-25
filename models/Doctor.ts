import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  aadhaar: string;
  nmcRegistrationNumber: string;
  specialization: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  verified: boolean;
  createdAt: Date;
}

const DoctorSchema = new Schema<IDoctor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  aadhaar: { type: String, required: true, unique: true },
  nmcRegistrationNumber: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);