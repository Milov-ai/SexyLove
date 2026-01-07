# Specification: Vault UX Overhaul

## Goal

Transform the "Hidden Vault" into a "Million Dollar" ethereal experience where every component floats in a glassmorphic void, ensuring strict data safety (no deletions/schema drops) and zero hardcoded strings.

## User Stories

- As a Keeper, I want to enter a Vault that feels like a distinct, premium dimension so that I feel emotionally transported away from the "Superficial" app.
- As a Keeper, I want to navigate my memories via a floating dock so that the experience feels fluid and unconstrained by standard Android UI patterns.
- As a User, I want to experience "physics-based" interactions (parallax, magnetic buttons) so that the app feels alive and expensive.

## Specific Requirements

**Aesthetic Engine: "Ethereal Float"**

- Implement a global "Void" background container that supports animated abstract wallpapers.
- Ensure NO component contacts the screen edges (except for intentional bleeds); everything must float with `margin` and `backdrop-blur`.
- Enforce "Glassmorphism 3.0": `bg-white/5` + `border-white/10` + `shadow-[inner_0_0_20px_rgba(255,255,255,0.05)]` as the baseline token.

**Universal "Floating Dock" Navigation**

- Replace standard bottom tabs with a detached, pill-shaped `FloatingNavBar`.
- Implement macOS-style "magnification" or scale-up on active/hover states for icons.
- Position: Fixed, bottom-center, `bottom-8`, `z-50`.

**Vault Dashboard 2.0**

- Refactor `NotesDashboard` (Vault variant) to use a Masonry or Staggered Grid layout for notes.
- Integrate `Framer Motion` for a "Waterfall" entrance animation of note cards.
- **Strict Data Safety:** Bind UI purely to existing `useNotes` hooks; DO NOT modify the underlying `notes` table schema.

**Atomic Component Library**

- Create `PremiumButton`: A floating, glass-button with "inner glow" state.
- Create `PremiumInput`: A borderless, glowing text field that looks like etched glass.
- Create `PremiumDialog`: A modal that morphs from the trigger source rather than fading in from center.

**String Externalization**

- Create `src/config/vault.constants.ts` to hold ALL visible text.
- Replace every hardcoded label in Vault components with references to this config.

## Visual Design

_No specific mockups provided. Consultant's Visualization applies._

**`Consultant's Vision`**

- **Floating Cards**: 16px border-radius minimum, 1px subtle white border.
- **Depth**: Use 3 layers of depth: Background (Video/Gradient) -> Glass Layer 1 (Nav/Controls) -> Glass Layer 2 (Active Modals).

## Existing Code to Leverage

**`src/components/ui/premium/GlassCard.tsx`**

- **Reuse:** This is the MASTER component. Use it as the base wrapper for _every_ list item and container in the Vault.
- **Refine:** Add a `variant="ethereal"` that removes the border on one side for a "fade-out" effect if needed.

**`src/features/notes/components/NotesDashboard.tsx`**

- **Reuse:** Logic for fetching, filtering, and pinning notes.
- **Refactor:** Strip the UI JSX entirely and replace with the new "Floating" layout, keeping the `useNotes` hook integration intact.

**`src/features/rituals/components/RitualList.tsx`**

- **Reuse:** The `AnimatePresence` list transitions here are close to what we want.
- **Refine:** Slow down the duration (`0.5s` -> `0.8s`) and add a `spring` stiffness for a more "heavy/premium" feel.

**`src/components/common/BiometricGuard.tsx`**

- **Reuse:** Keep the logic for locking/unlocking.
- **Refine:** Change the "Unlock" animation from a simple fade to a "gate opening" or "shattering glass" reveal effect.

## Out of Scope

- **Database Schema Changes:** No new columns, no table drops, no data deletions.
- **Superficial Facade Redesign:** The public "Notes" app remains unchanged.
- **Auth Logic:** The underlying Supabase Auth flow is untouched, only the visual presentation changes.
- **Cloud Functions:** No server-side logic changes.
