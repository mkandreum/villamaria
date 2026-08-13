import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const secret = process.env.APP_SECRETS_MASTER_KEY || process.env.JWT_SECRET || 'fallback-master-key-villamaria-2026-secret!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts cleartext using AES-256-GCM
 */
export function encryptText(text: string): string {
  if (!text) return '';
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Return base64 payload: IV + AuthTag + EncryptedData
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypts AES-256-GCM ciphertext
 */
export function decryptText(ciphertext: string): string {
  if (!ciphertext) return '';
  try {
    const key = getMasterKey();
    const data = Buffer.from(ciphertext, 'base64');
    
    if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new Error('Invalid ciphertext length');
    }

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedText = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}
