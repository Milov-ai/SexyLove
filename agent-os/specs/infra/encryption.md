# Atomic Spec: Client-Side Encryption (AES-256)

## Overview

The "Zero-Knowledge" premise of SexyLove is enforced by client-side AES-256 encryption. all sensitive vault data is encrypted on the device before transmission to Supabase, ensuring that the backend service provider (and any intermediate actors) cannot access the raw content.

## Encryption Protocol

### Engine

- **Library**: `crypto-js`.
- **Algorithm**: AES-256-CBC (Cipher Block Chaining).
- **Padding**: PKCS7.

### Keys & Secrets

- **Master Secret**: A unique, per-user secret key used to derive the encryption key.
- **Storage**: The secret must **never** be stored in the database. it is either derived from the user's master password (locally) or managed via a secure hardware enclave on mobile devices.

## Data Flow

### Outbound (Encryption)

1. The app prepares the structured JSON data (e.g., a new `Lugar` or `Note`).
2. The `encryptVault(data)` utility stringifies the JSON.
3. `CryptoJS.AES.encrypt` is called with the master secret.
4. The resulting ciphertext string is sent to Supabase.

### Inbound (Decryption)

1. The app fetches ciphertext from Supabase.
2. The `decryptVault(ciphertext)` utility is called with the master secret.
3. `CryptoJS.AES.decrypt` reverses the process and parses the result back into a JSON object.
4. The decrypted data is injected into the `decryptedVault` state in the store.

## Security Constraints

- **Plaintext Exposure**: Decrypted data exists **only in memory** within the Zustand store buffer. It is never written to persistent local storage unless explicitly requested by a "Backup" feature.
- **Wipe Logic**: Upon lockout or logout, the memory buffer is zeroed out.

## Atomic Verification Criteria

- [ ] inspecting the Supabase Dashboard reveals only ciphertext strings for `content` fields.
- [ ] `decryptVault` returns the exact original object structure.
- [ ] Changing the master secret (if implemented) correctly invalidates all existing ciphertext (requiring re-encryption).
