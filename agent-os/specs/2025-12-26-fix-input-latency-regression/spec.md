# Specification: Fix Input Latency & State Reversion

## Goal

Eliminate the text input latency ("delay like a second") and prevent text from "deleting itself" during typing. This ensures the editor feels "Atomic" (Instant & Stable).

## Root Cause Analysis (Hypothesis)

1.  **Latency**: The `useDebounce` hook creates a secondary state `debouncedBlocks` and a `useEffect` that runs on every keystroke. While usually cheap, passing the _entire_ `blocks` tree (which grows large) as a dependency to `useEffect` forces React to track this large object. If the GC or dependency tracking overhead is high, it stalls the main thread.
2.  **State Reversion ("Deleting")**: The "1-second delay" matches the debounce time. It is highly probable that the Auto-Save triggers an overarching `useNotesStore` update, which propagates back down. If the `NoteEditor` re-hydrates or re-renders due to this store update _before_ the local state is committed/stabilized, or if the parent remounts the component, the state resets to the "Server" version (which is 1s old).

## Proposed Changes

### 1. Decouple Auto-Save from Render Cycle (`NoteEditor.tsx`)

Instead of `useDebounce` (which uses `useState` and `useEffect`), we will use a **Ref-based Debounce Pattern**.

- **Ref**: `const blocksRef = useRef(blocks);` (Already exists).
- **Logic**: Create a `debouncedSave` function using `useCallback` + `lodash.debounce` (or a custom timer refs) that reads from `blocksRef.current`.
- **Benfit**: The render loop _never_ sees a "debounced value" update. Auto-save happens silently in the background without triggering _any_ component re-renders until the save completes (and even then, we can optimize `lastSaved` update).

### 2. Harden Hydration Logic

- Ensure `setBlocks` from `note.content` **ONLY** happens on initial mount or explicit `noteId` change, and **NEVER** if `blocks` has local changes (dirty state).
- Add a `isDirty` ref to track if user has typed.

### 3. Parent Stability (`NotesDashboard.tsx`)

- Ensure `NoteEditor` is not receiving unstable props that force re-renders. (Verified as likely stable, but willing to add `memo` wrapper if needed).

## Detailed Design

```typescript
// NoteEditor.tsx

// 1. Remove useDebounce
// const debouncedBlocks = useDebounce(blocks, 1000); // DELETE

// 2. Use stable save function
const saveNote = useCallback(async (currentBlocks: Block[], currentTitle: string) => {
   // Update store...
   updateNote(noteId, ...);
}, [noteId, updateNote]);

// 3. Debounced trigger
const triggerSave = useCallback(debounce((b, t) => saveNote(b, t), 1000), [saveNote]);

// 4. Effect hook
useEffect(() => {
   triggerSave(blocks, title);
   return () => triggerSave.cancel();
}, [blocks, title, triggerSave]);
```

## Verification Plan

- **Manual**: Type fast. Verify no lag. Verify no deletion.
- **Automated**: Jest test for `useDebounce` replacement? (UI test is better).
