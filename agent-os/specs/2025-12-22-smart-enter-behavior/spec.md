# Specification: Smart Enter Behavior

## Goal

Improve the "Enter" key behavior in the Notes Editor to ensuring that pressing Enter creates a new component of the same type immediately below the current one, preserving indentation and automatically capturing focus for rapid chain-creation.

## User Stories

- As a Writer, I want to press Enter on a Bullet Point and get a new Bullet Point below it so I can create lists quickly.
- As a User, I want to press Enter on a nested block and have the new block appear at the same nesting level so I don't lose my context.
- As a Power User, I want to chain multiple Enters (type -> enter -> type -> enter) without touching the mouse so I can brainstorm efficiently.

## Specific Requirements

**Enter Key Handler Logic**

- Upon `Enter` key press (without Shift), intercept the default newline behavior.
- Identify the current block's type (Text, Heading, Bullet, Todo, etc.).
- Determine the correct "next type":
  - Todo -> Todo
  - Bullet -> Bullet
  - Heading -> Text (Standard word processor behavior, usually you don't want 2 items of Heading 1 in a row)
  - Text -> Text
- Call the `addSibling` logic to insert a new block _immediately after_ the current block ID.

**Context & Indentation Preservation**

- The insertion must happen at the **same indentation depth** as the current block.
- Logic must ensure it targets the correct parent array in the nested tree structure specific to the `focusedBlockId`.

**Auto-Focus & Edit Mode**

- Immediately after creation, the new block must be set as `focusedBlockId`.
- The new block must automatically enter "Edit Mode" (`isEditing=true`).
- The cursor must be placed at the start of the new empty block.
- This transition must be seamless (< 50ms) to allow immediate typing.

**Chaining Support**

- The system must support rapid sequential firing of this event.
- Ensure no race conditions between "State Update (Add Block)" and "Focus Triggers".
- Verify that `setTimeout` or `flushSync` is used correctly to ensure the DOM exists before focusing.

## Visual Design

No new UI. This is a behavioral flow change.
_(Visuals provided were non-existent for this behavioral feature)_

## Existing Code to Leverage

**`NoteEditor.tsx`**

- Reuse `handleKeyDown` and `handleGlobalKeyDown` (lines 224-272).
- Reuse `addSibling` from `tree-utils` (line 23, 259).
- Reuse `setFocusedBlockId` state.

**`BlockRenderer.tsx`**

- Reuse the `autoFocus` prop logic in `useEffect` (lines 137-149).
- Reuse `textareaRef` for cursor positioning.

**`tree-utils.ts`**

- Reuse `findBlockPath` to locate the current node and its parent.
- Reuse `addSibling` implementation to handle array insertion.

## Out of Scope

- Converting types via slash commands (e.g. `/h1` turns text to heading).
- Splitting a block in the middle of content (e.g. pressing Enter in the middle of a sentence moves the second half to the new block - nice to have, but goal suggests "create exact same component", implying a new empty one or simple split. We will stick to creating a new one for now unless split is easy).
- Visual animations for insertion beyond existing Framer Motion defaults.
