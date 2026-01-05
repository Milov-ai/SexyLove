# Tasks: Biometric & Security Hardening

## 0. Setup & Infrastructure

- [ ] Install `capacitor-native-biometric` dependency <!-- id: 0 -->
- [ ] Configure `android/app/src/main/AndroidManifest.xml` with biometric permissions <!-- id: 1 -->
- [ ] Run `npx cap sync android` <!-- id: 2 -->
- [ ] Verify build with `pnpm run build` <!-- id: 3 -->

## 1. Zero-Trust State Management

- [ ] Update `VaultState` interface in `vault.store.ts` to include `isLocked`, `biometricAttempts`, `lockoutUntil` <!-- id: 4 -->
- [ ] Implement `lockVault()` action that sets `isLocked = true` <!-- id: 5 -->
- [ ] Implement `recordFailedAttempt()` action with logic for 3-strike Pin Fallback and 5-strike Lockout <!-- id: 6 -->
- [ ] Implement `unlockVault()` action to reset counters and `isLocked = false` <!-- id: 7 -->

## 2. The Biometric Guard (Watcher)

- [ ] Create `src/components/security/BiometricGuard.tsx` component <!-- id: 8 -->
- [ ] Implement `AppState` listener to detect "background" state and trigger `lockVault()` <!-- id: 9 -->
- [ ] Implement `AppState` listener for "active" state to trigger Biometric Prompt <!-- id: 10 -->
- [ ] Create "Locked" Overlay UI (Glassmorphic, full screen, z-index 50) <!-- id: 11 -->

## 3. Native Integration

- [ ] Implement `NativeBiometric.verifyIdentity()` call in the Guard <!-- id: 12 -->
- [ ] Handle "User Cancellation" -> Show PIN Entry Form <!-- id: 13 -->
- [ ] Handle "Biometric Failure" -> Increment failure count <!-- id: 14 -->
- [ ] Implement PIN Fallback UI within the Guard (reuse existing PIN logic) <!-- id: 15 -->

## 4. Verification

- [ ] Verify "Immediate Lock" on App Minimize <!-- id: 16 -->
- [ ] Verify "Biometric Prompt" on App Resume <!-- id: 17 -->
- [ ] Verify 3-Strike Rule (Biometric -> PIN) <!-- id: 18 -->
- [ ] Verify 5-Strike Rule (PIN -> 5 min Lockout) <!-- id: 19 -->
