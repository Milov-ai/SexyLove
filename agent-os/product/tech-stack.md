# Tech Stack

### Framework & Runtime

- **Application Framework:** React 19 (Frontend) + Supabase (BaaS)
- **Language/Runtime:** TypeScript / Vite
- **Package Manager:** pnpm
- **Native Bridge:** Capacitor 7 (Android)

### Frontend

- **JavaScript Framework:** React 19
- **CSS Framework:** Tailwind CSS 4
- **UI Components:** Shadcn/ui (customized) + Radix UI Primitives
- **Animations:** GSAP 3 + Framer Motion 12
- **State Management:** Zustand 5 (Global) + TanStack Query 5 (Server)

### Security & Data

- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (with Access Code gate)
- **Encryption:** AES-256 (via `crypto-js`)
- **Realtime / Sync:** Supabase Realtime + Custom "Eternity" Sync Protocol (Offline Queue + Optimistic Updates)
- **Storage:** Supabase Storage (Media/Images)

### Geospatial (Geografía del Deseo)

- **Engine:** MapLibre GL
- **React Wrapper:** `react-map-gl/maplibre`

### Testing & Quality

- **Test Framework:** Vitest + React Testing Library
- **Linting/Formatting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged

### Key Third-Party Libraries

- **Date Handling:** `date-fns`
- **Icons:** `lucide-react`
- **Form Management:** `react-hook-form` + `zod`
- **Drag & Drop:** `@dnd-kit` (Core, Sortable, Utilities)
- **Toast Notifications:** `sonner`
