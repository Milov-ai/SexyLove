# Task Breakdown: Polaroid Movie Catalog

## Overview

Total Tasks: 15

## Task List

### Infrastructure & Assets

#### Task Group 1: Typography & Dependencies

**Dependencies:** None

- [x] 1.0 Setup Assets and Libraries
  - [x] 1.1 Add 'Caveat' font to `index.html`
    - Add Google Fonts link: `https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap`
    - Verify font loads in the browser
  - [x] 1.2 Verify `framer-motion` allows 3D transforms
    - Ensure version supports `preserve-3d` and `rotateX/Y`
  - [x] 1.3 Add CSS utility for "preserve-3d" if missing in Tailwind
    - Add `.preserve-3d`, `.backface-hidden` utilities to `index.css` or `tailwind.config.js`

**Acceptance Criteria:**

- 'Caveat' font is available in the app.
- 3D CSS utilities are verified.

### Core Logic

#### Task Group 2: Media & Storage Logic

**Dependencies:** Task Group 1

- [x] 2.0 Refactor Media Logic
  - [x] 2.1 Extract upload logic from `MediaUploader.tsx` to a hook `useMediaUpload`
    - Should handle `supabase.storage.upload`
    - Should return `{ upload, isUploading, error }`
    - **Goal**: Reuse this for the Polaroid upload button.
  - [x] 2.2 Verify `notes-media` bucket policies
    - Ensure authenticated users can upload and read.
    - (Skip if already verified by existing Image Block usage, but good to check).

**Acceptance Criteria:**

- Reusable `useMediaUpload` hook exists.
- MediaUploader is refactored to use this hook (optional cleanup, but highly recommended).

### Frontend Components

#### Task Group 3: Polaroid Component Construction

**Dependencies:** Task Group 2

- [x] 3.0 Build PolaroidBlock Component
  - [x] 3.1 Create `src/features/notes/components/blocks/PolaroidBlock.tsx`
    - Basic props interface: `BlockProps`
    - Render interactive container with `aspect-[3.5/4.2]`
  - [x] 3.2 Implement "Front Face" (Image + Chin)
    - Image area with `linear-gradient` overlay for gloss.
    - White "Chin" area using 'Caveat' font.
    - Title and Rating display.
  - [x] 3.3 Implement 3D Tilt Effect
    - Use `framer-motion` `useMotionValue` for mouse tracking.
    - Apply `rotateX` and `rotateY` transforms on hover.
  - [x] 3.4 Implement "Back Face" (Edit Mode)
    - Textarea for "Memory/Review".
    - Inputs for Date and Location.
    - "Done" button to flip back.
  - [x] 3.5 Implement "Flip" Interaction
    - Click toggles `isFlipped` state.
    - Animate `rotateY` 180deg.
  - [x] 3.6 Integrate "Developing" Animation
    - `initial={{ filter: "sepia(1) blur(4px)" }}` -> `animate={{ filter: "sepia(0) blur(0)" }}`.

**Acceptance Criteria:**

- Polaroid looks photo-realistic (shadows, gloss).
- Tilt effect follows mouse smoothly.
- Flip interaction works to edit data.
- Data saves to `onChange` (block content updates).

### Integration

#### Task Group 4: Editor Integration

**Dependencies:** Task Group 3

- [x] 4.0 Integrate into BlockRenderer
  - [x] 4.1 Update `BlockRenderer.tsx`
    - Import `PolaroidBlock`.
    - Add `case 'polaroid':` logic.
  - [x] 4.2 Update `StyleToolbar.tsx` (or Slash Command)
    - Add button to insert "Polaroid".
    - Icon: `Camera` or similar from Lucide.
  - [x] 4.3 Verify Drag-and-Drop
    - Ensure `dnd-kit` allows dragging the Polaroid block without breaking the tilt physics (might need `dragCancel` on interactive parts).

**Acceptance Criteria:**

- Can insert a Polaroid block from the editor.
- Can drag and reorder the block.
- Block persistence works (reload page = data remains).

## Execution Order

1. Typography & Dependencies
2. Media & Storage Logic
3. Polaroid Component Construction
4. Editor Integration
