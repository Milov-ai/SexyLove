# Architecture Guide

## Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Global Store) + [TanStack Query](https://tanstack.com/query/latest) (Server State)
- **Mobile Runtime**: [Capacitor](https://capacitorjs.com/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Maps**: [MapLibre GL JS](https://maplibre.org/)

## Project Structure

The project follows a **feature-based architecture**, keeping related code collocated.

```
src/
├── features/           # Feature-specific modules
│   ├── auth/           # Authentication (Login, Signup, Guards)
│   ├── entries/        # Journal entries logic
│   ├── notes/          # Hidden vault/notes logic
│   └── places/         # Map and location features
├── components/         # Shared UI components
│   ├── ui/             # Primitive UI components (Buttons, Inputs)
│   └── common/         # Complex shared components
├── services/           # API and external service integrations
│   ├── sync.service.ts # Offline synchronization logic
│   └── supabase.ts     # Supabase client configuration
├── store/              # Global Zustand stores
├── lib/                # Utility functions and helpers
└── hooks/              # Shared custom React hooks
```

## Design System

### Aesthetics

The application features a **premium, modern design** focused on:

- **Glassmorphism**: Extensive use of backdrops, blurs, and semi-transparent layers.
- **Animations**: Smooth transitions using `framer-motion` and `gsap`.
- **Typography**: Clean, modern sans-serif fonts.

### Tailwind Configuration

We use Tailwind v4. Key theme extensions are defined in the CSS variables (see `index.css`), allowing for dynamic theming and dark mode support.

## State Management Strategy

1.  **Server State**: Handled by `TanStack Query`. Used for fetching data from Supabase (Entries, Places, etc.). Caches data and handles loading/error states.
2.  **Global UI State**: Handled by `Zustand`. Used for:
    - Authentication session state.
    - UI toggles (modals, sidebars).
    - "Vault" unlock status.
3.  **Local State**: Standard React `useState` / `useReducer` for component-specific logic.

## Security & The "Vault"

The application includes a "Hidden" mode (Vault).

- **Access**: Protected by a PIN/Pattern.
- **Encryption**: Sensitive data in the vault is encrypted using `crypto-js` before storage.
- **Obfuscation**: The app mimics a standard "Language Learning" or "Utility" app until unlocked.
