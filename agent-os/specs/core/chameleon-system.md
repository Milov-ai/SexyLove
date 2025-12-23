# Atomic Spec: Chameleon Persona System

## Overview

The Chameleon system allows the application to assume diverse "Superficial" personas to obfuscate its true purpose as a private vault. This is achieved via native mobile integrations and real-time remote configuration.

## Logical Specification

### Native Persona Switching (Chameleon Plugin)

- **Engine**: Custom Capacitor Plugin `Chameleon`.
- **Mechanism**: Dynamic switching of **Android Activity Aliases**.
- **Scope**: Changes the App Icon and the App Label (Name) in the OS launcher.
- **Available Aliases**:
  - `AliasPideUnDeseo`, `AliasNaaam`, `AliasAzulinaa`, `AliasMuaah`, `AliasTamuu`, `AliasKissKiss`, `AliasUuuf`, `AliasPlop`, `AliasHohoho`, `AliasWow`, `AliasXoxo`.

### Remote Identity Synchronization

- **Engine**: Supabase Realtime + `ChameleonRemote`.
- **Logic**:
  1. The app subscribes to the `profiles` table in Supabase.
  2. When a `current_alias` field is updated (via another device or secondary identity), the local `ChameleonManager.setIdentity` is triggered.
  3. This ensures that all devices signed into the same vault present the same facade.

## Implementation Details

### ChameleonManager (API)

- `setIdentity(aliasName: AliasType)`:
  - Checks `Capacitor.isNativePlatform()`.
  - If native: Calls `Chameleon.setAlias`.
  - If web: Logs a simulation message.
- `switchRandom()`: Rotates through all available aliases (Pure Random Chaos mode).

### Data Schema

The current identity is typically stored in the `profiles` table or synced via a dedicated `broadcast` channel.

## Security Considerations

- **Detection Avoidance**: The app should appear as a standard utility (e.g., Notes, Recipes) when switched.
- **State Persistence**: The active alias must persist across app restarts and updates.
- **Atomic Reliability**: Switching aliases must be atomic; failure to switch the icon while switching the name (or vice versa) is a critical UX failure.
