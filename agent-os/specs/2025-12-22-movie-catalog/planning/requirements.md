# Spec Requirements: Polaroid Movie Memory Component

## Initial Description

A high-fidelity "Polaroid" style component to be used within Notes, allowing users to catalog movies/memories with user-uploaded photos, rich details, and ratings.

## Requirements Discussion

### Key Decisions

1.  **Architecture**: Integrated into the **Notes System** (Public Facade) as a custom Block Type (`PolaroidBlock`).
2.  **Imagery**: **User-uploaded** focus (e.g., photo of the ticket, selfie at the cinema) rather than generic posters.
3.  **Aesthetics**: **World-Class / Ultra-Premium / Sinergia**.
    - **Physics**: Micro-interactions with tilt/glare effects on hover (using `react-tilt` or Framer Motion 3D transforms).
    - **Typography**: A curated "Handwriting" font for the caption area (e.g., _Caveat_, _Shadows Into Light_, or a custom variable font) to simulate authentic writing.
    - **Texture**: Subtle paper grain texture overlay on the white border.
    - **Motion**: "Developing" animation on load—image slowly fades in from sepia/gray to full color.
4.  **Metadata (Synergy-Aligned)**:
    - **Rating**: 5-star (or custom icon) system with fluid "pop" animations on selection.
    - **Details**: Title, Date, concise "Memory/Review", and Tags.
    - **Layout**: Balanced, white-space heavy bottom section to mimic the iconic instant film look.

## Technical Requirements

- **Block Type**: New `PolaroidBlock` implementation for the block editor.
- **Storage**: Images stored in Supabase Storage (`memories` bucket) with aggressive caching and optimization.
- **Interactivity**:
  - **Editable**: Click to flip (back of photo) for editing details? Or inline editing on the "paper"?
  - **Draggable**: Smooth drag-and-drop reordering within the note.
- **Performance**:
  - Heavy use of CSS `transform: translate3d` for performance.
  - `will-change` optimizations for the tilt effect.

## Visual Design Strategy

- **Container**: Aspect ratio mimicking classic instant film (~3.5" x 4.2").
- **Shadows**: Deep, layered realistic drop shadows that react to cursor position/tilt (`box-shadow` interpolation).
- **Glassmorphism**: A slight, high-gloss overlay (gradient with low opacity) on the "photo" area to simulate the glossy finish of actual film, contrasting with the matte texture of the paper border.

## Out of Scope

- Automatic API fetching of movie metadata (User preference for personal upload/curation).
- Integration with the Hidden Vault (This is explicitly a Public Facade/Notes feature as requested).
