# Atomic Spec: Block-based Note Editor

## Overview

The Note Editor is a modern, block-based system designed for high performance and clean structure. It allows users to create hierarchical notes using diverse block types.

## Block Specification

### Supported Types

- `text`: Standard paragraph text.
- `heading`: Title or section header.
- `todo`: Checkbox item with completion state.
- `bullet`: Unordered list item.
- `quote`: Blockquote style.
- `polaroid`: Image with caption and decorative tilt.
- `link`: Bookmark or URL reference.
- `table`: Structured data in rows/columns.

### Hierarchy & Nesting

- **Children**: Blocks can contain other blocks (recursive rendering).
- **Indentation**: Tab key triggers `indentBlock` and `outdentBlock` logic via `tree-utils.ts`.
- **Zoom**: Users can "Zoom into" a block (Focus mode), treating it as the temporary root.

## Smart Interactions

### "Smart Enter" Behavior

- **Bullet/Todo**: Pressing Enter at the end of a bullet or todo block creates a new block of the **same type** at the same depth.
- **Heading**: Pressing Enter at the end of a heading creates a **text block** (standard paragraph).
- **Indented Blocks**: Enter preserves the current indentation level.
- **Focus Management**: New blocks are auto-focused and set to `isEditing: true` to eliminate visual lag.

### Formatting & Styles (Aura)

- **Style Toolbar**: Floating menu for bold, italic, underline, strikethrough, and alignment.
- **Aura Colors**: Blocks can be assigned aesthetic theme colors.

## Technical Architecture

### Data Structure

Notes are stored as an array of `Block` objects in the `notes` table (JSONB `content` field).

```typescript
interface Block {
  id: string;
  type: BlockType;
  content: string;
  isCompleted?: boolean;
  children?: Block[];
  style?: BlockStyle;
  props?: Record<string, unknown>;
}
```

### Drag & Drop

- Engine: `@dnd-kit`.
- Implementation: `SortableContext` handles block reordering within the same parent.

## Atomic Verification Criteria

- [ ] Pressing Enter on a `todo` item creates a new `unchecked` todo item.
- [ ] Tab and Shift+Tab correctly shift blocks horizontally without breaking the tree.
- [ ] "Zoomed" view correctly displays only children of the target block.
- [ ] Styles (Bold/Italic) are preserved across block reordering.
