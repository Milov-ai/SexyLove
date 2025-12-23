# Specification: Polaroid Movie Catalog

## Goal

Implement a premium, interactive "Polaroid" block type for the Notes system that allows users to catalog movie memories with high-fidelity visuals, physics-based interactions, and rich metadata, perfectly aligned with the "Synergy" aesthetic.

## User Stories

- As a user, I want to add a "Polaroid" block to my notes so that I can visually catalog my movie experiences.
- As a user, I want to upload my own photo of a ticket or moment so that the memory feels authentic and personal.
- As a user, I want to see the Polaroid "tilt" when I hover over it so that it feels like a real physical object.
- As a user, I want to flip the photo to write details so that I can capture the context without cluttering the visual feed.

## Specific Requirements

**PolaroidBlock Component**

- **Structure**: A 3D-enabled container preserving 3.5" x 4.2" aspect ratio.
- **Front Face**:
  - Full-width squared image area (approx 3.1" wide) with a glossy overlay gradient.
  - White "Chin" area housing the Title (Handwriting font) and Rating (Stars/Hearts).
- **Back Face**:
  - Paper texture background.
  - Input fields for Date, Location, and "Memory" (textarea).
  - "Flip" button to return to front.

**Interactions & Physics**

- **Hover**: Use `react-tilt` (or `framer-motion` equivalent) to apply gyroscopic tilt based on mouse position. Shadows must move dynamically to sell the depth.
- **Entrance**: "Developing" effect—image starts with high contrast/sepia/blur filters and transitions to full color over 1.5s on mount.
- **Flip**: Click interaction triggers a 180-degree Y-axis rotation using `framer-motion` spring physics.

**Typography & Aesthetics**

- **Font**: Integrate Google Font "Caveat" or "Shadows Into Light" specifically for the handwriting elements on the Polaroid chin.
- **Texture**: Subtle grain overlay on the white border (`mix-blend-mode: multiply`) to simulate real photo paper.

**Data Model (Block Props)**

- `type`: "polaroid"
- `content`: Primary caption/title.
- `props`:
  - `imageUrl`: string (Supabase public URL)
  - `rating`: number (0-5)
  - `date`: string (ISO)
  - `location`: string
  - `review`: string
  - `rotation`: number (random -2deg to 2deg on creation for "messy pile" look)

## Visual Design

- **Glassmorphism**: The glossy overlay on the photo should use a white-to-transparent linear gradient at 45deg to simulate a light source reflection.
- **Shadows**: Deep, diffuse shadows (`shadow-xl`) that increase in offset when functionality (hover/lift) is active.

## Existing Code to Leverage

**`BlockRenderer.tsx`**

- Register the new `polaroid` block type in the switch/conditional rendering logic (around line 468).
- Reuse the `dnd-kit` attributes for drag-and-drop capability.

**`MediaUploader.tsx` / `NoteEditor.tsx`**

- Reuse the Supabase Storage upload logic found in `handleImageUpload` (NoteEditor.tsx lines 369-393) but encapsulated within the Polaroid component for the specific image area.

**`Supabase Client`**

- Use the existing `supabase` singleton from `@/lib/supabase` for storage operations (`notes-media` bucket).

## Out of Scope

- Automatic fetching of movie posters via 3rd party APIs (OMDB/TMDB) - strict focus on user uploads.
- Video support within the Polaroid frame (Images only for v1).
- Sharing Polaroids to social media or external links.
