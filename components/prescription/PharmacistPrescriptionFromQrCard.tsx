'use client';

import type { PharmacistFromQRView } from '@/lib/pharmacistPrescriptionView';

function formatDate(s: string) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export function PharmacistPrescriptionFromQrCard({
  title = 'Details read from this QR',
  data,
}: {
  title?: string;
  data: PharmacistFromQRView | null | undefined;
}) {
  if (!data) return null;

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/70 to-sky-50/80 p-5 shadow-lg shadow-emerald-100/80">
      <h4 className="text-lg font-bold tracking-tight text-emerald-900">{title}</h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-100/70 to-teal-100/60 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Doctor</p>
          <p className="font-bold text-gray-900">{data.doctorName || '—'}</p>
          <p className="text-sm text-gray-600">NMC: {data.doctorNMC || '—'}</p>
        </div>
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-100/70 to-blue-100/60 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Patient</p>
          <p className="font-bold text-gray-900">{data.patientName || '—'}</p>
          {data.patientPhone && (
            <p className="text-sm text-gray-600">Phone: {data.patientPhone}</p>
          )}
          <p className="text-sm text-gray-600">
            {data.patientAge ? `${data.patientAge} yrs` : '—'} · {data.patientGender || '—'}
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-100/60 to-indigo-100/60 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Diagnosis</p>
        <p className="font-semibold text-gray-900">{data.diagnosis || '—'}</p>
      </div>
      {data.notes ? (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-100/70 to-gray-100/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Notes</p>
          <p className="text-sm text-gray-800">{data.notes}</p>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
        <p>
          <span className="font-medium text-gray-800">Issued: </span>
          {formatDate(data.issuedAt)}
        </p>
        <p>
          <span className="font-medium text-gray-800">Expires: </span>
          {formatDate(data.expiryDate)}
        </p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-800">Medicines</p>
        <div className="space-y-2">
          {data.medicines?.length ? (
            data.medicines.map((m, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-100/60 to-cyan-100/60 p-3 shadow-sm sm:flex-row sm:justify-between"
              >
                <div>
                  <p className="font-bold text-gray-900">{m.name}</p>
                  <p className="text-sm text-gray-600">{m.dosage}</p>
                </div>
                <div className="text-sm text-gray-600 sm:text-right">
                  <p>{m.frequency}</p>
                  <p>{m.duration}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No medicine rows in payload.</p>
          )}
        </div>
      </div>
    </div>
  );
}
