# Atomic Spec: Notes Dashboard (Public Facade)

## Overview

The Notes Dashboard is the primary functional interface of the Public Facade. It provides a familiar, high-performance notes management experience while incorporating hidden security features (PIN-locked folders).

## Functional Specification

### Folder Management

- **Hierarchy**: Supports nested folders (parent/child relationships).
- **Security**: Folders can be "Locked" with a **4-digit PIN**.
- **State**: Locked folders conceal their contents until the correct PIN is entered. PINs are hashed using SHA-256 before storage/comparison.
- **Visuals**: Folders use a custom color system (Aura colors) and Lucide icons.

### Note Management

- **Organization**: Notes belong to a specific folder.
- **Pinned Notes**: Supports pinning important notes to the top of the list.
- **Search**: Real-time filtering by note title or content.
- **View Modes**: Grid and List views.

### Navigation Header

- Displays the current location in the folder hierarchy.
- Contains the "Hidden Gateway" (3-click trigger on the title).

## Technical Implementation

### State Management (`notes.store.ts`)

- `folders`: Collection of folder nodes.
- `notes`: Collection of note metadata and content.
- `unlockedFolderIds`: Ephemeral state tracking which folders are currently accessible in the session.

### Security Logic

- **Locking**: When creating/editing a folder, the user can enable "Private" mode and set a PIN.
- **Hashing**: `CryptoJS.SHA256(pin).toString()` is used to store the `lock_code`.
- **Unlock**: The `LockScreen` component intercepts navigation into a private folder.

## Atomic Verification Criteria

- [ ] Drag-and-drop between folders works seamlessly.
- [ ] Locked folders correctly hide note counts and titles in the UI.
- [ ] PIN reset or recovery is intentionally omitted (security via obfuscation/responsibility).
