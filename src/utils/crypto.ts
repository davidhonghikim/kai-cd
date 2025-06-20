import CryptoJS from 'crypto-js';

// It's crucial that the key derivation is consistent and secure.
// We use PBKDF2, a standard and strong key derivation function.
// The salt should be stored with the user's data, but for this application's
// purpose (a local, single-user vault), we can use a static salt.
// A better implementation would generate and store a unique salt per user/vault.
const SALT = 'a-very-strong-and-unique-salt-for-kai-cd';
const KEY_SIZE = 256 / 32; // 256 bits
const ITERATIONS = 1000; // A reasonable number of iterations for a local app

/**
 * Derives a key from a password using PBKDF2.
 */
const deriveKey = (password: string) => {
  return CryptoJS.PBKDF2(password, SALT, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });
};

/**
 * Encrypts a plaintext string using a password.
 * @param plaintext The string to encrypt.
 * @param password The password to use for encryption.
 * @returns The encrypted string (ciphertext).
 */
export const encrypt = (plaintext: string, password: string): string => {
  const key = deriveKey(password);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key.toString(CryptoJS.enc.Hex));
  return encrypted.toString();
};

/**
 * Decrypts a ciphertext string using a password.
 * @param ciphertext The string to decrypt.
 * @param password The password to use for decryption.
 * @returns The decrypted string (plaintext).
 */
export const decrypt = (ciphertext: string, password: string): string => {
  const key = deriveKey(password);
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key.toString(CryptoJS.enc.Hex));
  return decrypted.toString(CryptoJS.enc.Utf8);
};

// Web Crypto API functions for secure database
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Generate a random encryption key using Web Crypto API
 */
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Derive a CryptoKey from a password using PBKDF2
 */
export const deriveKeyFromPassword = async (password: string, salt?: Uint8Array): Promise<CryptoKey> => {
  const saltBytes = salt || encoder.encode(SALT);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt data using AES-GCM with Web Crypto API
 */
export const encryptData = async (data: string, key: CryptoKey): Promise<{ encryptedData: string; iv: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encodedData = encoder.encode(data);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  
  return {
    encryptedData: Array.from(new Uint8Array(encryptedBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    iv: Array.from(iv)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  };
};

/**
 * Decrypt data using AES-GCM with Web Crypto API
 */
export const decryptData = async (encryptedData: string, ivHex: string, key: CryptoKey): Promise<string> => {
  const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const encryptedBytes = new Uint8Array(encryptedData.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  );
  
  return decoder.decode(decryptedBuffer);
}; 