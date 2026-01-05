# Biometric & Security Hardening

## Core Idea

Implement "Military Grade" security for the Vault access.

## Key Features

1. **Biometric Auth**: Use native Capacitor/Android biometric capabilities (Fingerprint/FaceID) to unlock the Vault.
2. **Behavioral Lockout**: Automatically lock the application if suspicious behavior is detected (e.g., multiple failed PIN attempts, rapid switching).
3. **Zero-Trust Hardening**: Ensure that even if the app is open, the Vault remains encrypted until explicit biometric proof is provided.

## Source

Derived from `agent-os/product/roadmap.md` Phase 6.
