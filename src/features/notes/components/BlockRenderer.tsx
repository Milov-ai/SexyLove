import type { Block } from "@/store/notes.store";
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

interface BlockProps {
  block: Block;
  onChange: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, id: string) => void;
  onFocus?: (id: string) => void;
  autoFocus?: boolean;
}

export const BlockRenderer = memo(
  ({
    block,
    onChange,
    onDelete,
    onKeyDown,
    onFocus,
    autoFocus,
  }: BlockProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const [selectionRange, setSelectionRange] = useState<{
      start: number;
      end: number;
    } | null>(null);

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
      willChange: "transform", // GPU Acceleration
    };

    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, [autoFocus]);

    // Auto-resize on mount and content change
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

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
      handleContentChange(e);
    };

    // Rich Text Selection Handler
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

    const applyFormat = (format: "bold" | "italic") => {
      if (!selectionRange || !textareaRef.current) return;

      const text = block.content;
      const { start, end } = selectionRange;
      const selectedText = text.substring(start, end);
      let newText = text;

      if (format === "bold") {
        newText =
          text.substring(0, start) +
          `**${selectedText}**` +
          text.substring(end);
      } else if (format === "italic") {
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

    // Internal handlers to bridge the gap
    const handleKeyDownInternal = (e: React.KeyboardEvent) => {
      onKeyDown?.(e, block.id);
    };

    const handleFocusInternal = () => {
      onFocus?.(block.id);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group flex items-start gap-2 py-1 relative"
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1.5 text-slate-700 cursor-grab active:cursor-grabbing touch-none p-2 -ml-2 hover:text-slate-400 transition-colors"
        >
          <GripVertical size={18} />
        </div>

        <div className="flex-1 min-w-0 relative">
          {/* Rich Text Toolbar */}
          {showToolbar &&
            (block.type === "text" || block.type === "bullet") && (
              <div className="absolute -top-10 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl flex items-center p-1 gap-1 z-50">
                <button
                  onClick={() => applyFormat("bold")}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() => applyFormat("italic")}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                >
                  <Italic size={14} />
                </button>
              </div>
            )}

          {block.type === "text" && (
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleInput}
              onKeyDown={handleKeyDownInternal}
              onSelect={handleSelect}
              onFocus={handleFocusInternal}
              placeholder="Escribe algo..."
              className={cn(
                "w-full bg-transparent border-none resize-none focus:ring-0 p-1 text-slate-300 leading-relaxed whitespace-pre-wrap break-words",
                getBlockStyles(),
              )}
              rows={1}
              style={{ height: "auto", minHeight: "32px" }}
            />
          )}

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
              className={cn(
                "w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-100 resize-none overflow-hidden leading-tight",
                block.props?.level === 1
                  ? "text-3xl"
                  : block.props?.level === 2
                    ? "text-2xl"
                    : "text-xl",
                getBlockStyles(),
              )}
              rows={1}
              style={{ height: "auto", minHeight: "40px" }}
              autoFocus={autoFocus}
            />
          )}

          {block.type === "todo" && (
            <div className="flex items-start gap-3">
              <button
                onClick={handleToggleTodo}
                className={cn(
                  "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                  block.isCompleted
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-slate-600 hover:border-violet-500",
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
                    : "text-slate-300",
                  getBlockStyles(),
                )}
                rows={1}
                style={{ height: "auto", minHeight: "24px" }}
              />
            </div>
          )}

          {block.type === "bullet" && (
            <div className="flex items-start gap-3">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleInput}
                onKeyDown={handleKeyDownInternal}
                onSelect={handleSelect}
                onFocus={handleFocusInternal}
                placeholder="Elemento de lista..."
                className={cn(
                  "w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-slate-300 leading-relaxed whitespace-pre-wrap break-words",
                  getBlockStyles(),
                )}
                rows={1}
                style={{ height: "auto", minHeight: "24px" }}
              />
            </div>
          )}

          {block.type === "table" && (
            <TableBlock
              content={block.content}
              onChange={(newContent) =>
                onChange(block.id, { content: newContent })
              }
            />
          )}

          {block.type === "image" && (
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group/image">
              {block.content ? (
                <img
                  src={block.content}
                  alt="Block content"
                  className="w-full h-auto max-h-[500px] object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center text-slate-500 bg-slate-900/50">
                  <ImageIcon size={24} className="opacity-50" />
                </div>
              )}
              <button
                onClick={() => onDelete(block.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Metadata / Reminder Chip */}
          {block.reminder && (
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium border border-violet-500/20">
                <Bell size={10} />
                {format(new Date(block.reminder), "MMM d, HH:mm")}
                <button
                  onClick={() => handleReminderSelect(undefined)}
                  className="hover:text-white ml-1"
                >
                  <X size={10} />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pl-2 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"
              >
                <Bell size={16} />
              </Button>
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(block.id)}
            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    );
  },
);
