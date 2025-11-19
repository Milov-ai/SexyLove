# Features Overview

## 🔐 Authentication

- **Supabase Auth**: Secure email/password login and signup.
- **Session Management**: Persistent sessions with automatic refresh.
- **Profile Management**: User avatars and display names.

## 📔 Entries (Journal)

- **Rich Text**: Create entries with detailed descriptions.
- **Media**: Attach photos to entries (stored in Supabase Storage).
- **Timeline**: View entries in a chronological timeline.
- **Filtering**: Filter entries by tags, dates, or categories.

## 🛡️ The Vault (Hidden App)

A secure, hidden section of the app for private content.

- **Access Control**: Requires a secondary PIN or biometric authentication (if implemented).
- **Encrypted Notes**: Notes stored in the vault are client-side encrypted.
- **Disguise**: The entry point is hidden within the UI, often requiring a specific gesture or code to reveal.

## 🗺️ Places & Maps

- **Interactive Map**: View locations of interest on a map.
- **Geocoding**: Save locations with coordinates.
- **Chronicle View**: See a history of visits to specific places.

## 🔄 Offline Sync

- **Local-First Architecture**: The app works offline.
- **Queue System**: Actions performed offline are queued and synced when the connection is restored.
- **Conflict Resolution**: Basic "last-write-wins" strategy for data synchronization.
