# Task Breakdown: Text Input Optimization

## Overview

Total Tasks: 9

## Task List

### Frontend Refactoring

#### Task Group 1: State Decoupling & Auto-Save

**Dependencies:** None

- [/] 1.0 Decouple `NoteEditor` state
  - [x] 1.1 Write 2-8 focused tests for `NoteEditor` state logic
    - Test initial hydration from `note` prop.
    - Test that subsequent `note` prop updates (simulating auto-save echo) do NOT overwrite local state if `lastEdited` is recent.
  - [x] 1.2 Implement `useDebounce` hook
    - Create `useDebounce` hook (or reuse existing) for `updateNote` calls.
    - Set debounce delay to 1000ms.
  - [x] 1.3 Refactor `NoteEditor` useEffects
    - Remove the dependency on `note.content` in the block hydration effect after the first render.
    - Implement a `isDirty` or `localLastModified` ref to track local changes.
    - Ensure `updateNote` is called only after the debounce period.
  - [ ] 1.4 Ensure state tests pass
    - Run ONLY the 2-8 tests written in 1.1.
    - Verify that rapid typing does not trigger re-renders from upstream props.

**Acceptance Criteria:**

- Typing quickly does not cause cursor jumps.
- Auto-save triggers 1 second after typing stops.
- Local state persists even if `note` prop updates in the background.

#### Task Group 2: Block Stability & Rendering

**Dependencies:** Task Group 1

- [/] 2.0 Optimize Block Rendering & Identity
  - [x] 2.1 Write 2-8 focused tests for `BlockRenderer` stability
    - Test that creating a new block (Enter) generates a stable ID.
    - Test that `BlockRenderer` does not re-render siblings when one block updates its content.
  - [x] 2.2 Enforce Stable IDs
    - Verify `uuidv4` usage in `addBlock` and `handleGlobalKeyDown` in `NoteEditor.tsx`.
    - Ensure no implicit index-based keys are used in lists (only `block.id`).
  - [x] 2.3 Optimize `BlockRenderer` memoization
    - Profile `BlockRenderer` re-renders.
    - Wrap `onChange`, `onKeyDown`, `onFocus` handlers in `useCallback` with correct dependency arrays.
    - Ensure `BlockRenderer` uses `React.memo` correctly (verify comparison function if needed).
  - [x] 2.4 Verify fix with manual smoke test
    - Type rapidly in a long note.
    - Create new blocks with Enter.
    - Move blocks via drag-and-drop.
    - Confirm component stability (no disappearances).
  - [ ] 2.5 Ensure rendering tests pass
    - Run ONLY the 2-8 tests written in 2.1.

**Acceptance Criteria:**

- `BlockRenderer` only re-renders the specific block being edited.
- New blocks appear instantly and persist.
- Drag-and-drop operations are smooth and data-safe.

### Testing

#### Task Group 3: Final Verification

**Dependencies:** Task Groups 1-2

- [ ] 3.0 Final Regression Check
  - [ ] 3.1 Analyze text input behavior on mobile
    - Verify fix on the specific Android device (via browser or APK).
  - [ ] 3.2 Verify legacy data compatibility
    - Open an existing old note and ensure it loads/saves correctly without data loss.

**Acceptance Criteria:**

- Validated on Mobile view.
- No regression in existing note functionality.

## Execution Order

1. State Decoupling & Auto-Save (Task Group 1)
2. Block Stability & Rendering (Task Group 2)
3. Final Verification (Task Group 3)
