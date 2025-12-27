# Specification: Text Input Optimization

## Goal

Eliminate input lag, cursor jumping, and data loss in the Note Editor by decoupling local editing state from upstream database synchronization, verifying "Atomic" stability of block IDs.

## User Stories

- As a user, I want to type continuously without the cursor jumping back or characters disappearing so that I can write thoughts fluently.
- As a user, I want my blocks to remain stable when I press Enter or move them, so that the UI doesn't glitch or remove items unexpectedly.
- As a user, I want my notes to save automatically in the background without freezing the interface.

## Specific Requirements

**Decoupled State Management**

- Initialize `blocks` state from `note.content` ONLY on the first mount or if the note ID changes.
- Prevent `useEffect` from re-hydrating `blocks` from `note` prop during active editing sessions to avoid overwriting local changes with stale server echoes.
- Implement a "Last Edited" timestamp or dirty flag to distinguish between local user actions and remote updates.

**Optimized Auto-Save Strategy**

- Implement a `useDebounce` hook or logic (wait 1000ms after last keystroke) before triggering `updateNote`.
- Ensure `updateNote` execution is purely a side-effect (fire-and-forget) and does not trigger a re-render of the editor component.
- Use `JSON.stringify` only when saving, not on every render.

**Stable Block Identity**

- Enforce strict `uuidv4` generation for new blocks.
- Ensure that creating a new block (Enter key) immediately adds it to local state with a permanent ID before any sync occurs.
- Prevent "Ghost Blocks" where a block is rendered optimistically but then replaced by a server response with a different ID (if applicable).

**Render Performance**

- Verify `BlockRenderer.tsx` utilizes `React.memo` effectively; ensure props (`onChange`, `onKeyDown`) are stable references (`useCallback`).
- Prevent full list re-renders when a single block's content changes by strictly isolating state updates or passing specific update handlers.

## Visual Design

No visual assets provided. The goal is performance and stability invisible to the eye (except for smoothness).

## Existing Code to Leverage

**`src/features/notes/components/NoteEditor.tsx`**

- Reuse the existing `DndContext` and `handleDragEnd` logic but ensure it updates _local state only_ first, then syncs.
- Identify the conflicting `useEffect` at lines ~133-169 in `NoteEditor.tsx` that causes the race condition.

**`src/features/notes/logic/tree-utils.ts`**

- Leverage valid helper functions (`updateBlockInTree`, `addSibling`) as they are pure functions and efficient.

## Out of Scope

- Redesigning the editor UI or changing the visual theme.
- Changing the underlying database schema (Supabase `notes` table).
- Implementing "Google Docs-style" multi-user real-time collaboration (OT/CRDTs) - we are fixing single-user sync conflicts only.
