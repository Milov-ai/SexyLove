# Task Breakdown: Smart Enter Behavior

## Overview

Total Tasks: 2

## Task List

### Frontend Logic

#### Task Group 1: Enter Key Logic & Focus Management

**Dependencies:** None

- [x] 1.0 Implement Smart Enter Logic
  - [x] 1.1 Write 2-4 focused integration tests for Enter Key behavior
    - Test case: Pressing Enter on a bullet point creates a new bullet point
    - Test case: Pressing Enter on a heading creates a paragraph
    - Test case: Pressing Enter on an indented item creates a sibling at same depth
  - [x] 1.2 Refactor `handleKeyDown` in `NoteEditor.tsx`
    - Update `Enter` logic to intelligently determine "Next Type"
      - Bullet -> Bullet
      - Todo -> Todo (unchecked)
      - Heading -> Text (standard paragraph)
      - Quote -> Text (or Quote, depending on preference, usually Text)
      - Standard -> Standard
    - Ensure `addSibling` is called with the correct `focusedBlockId` context
  - [x] 1.3 Verify and Optimize Focus Transition in `BlockRenderer.tsx`
    - Ensure `autoFocus` prop correctly triggers `.focus()` on the textarea
    - Ensure `isEditing` state defaults to `true` for newly created blocks to avoid "double tap" requirement
    - Verify `selectionTimeRef` logic allows immediate typing (ghost click protection shouldn't block initial focus)
  - [x] 1.4 Test Chaining Capability
    - Manual Test: Press Enter 5 times rapidly. Ensure 5 empty blocks are created and the cursor ends up in the last one.
    - Fix any race conditions with `setFocusedBlockId` (ensure `setTimeout` value is appropriate, usually 0 is fine, but React 18 batching might need `flushSync` if issues arise)
  - [x] 1.5 Ensure Feature Tests Pass
    - Run the 2-4 integration tests from 1.1
    - Verify manual chaining works seamlessly

**Acceptance Criteria:**

### Mobile-First Refinements

#### Task Group 3: Mobile UX Optimization

**Dependencies:** Task Group 1

- [x] 3.1 Optimize Polaroid for Mobile
  - [x] Replace hover-only tilt with device orientation (gyroscope) tracking
  - [x] Add `whileTap` tactile feedback for flip/touch interactions
  - [x] Add breathing animation for a "living" UI feel
- [x] 3.2 Standardize Tactile Feedback
  - [x] Add `whileTap` scaling to Dashboard folder/note cards
  - [x] Add `whileTap` to primary action buttons (Search, View Toggle, Back, Delete)
  - [x] Ensure `focus-within` triggers visibility for block controls on touch
- [x] 3.3 Verify "Edit Mode" on Touch
  - [x] Ensure newly created blocks via Smart Enter enter edit mode automatically (fixed race condition in `BlockRenderer.tsx`)

**Acceptance Criteria:**

- [x] Pressing Enter on a List Item creates a new List Item
- [x] Pressing Enter on a Heading creates a Paragraph
- [x] New block appears at the correct indentation level
- [x] New block is immediately focused and in "Edit Mode"
- [x] Typing can start immediately after pressing Enter (< 50ms delay)
- [x] Polaroid responds to phone movement (orientation)
- [x] Every touch on a card or primary button provides tactile (scale) feedback
- [x] Fixed "double tap" requirement for newly created blocks

### Testing

#### Task Group 2: Verification

**Dependencies:** Task Group 1, Task Group 3

- [x] 2.0 Feature Verification
  - [x] 2.1 Verify Deep Nesting
    - Create a list 3 levels deep
    - Press Enter on the deepest item
    - Verify new item is also 3 levels deep
  - [x] 2.2 Verify Mobile Behavior
    - Simulate mobile view (touch)
    - Ensure virtual keyboard stays up or re-appears instantly on new block creation
  - [x] 2.3 Close-out
    - Ensure no regressions in standard editing (typing text, deleting blocks)

**Acceptance Criteria:**

- [x] Deep nesting works as expected
- [x] Mobile experience is smooth and premium
