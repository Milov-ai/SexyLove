# Atomic Spec: Vault Store Architecture

## Overview

The `vault.store.ts` (powered by Zustand) is the central intelligence of the application. it manages authentication, data orchestration, and real-time state synchronization for the Hidden Vault.

## Core Responsibilities

### State Orchestration

- **Identity State**: `isAuthenticated`, `user`, `userProfile`, and `profiles`.
- **Data State**: `decryptedVault` (the structured, plain-text representation of all secure data).
- **UI Tracking**: `dateRange`, `showHeatmap`, `lockoutUntil`, etc.

### LifeCycle Management

- **Initialization (`initialize`)**:
  1. Checks for an active Supabase session.
  2. Fetches user profiles.
  3. Starts the `subscribeToRealtime` listener.
  4. Triggers the first `syncWithSupabase`.
- **Auto-Sync**: Sets up a periodic heartbeat sync (every 5 minutes) as a fallback mechanism.

### Data Harmonization

- **Optimistic Updates**: When a user performs an action (e.g., `addLugar`), the store updates the local state **immediately** before enqueuing the background sync.
- **Rollback Logic**: In case of persistent sync failure, the local state is eventually reconciled with the backend truth.

## Real-time Integration

### Postgres Subscriptions

- The store subscribes to the `public` schema via `supabase.channel`.
- `handleRealtimePayload`: Processes `INSERT`, `UPDATE`, and `DELETE` events from other devices.
- High-priority tables (e.g., `tags`) have granular processing logic to update the UI without a full reload.

## Security Controls

- **Zero Memory Leaks**: Upon `SIGNED_OUT`, the `decryptedVault` and all sensitive buffers are explicitly set to `null`.
- **Pin Lockout**: Tracks `failedPinAttempts` and sets `lockoutUntil` to prevent brute-force attacks on PIN-locked folders.

## Atomic Verification Criteria

- [ ] `isAuthenticated` correctly reflects the Supabase session state.
- [ ] Optimistic updates are visible in the UI before the Supabase request completes.
- [ ] Real-time payloads from another session trigger the `syncWithSupabase` or granular update logic.
- [ ] sensitive data is wiped from the store on logout.
