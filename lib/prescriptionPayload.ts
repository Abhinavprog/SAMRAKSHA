/**
 * Normalize QR / paste / upload payloads so CryptoJS "Salted__" ciphertext can be verified.
 * Pure string helpers — safe for client and server.
 */

const CRYPTO_PREFIX = 'U2FsdGVkX';

function stripInvisible(s: string): string {
  return s.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
}

/**
 * Pull ciphertext from pasted URLs (?data=...), JSON wrappers, or quoted strings.
 */
export function extractEncryptedPayload(raw: string): string {
  let s = stripInvisible(raw.trim());
  if (!s) return s;

  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s) as Record<string, unknown>;
      const inner =
        (typeof o.encryptedData === 'string' && o.encryptedData) ||
        (typeof o.data === 'string' && o.data) ||
        (typeof o.payload === 'string' && o.payload) ||
        '';
      if (inner) return extractEncryptedPayload(inner);
    } catch {
      /* not JSON */
    }
  }

  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    const inner = s
      .slice(1, -1)
      .replace(/\\n/g, '')
      .replace(/\\r/g, '')
      .replace(/\\"/g, '"');
    return extractEncryptedPayload(inner);
  }

  const lower = s.toLowerCase();
  if (lower.includes('data=') && (s.includes(CRYPTO_PREFIX) || lower.includes(CRYPTO_PREFIX.toLowerCase()))) {
    try {
      const url = s.startsWith('http') ? new URL(s) : new URL(s, 'https://local.invalid');
      const d = url.searchParams.get('data');
      if (d) {
        const decoded = extractEncryptedPayload(safeDecodeURIComponent(d));
        if (decoded.startsWith(CRYPTO_PREFIX)) return decoded;
      }
    } catch {
      /* ignore */
    }
  }

  return s;
}

function safeDecodeURIComponent(x: string): string {
  try {
    return decodeURIComponent(x);
  } catch {
    return x;
  }
}

/**
 * Variants that often fix scan/paste corruption (whitespace, + vs space, double encoding).
 */
export function buildCipherTextVariants(cipher: string): string[] {
  const out: string[] = [];
  const add = (x: string) => {
    const t = x.trim();
    if (t && !out.includes(t)) out.push(t);
  };

  add(cipher);
  add(cipher.replace(/[\r\n\t]/g, ''));
  add(cipher.replace(/\s+/g, ''));
  add(cipher.replace(/ /g, '+'));

  let x = cipher;
  for (let i = 0; i < 3; i++) {
    try {
      const y = decodeURIComponent(x);
      if (y === x) break;
      x = y;
      add(x);
      add(x.replace(/[\r\n\t]/g, ''));
      add(x.replace(/\s+/g, ''));
      add(x.replace(/ /g, '+'));
    } catch {
      break;
    }
  }

  return out;
}

export function looksLikeEncryptedPrescriptionPayload(s: string): boolean {
  const e = extractEncryptedPayload(s);
  return e.startsWith(CRYPTO_PREFIX);
}

export function isDecryptedPrescriptionShape(d: unknown): d is Record<string, unknown> {
  if (!d || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  return (
    typeof o.patientName === 'string' &&
    typeof o.doctorName === 'string' &&
    Array.isArray(o.medicines) &&
    o.medicines.length > 0
  );
}
