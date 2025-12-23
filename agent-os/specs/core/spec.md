# Specification: SexyLove Dual-Layer Architecture

## Goal

Establish a robust, atomic-level documentation of the SexyLove application, detailing the "Public Facade" (Notes & Chameleon) and the "Hidden Vault" (Encrypted Core), ensuring seamless transitions and absolute privacy.

## User Stories

- As a casual user, I want to use a high-quality Notes app so that the application appears legitimate and useful.
- As a privacy-focused user, I want to access my hidden vault via a secret gesture/PIN so that my sensitive data remains invisible to others.

## Specific Requirements

**Public Facade (NotesDashboard)**

- Atomic UI: Uses custom glassmorphic blocks for rich-text editing.
- Aesthetics: High-end interactive Starfield background and smooth Framer Motion transitions.
- Functional Logic: Operates as a complete, stand-alone utility fetching public metadata.

**Hidden Vault (Protected Layer)**

- Authentication: Securely guarded by `useVaultStore` and `isAuthenticated` state in `App.tsx`.
- Client-Side Encryption: AES-256 encryption via `crypto-js` before syncing with Supabase.
- Auto-Lock: Mandatory session timeout and backgrounding lock logic.

**Chameleon Identity (Facade System)**

- Remote Sync: `ChameleonRemote.ts` listens for global identity changes.
- Dynamic Theming: Real-time UI adjustment based on the active identity (Utility vs Learning).

**Local-First Sync Stack**

- Queue Management: `OfflineQueue` handles mutations without active internet.
- Conflict Strategy: Deterministic "Last-Write-Wins" combined with client-side verification.

**Geospatial Visualization**

- Interactive Maps: Integrated MapLibre GL JS engine for private place pins.
- Privacy Guard: Map layers for private pins only render when `isAuthenticated` is true.

## Existing Code to Leverage

**Vault Store (`src/store/vault.store.ts`)**

- Core Zustand state managing authentication and optimistic updates.
- Integrates directly with Supabase Realtime for instant synchronization.

**Proposal Overlay (`src/features/proposal/components/ProposalOverlay.tsx`)**

- High-fidelity entry point for the "Secret Gesture" and initial auth flow.

**Sync Service (`src/services/sync.service.ts`)**

- Central logic for enqueuing mutations and handling backend connectivity.

## Out of Scope

- Direct clear-text storage of sensitive data.
- Publicly accessible administration portals.
- Third-party unencrypted cloud backups.
