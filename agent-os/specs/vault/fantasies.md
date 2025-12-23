# Atomic Spec: Fantasies (Secure Record Keeping)

## Overview

"Fantasies" is a secure record-keeping feature within the Hidden Vault. It allows users to document aspirations, preferences, and private plans with the same level of encryption as the rest of the vault.

## Functional Specification

### Fantasy Structure

Each fantasy record is an object with:

- `id`: UUID.
- `title`: Descriptive name.
- `description`: Detailed text content.
- `status`: Lifecycle state (e.g., "Planned", "Realized").
- `tags`: Associated category labels.
- `toys`: References to required items/tools.
- `settingPlaces`: Preferred locations/types of environments.
- `created_at`: Timestamp.

### Interaction Logic

- **CRUD Operations**: Handled via the `FantasyModal` and synced through the `vault.store.ts`.
- **Encryption**: All fields (except ID and timestamps used for indexing) are encrypted before being sent to the backend.

## Technical Implementation

### Components

- `FantasyModal`: The primary interface for creating and editing fantasies.
- `OPTIONS_MENU`: Entry point for managing categories (`toys`, `settingPlaces`) and adding new fantasies.

### Store Actions

- `addFantasy(fantasy)`
- `updateFantasy(fantasy)`
- `deleteFantasy(fantasyId)`

## Atomic Verification Criteria

- [ ] New fantasies are correctly appended to the `decryptedVault.fantasies` array in memory.
- [ ] Relationship tags (`toys`, `settingPlaces`) correctly resolve to current catalog items.
- [ ] Deleting a toy or setting correctly handles references in existing fantasies (or prompts for confirmation).
- [ ] The UI supports multi-line text descriptions with smooth scrolling.
