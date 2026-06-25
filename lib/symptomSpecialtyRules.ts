export type SymptomRule = {
  specialty: string;
  /** Any regex match increments rule score */
  patterns: RegExp[];
};

/**
 * Small rule layer to help obvious keywords route correctly even with limited training data.
 * This does NOT replace ML; it just boosts matching specialties.
 */
export const SYMPTOM_SPECIALTY_RULES: SymptomRule[] = [
  { specialty: 'Neurology', patterns: [/\b(fits|seizure|seizures|convulsion|epilep|blackout)\b/i] },
  { specialty: 'Cardiology', patterns: [/\b(chest pain|angina|palpitation|palpitations|heart|bp|blood pressure)\b/i] },
  { specialty: 'Pulmonology', patterns: [/\b(wheeze|wheezing|asthma|copd|shortness of breath|breathless|lung)\b/i] },
  { specialty: 'Gastroenterology', patterns: [/\b(heartburn|acid reflux|gerd|stool|diarrhea|constipation|abdominal pain|jaundice|stomach ache|stomach pain|gastric|indigestion|nausea|vomit|vomiting)\b/i] },
  { specialty: 'Urology', patterns: [/\b(urine|urinary|burning urination|dysuria|kidney stone|stones|prostate|psa)\b/i] },
  { specialty: 'Nephrology', patterns: [/\b(foamy urine|proteinuria|creatinine|kidney failure|renal)\b/i] },
  { specialty: 'Dermatology', patterns: [/\b(rash|itch|itching|eczema|psoriasis|acne|hives|skin)\b/i] },
  { specialty: 'ENT', patterns: [/\b(ear pain|hearing loss|sinus|sinusitis|tonsil|tonsillitis|nosebleed|hoarseness)\b/i] },
  { specialty: 'Ophthalmology', patterns: [/\b(blurred vision|double vision|eye pain|cataract|glaucoma|red eye)\b/i] },
  { specialty: 'Orthopedics', patterns: [/\b(fracture|broken bone|sprain|knee pain|back pain|joint pain)\b/i] },
  { specialty: 'Psychiatry', patterns: [/\b(panic|anxiety|depression|hallucination|insomnia|ocd)\b/i] },
  { specialty: 'Pediatrics', patterns: [/\b(child|newborn|infant|pediatric|paediatric)\b/i] },
  { specialty: 'Gynecology', patterns: [/\b(pelvic pain|period|bleeding|pap smear|fibroid|menopause|vaginal)\b/i] },
  { specialty: 'Obstetrics', patterns: [/\b(pregnan|labor|labour|delivery|prenatal|antenatal)\b/i] },
  { specialty: 'General Physician', patterns: [/\b(fever|cold|cough|body ache|checkup|screening)\b/i] },
];

