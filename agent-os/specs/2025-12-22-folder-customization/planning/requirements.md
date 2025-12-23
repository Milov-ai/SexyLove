# Spec Requirements: Folder Customization

## Initial Description

Poder poner iconos a las carpetas los de lucide react, y poder elegir cualquiera y tambien se le aplique el thema, Poder editar el nombre de las carpetas etc etc

## Requirements Discussion

### First Round Questions

**Q1:** I assume this customization (icons and renaming) applies to **Public Note Folders**. Should it also apply to **Private/Vault Folders**?
**Answer:** 1 solo a las publicas, las privadas deben verse con el icono de candado y en las publicas no debe estar el de icono de candado

**Q2:** For "choosing any icon" from Lucide React, I assume we need a **Searchable Icon Picker** modal. Is that correct?
**Answer:** 2 si

**Q3:** Regarding "apply the theme" to the icon: I assume the icon should inherit the folder's existing **Color/Aura** (e.g., if folder is pink, icon is pink). Or did you mean something else?
**Answer:** 3 si, debe aplicarse como al icono actual pero con el que se elija

**Q4:** For "editing the name", do you prefer an **Inline Edit** (double-click to type) or a **Context Menu > Rename** option?
**Answer:** 4 edicion en linea

**Q5:** I assume we need to update the Supabase `folders` table to add an `icon` column (string). Is that acceptable?
**Answer:** 5 si es necesario, puedes hacer lo que quieras, pero no elimines datos ni notas

### Existing Code to Reference

**Similar Features Identified:**

- **Folder List Rendering**: `src/features/notes/components/NotesDashboard.tsx` (Lines 521-623). Handles rendering, theming, and context menus.
- **Icons**: `lucide-react` is already used throughout the app.
- **Color Logic**: `THEMES` constant in `src/lib/theme-constants.ts`.

### Follow-up Questions

None required.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Custom Icons (Public Folders Only)**:
  - Users can select _any_ icon from the Lucide React library for a public folder.
  - Private/Locked folders MUST retain the `Lock` icon and cannot have custom icons visible (or at least they are overridden by the lock status).
  - The selected icon inherits the folder's current `color` (Aura).
- **Icon Picker**:
  - A searchable modal/sheet to browse and select icons.
- **Renaming**:
  - Inline editing of folder names. Triggered likely via double-click or a "Rename" context menu option that activates the edit state.
- **Data Persistence**:
  - Store the icon name (string) in the `folders` table.
  - Schema update required: `alter table folders add column icon text;`

### Reusability Opportunities

- Reuse `Dialog` or `Sheet` components for the Icon Picker.
- Reuse `Input` component for inline renaming.
- Reuse `ColorPicker` logic (but for icon aesthetic).

### Scope Boundaries

**In Scope:**

- Update `folders` table schema.
- Update `NotesDashboard` UI for rendering custom icons.
- Implement `IconPicker` component.
- Implement inline renaming logic.

**Out of Scope:**

- Custom icons for _Private_ folders (they remain locked).
- Uploading custom image/SVG icons (restricted to Lucide library).

### Technical Considerations

- **Dynamic Icon Loading**: Use `lucide-react`'s dynamic capability or `import { icons } from 'lucide-react'` if bundle size permits (or lazy load the picker).
- **Aesthetics**: Ensure the custom icon matches the exact styling (glassmorphism/glow) of the current default folder icon.
