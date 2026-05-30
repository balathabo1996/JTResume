/**
 * @file crypto.js
 * @description Source file for crypto.js.
 * @author Thabotharan Balachandran
 */
import CryptoJS from 'crypto-js';

/**
 * Derives a strong AES-256 key from a password and salt (email).
 * In a real-world scenario, you might want more iterations, 
 * but 1000 is a good balance for browser performance.
 */
export const deriveKey = (password, email) => {
  const salt = email.toLowerCase().trim();
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

/**
 * Encrypts a JSON payload using the derived key.
 */
export const encryptData = (data, key) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};

/**
 * Decrypts a ciphertext back to a JSON payload using the derived key.
 */
export const decryptData = (ciphertext, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const utf8String = bytes.toString(CryptoJS.enc.Utf8);
    if (!utf8String) return null;
    return JSON.parse(utf8String);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
