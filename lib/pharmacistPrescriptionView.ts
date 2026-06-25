/**
 * Shape returned to pharmacists for “what this QR contains” (from decrypted JSON).
 */

export type PharmacistFromQRView = {
  doctorName: string;
  doctorNMC: string;
  patientName: string;
  patientPhone?: string;
  patientAge: string | number;
  patientGender: string;
  diagnosis: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
  issuedAt: string;
  expiryDate: string;
};

export function decryptedPayloadToPharmacistView(
  d: Record<string, unknown>
): PharmacistFromQRView {
  const meds = Array.isArray(d.medicines) ? d.medicines : [];
  return {
    doctorName: String(d.doctorName ?? ''),
    doctorNMC: String(d.doctorNMC ?? ''),
    patientName: String(d.patientName ?? ''),
    patientPhone: d.patientPhone != null ? String(d.patientPhone) : undefined,
    patientAge: (d.patientAge as string | number) ?? '',
    patientGender: String(d.patientGender ?? ''),
    diagnosis: String(d.diagnosis ?? ''),
    medicines: meds.map((m: unknown) => {
      const x = m as Record<string, unknown>;
      return {
        name: String(x?.name ?? ''),
        dosage: String(x?.dosage ?? ''),
        frequency: String(x?.frequency ?? ''),
        duration: String(x?.duration ?? ''),
      };
    }),
    notes: String(d.notes ?? ''),
    issuedAt: typeof d.issuedAt === 'string' ? d.issuedAt : '',
    expiryDate: typeof d.expiryDate === 'string' ? d.expiryDate : '',
  };
}
