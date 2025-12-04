import { useState, useEffect, useCallback, useRef } from "react";
import { useNotesStore, type Block, type BlockType } from "@/store/notes.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { BlockRenderer } from "./BlockRenderer";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { THEMES, type ThemeId } from "@/lib/theme-constants";
import { StyleToolbar } from "./StyleToolbar";
import type { BlockStyle } from "@/store/notes.store";

interface NoteEditorProps {
  noteId: string;
  onClose: () => void;
}

const NoteEditor = ({ noteId, onClose }: NoteEditorProps) => {
  const { notes, updateNote, deleteNote } = useNotesStore();
  const note = notes.find((n) => n.id === noteId);

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  // Refs for stable access in handlers
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require movement before drag starts (prevents accidental clicks)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      // Mobile: Long press to drag
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      // Desktop: Instant drag
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = () => {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Migration utility
  const migrateBlocks = (blocks: Block[]): Block[] => {
    return blocks.map((block) => {
      if (block.type === "heading") {
        const level = (block.props?.level as number) || 1;
        const fontSize = level === 1 ? "2xl" : level === 2 ? "xl" : "lg";

        return {
          ...block,
          type: "text",
          style: {
            ...block.style,
            fontSize,
            isBold: true,
          },
        };
      }
      return block;
    });
  };

  // Initialize state from note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      try {
        const parsedBlocks = note.content ? JSON.parse(note.content) : [];
        if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
          setBlocks(migrateBlocks(parsedBlocks));
        } else {
          // Default to one empty text block if new or empty
          setBlocks([{ id: uuidv4(), type: "text", content: "" }]);
        }
      } catch {
        // Fallback for legacy text content
        setBlocks([
          { id: uuidv4(), type: "text", content: note.content || "" },
        ]);
      }
      setLastSaved(new Date(note.updated_at));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // Debounced save
  useEffect(() => {
    if (!note) return;

    const timer = setTimeout(() => {
      const contentString = JSON.stringify(blocks);
      if (title !== note.title || contentString !== note.content) {
        updateNote(noteId, { title, content: contentString });
        setLastSaved(new Date());
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, blocks, noteId, updateNote, note]);

  // Stable Handlers
  const handleBlockChange = useCallback(
    (id: string, updates: Partial<Block>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      );
    },
    [],
  );

  const handleBlockDelete = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleBlockFocus = useCallback((id: string) => {
    setFocusedBlockId(id);
  }, []);

  const handleStyleChange = (updates: Partial<BlockStyle>) => {
    if (!focusedBlockId) return;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === focusedBlockId) {
          const currentStyle = b.style || {};
          return { ...b, style: { ...currentStyle, ...updates } };
        }
        return b;
      }),
    );
  };

  const handleAuraChange = (color: string) => {
    if (!note) return;
    updateNote(noteId, { color });
    toast.success("Aura actualizada ✨");
  };

  const addBlock = useCallback(
    (
      type: BlockType,
      content: string = "",
      props?: Record<string, unknown>,
      index?: number, // Optional index to insert at
    ) => {
      const newBlock: Block = {
        id: uuidv4(),
        type,
        content,
        isCompleted: false,
        props,
      };

      setBlocks((prev) => {
        if (index !== undefined) {
          const newBlocks = [...prev];
          newBlocks.splice(index, 0, newBlock);
          return newBlocks;
        }
        return [...prev, newBlock];
      });
      setFocusedBlockId(newBlock.id);
    },
    [],
  );

  // Handle Enter key to create new blocks
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blockId: string) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const currentBlocks = blocksRef.current;
        const index = currentBlocks.findIndex((b) => b.id === blockId);
        if (index === -1) return;

        const currentBlock = currentBlocks[index];

        // If Todo or Bullet, create another one of same type
        if (currentBlock.type === "todo" || currentBlock.type === "bullet") {
          addBlock(currentBlock.type, "", undefined, index + 1);
        } else {
          // Default to text block for others
          addBlock("text", "", undefined, index + 1);
        }
      }
    },
    [addBlock],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting the same file again
    e.target.value = "";

    const toastId = toast.loading("Subiendo imagen...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${noteId}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("notes-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("notes-media").getPublicUrl(fileName);

      addBlock("image", publicUrl);
      toast.success("Imagen añadida", { id: toastId });
    } catch (error: unknown) {
      console.error("Error uploading:", error);
      const err = error as { message?: string; statusCode?: string };
      if (
        err.message &&
        (err.message.includes("Bucket not found") || err.statusCode === "404")
      ) {
        toast.error(
          'Error: El bucket "notes-media" no existe. Por favor créalo en tu panel de Supabase.',
          { id: toastId },
        );
      } else {
        toast.error(
          "Error al subir imagen: " + (err.message || "Desconocido"),
          { id: toastId },
        );
      }
    }
  };

  // Delete Dialog State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handle delete note
  const handleDelete = async () => {
    await deleteNote(noteId);
    onClose();
  };

  if (!note) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950"
    >
      {/* Aura Background Layer */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          THEMES[note.color as ThemeId]?.bg || THEMES.default.bg
        } ${
          THEMES[note.color as ThemeId]?.gradient || THEMES.default.gradient
        }`}
      />

      {/* Content Container - Relative to sit on top of background */}
      <div className="relative flex flex-col flex-1 h-full">
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title="¿Eliminar nota?"
          description="Esta acción no se puede deshacer. La nota se eliminará permanentemente."
        />

        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
          >
            <ArrowLeft size={24} />
          </Button>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={12} />
            <span>
              {lastSaved
                ? `Guardado ${format(lastSaved, "HH:mm")}`
                : "Sin guardar"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
          >
            <Trash2 size={24} />
          </Button>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 pb-32 space-y-2">
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la nota"
              className="w-full bg-transparent text-4xl font-bold text-slate-100 placeholder:text-slate-600 border-none focus:ring-0 p-0 mb-8"
            />

            {/* Blocks */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {blocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      onChange={handleBlockChange}
                      onDelete={handleBlockDelete}
                      onKeyDown={handleKeyDown}
                      onFocus={handleBlockFocus}
                      autoFocus={focusedBlockId === block.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Block Button removed in favor of Toolbar */}
            <div className="pt-4 pb-20"></div>
          </div>
        </div>

        <StyleToolbar
          activeBlockId={focusedBlockId}
          activeBlockType={
            blocks.find((b) => b.id === focusedBlockId)?.type || null
          }
          currentStyle={
            blocks.find((b) => b.id === focusedBlockId)?.style || {}
          }
          onStyleChange={handleStyleChange}
          onAddBlock={(type) => {
            if (type === "image") {
              document.getElementById("image-upload-trigger")?.click();
            } else {
              addBlock(type);
            }
          }}
          onAuraChange={handleAuraChange}
          currentAura={note.color}
        />
        <input
          type="file"
          id="image-upload-trigger"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </motion.div>
  );
};

export default NoteEditor;
