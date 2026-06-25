import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorNMC: string;
  doctorSpecialization: string;
  doctorCity: string;
  doctorState: string;
  doctorAddress: string;
  doctorPincode: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorNMC: { type: String, required: true },
  doctorSpecialization: { type: String, required: true },
  doctorCity: { type: String, required: true },
  doctorState: { type: String, required: true },
  doctorAddress: { type: String, required: true },
  doctorPincode: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
AppointmentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Appointment: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);