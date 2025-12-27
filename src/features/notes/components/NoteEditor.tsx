import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { debounce } from "@/lib/utils";
import {
  useNotesStore,
  type Block,
  type BlockType,
  type BlockStyle,
} from "@/store/notes.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Trash2, Home, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { BlockRenderer } from "./BlockRenderer";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { PolaroidFilterBar } from "./PolaroidFilterBar";
import {
  usePolaroidFilter,
  type FilterState,
} from "../hooks/usePolaroidFilter";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import {
  indentBlock,
  outdentBlock,
  deleteBlockFromTree,
  updateBlockInTree,
  findBlockPath,
  addSibling,
  getBlockChain,
  moveBlockInTree,
} from "@/features/notes/logic/tree-utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
  const [zoomedBlockId, setZoomedBlockId] = useState<string | null>(null);

  // Refs for stable access in handlers
  // Refs for stable access in handlers (Silent State)
  // This decoupling prevents "render-loop" lags caused by passing large objects to useEffect
  const blocksRef = useRef(blocks);
  const titleRef = useRef(title);
  const isDirty = useRef(false); // Track if user has typed locally

  useEffect(() => {
    blocksRef.current = blocks;
    // If blocks changed and it wasn't a hydration (checked below), we mark dirty
    if (blocks.length > 0) isDirty.current = true; 
  }, [blocks]);

  useEffect(() => {
    titleRef.current = title;
    if (title) isDirty.current = true;
  }, [title]);

  // Polaroid Filters State
  const [polaroidFilters, setPolaroidFilters] = useState<FilterState>({
    searchQuery: "",
    selectedGenre: null,
    selectedYear: null,
    selectedDirector: null,
    watchedStatus: "all",
    minRating: 0,
  });

  // Derived State for Zoom
  const breadcrumbs = zoomedBlockId ? getBlockChain(blocks, zoomedBlockId) : [];
  const zoomedBlock =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs[breadcrumbs.length - 1]
      : null;
  const displayedBlocks = zoomedBlock ? zoomedBlock.children || [] : blocks;

  // Filter Logic
  const hiddenBlockIds = usePolaroidFilter(displayedBlocks, polaroidFilters);
  const visibleBlocks = displayedBlocks.filter(
    (b) => !hiddenBlockIds.has(b.id),
  );

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag starts (allows taps)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

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

  // useDebounce Removed to prevent double-render and heavy dependency tracking
  // const debouncedBlocks = useDebounce(blocks, 1000);
  // const debouncedTitle = useDebounce(title, 1000);

  // Initialize State from Note (One-way hydration on mount/ID change)
  useEffect(() => {
    if (note) {
      // 1. Handle Titlte
      // Only update title if it's legally different and we haven't edited it?
      // For simplicity, we just set it initially. We don't support real-time external title updates while open.
      if (!title) setTitle(note.title);

      // 2. Handle Content
      // We only hydrate if blocks are empty (initial load) or note changed EXTERNALLY (hard to know).
      // To fix the glitch, we assume the user's local version is always the authority while open.
      // We ONLY re-hydrate if the noteID changes.
      
      const isNewNote = blocks.length === 0;
      
      // ONLY hydrate if we haven't dirtied the state locally (User typing > Server data)
      // Or if it's a fresh mount/new noteId.
      if (isNewNote && !isDirty.current) {
         try {
          const parsedBlocks = note.content ? JSON.parse(note.content) : [];
          if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
            setBlocks(migrateBlocks(parsedBlocks));
          } else {
             // Default empty block
             setBlocks([{ id: uuidv4(), type: "text", content: "" }]);
          }
        } catch {
          setBlocks([{ id: uuidv4(), type: "text", content: note.content || "" }]);
        }
      }
      
      setLastSaved(new Date(note.updated_at));
      
      // Reset dirty flag on ID change
      isDirty.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]); // STRICTLY depends only on ID to prevent re-hydration loops

  // Silent Debounced Auto-Save
  // This uses a ref-based debounce so it doesn't trigger re-renders or depend on state directly
  const triggerSave = useMemo(
    () =>
      debounce(async (currentNoteId: string, currentBlocks: Block[], currentTitle: string) => {
         if (!currentNoteId) return;
         
         const contentString = JSON.stringify(currentBlocks);
         
         // We can't easily check against "server" state here without prop drilling 'note' 
         // but checking cheap strings is fine.
         // We'll trust the debounce to throttle enough.
         
         try {
            await updateNote(currentNoteId, { title: currentTitle, content: contentString });
            setLastSaved(new Date());
         } catch (e) {
            console.error("Auto-save failed", e);
            toast.error("Error al guardar cambios");
         }
      }, 1000),
    [updateNote]
  ) as ((...args: unknown[]) => void) & { cancel: () => void };
  
  // Effect to trigger logic - decoupled from render cost
  useEffect(() => {
    // We pass the VALUES to the trigger, but the trigger is debounced internally
    // and won't execute immediately.
    // However, to be purely "ref based" for the EXECUTION phase:
    triggerSave(noteId, blocks, title);
    
    return () => {
      triggerSave.cancel();
    }
  }, [blocks, title, noteId, triggerSave]);

  const handleBlockChange = useCallback(
    (id: string, updates: Partial<Block>) => {
      setBlocks((prev) => updateBlockInTree(prev, id, updates));
    },
    [],
  );

  const handleBlockDelete = useCallback((id: string) => {
    setBlocks((prev) => deleteBlockFromTree(prev, id));
  }, []);

  const handleRequestDelete = useCallback((id: string) => {
    setBlockToDelete(id);
  }, []);

  const handleIndent = useCallback((id: string) => {
    setBlocks((prev) => {
      const res = indentBlock(prev, id);
      if (!res.success) {
        toast.info("💡 Crea un bloque antes (Enter) para poder anidar este.");
      }
      return res.success ? res.tree : prev;
    });
  }, []);

  const handleOutdent = useCallback((id: string) => {
    setBlocks((prev) => {
      const res = outdentBlock(prev, id);
      return res.success ? res.tree : prev;
    });
  }, []);

  const handleBlockFocus = useCallback((id: string) => {
    setFocusedBlockId(id);
  }, []);

  const handleStyleChange = useCallback((updates: Partial<BlockStyle>) => {
    if (!focusedBlockId) return;
    setBlocks((prev) =>
      updateBlockInTree(prev, focusedBlockId, { style: updates }),
    );
  }, [focusedBlockId]);

  const addBlock = useCallback(
    (
      type: BlockType,
      content: string = "",
      props?: Record<string, unknown>,
    ) => {
      // Legacy addBlock strictly for root/toolbar usage when NOT focused
      // If we have a zoomed view, we should add to that view?
      // Toolbar uses this.
      // If zoomed, add to zoomedBlock.children.
      // Logic:
      const newBlock: Block = {
        id: uuidv4(),
        type,
        content,
        isCompleted: false,
        props,
      };

      setBlocks((prev) => {
        if (zoomedBlockId) {
          const newTree = JSON.parse(JSON.stringify(prev));
          const found = findBlockPath(newTree, zoomedBlockId);
          if (found) {
            const items = found.node.children || [];
            items.push(newBlock);
            found.node.children = items; // ensure init
            return newTree;
          }
          return prev;
        }
        return [...prev, newBlock];
      });
      setFocusedBlockId(newBlock.id);
    },
    [zoomedBlockId],
  );

  // Global Key Handler for Creation and Navigation (when not editing text)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If event already handled (by textarea), ignore
      if (e.defaultPrevented) return;

      // Ignore if typing in an input (unless it's readOnly, meaning potentially just selected)
      const active = document.activeElement;
      const isInput =
        active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
      if (isInput && !(active as HTMLInputElement)?.readOnly) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        if (focusedBlockId) {
          // Case 1: Active Selection - Create Sibling
          const newId = uuidv4();
          setBlocks((prev) => {
            const found = findBlockPath(prev, focusedBlockId);
            if (!found) return prev;

            const { node } = found;
            // Smart Type Resolution
            let newType: BlockType = "text";

            if (node.type === "todo") newType = "todo";
            else if (node.type === "bullet") newType = "bullet";
            else if (node.type === "heading") newType = "text";
            else newType = node.type;

            const newBlock: Block = {
              id: newId,
              type: newType,
              content: "",
              isCompleted: false,
              children: [],
            };

            const res = addSibling(prev, focusedBlockId, newBlock);
            return res.success ? res.tree : prev;
          });
          setTimeout(() => setFocusedBlockId(newId), 0);
        } else {
          // Case 2: No Selection - Create at Bottom (Zoomed or Root)
          addBlock("text");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [focusedBlockId, zoomedBlockId, addBlock]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blockId: string) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          handleOutdent(blockId);
        } else {
          handleIndent(blockId);
        }
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const newId = uuidv4();

        setBlocks((prev) => {
          const found = findBlockPath(prev, blockId);
          if (!found) return prev;

          const { node } = found;
          // Smart Type Resolution
          let newType: BlockType = "text";

          if (node.type === "todo") newType = "todo";
          else if (node.type === "bullet") newType = "bullet";
          // Headings should implicitly revert to text for the next block (standard document flow)
          else if (node.type === "heading") newType = "text";
          else newType = node.type; // Default to same type for others if not specified

          // If it was text, it stays text.

          const newBlock: Block = {
            id: newId,
            type: newType,
            content: "",
            isCompleted: false,
            children: [],
          };

          const res = addSibling(prev, blockId, newBlock);
          return res.success ? res.tree : prev;
        });

        // setTimeout 0 ensures the new block is rendered before we try to focus it
        setTimeout(() => setFocusedBlockId(newId), 0);
      }
    },
    [handleIndent, handleOutdent],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (zoomedBlockId) {
        setBlocks((prev) => {
          const newTree = JSON.parse(JSON.stringify(prev));
          const found = findBlockPath(newTree, zoomedBlockId);
          if (!found) return prev;

          // If dragging within the Zoomed Block's children list
          const items = found.node.children || [];
          const oldIndex = items.findIndex(
            (item: Block) => item.id === active.id,
          );
          const newIndex = items.findIndex(
            (item: Block) => item.id === over.id,
          );

          if (oldIndex !== -1 && newIndex !== -1) {
            // Simple reorder within zoomed list
            found.node.children = arrayMove(items, oldIndex, newIndex);
          } else {
            // Cross-level or complex drag within zoomed context?
            // If we support deep dragging inside zoomed view, we need generic move
            // But displayedBlocks only shows direct children usually?
            // Wait, BlockRenderer is recursive. So we CAN see deep children.
            // So specific moveBlockInTree logic is better if IDs match deeper items.
            // However, 'moveBlockInTree' works on the WHOLE tree.
            // We need to apply it relative to the Zoomed Node if we want to scope it?
            // Actually, moveBlockInTree searches the whole provided tree.
            // If we pass the whole tree, it works.
          }
          return newTree;
        });
      } else {
        setBlocks((items) => {
          // Try generic move first
          // If active and over are both in 'items' (root), arrayMove is faster/safer for animations
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          if (oldIndex !== -1 && newIndex !== -1) {
            return arrayMove(items, oldIndex, newIndex);
          }

          // If not found in root, or mixed, usage tree move
          return moveBlockInTree(items, active.id as string, over.id as string);
        });
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      // Error handling matches previous version
      console.error(error);
      toast.error("Error al subir imagen", { id: toastId });
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    await deleteNote(noteId);
    onClose();
  };

  const handleConfirmBlockDelete = () => {
    if (blockToDelete) {
      handleBlockDelete(blockToDelete);
      setBlockToDelete(null);
    }
  };

  // Zoom Handlers
  const handleZoomIn = () => {
    if (focusedBlockId) {
      setZoomedBlockId(focusedBlockId);
    }
  };

  const handleZoomOut = () => {
    if (zoomedBlockId) {
      if (breadcrumbs && breadcrumbs.length > 0) {
        // breadcrumbs is [Root, ... Parent, Zoomed ]
        // We want Parent.
        // If length is 1 (Zoomed is Child of Root), we go to Null (Root View).
        if (breadcrumbs.length > 1) {
          const parent = breadcrumbs[breadcrumbs.length - 2];
          setZoomedBlockId(parent.id);
        } else {
          setZoomedBlockId(null);
        }
      } else {
        setZoomedBlockId(null);
      }
    }
  };

  if (!note) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950"
    >
      <div
        className={`absolute inset-0 pointer-events-none ${
          THEMES[note.color as ThemeId]?.bg || THEMES.default.bg
        } ${
          THEMES[note.color as ThemeId]?.gradient || THEMES.default.gradient
        }`}
      />

      <div className="relative flex flex-col flex-1 h-full">
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title="¿Eliminar nota?"
          description="Esta acción no se puede deshacer."
        />

        <DeleteConfirmationDialog
          open={!!blockToDelete}
          onOpenChange={(open) => !open && setBlockToDelete(null)}
          onConfirm={handleConfirmBlockDelete}
          title="¿Eliminar bloque?"
          description="Esta acción eliminará este contenido."
        />

        <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10 transition-all">
          <motion.div whileTap={{ scale: 0.8 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
            >
              <ArrowLeft size={24} />
            </Button>
          </motion.div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={12} />
            <span>
              {lastSaved
                ? `Guardado ${format(lastSaved, "HH:mm")}`
                : "Sin guardar"}
            </span>
          </div>

          <motion.div whileTap={{ scale: 0.8 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
            >
              <Trash2 size={24} />
            </Button>
          </motion.div>
        </header>

        {/* Zoom Breadcrumbs */}
        {zoomedBlockId && (
          <div className="px-6 pt-4 pb-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap mask-linear-fade">
            <button
              onClick={() => setZoomedBlockId(null)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors"
            >
              <Home size={14} />
              <span className="font-medium">Inicio</span>
            </button>

            {breadcrumbs?.map((crumb, idx) => {
              // Don't show the last one (current title) in crumbs list usually?
              // Or show entire chain.
              // Let's show all for navigation.
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={crumb.id} className="flex items-center gap-2">
                  <ChevronRight size={12} className="text-slate-700" />
                  <button
                    onClick={() => !isLast && setZoomedBlockId(crumb.id)}
                    disabled={isLast}
                    className={`text-xs max-w-[100px] truncate ${isLast ? "text-white font-bold cursor-default" : "text-slate-500 hover:text-white transition-colors"}`}
                  >
                    {crumb.content || "Sin título"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Polaroid Filters - Fixed at Top */}
        <PolaroidFilterBar
          blocks={displayedBlocks}
          filters={polaroidFilters}
          onFilterChange={(updates) =>
            setPolaroidFilters((prev) => ({ ...prev, ...updates }))
          }
          className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl z-40"
        />

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 pb-32 space-y-2">
            {/* Note Title (Only showing at Root View) */}
            {!zoomedBlockId && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nota"
                className="w-full bg-transparent text-4xl font-bold text-slate-100 placeholder:text-slate-600 border-none focus:ring-0 p-0 mb-8"
              />
            )}

            {/* Zoom Title (Current Focus) */}
            {zoomedBlock && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-white break-words">
                  {zoomedBlock.content || (
                    <span className="text-slate-600 italic">
                      Bloque sin contenido
                    </span>
                  )}
                </div>
              </motion.div>
            )}



            {/* Blocks */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {visibleBlocks.length > 0 ? (
                    visibleBlocks.map((block) => (
                      <BlockRenderer
                        key={block.id}
                        block={block}
                        onChange={handleBlockChange}
                        onDelete={handleRequestDelete}
                        onKeyDown={handleKeyDown}
                        onFocus={handleBlockFocus}
                        activeBlockId={focusedBlockId}
                        autoFocus={focusedBlockId === block.id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-600 text-sm italic">
                      Vacío. Pulsa Enter o usa el botón + para añadir contenido
                      aquí.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>

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
          onAddBlock={(type, props) => {
            if (type === "image") {
              document.getElementById("image-upload-trigger")?.click();
            } else {
              addBlock(type, "", props);
            }
          }}
          onAuraChange={(color) => {
            if (!note) return;
            updateNote(noteId, { color });
            toast.success("Aura actualizada ✨");
          }}
          currentAura={note.color}
          onIndent={() => focusedBlockId && handleIndent(focusedBlockId)}
          onOutdent={() => focusedBlockId && handleOutdent(focusedBlockId)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
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
