# Spec Requirements: Biometric Security

## Initial Description

Implement "Military Grade" security for the Vault access using native biometric capabilities (Fingerprint/FaceID), behavioral lockout, and Zero-Trust hardening. Focus on "Best of the Best" quality using native integrations without data destruction.

## Requirements Discussion

### First Round Questions

**Q1:** Paranoia vs Usability?
**Answer:** "Best of the best". Interpretation: Bank-grade security. Require Auth on App Resume (from background) and App Launch. Grace period of 0s (Immediate) or very short (30s) for maximum security perception.

**Q2:** Fallback Strategy?
**Answer:** "Without deleting information". Fallback must be the existing PIN/Password system. No data wipe on failure.

**Q3:** Lockout Behavior?
**Answer:** Temporary suspension (Time-out) after N failed attempts. strictly NO "Panic Mode" (data erasure) as per user instruction.

**Q4:** Integration Strategy?
**Answer:** "Native integrations". Use high-performance Native Biometric APIs (via Capacitor 7). Must feel instantaneous and deeply integrated with the OS (Android Credential Manager / BiometricPrompt).

### Existing Code to Reference

- **Capacitor Config**: `capacitor.config.ts` (for plugin configuration).
- **MainActivity.kt**: Already modified for Notifications, likely target for native Biometric bridging if plugins fall short.
- **Vault Store**: `vault.store.ts` (currently handles `isAuthenticated`). Needs to be upgraded to support `isBiometricAuthenticated`.

### Follow-up Questions

None needed. User directive "Todo lo mejor de lo mejor" is clear direction for higher order execution.

## Visual Assets

### Files Provided:

No visual files found.

### Visual Insights:

- **Design Direction:** "Best of the best" implies "Sci-Fi / High-Tech" aesthetic compatible with the existing "SexyLove" brand (Glassmorphism, Neon, Clean).
- **Lock Screen:** Should overlay the entire UI when app is backgrounded.
- **Iconography:** Use `lucide-react` (Fingerprint, Lock, Shield) with "Glow" effects.

## Requirements Summary

### Functional Requirements

1.  **Biometric Gate:**
    - Intercept App Resume (Foreground) event.
    - Present Native Biometric Prompt immediately if Vault is "locked".
    - Verify signature against Keystore (Android).
2.  **Zero-Trust State:**
    - Vault decryption key must be protected by Biometric Hardware (if possible) or at least gated by the successful auth signal.
    - `isAuthenticated` state in `vault.store.ts` must become volatile (false on background).
3.  **Fallback Mechanism:**
    - If Biometric fails or is cancelled, show the custom "Access Code" screen.
    - Allow user to choose "Use PIN" explicitly.
4.  **Behavioral Lockout:**
    - 3 consecutive failed biometrics -> Force PIN.
    - 5 consecutive failed PINs -> 5 minute Lockout (Timer).

### Reusability Opportunities

- `VaultStore`: Extend existing auth logic.
- `MainActivity.kt`: Extend for native event handling if needed.

### Scope Boundaries

**In Scope:**

- Android Biometric Prompt implementation.
- App State handling (Background/Foreground).
- Lockout Timer logic.
- UI Overlay for "Locked" state.

**Out of Scope:**

- Data Erasure (Panic Mode).
- Server-side auth (Local Vault focus).
- iOS implementation (Android only for now as per Context).

### Technical Considerations

- **Plugin:** `capacitor-native-biometric` or `@capacitor/preferences` + Native Code.
- **Crypto:** Ensure keys are not stored in plain text.
- **Performance:** Biometric prompt must appear instantly (`<200ms`) upon resume to prevent UI flashing.
