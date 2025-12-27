// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);
import NoteEditor from "./NoteEditor";
import { useNotesStore } from "@/store/notes.store";
import type { Block, BlockType } from "@/store/notes.store";

// Mock dependencies
vi.mock("../hooks/usePolaroidFilter", () => ({
  usePolaroidFilter: () => new Set(), // No filtered blocks
}));

// Mock Dependencies
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
}));
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  arrayMove: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
}));
vi.mock("./BlockRenderer", () => ({
  BlockRenderer: ({ block, onChange }: { block: Block; onChange: (id: string, updates: Partial<Block>) => void }) => (
    <div data-testid={`block-${block.id}`}>
      <input
        data-testid={`input-${block.id}`}
        value={block.content}
        onChange={(e) => onChange(block.id, { content: e.target.value })}
      />
    </div>
  ),
}));
vi.mock("./PolaroidFilterBar", () => ({
  PolaroidFilterBar: () => null,
}));
vi.mock("./StyleToolbar", () => ({
  StyleToolbar: () => null,
}));
vi.mock("@/components/ui/button", () => ({
  Button: () => null,
}));

// Mock Store
const mockUpdateNote = vi.fn();
const mockDeleteNote = vi.fn();

vi.mock("@/store/notes.store", () => ({
  useNotesStore: vi.fn(),
}));

describe("NoteEditor State Logic", () => {
  const noteId = "test-note";
  const initialBlocks = [{ id: "block-1", type: "text", content: "Initial" }];

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNotesStore as any).mockReturnValue({
      notes: [
        {
          id: noteId,
          title: "Test Note",
          content: JSON.stringify(initialBlocks),
          updated_at: new Date().toISOString(),
        },
      ],
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
    });
  });

  it("hydrates from store on mount", async () => {
    render(<NoteEditor noteId={noteId} onClose={vi.fn()} />);
    const input = await screen.findByTestId("input-block-1");
    expect(input).toHaveValue("Initial");
  });

  it("does NOT overwrite local changes when store updates with stale data", async () => {
    const { rerender } = render(<NoteEditor noteId={noteId} onClose={vi.fn()} />);
    
    // Wait for hydration
    const input = await screen.findByTestId("input-block-1");
    
    // 1. User types "Initial + Edit"
    await act(async () => {
        // Direct event simulation
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(input, "Initial + Edit");
        const ev = new Event("input", { bubbles: true });
        input.dispatchEvent(ev);
    });
    
    // 2. Simulate Store Update
    (useNotesStore as any).mockReturnValue({
      notes: [
        {
          id: noteId,
          title: "Test Note",
          content: JSON.stringify(initialBlocks), // Stale content "Initial"
          updated_at: new Date().toISOString(), // New timestamp
        },
      ],
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
    });

    rerender(<NoteEditor noteId={noteId} onClose={vi.fn()} />);

    // 3. Expectation: The input should STILL be "Initial + Edit"
    // We expect it NOT to change back to "Initial"
    // We can just check value again.
    // Use waitFor to ensure no pending effects revert it?
    // If we wait 100ms and it's still good, we are good.
    await new Promise(r => setTimeout(r, 100));
    expect(input).toHaveValue("Initial + Edit");
  });
});
