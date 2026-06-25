/**
 * Maps ML dataset specialty labels to MongoDB $regex patterns so we match
 * real doctor specialization strings (e.g. "Cardiologist" vs "Cardiology").
 */
export function specialtyToMongoPattern(specialty: string): string {
  const map: Record<string, string> = {
    Anesthesiology: 'anesthes|anaesth',
    Cardiology: 'cardiolog|cardio|heart',
    'Cardiothoracic Surgery': 'cardiothorac|cardiac surg|heart surg|ctvs',
    'Critical Care Medicine': 'critical care|intensive care|icu|intensivist',
    Dermatology: 'dermat|skin',
    'Emergency Medicine': 'emergency medic|accident emerg|casualty|er medic',
    Endocrinology: 'endocrin|diabet|thyroid',
    ENT: 'ent|otolaryng|ear nose|throat',
    'Family Medicine': 'family medic|family pract|primary care',
    Gastroenterology: 'gastroenter|gastro|hepatolog|gi tract|gi specialist',
    'General Physician': 'general physician|general medic|internal medic|physician|family medic|\\bgp\\b',
    'General Surgery': 'general surg|laparosc|abdominal surg|hernia surg',
    Geriatrics: 'geriatr|elderly|gerontology',
    Gynecology: 'gynec|gynaec|obstetr|ob.gyn|obgyn|women',
    Hematology: 'hematolog|haematolog|blood disorder|hemato-onc',
    'Infectious Disease': 'infectious|infection disease|hiv|tuberculosis|tropical medic',
    'Medical Oncology': 'oncolog|chemotherapy|medical onc|cancer',
    Nephrology: 'nephro|kidney|renal',
    Neonatology: 'neonat|newborn|nicu',
    Neurology: 'neurolog|neurology',
    Neurosurgery: 'neurosurg|brain surg|spine surg|neuro surg',
    'Nuclear Medicine': 'nuclear medic|nuclear imaging|pet scan',
    Obstetrics: 'obstetr|obstetric|delivery|maternity|labour|labor',
    'Occupational Medicine': 'occupational|industrial medic|workplace',
    Ophthalmology: 'ophthalm|optom|eye surg|retina',
    Orthopedics: 'orthop|ortho|bone|joint|trauma ortho',
    'Pain Medicine': 'pain medic|pain manag|analgesia clinic',
    Pathology: 'patholog|histopath|cytopath',
    Pediatrics: 'pediat|paediat|child specialist',
    'Pediatric Surgery': 'pediatric surg|paediatric surg|child surg',
    'Physical Medicine and Rehabilitation': 'rehabilitation|physiatrist|pmr|physical medic',
    'Plastic Surgery': 'plastic surg|reconstructive|cosmetic surg|burns',
    Psychiatry: 'psychiat|mental health|depress anxiety clinic',
    Pulmonology: 'pulmon|respirat|lung|chest',
    Radiology: 'radiolog|imaging|interventional rad',
    Rheumatology: 'rheumat|lupus|autoimmune|arthritis',
    'Sleep Medicine': 'sleep medic|sleep disorder|somnolog',
    'Sports Medicine': 'sports medic|sports injur|athletic',
    'Thoracic Surgery': 'thoracic surg|lung surg|chest surg',
    'Trauma Surgery': 'trauma surg|acute care surg',
    Urology: 'urolog|androlog|genitourinary',
    'Vascular Surgery': 'vascular surg|angio|varicose|aneurysm',
  };
  if (map[specialty]) return map[specialty];
  return specialty.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
