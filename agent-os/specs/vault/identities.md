# Atomic Spec: Multi-Identity Persona System

## Overview

The Multi-Identity system allows a single user to manage different "Profiles" within their vault. This is used for compartmentalizing memories or managing different social contexts (e.g., "Azulinaa" vs "Naaam").

## Data Specification

### Profile Schema

Each identity is a record in the `profiles` table:

- `id`: UUID (Primary Key, linked to Supabase User).
- `username`: Public-facing name for this profile.
- `avatar_url`: URL to profile image (Supabase Storage).
- `current_alias`: The active Chameleon persona/icon linked to this profile.
- `metadata`: JSONB for supplementary preferences.

### Identity Switching

- **Mechanism**: Handled via the `IdentitySelectorDialog`.
- **Logic**:
  1. User selects a profile.
  2. App updates the local `userProfile` state in `vault.store.ts`.
  3. The `ChameleonManager.setIdentity` is called with the profile's `current_alias`.
  4. Subscriptions in `ChameleonRemote` ensure all synced devices update simultaneously.

## Visual Representation

### Identity Selector

- A premium, animated grid of profiles.
- Displays the profile avatar, username, and active alias icon.
- Uses Framer Motion for smooth scaling and entrance animations.

### Context Obfuscation

- When switched, the app's global "Theme" (colors, fonts) may update to match the persona's aesthetic.

## Implementation Details

### Store Integration (`vault.store.ts`)

- `profiles`: Array of all available identities.
- `userProfile`: The currently active identity.
- `fetchProfiles()`: Populates the profile list from Supabase.

### Sync Logic

- Updates to a profile (e.g., changing the alias) are broadcasted to all logged-in sessions via Supabase Realtime to ensure "Total Persona Alignment".

## Atomic Verification Criteria

- [ ] Switching identity updates the local `userProfile` state immediately.
- [ ] Switching identity triggers the `Chameleon` native icon change request.
- [ ] Profiles are fetched only after a successful Vault Auth.
- [ ] Real-time updates to profiles on one device are reflected on others within < 2s.
