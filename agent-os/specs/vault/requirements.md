# Spec: Hidden Vault

## Status: Active / Core Feature

## Description

The Hidden Vault is the primary security layer of SexyLove. it allows users to store sensitive data (Notes, Places, Identities) in an encrypted, obfuscated environment that is not visible in the standard application state.

## Core Requirements

1.  **Obfuscation**: The vault must be completely "invisible" to a casual user.
2.  **Authentication**: Access requires a secondary PIN or Pattern.
3.  **Client-Side Encryption**: AES-256 (via `crypto-js`) for all vault data.
4.  **Auto-Lock**: Automatic timeout or backgrounding lock.

## Technical Architecture

- **State**: `useVaultStore` (Zustand).
- **Encryption**: `VaultEncryptionService`.
- **Sync**: Offline Queue integration.
