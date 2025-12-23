# Spec Requirements: Smart Enter Behavior

## Initial Description

The user wants to improve the editing experience in Notes. Specifically, pressing "Enter" on a component should:

1.  **Duplicate/Create Logic**: Create a new component of the _same type_ (or a compatible default) immediately below the current one.
2.  **Position Independence**: This should work "se encuentre donde se encuentre" (wherever it is), respecting indentation or nesting.
3.  **Auto-Edit/Focus**: The newly created component must be automatically selected/focused in "edit mode" so typing can continue immediately.
4.  **Chaining**: It must support rapid sequential creation (Enter -> Type -> Enter -> Type), allowing for efficient "chain creation" of components.

## Requirements Discussion

### Functional Requirements

- **Trigger**: "Enter" key press on a component (likely text-based or interactive).
- **Action**:
  - Insert a new component after the current one.
  - Type resolution: Likely same type as current (e.g., Checkbox -> Checkbox, Paragraph -> Paragraph) or standard text block.
  - Context: Must handle nesting (e.g., inside a list or indented block) by preserving the indentation level.
- **Focus State**:
  - The new component must immediately capture focus.
  - It must be in "Edit Mode" (cursor active).
- **User Flow**:
  - User types in Component A.
  - User presses Enter.
  - Component A loses focus (saving content if needed).
  - Component B is created below A.
  - Component B gains focus.
  - User types in Component B.

### Reusability Opportunities

- **Existing Notes Logic**: `NotesDashboard.tsx`, `NoteEditor.tsx`, or similar.
- **Component Rendering**: The mapping of "Enter" to "Create sibling" likely needs to happen in the block/component renderer or the main editor loop.

### Scope Boundaries

**In Scope:**

- Handling "Enter" key events in note components.
- Creation logic for new components.
- Focus management logic.

**Out of Scope:**

- Changing the data structure (unless necessary to support ordering).
- Features unrelated to "Enter" key behavior.

### Technical Considerations

- **Event Handling**: Need to capture `onKeyDown` (Enter) and prevent default new-line behavior if it's meant to spawn a new block.
- **State Management**: The "Focus" state needs to be managed potentially via a store or refs to ensure the correct element receives focus after render.
