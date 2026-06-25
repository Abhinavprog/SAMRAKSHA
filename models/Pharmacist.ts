import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPharmacist extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  pharmacyName: string;
  licenseNumber: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  verified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
}

const PharmacistSchema = new Schema<IPharmacist>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  pharmacyName: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Pharmacist: Model<IPharmacist> = mongoose.models.Pharmacist || mongoose.model<IPharmacist>('Pharmacist', PharmacistSchema);