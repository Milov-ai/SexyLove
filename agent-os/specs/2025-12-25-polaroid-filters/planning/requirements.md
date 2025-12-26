# Spec Requirements: Polaroid Filters

## Initial Description

@[/shape-spec] En las notas donde se identifique que hay un componente de movie polaroid debe agregarse un componente de filtros al inicio de la nota, que permita filtrar los polaroids por campos como nombre, género, año, director, calificación, si ya lo vimos o no.

## Requirements Discussion

### First Round Questions

**Q1:** "Watched" Status: Should we first update the Polaroid block to include an interactive "Watched/Seen" checkbox or toggle?
**Answer:** The user confirmed "el switch ya lo tiene" (the switch already has it). Verification of `CinePolaroidBlock.tsx` confirms a `Switch` component bounded to `props.isSeen` exists and persists data via the `content` JSON blob in Supabase.

**Q2:** Placement: Should this filter component be a permanent header or dismissible?
**Answer:** User specified: "deberia ser un filtro arriba en la nota, que este siempre alfrente, como overlay o por el estilo, colapsable, y que aparezca la opcion solo cuando detecte que este una polaroid movie" (Overlay at top, sticky/always in front, collapsible, only appears when polaroid movie is detected).

**Q3:** Filtering Behavior: Hide or dim non-matching blocks?
**Answer:** User implied "filtrar las polaroids" (filter the polaroids). Standard behavior for filters is hiding non-matching items to declutter the view.

**Q4:** Data Source: Dynamic generation?
**Answer:** User command "planifica todo el control de errores y filtros etc etc etc, para que se puedan filtrar todas" implies robust, comprehensive dynamic filtering based on available data.

### Existing Code to Reference

**Similar Features Identified:**

- `CinePolaroidBlock.tsx`: Contains the source interfaces (`CinePolaroidProps`) and the "Watched" (`isSeen`) toggle logic.
- `notes.store.ts`: Handles the persistence of the block data (where `isSeen` and other metadata are stored).

### Follow-up Questions

None needed. Code verification confirmed the state persistence mechanism.

## Visual Assets

### Files Provided:

No visual assets provided. User declined/didn't provide files.

## Requirements Summary

### Functional Requirements

1.  **Auto-Detection**: The Note Editor must detect if at least one `cine_polaroid` block exists in the current note/folder.
2.  **Filter Overlay**:
    - Position: Top of the note content (Sticky/Fixed overlay).
    - Visibility: Only visible when `cine_polaroid` blocks are present.
    - State: Collapsible (Expanded/Collapsed).
3.  **Filter Fields**:
    - **Text Search**: Filter by Title (partial match).
    - **Genre**: Dropdown of unique genres found in current blocks.
    - **Year**: Dropdown/Range for years.
    - **Director**: Dropdown of unique directors.
    - **Rating**: Filter by Official Rating or Personal Rating (e.g., ">= 4 stars").
    - **Watched Status**: Toggle/Dropdown (All / Seen / Not Seen).
4.  **Filtering Logic**:
    - Apply filters conjunctively (AND logic).
    - Non-matching blocks should be visually hidden (not removed from document).
    - Real-time updates as filters change.

### Reusability Opportunities

- Reuse `CinePolaroidProps` interface for type safety.
- Shadcn `Select`, `Input`, `Slider` components for the filter UI.
- Lucide icons (`Filter`, `ChevronUp/Down`) for the toggle.

### Scope Boundaries

**In Scope:**

- Creating the `PolaroidFilterBar` component.
- Integrating it into `NoteEditor.tsx`.
- Implementing the filtering logic hook/utility.
- Ensuring `isSeen` persistence interacts correctly with the filter.

**Out of Scope:**

- Changing the database schema (Supabase JSON storage is sufficient).
- Global search across _all_ notes (filtering is per-note/folder).

### Technical Considerations

- **Performance**: Filtering should be client-side (memoized) since all blocks are already loaded in the editor.
- **Z-Index**: Ensure overlay floats above content but doesn't block the main toolbar if possible.
- **Persistence**: Filter state (which filters are active) does not need to be persisted between sessions, but the "Collapsed/Expanded" state of the bar might be nice to persist in local state.
