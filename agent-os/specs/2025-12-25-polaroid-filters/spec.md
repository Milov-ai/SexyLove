# Specification: Polaroid Filters

## Goal

Implement a collapsible, context-aware filter overlay in the Note Editor that allows users to filter Cinematic Polaroid blocks by metadata (Genre, Year, Director, Rating, Watched status) without altering the document structure.

## User Stories

- As a **movie buff**, I want to filter my "Movies to Watch" note by "Genre: Horror" so that I can quickly pick a scary movie for tonight.
- As a **completionist**, I want to toggle "Hide Watched" so that I only see movies I haven't seen yet.
- As a **curator**, I want to search by Director name so I can see all the Tarantino movies in my list at once.

## Specific Requirements

**Component: PolaroidFilterBar**

- Create a new component `PolaroidFilterBar.tsx` that renders purely conditionally based on the presence of `cine_polaroid` blocks.
- Position the bar as a **sticky** or **fixed** overlay at the top of the editor content area (z-index managed to sit below main toolbar but above content).
- Implement a **collapsible** design (using `Collapsible` primitive) to minimize visual noise when not in use. `Expanded` state should be local but potentially persist in `localStorage` per note if desired (start with local).

**Dynamic Metadata Extraction**

- Implement a `usePolaroidStats` hook that memoizes the scan of `blocks` array.
- Extract unique values for: `Genre` (array unique), `Year` (min/max range or unique list), `Director` (unique list), `OfficialRating` (min/max).
- Count "Total Movies" vs "Visible Movies" to display a badge (e.g., "Showing 5/12").

**Filtering Logic**

- Implement **client-side filtering** that modifies the _render_ list, NOT the actual _block_ list in the store.
- **Title Search**: Case-insensitive partial match on `block.props.title`.
- **Genre Filter**: Multi-select or single-select dropdown (Shadcn `Select` or `Combobox`).
- **Watched Toggle**: Three-state toggle or dropdown: "All" (default), "Unseen Only", "Seen Only".
- **Rating**: Simple slider or "Minimum Rating" numeric input.

**Visual Feedback**

- Non-matching blocks should be **hidden via CSS** (`display: none`) or not rendered in the mapped list to preserve layout flow.
- Ensure smooth layout transitions (Framer Motion `AnimatePresence` or `layout` prop) when items appear/disappear.

**Integration**

- Integrate into `NoteEditor.tsx` inside the main content wrapper.
- Ensure the filter bar does not overlap the title or other essential editor controls.

## Visual Design

**`planning/visuals/`**
_(No visual assets provided. Following existing "Glassmorphic" aesthetic)_

**UI Guidelines**

- Use `backdrop-blur-md` and `bg-white/10` (or theme-aware equivelant) to match the "Glass" aesthetic.
- Use `Badge` components to show active filter counts.
- Use `Switch` for binary toggles like "Hide Watched".
- Use `CollapsibleTrigger` with a `ChevronDown` icon for the expand/collapse action.

## Existing Code to Leverage

**`CinePolaroidBlock.tsx`**

- Reuse `CinePolaroidProps` interface to ensure type safety when accessing `block.props`.
- Reference the `isSeen` prop logic for the "Watched" filter.

**`NotesDashboard.tsx`**

- Reference the existing search/filter logic (`filteredNotes`) for patterns on how to filter an array of objects based on properties efficiently.

**Shadcn UI Components**

- `src/components/ui/collapsible.tsx`: For the expand/collapse container.
- `src/components/ui/switch.tsx`: For the "Watched" toggle.
- `src/components/ui/badge.tsx`: For displaying counts.
- `src/components/ui/select.tsx`: For Genre/Director dropdowns.
- `src/components/ui/slider.tsx`: For Rating range.

## Out of Scope

- **Global Search**: Filtering is strictly scoped to the _current open note_.
- **Database Indexing**: No backend changes; all filtering is client-side.
- **Complex Queries**: No "OR" logic or complex query builder (simple "AND" filtering only).
- **Sorting**: Re-ordering blocks (sorting by Year, etc.) is out of scope for this spec; we are only strictly _filtering_ (hiding) items.
