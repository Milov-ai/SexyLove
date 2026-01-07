# Spec Requirements: 2026-01-07-vault-ux-overhaul

## Initial Description

"Consultor de millon de dolares por hora... Diseño de marca y app superficial de notas... glasmorphics redondeado flotante por componente... requisitos funcionales con especificacion atomica... mejora toda la ux ui y flujos de la app oculta vault."

**Core mandate:** "Decide todo lo mejor de lo mejor sin que elimine informacion de la base de datos, ni ponga informacion directamente en el codigo."

## Requirements Discussion

### Key Decisions (Consultant's Decree)

Based on the "Million Dollar" consulting persona and "Best of the Best" directive, the following decisions are locked:

1.  **Aesthetic Direction: "Ethereal Float"**
    - **Concept:** The Vault is not a "page"; it is a space. Backgrounds are deep, immersive (dark gradients or subtle animated abstract wallpapers).
    - **Component Physics:** All UI elements (cards, lists, buttons) must appear to "float" independently. No solid containers wrapping the screen logic.
    - **Glassmorphism 3.0:** Use of `backdrop-filter: blur(24px)`, subtle white/gradient borders `border-white/10`, and inner shadows to create depth.
    - **Typography:** Modern, variable-width fonts (Inter/Outfit) with "expensive" tracking (slight letter-spacing adjustments) and hierarchy.

2.  **Architecture Constraints**
    - **Zero-Hardcoding:** All UI strings (titles, placeholders, toasts) must be decoupled into a configuration object or localization file (`src/config/ui.constants.ts`).
    - **Data Safety Prime Directive:** NO schema alterations that drop columns. NO `DELETE` operations on production data layers. UI refactors must work with _existing_ data shapes, expanding them only if strictly necessary via additive migrations.

### Existing Code to Reference

**Similar Features Identified:**

- **Source of Truth:** `src/components/ui/premium/GlassCard.tsx` (Current "Gold Standard" for visuals).
- **Facade Reference:** `NotesDashboard.tsx` (Use as a functional baseline but upgrade visuals to "Premium Vault" standard).

## Visual Assets

_No visual files provided by user._
**Consultant's Visualization:**

- **Dashboard:** A masonry or smart-grid layout of "Memory Shards" (Notes/Images), floating over a void-like background.
- **Navigation:** A floating bottom bar (Mac OS Dock style) or gesture-based floating action button, detached from screen edges.

## Requirements Summary

### Functional Requirements with Atomic Specification

#### 1. Vault Dashboard (The Hub)

- **Actor:** Authenticated User (The Keeper).
- **Action:** Enters Vault via Biometric/PIN.
- **Outcome:**
  - **State:** Dashboard mounts.
  - **Transition:** Staggered fade-up animation of Folder/Category chips.
  - **Display:** "Recent Memories" grid floats in center.
  - **Interaction:** Pull-to-refresh triggers "Haptic Tick". Scroll creates parallax effect on background vs foreground cards.

#### 2. Universal Navigation (The Floating Dock)

- **Actor:** User.
- **Action:** Navigates between 'Notes', 'Map', 'Fantasies'.
- **Outcome:**
  - **Component:** `FloatingNavBar` (New Component).
  - **Design:** Pill-shaped glass container floating 24px from bottom.
  - **Animation:** Icons scale up 120% on hover/touch (Mac Dock effect).
  - **Active State:** "Glow" indicator under active icon.

#### 3. Data Presentation (The Lists)

- **Spec:** "Floating Islands".
- **Detail:** Each list item is its own `GlassCard`.
- **Spacing:** Margins between items to allow background "breathing" room.
- **Interaction:** Swipe-left to archive/delete (with confirmation), Swipe-right to "Star/Favorite".

### UX & User Flows

- **Flow 1: Seamless Entry:**
  - Triple Click (Facade) -> Biometric -> _Flash of Light/Unlock Animation_ -> Vault Dashboard.
  - _Improvement:_ Eliminate jarring screen transitions. Use Shared Element Transition if possible, or a smooth cross-fade.
- **Flow 2: Creation:**
  - Tap Floating "+" -> "Compose" modal expands from the button (morphing animation) rather than sliding up from bottom.

### Scope Boundaries

**In Scope:**

- Redesign of Vault Dashboard (`NotesDashboard.tsx` equivalent in Vault).
- Redesign of "Folder" mechanisms in Vault.
- Refactoring generic components to "Premium" variants.
- Abstraction of all text strings to config/constants.

**Out of Scope:**

- Backend Schema changes (Strict constraint).
- Public Facade redesign (Already considered "Superficial Layer").

### Technical Considerations

- **Library:** `framer-motion` for all entrance/exit/layout animations.
- **Styling:** Tailwind CSS with `bg-opacity`, `backdrop-blur`, `shadow-inner`.
- **Safety:** Wrap all new render logic in `ErrorBoundary` components to prevent Vault lockouts due to UI crashes.
