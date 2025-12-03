import { useState, useEffect } from "react";
import { useNotesStore, type Block, type BlockType } from "@/store/notes.store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  Trash2,
  Plus,
  Type,
  CheckSquare,
  Image as ImageIcon,
  Heading,
  List,
  Table as TableIcon,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { BlockRenderer } from "./BlockRenderer";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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

  // Initialize state from note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      try {
        const parsedBlocks = note.content ? JSON.parse(note.content) : [];
        if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
          setBlocks(parsedBlocks);
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

  // Block Handlers
  const handleBlockChange = (id: string, updates: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
  };

  const handleBlockDelete = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const addBlock = (
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
  };

  // Handle Enter key to create new blocks
  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return;

      const currentBlock = blocks[index];

      // If Todo or Bullet, create another one of same type
      if (currentBlock.type === "todo" || currentBlock.type === "bullet") {
        addBlock(currentBlock.type, "", undefined, index + 1);
      } else {
        // Default to text block for others
        addBlock("text", "", undefined, index + 1);
      }
    }
  };

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
    } catch (error: unknown) {
      console.error("Error uploading:", error);
      const err = error as { message?: string; statusCode?: string };
      if (
        err.message &&
        (err.message.includes("Bucket not found") || err.statusCode === "404")
      ) {
        alert(
          'Error: El bucket "notes-media" no existe. Por favor créalo en tu panel de Supabase (Storage -> New Bucket -> "notes-media" -> Public).',
        );
      } else {
        alert("Error al subir imagen: " + (err.message || "Desconocido"));
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
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
    >
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="¿Eliminar nota?"
        description="Esta acción no se puede deshacer. La nota se eliminará permanentemente."
      />

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
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
                    onKeyDown={(e) => handleKeyDown(e, block.id)}
                    autoFocus={focusedBlockId === block.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Block Button */}
          <div className="pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 gap-2"
                >
                  <Plus size={18} />
                  Agregar bloque
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-slate-900 border-slate-800 text-slate-200 w-56"
              >
                <DropdownMenuItem
                  onClick={() => addBlock("text")}
                  className="gap-2 cursor-pointer hover:bg-slate-800"
                >
                  <Type size={16} /> Texto
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 cursor-pointer hover:bg-slate-800">
                    <Heading size={16} /> Título
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <DropdownMenuItem
                      onClick={() => addBlock("heading", "", { level: 1 })}
                      className="gap-2 cursor-pointer hover:bg-slate-800"
                    >
                      <Heading size={16} /> Título 1
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => addBlock("heading", "", { level: 2 })}
                      className="gap-2 cursor-pointer hover:bg-slate-800"
                    >
                      <Heading size={14} /> Título 2
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => addBlock("heading", "", { level: 3 })}
                      className="gap-2 cursor-pointer hover:bg-slate-800"
                    >
                      <Heading size={12} /> Título 3
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem
                  onClick={() => addBlock("todo")}
                  className="gap-2 cursor-pointer hover:bg-slate-800"
                >
                  <CheckSquare size={16} /> Lista de tareas
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => addBlock("bullet")}
                  className="gap-2 cursor-pointer hover:bg-slate-800"
                >
                  <List size={16} /> Lista con viñetas
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => addBlock("table")}
                  className="gap-2 cursor-pointer hover:bg-slate-800"
                >
                  <TableIcon size={16} /> Tabla
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="gap-2 cursor-pointer hover:bg-slate-800"
                >
                  <label className="flex items-center gap-2 w-full cursor-pointer">
                    <ImageIcon size={16} /> Imagen
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteEditor;
