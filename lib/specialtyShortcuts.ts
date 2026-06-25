/**
 * Short labels for ML / symptom predicted specialties (UI + API).
 * Covers common doctor registration specializations.
 */
const SPECIALTY_SHORTCUTS: Record<string, string> = {
  Anesthesiology: 'Anesth',
  Cardiology: 'Cardio',
  'Cardiothoracic Surgery': 'CTS',
  'Critical Care Medicine': 'ICU',
  Dermatology: 'Derm',
  'Emergency Medicine': 'EM',
  Endocrinology: 'Endo',
  ENT: 'ENT',
  'Family Medicine': 'FM',
  Gastroenterology: 'GI',
  'General Physician': 'GP',
  'General Surgery': 'Gen Surg',
  Geriatrics: 'Geri',
  Gynecology: 'Gynae',
  Hematology: 'Heme',
  'Infectious Disease': 'ID',
  'Medical Oncology': 'Onc',
  Nephrology: 'Nephro',
  Neonatology: 'Neo',
  Neurology: 'Neuro',
  Neurosurgery: 'NS',
  'Nuclear Medicine': 'Nuc Med',
  Obstetrics: 'Obs',
  'Occupational Medicine': 'Occ Med',
  Ophthalmology: 'Ophth',
  Orthopedics: 'Ortho',
  'Pain Medicine': 'Pain',
  Pathology: 'Path',
  Pediatrics: 'Peds',
  'Pediatric Surgery': 'Peds Surg',
  'Physical Medicine and Rehabilitation': 'PM&R',
  'Plastic Surgery': 'Plastics',
  Psychiatry: 'Psych',
  Pulmonology: 'Pulmo',
  Radiology: 'Rad',
  Rheumatology: 'Rheum',
  'Sleep Medicine': 'Sleep',
  'Sports Medicine': 'Sports',
  'Thoracic Surgery': 'Thor Surg',
  'Trauma Surgery': 'Trauma',
  Urology: 'Uro',
  'Vascular Surgery': 'Vasc',
};

function normalizeSpecialtyName(s: string): string {
  return s
    .trim()
    .replace(/[\u00A0\u2000-\u200B\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[\u2013\u2014\u2212]/g, '-');
}

/** Lowercase normalized name → abbreviation */
const LOOKUP = new Map<string, string>();
for (const [label, abbr] of Object.entries(SPECIALTY_SHORTCUTS)) {
  LOOKUP.set(normalizeSpecialtyName(label).toLowerCase(), abbr);
}

export function getSpecialtyShortcut(specialty: string): string {
  const n = normalizeSpecialtyName(specialty);
  if (!n) return specialty;
  return LOOKUP.get(n.toLowerCase()) ?? n;
}
