# Atomic Spec: Hidden Vault Auth Gateway

## Overview

The Auth Gateway is the first security layer encountered after triggering the hidden facade gesture. It combines traditional credentials with a platform-specific "Access Code" gate to prevent unauthorized registrations.

## Authentication Layers

### 1. The Obfuscated Entry

- **Trigger**: Handled by the `Facade Trigger` (3-click logic).
- **Presentation**: `AuthScreen` is rendered as a cinematic glassmorphic overlay. No direct link to this screen exists in the public UI.

### 2. Registration Gate (Access Codes)

- **Constraint**: To create an account, a valid **Access Code** is required.
- **Verification**: The code is checked against the `access_codes` table in Supabase (`is_active: true`).
- **Purpose**: Restricts platform usage to invited individuals, maintaining a closed-loop secure ecosystem.

### 3. Identity Provider (Supabase Auth)

- **Backend**: Supabase GoTrue.
- **Methods**: Email/Password.
- **Workflow**:
  1. User inputs email, password, and access code.
  2. App verifies code.
  3. App calls `supabase.auth.signUp`.
  4. Upon confirmation (email link), the `profiles` record is initialized.

## Session Management

### Auto-Initialization

- The `useVaultStore` listens for `onAuthStateChange`.
- When `SIGNED_IN`:
  - Fetch the user's `profiles`.
  - Initialize the `decryptedVault` (AES decryption engine).
  - Start `subscribeToRealtime` for sync.

### Lock Mechanism

- **Action**: `lockVault()` action in the store.
- **Effect**: Signs out the user via Supabase, clears `decryptedVault` from memory, and resets `isAuthenticated` to `false`.
- **Trigger**: Explicit user logout or security timeout.

## Atomic Verification Criteria

- [ ] Registration fails if the Access Code is incorrect or inactive.
- [ ] Login screen is not reachable via direct URL or standard UI links.
- [ ] Redirect to `MainLayout` or `HomePage` occurs only after a successful Supabase session is established.
- [ ] `decryptedVault` is null when `isAuthenticated` is false.
