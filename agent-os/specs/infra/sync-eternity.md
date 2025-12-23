# Atomic Spec: Eternity Sync Protocol

## Overview

The "Eternity" protocol is a custom synchronization layer built on top of Supabase Realtime. It is designed to be conflict-resilient and offline-first, ensuring that the Hidden Vault remains consistent across multiple devices.

## Protocol Mechanics

### 1. Unified Event Bus

- **Engine**: Supabase Realtime (Cdc).
- **Scope**: Listens to `INSERT`, `UPDATE`, and `DELETE` events on all vault-critical tables (`lugares`, `entradas`, `fantasies`, `tags`).

### 2. Operational Transformation (simplified)

- **Clock**: Uses server-side timestamps (`updated_at`) for basic Last-Write-Wins (LWW) conflict resolution.
- **Deduplication**: Client-side logic ensures that same-ID updates are merged rather than duplicated.

### 3. Offline Resilience

- **Mechanism**: `syncService` enqueues operations in a local persistent queue (IndexedDB via Capacitor/Web).
- **Execution**: When the network state transitions to `online`, the queue is processed sequentially.
- **Retry Logic**: Exponential backoff for failed sync attempts (e.g., due to RLS failures or network timeouts).

### 4. Broadcast Signals

- **Custom Event**: `broadcastSignal` (via `useEternitySync` hook).
- **Purpose**: Specific triggers like "Force Refresh", "Identity Switch", or "Ephemeral Chat Notification" that don't necessarily persist in a table.

## Implementation Details

### `syncService` (Logic)

- `enqueue(action, table, payload)`: Adds a task to the sync queue.
- `processQueue()`: Iterates through the queue and performs the Supabase operations.

### Conflict States

- **Detected**: When a local change conflicts with a newer remote change.
- **Resolved**: Local UI is refreshed with the remote truth, unless the local change is "Unsynced", in which case a merge is attempted.

## Atomic Verification Criteria

- [ ] UI updates optimistically for all `syncService.enqueue` actions.
- [ ] Offline actions are successfully pushed to Supabase when the connection is restored.
- [ ] Real-time updates from another device are reflected in the local `decryptedVault` within 2 seconds.
- [ ] Concurrent updates to the same field favor the latest server-validated timestamp.
