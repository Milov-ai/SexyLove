# Task Breakdown: Polaroid Filters

## Overview

Total Tasks: 13

## Task List

### Frontend Logic (React Hooks)

#### Task Group 1: Filter Logic & State

**Dependencies:** None

- [x] 1.0 Implement Logic Hook
  - [x] 1.1 Write 2-8 focused tests for `usePolaroidStats`
    - Test unique genre extraction
    - Test min/max year calculation
    - Test "watched" counting
  - [x] 1.2 Create `usePolaroidStats` hook
    - Input: `Block[]`
    - Output: `stats` object (genres, directors, years range, ratings)
  - [x] 1.3 Create `usePolaroidFilter` hook
    - Input: `Block[]`, `filters` state
    - Output: `filteredBlocks` (or IDs to hide)
    - Logic: Case-insensitive title match, AND logic for Genre/Year/Director
  - [x] 1.4 Ensure Logic tests pass
    - Run ONLY tests from 1.1

**Acceptance Criteria:**

- Hook correctly extracts unique metadata from a list of blocks
- Filtering logic correctly handles multiple active filters (AND logic)
- Performance is optimized (memoized)

### Frontend Components (UI)

#### Task Group 2: Filter Bar Component

**Dependencies:** Task Group 1

- [x] 2.0 Build Component
  - [x] 2.1 Write 2-8 focused tests for `PolaroidFilterBar`
    - Test rendering when `cine_polaroid` is present
    - Test collapse/expand interaction
  - [x] 2.2 Create `PolaroidFilterBar.tsx` Layout
    - Sticky/Fixed positioning
    - Glassmorphic styling (`backdrop-blur`)
    - Collapsible functionality (`Collapsible` primitive)
  - [x] 2.3 Implement Filter Controls
    - Genre Select (Shadcn `Select`) -> Refactored to `DropdownMenu`
    - Watched Toggle (`Switch` or `Tabs`)
    - Rating Slider/Input
    - Search Input
  - [x] 2.4 Ensure Component tests pass
    - Run ONLY tests from 2.1

**Acceptance Criteria:**

- Component matches visual design (Glassmorphic, compact)
- Controls interact correctly with the `onFilterChange` prop
- Collapsible state works

### Integration

#### Task Group 3: Editor Integration

**Dependencies:** Task Group 2

- [x] 3.0 Integrate into Editor
  - [x] 3.1 Write 2-8 focused tests for Editor Integration
    - Test that filter bar appears when polaroids exist
    - Test that non-matching blocks are hidden
  - [x] 3.2 Update `NoteEditor.tsx`
    - Add `PolaroidFilterBar` to render tree
    - Pass `blocks` and filter state
  - [x] 3.3 Implement Visibility Logic
    - Pass `isHidden` prop to `BlockRenderer` OR
    - Use CSS class to hide filtered blocks (preferred for performance)
  - [x] 3.4 Ensure Integration tests pass
    - Run ONLY tests from 3.1

**Acceptance Criteria:**

- Filter bar only appears for notes with Movies
- Filtering hides unrelated blocks in real-time
- Editor performance remains stable (no lag on type)

### Verification

#### Task Group 4: Manual Validation

**Dependencies:** Task Groups 1-3

- [x] 4.0 Manual Verification
  - [x] 4.1 Verify Title Search
  - [x] 4.2 Verify Genre Filtering
  - [x] 4.3 Verify Watched Toggle
  - [x] 4.4 Check Layout Stability (Sticky behavior)

**Acceptance Criteria:**

- All filter types work as expected
- UI is responsive and aesthetically pleasing
