import CryptoJS from "crypto-js";

const secretKey = "your-super-secret-key"; // This should be stored securely, not hardcoded

/**
 * Encrypts a data object using AES encryption.
 *
 * @param data - The data to encrypt (will be JSON stringified)
 * @returns The encrypted ciphertext string
 */
export const encryptVault = (data: unknown): string => {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey,
  ).toString();
  return ciphertext;
};

/**
 * Decrypts an encrypted string back into its original data object.
 *
 * @param encryptedData - The ciphertext string to decrypt
 * @returns The decrypted data object
 */
export const decryptVault = <T = unknown>(encryptedData: string): T => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData as T;
};
