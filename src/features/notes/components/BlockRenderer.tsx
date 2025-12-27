import type { Block } from "@/store/notes.store";
import { LinkBlockSecure as LinkBlock } from "./blocks/LinkBlock";
import { PolaroidBlock } from "./blocks/PolaroidBlock";
import { CinePolaroidBlock } from "./blocks/CinePolaroidBlock";
import { Button } from "@/components/ui/button";
import {
  Check,
  GripVertical,
  Trash2,
  X,
  Bell,
  Bold,
  Italic,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState, memo } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableBlock } from "./TableBlock";
import { motion, AnimatePresence } from "framer-motion";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { LinkMetadata } from "../logic/link-resolver";

interface BlockProps {
  block: Block;
  onChange: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onFocus: (id: string) => void;
  autoFocus?: boolean;
  depth?: number;
  activeBlockId?: string | null;
}

// Premium color palette for nesting depth (brand-aligned violet/pink)
const DEPTH_COLORS = [
  "from-violet-600/20 to-violet-500/10 border-violet-500/30",
  "from-fuchsia-600/20 to-fuchsia-500/10 border-fuchsia-500/30",
  "from-pink-600/20 to-pink-500/10 border-pink-500/30",
  "from-rose-600/15 to-rose-500/10 border-rose-500/25",
  "from-purple-600/15 to-purple-500/10 border-purple-500/25",
  "from-indigo-600/15 to-indigo-500/10 border-indigo-500/25",
];

const BlockRendererInner = ({
  block,
  onChange,
  onDelete,
  onKeyDown,
  onFocus,
  autoFocus,
  depth = 0,
  activeBlockId,
}: BlockProps) => {
  // Derived Selection State
  const isSelected = activeBlockId === block.id;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle Edit Mode: If selected, another tap enables editing.
  // If not selected, tap selects it (Silhouette).
  // Initialize to true if it's born for focus to avoid "jump" on mount
  const [isEditing, setIsEditing] = useState(autoFocus);

  // Timestamp to prevent ghost clicks from immediately entering edit mode
  const selectionTimeRef = useRef<number>(isSelected ? Date.now() : 0);

  // Reset editing state if focus changes
  useEffect(() => {
    if (!isSelected) {
      setIsEditing(false);
      selectionTimeRef.current = 0;
    } else {
      // Just became selected - record timestamp
      if (selectionTimeRef.current === 0) {
        selectionTimeRef.current = Date.now();
        // Auto-edit ONLY for newly created empty blocks or if explicitly requested via prop
        if (!block.content || autoFocus) {
          setIsEditing(true);
        }
      }
    }
  }, [isSelected, block.content, autoFocus]);

  // DnD Hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    willChange: "transform",
  };

  const hasChildren = block.children && block.children.length > 0;
  const indentClass = depth > 0 ? "ml-4 pl-3 border-l-2 border-white/5" : "";

  const isSticky = hasChildren && !isCollapsed;

  const stickyTop = Math.min(depth, 7) * 36;
  const stickyZ = Math.max(30 - depth, 10);

  const stickyStyle = isSticky
    ? {
        position: "sticky" as const,
        top: `${stickyTop}px`,
        zIndex: stickyZ,
      }
    : {};

  const depthColor = DEPTH_COLORS[depth % DEPTH_COLORS.length];

  useEffect(() => {
    // Auto-focus logic: Only if active and editing mode is explicitly requested
    if (autoFocus && isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      try {
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      } catch {
        // Ignore selection range errors on some inputs
      }
    }
  }, [autoFocus, isEditing]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  const handleContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    onChange(block.id, { content: e.target.value });
  };

  const handleToggleTodo = () => {
    onChange(block.id, { isCompleted: !block.isCompleted });
  };

  const handleReminderSelect = (date: Date | undefined) => {
    if (date) {
      onChange(block.id, { reminder: date.toISOString() });
    } else {
      onChange(block.id, { reminder: null });
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    handleContentChange(e);
  };

  const handleSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setSelectionRange({ start, end });
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    }
  };

  const applyFormat = (formatType: "bold" | "italic") => {
    if (!selectionRange || !textareaRef.current) return;

    const text = block.content;
    const { start, end } = selectionRange;
    const selectedText = text.substring(start, end);
    let newText = text;

    if (formatType === "bold") {
      newText =
        text.substring(0, start) + `**${selectedText}**` + text.substring(end);
    } else if (formatType === "italic") {
      newText =
        text.substring(0, start) + `_${selectedText}_` + text.substring(end);
    }

    onChange(block.id, { content: newText });
    setShowToolbar(false);
  };

  const getBlockStyles = () => {
    const s = block.style || {};
    return cn(
      s.fontFamily === "serif" && "font-serif",
      s.fontFamily === "mono" && "font-mono",
      s.fontFamily === "sans" && "font-sans",
      s.textAlign === "center" && "text-center",
      s.textAlign === "right" && "text-right",
      s.textAlign === "justify" && "text-justify",
      s.fontSize === "sm" && "text-sm",
      s.fontSize === "lg" && "text-lg",
      s.fontSize === "xl" && "text-xl",
      s.fontSize === "2xl" && "text-2xl",
      s.isBold && "font-bold",
      s.isItalic && "italic",
      s.isUnderline && "underline",
    );
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent) => {
    onKeyDown?.(e, block.id);
  };

  // Handle Tap/Focus - Implements UC-1 (Tap to Select) and UC-2 (Tap to Edit)
  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSelected) {
      // UC-1: Inactive → Selected
      onFocus?.(block.id);
      setIsEditing(false);
      selectionTimeRef.current = Date.now();
    } else {
      // Already selected - check ghost click protection (C-1)
      const timeSinceSelection = Date.now() - selectionTimeRef.current;
      if (timeSinceSelection > 400) {
        // UC-2: Selected → Editing (deliberate second tap)
        setIsEditing(true);
      }
      // Ignore if < 400ms (ghost click from same tap event)
    }
  };

  const handleFocusInternal = () => {
    // If focused via keyboard navigation (Tab), select it
    if (!isSelected) onFocus?.(block.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleBlockClick}
      className={cn(
        "group relative flex flex-col transition-all rounded-xl p-0.5 border-2",
        isDragging && "z-50 drag-shadow",
        // C-2 & C-3: Selection visual ALWAYS visible when selected
        isSelected
          ? "border-violet-500/50 bg-white/5 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          : "border-transparent",
        // Additional ring when actively editing
        isSelected && isEditing && "ring-2 ring-violet-400/50",
      )}
    >
      {/* Premium Sticky Header with Glassmorphism */}
      <div
        className={cn(
          "flex items-start gap-2 py-1.5 px-2 rounded-lg transition-all duration-300",
          isSticky &&
            `bg-gradient-to-r ${depthColor} backdrop-blur-xl border shadow-lg shadow-black/20`,
        )}
        style={stickyStyle}
      >
        {/* Handle/Collapse - Hidden on Mobile, visible on focus */}
        <div className="mt-1 flex flex-col items-center gap-0.5 shrink-0">
          {hasChildren && (
            <button
              onKeyDown={() => {}}
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className={cn(
                "p-1 rounded-md cursor-pointer transition-all duration-200",
                isCollapsed
                  ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
                  : "text-slate-500 hover:bg-white/10 hover:text-white",
              )}
            >
              {isCollapsed ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          )}

          {/* Drag handle - Enlarge hit area for mobile */}
          <div
            {...attributes}
            {...listeners}
            // Important: onPointerDown prevents click propagation so dragging starts clean
            className={cn(
              "w-8 h-8 -ml-2 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 rounded-full opacity-60 hover:opacity-100 transition-opacity touch-none z-20",
            )}
          >
            <GripVertical size={16} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 relative">
          {/* Rich Text Toolbar */}
          {showToolbar &&
            (block.type === "text" || block.type === "bullet") && (
              <div className="absolute -top-10 left-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl flex items-center p-1 gap-1 z-50">
                <button
                  onClick={() => applyFormat("bold")}
                  className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => applyFormat("italic")}
                  className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                >
                  <Italic size={14} />
                </button>
              </div>
            )}

          {/* Text Block */}
          {block.type === "text" && (
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleInput}
              onKeyDown={handleKeyDownInternal}
              onSelect={handleSelect}
              onFocus={handleFocusInternal}
              placeholder={isEditing ? "Escribe algo..." : "Toca para editar"}
              readOnly={!isEditing}
              className={cn(
                "w-full bg-transparent border-none resize-none focus:ring-0 p-1 text-slate-200 leading-relaxed whitespace-pre-wrap break-words transition-opacity",
                !isEditing && "pointer-events-none cursor-default",
                getBlockStyles(),
              )}
              rows={1}
              style={{ height: "auto", minHeight: "28px" }}
            />
          )}

          {/* ... (Apply similar logic to other blocks: Heading, Bullet, Todo ...) */}
          {/* Heading Block */}
          {block.type === "heading" && (
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => {
                handleInput(e);
                handleContentChange(e);
              }}
              onKeyDown={handleKeyDownInternal}
              onFocus={handleFocusInternal}
              placeholder="Título"
              readOnly={!isEditing}
              className={cn(
                "w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-100 resize-none overflow-hidden leading-tight",
                !isEditing && "pointer-events-none",
                block.props?.level === 1
                  ? "text-3xl"
                  : block.props?.level === 2
                    ? "text-2xl"
                    : "text-xl",
                getBlockStyles(),
              )}
              rows={1}
              style={{ height: "auto", minHeight: "40px" }}
            />
          )}

          {/* Todo Block */}
          {block.type === "todo" && (
            <div className="flex items-start gap-3">
              <button
                onClick={handleToggleTodo}
                className={cn(
                  "mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0",
                  block.isCompleted
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 border-transparent text-white shadow-lg shadow-violet-500/30"
                    : "border-slate-600 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20",
                )}
              >
                {block.isCompleted && <Check size={12} strokeWidth={3} />}
              </button>
              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleInput}
                onKeyDown={handleKeyDownInternal}
                onSelect={handleSelect}
                onFocus={handleFocusInternal}
                placeholder="Tarea..."
                className={cn(
                  "w-full bg-transparent border-none resize-none focus:ring-0 p-0 leading-relaxed whitespace-pre-wrap break-words mt-0.5",
                  block.isCompleted
                    ? "text-slate-500 line-through"
                    : "text-slate-200",
                  getBlockStyles(),
                )}
                rows={1}
                style={{ height: "auto", minHeight: "24px" }}
              />
            </div>
          )}

          {/* Bullet Block */}
          {block.type === "bullet" && (
            <div className="flex items-start gap-3">
              <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 shrink-0 shadow-lg shadow-violet-500/30" />
              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleInput}
                onKeyDown={handleKeyDownInternal}
                onSelect={handleSelect}
                onFocus={handleFocusInternal}
                placeholder="Elemento de lista..."
                className={cn(
                  "w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-slate-200 leading-relaxed whitespace-pre-wrap break-words",
                  getBlockStyles(),
                )}
                rows={1}
                style={{ height: "auto", minHeight: "24px" }}
              />
            </div>
          )}

          {/* Table Block */}
          {block.type === "table" && (
            <TableBlock
              content={block.content}
              onChange={(newContent) =>
                onChange(block.id, { content: newContent })
              }
            />
          )}

          {/* Link Block */}
          {block.type === "link" && (
            <LinkBlock meta={block.props?.meta as LinkMetadata} />
          )}

          {/* Polaroid Block */}
          {block.type === "polaroid" && (
            <PolaroidBlock block={block} onChange={onChange} />
          )}

          {/* Cine Polaroid Block */}
          {block.type === "cine_polaroid" && (
            <CinePolaroidBlock block={block} onChange={onChange} />
          )}

          {/* Image Block */}
          {block.type === "image" && (
            <div className="relative rounded-xl overflow-hidden bg-slate-900/50 border border-slate-800/50 group/image">
              {block.content ? (
                <img
                  src={
                    (block.content as unknown as Record<string, unknown>)?.url
                      ? ((block.content as unknown as Record<string, unknown>)
                          .url as string)
                      : (block.content as string)
                  }
                  alt="Block content"
                  className="w-full h-auto max-h-[500px] object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center text-slate-500 bg-slate-900/50">
                  <ImageIcon size={24} className="opacity-50" />
                </div>
              )}
            </div>
          )}

          {/* Reminder Chip */}
          {block.reminder && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 text-xs font-medium border border-violet-500/30 shadow-lg shadow-violet-500/10">
                <Bell size={10} />
                {format(new Date(block.reminder), "MMM d, HH:mm")}
                <button
                  onClick={() => handleReminderSelect(undefined)}
                  className="hover:text-white ml-1 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Actions - Always Visible on Mobile */}
        <div className="flex items-center gap-0.5 pl-1 shrink-0 opacity-60 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Popover>
            <PopoverTrigger asChild>
              <motion.div whileTap={{ scale: 0.8 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"
                >
                  <Bell size={14} />
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-slate-950 border-slate-800"
              align="end"
            >
              <Calendar
                mode="single"
                selected={block.reminder ? new Date(block.reminder) : undefined}
                onSelect={handleReminderSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <motion.div whileTap={{ scale: 0.8 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(block.id)}
              className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Recursive Children - With unique key suffix for safety */}
      <AnimatePresence>
        {hasChildren && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={indentClass}
          >
            <SortableContext
              items={block.children!.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {block.children!.map((child) => (
                <BlockRenderer
                  key={child.id}
                  block={child}
                  onChange={onChange}
                  onDelete={onDelete}
                  onKeyDown={onKeyDown}
                  onFocus={onFocus}
                  depth={depth + 1}
                  activeBlockId={activeBlockId}
                  autoFocus={activeBlockId === child.id}
                />
              ))}
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BlockRenderer = memo(BlockRendererInner);
