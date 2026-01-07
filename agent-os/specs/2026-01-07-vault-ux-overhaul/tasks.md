# Task Breakdown: Vault UX Overhaul

## Overview

Total Tasks: 15

## Task List

### Foundation & Infrastructure

#### Task Group 1: Configuration & Base Styles

**Dependencies:** None

- [ ] 1.0 Initialize Vault foundation
  - [ ] 1.1 Write 2-4 focused tests for Configuration logic
    - Test that `vault.constants.ts` string retrieval works correctly.
    - Test that color tokens/utilities for "Ethereal" theme resolve correctly (if using a utility helper).
  - [ ] 1.2 Create `src/config/vault.constants.ts`
    - Extract strings for Dashboard titles, Empty states, and Confirmation dialogs.
    - Define animation constants (duration, easing) for global consistency.
  - [ ] 1.3 Implement `VoidContainer` layout
    - Create a wrapper component with the global animated background.
    - Ensure it handles `safe-area-inset` correctly for mobile.
  - [ ] 1.4 Ensure Foundation tests pass
    - Run ONLY tests from 1.1.

**Acceptance Criteria:**

- `VoidContainer` renders with correct "dark/ethereal" background.
- All strings are served from the config file.

### Atomic Component Library

#### Task Group 2: Premium UI Components

**Dependencies:** Task Group 1

- [ ] 2.0 Build "Million Dollar" Components
  - [ ] 2.1 Write 2-4 focused tests for Premium Components
    - Test `PremiumButton` click states and disabled states.
    - Test `PremiumInput` focus/blur visual state changes (via class assertions).
  - [ ] 2.2 Refine `GlassCard.tsx`
    - Add `variant="ethereal"` prop.
    - Implement the "fade-out" border logic.
  - [ ] 2.3 Create `PremiumButton.tsx`
    - Implement "Inner Glow" and "Floating" hover effects.
    - Support variants: `primary`, `danger`, `ghost`.
  - [ ] 2.4 Create `PremiumInput.tsx`
    - Borderless design with bottom-glow on focus.
    - Integration with `react-hook-form` refs.
  - [ ] 2.5 Ensure Component tests pass
    - Run ONLY tests from 2.1.

**Acceptance Criteria:**

- Components match the "Floating Island" aesthetic (no hard edges, standard transparency).
- Interactions (Hover/Focus) trigger GPU-accelerated transitions.

### Navigation Layer

#### Task Group 3: Floating Dock

**Dependencies:** Task Group 2

- [ ] 3.0 Implement Universal Navigation
  - [ ] 3.1 Write 2-4 focused tests for Navigation
    - Test that clicking dock icons triggers route/view changes.
    - Test active state indication logic.
  - [ ] 3.2 Implement `FloatingNavBar.tsx`
    - Fixed position `bottom-8`.
    - "Magnification" effect on hover/touch using Framer Motion.
  - [ ] 3.3 Create Icon set for Dock
    - Notes, Map (Geografía), Fantasies (Rituals).
    - Use `lucide-react` with custom stroke widths.
  - [ ] 3.4 Integrate Dock into `VoidContainer`
    - Ensure it floats above content and z-index is correct.
  - [ ] 3.5 Ensure Navigation tests pass
    - Run ONLY tests from 3.1.

**Acceptance Criteria:**

- Dock floats 24px-32px from bottom.
- Icons scale smoothly on interaction.
- Active tab has distinct "glow".

### Feature Implementation

#### Task Group 4: Vault Dashboard 2.0

**Dependencies:** Task Group 3, existing `useNotes` hook

- [ ] 4.0 Build the Vault Dashboard
  - [ ] 4.1 Write 2-4 focused tests for Dashboard
    - Test that notes render in the grid.
    - Test that "Empty State" renders when no notes exist.
  - [ ] 4.2 Create `VaultDashboard.tsx`
    - **Crucial:** Isolate from `NotesDashboard` (Facade).
    - Implement "Masonry" or Staggered Grid layout using CSS Grid + Framer Motion.
    - Bind to `useNotes` for data.
  - [ ] 4.3 Implement "Waterfall" Entrance
    - Note cards should stagger in (`delta: 0.05s`).
  - [ ] 4.4 Integrate "Pull to Refresh" / interactions
    - Verify haptics (if available) or visual spring release.
  - [ ] 4.5 Ensure Dashboard tests pass
    - Run ONLY tests from 4.1.

**Acceptance Criteria:**

- Dashboard renders note cards in a staggered grid.
- No direct database calls (uses hook).
- Animations are smooth (60fps).

### Verification

#### Task Group 5: Quality Assurance

**Dependencies:** All previous groups

- [ ] 5.0 UX & Data Safety Audit
  - [ ] 5.1 Review Test Coverage
    - Verify critical paths: Entry -> Dashboard -> Navigation -> Interaction.
  - [ ] 5.2 Manual "Vibe Check"
    - Verify "Floating" effect implies no containers are clipped.
    - Verify "Glassmorphism" blur does not cause legibility issues.
  - [ ] 5.3 Data Safety Verification
    - Create a test note in Vault.
    - Verify it persists.
    - Verify NO data lost during UI switches.
  - [ ] 5.4 Run Feature Tests
    - Run the focused test suite from Groups 1-4.

**Acceptance Criteria:**

- "Million Dollar" aesthetic achieved (subjective but guided by "Float" spec).
- Strict Data Safety: Zero data loss verified.
