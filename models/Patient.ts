import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  gender: string;
  createdAt: Date;
}

const PatientSchema = new Schema<IPatient>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
