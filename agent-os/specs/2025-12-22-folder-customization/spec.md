# Specification: Folder Customization

## Goal

Enable users to personalize their public workspace by customizing folder icons (using the Lucide library) and renaming folders directly, ensuring these changes integrate seamlessly with the existing aura (theme) system while preserving security indicators for private folders.

## User Stories

- As a User, I want to assign a specific icon to my public folders so that I can visually distinguish them based on their content (e.g., a music note for a Music folder).
- As a User, I want to rename my folders via an inline edit or context menu so that I can easily organize my structure without deleting and recreating folders.
- As a User, I want my selected custom icon to automatically inherit the folder's "Aura" (color/glow) so that the visual harmony of the application is maintained.

## Specific Requirements

**Database Schema**

- Update the `folders` table in Supabase to include an `icon` column (text/string) to store the name of the Lucide icon.
- Ensure the `Folder` interface in `store/notes.store.ts` reflects this new optional property.

**Icon Picker Component**

- Create a new `IconPicker` component (likely a Dialog or Sheet to match existing UI patterns).
- Include a search bar to filter icons by name (e.g., "music", "work").
- Display a grid of available `lucide-react` icons.
- On selection, update the folder's `icon` property via the store.

**Dashboard Folder Rendering**

- Modify `src/features/notes/components/NotesDashboard.tsx` to render the custom icon if `folder.icon` exists.
- **Constraint**: If `folder.is_locked` is true, the `Lock` icon MUST take precedence or the custom icon must be hidden/locked to indicate security (User specified private folders must show lock).
- Apply the same Tailwind classes for color/glow (`THEMES[folder.color].icon`) to the dynamic icon component.

**Context Menu Actions**

- Add "Cambiar Icono" (Change Icon) option to the existing folder `DropdownMenu` in `NotesDashboard.tsx`.
- Add "Renombrar" (Rename) option to the `DropdownMenu`.

**Inline Renaming**

- Implement an editing state logic (e.g., `editingFolderId`).
- When active, replace the folder name `span` with an `Input` field (or contentEditable element).
- Save changes on "Enter" or "Blur".
- Revert on "Escape".

## Visual Design

No specific visual assets provided.

- Follow existing "Glassmorphism" and "Neon/Aura" aesthetic.
- Use `Dialog`/`Sheet` components from `shadcn/ui` (or existing implementations) for the picker.
- Ensure the Input for renaming blends with the card design (transparent background, standard font).

## Existing Code to Leverage

**`src/features/notes/components/NotesDashboard.tsx`**

- Use the existing `filteredFolders.map` loop for rendering logic.
- Reuse the `DropdownMenu` structure for adding new actions.
- Reuse `THEMES` integration for styling the new icons.

**`src/components/ui/ColorPicker.tsx`**

- Reference the selection UI pattern for the `IconPicker`.

**`lucide-react`**

- Use the library's dynamic icon rendering capabilities (e.g., `icons[name]`).

**`src/store/notes.store.ts`**

- Use `updateFolder` action to save the new name and icon.

## Out of Scope

- Customizing icons for Private/Locked folders (they must handle security visualization).
- Uploading custom images or SVGs (restricted to Lucide library).
- "Pin to top" logic changes (customization is visual only).
