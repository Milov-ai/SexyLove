# Task Breakdown: Folder Customization

## Overview

Total Tasks: 3 Groups

## Task List

### Database & State

#### Task Group 1: Schema & Store Updates

**Dependencies:** None

- [x] 1.0 Update Database and State
  - [x] 1.1 Create migration to add `icon` column to `folders` table
    - SQL: `alter table folders add column icon text;`
    - Verify with Supabase tool.
  - [x] 1.2 Update `Folder` interface in `src/store/notes.store.ts`
    - Add `icon?: string;`.
    - Ensure `updateFolder` and `addFolder` methods support the new field (they likely pass `Partial<Folder>` so might auto-support, but verify types).
  - [x] 1.3 Verify state persistence
    - Manually update a folder row in Supabase with an icon name (e.g., "Music") and verify it loads in the store.

**Acceptance Criteria:**

- `folders` table has `icon` column.
- TypeScript types reflect the new field.

### Frontend Components

#### Task Group 2: Icon Picker & Rendering

**Dependencies:** Task Group 1

- [x] 2.0 Implement Icon System
  - [x] 2.1 Create `IconPicker` component
    - Location: `src/components/ui/IconPicker.tsx` (or similar).
    - Features: Search input, Grid of icons.
    - Implementation: Use `lucide-react` imports (dynamic or imported `icons` object).
    - Props: `onSelect: (iconName: string) => void`, `onClose: () => void`.
    - Style: Use `Dialog` or `Sheet` components.
  - [x] 2.2 Update `NotesDashboard` to render custom icons
    - Import dynamic icon renderer.
    - Logic: If `folder.icon` exists AND `!folder.is_locked`, render the custom icon.
    - Style: Apply same `THEMES` classes (bg, border, glow) to the new icon container.
    - Fallback: Default `FolderIcon` if no custom icon.
    - **Constraint**: Locked folders MUST show `Lock` icon regardless of custom setting.

**Acceptance Criteria:**

- `IconPicker` allows searching and selecting icons.
- `NotesDashboard` renders the selected icon for public folders.
- Locked folders still show Lock icon.
- Design matches existing aesthetic.

### Interactions

#### Task Group 3: Context Menu & Renaming

**Dependencies:** Task Group 2

- [x] 3.0 Add Interactions
  - [x] 3.1 Update Folder Context Menu in `NotesDashboard`
    - Add "Cambiar Icono" -> Opens `IconPicker`.
    - Add "Renombrar" -> Triggers inline edit mode.
  - [x] 3.2 Implement Inline Renaming Logic
    - State: `editingFolderId` (string | null).
    - UI: When editing, replace Name `<span>` with `<Input>`.
    - Behavior: Focus on mount, save on Enter/Blur, cancel on Escape.
    - Validation: Non-empty string.
  - [x] 3.3 Connect `IconPicker` selection to `updateFolder`
    - Save selected icon string to store/DB.

**Acceptance Criteria:**

- Users can rename folders inline.
- Users can change icons via context menu.
- Changes persist to Supabase.
