# Specification: Biometric & Security Hardening

## Goal

Implement "Military Grade" biometric security to protect the Vault. Ensure immediate, native biometric authentication (Fingerprint/FaceID) upon application resume and launch, maintaining a "Zero-Trust" posture while strictly preserving user data (no "Panic Mode" erasure).

## User Stories

- As a **security-conscious user**, I want the app to immediately lock when I minimize it so that no one can see my Vault if I hand them my phone.
- As a **user**, I want to unlock the Vault with my FaceID/Fingerprint instantaneously (<200ms) so that security doesn't hamper usability.
- As a **user**, I want to fall back to my PIN if my biometrics fail (e.g., wet hands, darkness) so that I am never locked out of my own data.

## Specific Requirements

**Native Biometric Integration**

- Implement `capacitor-native-biometric` (or similar native plugin) to interface with Android's `BiometricPrompt`.
- Must verify identity against the device's secure enclave / keystore.
- Prompt must appear **immediately** on `AppResume` if the Vault was previously accessed.

**Zero-Trust State Management**

- Introduce a volatile `isLocked` state in `vault.store.ts`.
- Listen to `AppState` changes (Capacitor App plugin).
- **On Background**: Immediately set `isAuthenticated = false` (or `isLocked = true`) to hide the UI.
- **On Foreground**: Check if `isLocked`. If true, trigger Biometric Prompt.

**BiometricGuard Component**

- Create a dedicated component (`BiometricGuard.tsx`) to manage the background/foreground lifecycle and authentication flows.
- Should render a high-quality "Locked" overlay (Glassmorphism + Icon) while waiting for biometric success.
- If biometric fails or is cancelled, transition to the existing "Access Code" (PIN) screen.

**Behavioral Lockout**

- Track failed biometric attempts in session state.
- **3 Failed Biometric Attempts**: Force fallback to PIN.
- **5 Failed PIN Attempts**: Enforce a 5-minute lockout timer (persist timestamp in `localStorage` or `secureStorage`).

**Fallback Mechanism**

- Ensure the existing "Access Code" screen is accessible if biometrics are unavailable or fail.
- Do **NOT** implement data erasure ("Panic Mode").

## Existing Code to Leverage

**`src/store/vault.store.ts`**

- Reuse `isAuthenticated` state.
- Extend to include `lockoutUntil` and `failedPinAttempts` (already present).
- Add action `lockVault()` (sets `isAuthenticated = false`).

**`src/App.tsx`**

- Modify `App.tsx` to wrap the Vault pages with `BiometricGuard`.
- Use `useEffect` to register `App.addListener('appStateChange')`.

**`ProposalOverlay` / `NotesDashboard`**

- These components serve as the "Public Facade" and should remain accessible even if the Vault is locked (Security by Obscurity). The Biometric Guard only locks the _Vault_.

## Out of Scope

- **Data Erasure**: No deleting data on failed attempts.
- **IOS Support**: Focus strictly on Android (Capacitor) for this phase.
- **Server-Side Auth**: This is purely local device security.
