import CryptoJS from 'crypto-js';

// Ensure we're using the environment variable properly
const ENCRYPTION_KEY = process.env.AES_ENCRYPTION_KEY || 'this-is-a-32-character-secret-key-for-encryption';

export function encryptData(data: any): string {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  return encrypted;
}

export function decryptData(encryptedData: string): any {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Invalid or tampered data');
  }
}

/** Same as decryptData but returns null instead of throwing (for trying multiple cipher variants). */
export function tryDecryptData(encryptedData: string): any | null {
  try {
    return decryptData(encryptedData);
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}
