# Specification: Minecraft Web Client Integration

## Goal

Integrate a web-based Minecraft client into SexyLove's Public Facade, accessible via the search bar keyword `minecraft`. This enables the user and partner to play together on external servers (e.g., Aternos) without requiring separate app installations or account registrations.

## User Stories

- As a user, I want to type "minecraft" in the notes search bar to launch a Minecraft game, so I can access it discreetly.
- As a user, I want to enter my username before playing, so my progress on servers like Aternos is tied to my name.
- As a user, I want to connect to an Aternos server address from within the app, so my partner and I can play together on different devices.

## Specific Requirements

**Search Bar Trigger**

- Detect when user types `minecraft` (case-insensitive) in `NotesDashboard.tsx` search bar.
- On match, open a `MinecraftLauncher` dialog instead of performing a search.
- Clear the search bar after opening the dialog.
- Follow existing pattern from Chameleon trigger (`#CHAMELEON` → `setIsChameleonOpen(true)`).

**Minecraft Launcher Dialog**

- Display a glassmorphic bottom sheet with:
  - Username input field (pre-populated from localStorage if available).
  - Server address input field (format: `server.aternos.me:12345`).
  - "Play" button that navigates to full-screen game.
- Persist last-used username and server address to localStorage.
- Validate inputs before allowing launch.

**Minecraft Game View**

- Create a full-screen component at `/minecraft` route.
- Embed the game via sandboxed `<iframe>`.
- Pass username and server via URL query parameters (library supports `?username=...&server=...`).
- Include a "back" button to return to notes dashboard.
- Handle mobile viewport (ensure `viewport-fit=cover` and safe areas).

**Library Integration**

- Clone `zardoy/minecraft-web-client` into `packages/minecraft-web-client/`.
- For MVP, use their hosted version (`mcon.vercel.app`) to avoid build complexity.
- For production, self-host the built client in `public/minecraft/` or as a separate deploy.
- Configure iframe sandbox: `allow-scripts allow-same-origin allow-forms`.

**Mobile Touch Controls**

- Library has built-in touch controls (joysticks, action buttons).
- No custom UI needed for MVP; use library defaults.
- Settings → Controls → Touch Controls Type → Joystick (recommend in-app tooltip).

**External Server Connectivity**

- Library uses WebSocket proxy for Java server connections.
- Aternos servers are compatible out-of-the-box.
- User enters full server address (e.g., `YourServer.aternos.me:12345`).

## Existing Code to Leverage

**`NotesDashboard.tsx` (Search Trigger Pattern)**

- Lines 556-562: Chameleon trigger on `#CHAMELEON` or `#777` keyword.
- Replicate this pattern for `minecraft` keyword detection.
- Use same state pattern: `isMinecraftOpen` / `setIsMinecraftOpen`.

**`IdentitySelectorDialog.tsx` (Dialog Pattern)**

- Glassmorphic bottom sheet styling.
- Sheet content structure, button styles.
- Use as template for `MinecraftLauncher.tsx`.

**`ChameleonManager.ts` (Feature Module Structure)**

- Follow same folder structure for `src/features/minecraft/`.
- Export pattern via `index.ts`.

**App Router (`App.tsx`)**

- Add route for `/minecraft` → `MinecraftGame` component.
- Follow existing route definitions.

## Out of Scope

- iOS-specific configurations (focus on Android/Web).
- Custom touch control UI (use library defaults).
- P2P hosting from within the app (server-only mode for now).
- World save sync to Supabase/Vault.
- Shader or mod support.
- Full survival mode balance testing.
- Self-hosted WebSocket proxy (use library's default).
