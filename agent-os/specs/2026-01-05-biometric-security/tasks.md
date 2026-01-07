# Tasks: Biometric & Security Hardening

## 0. Setup & Infrastructure

- [x] Install `capacitor-native-biometric` dependency <!-- id: 0 -->
- [x] Configure `android/app/src/main/AndroidManifest.xml` with biometric permissions <!-- id: 1 -->
- [x] Run `npx cap sync android` <!-- id: 2 -->
- [x] Verify build with `pnpm run build` <!-- id: 3 -->

## 1. Zero-Trust State Management

- [x] Update `VaultState` interface in `vault.store.ts` to include `isLocked`, `biometricAttempts` <!-- id: 4 -->
- [x] Implement `lockVault()` action that sets `isLocked = true` <!-- id: 5 -->
- [x] Implement `recordFailedAttempt()` logic (Done via `PinService`) <!-- id: 6 -->
- [x] Implement `unlockVault()` action to reset counters and `isLocked = false` <!-- id: 7 -->

## 2. The Biometric Guard (Watcher)

- [x] Create `src/components/security/BiometricGuard.tsx` component <!-- id: 8 -->
- [x] Implement `AppState` listener to detect "background" state and trigger `lockVault()` <!-- id: 9 -->
- [x] Implement `AppState` listener for "active" state to trigger Biometric Prompt <!-- id: 10 -->
- [x] Create "Locked" Overlay UI (Glassmorphic, full screen, z-index 50) <!-- id: 11 -->

## 3. Native Integration

- [x] Create `src/services/biometric.service.ts` (Done) <!-- id: 11.5 -->
- [x] Implement `NativeBiometric.verifyIdentity()` call in the Guard <!-- id: 12 -->
- [x] Handle "User Cancellation" -> Show PIN Entry Form <!-- id: 13 -->
- [x] Handle "Biometric Failure" -> Increment failure count <!-- id: 14 -->
- [x] Implement PIN Fallback UI within the Guard (reuse existing PIN logic) <!-- id: 15 -->

## 4. Verification

- [ ] Verify "Immediate Lock" on App Minimize <!-- id: 16 -->
- [ ] Verify "Biometric Prompt" on App Resume <!-- id: 17 -->
- [ ] Verify 3-Strike Rule (Biometric -> PIN) <!-- id: 18 -->
- [ ] Verify 5-Strike Rule (PIN -> 5 min Lockout) <!-- id: 19 -->
