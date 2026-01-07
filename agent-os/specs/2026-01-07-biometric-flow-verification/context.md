# Feature: Biometric Flow Verification & Enhancement

## 🎯 Goal

Verify and fix the biometric authentication flow to ensure the PIN does NOT appear when exiting the vault via triple-click, but DOES appear for re-entry when a session exists, with intelligent timeout-based authentication and premium UX patterns.

## 🔍 Problem Statement

Current biometric flow has inconsistent behavior:

- Exit flow may show unwanted authentication prompts
- Re-entry doesn't intelligently adapt based on time elapsed
- No automatic PIN fallback after biometric failures
- Timeout-based authentication not implemented

## ✨ Proposed Solution

Implement a world-class biometric authentication flow with:

1. **Triple-Click Exit** - Instant exit to facade with ZERO authentication prompts
2. **Intelligent Re-Entry** - Biometric-only for < 5 min, full auth otherwise
3. **Automatic Fallback** - Auto-switch to PIN after 3 biometric failures
4. **Progressive Lockout** - 30s lockout at 5 failures, force logout at 10 total

## 📋 User Stories

- As a vault user, I want to triple-click the vault title to instantly exit without auth prompts, so I can quickly hide sensitive content in emergencies
- As a returning user within 5 minutes, I want to re-enter vault with only biometric authentication, so I experience minimal friction while maintaining security
- As a user experiencing biometric failures, I want automatic fallback to PIN after 3 attempts, so I'm never locked out of my data

## 🏗️ Technical Approach

### State Management Enhancement

- Add `lastUnlockTime: number` to VaultState
- Add `VAULT_TIMEOUT_MS` constant (300,000ms = 5 minutes)
- Update `unlockVault()` to track timestamps

### Component Logic

- Create `shouldRequireFullAuth()` helper for timeout checking
- Implement biometric failure counter (auto PIN at 3 failures)
- Verify `handleCancel()` exit behavior

### Testing & Verification

- Manual flow testing for all scenarios
- Edge case validation (background, kill, restart)
- Visual feedback and UX polish verification

## 📊 Scope

**In Scope:**

- ✅ Exit flow verification (no auth on triple-click)
- ✅ Timeout-based re-entry logic
- ✅ Automatic PIN fallback
- ✅ App lifecycle event handling
- ✅ Visual feedback and animations

**Out of Scope:**

- ❌ Multi-device session sync
- ❌ Biometric enrollment UI
- ❌ Emergency bypass codes
- ❌ Database schema changes

## 📦 Implementation Details

**Files to Modify:**

- `src/store/vault.store.ts` - Add timeout tracking
- `src/components/common/BiometricGuard.tsx` - Implement intelligent auth logic

**Dependencies:**

- Existing: `biometric.service.ts`, `pin.service.ts`
- No new dependencies required

## ✅ Acceptance Criteria

- [ ] Triple-click exit works without auth prompts
- [ ] Re-entry within 5 min shows biometric only
- [ ] Re-entry after 5 min shows full auth flow
- [ ] 3 biometric failures auto-switch to PIN
- [ ] Progressive lockout works at 5 PIN failures
- [ ] Force logout occurs at 10 total failures
- [ ] All visual feedback and animations are premium quality
- [ ] No regressions in existing functionality

## 🔗 Related

- Spec: `agent-os/specs/2026-01-07-biometric-flow-verification/`
- Branch: `feature/biometric-flow-verification`
- Roadmap: Phase 6 - Biometric & Security Hardening
