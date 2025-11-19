import type { Block } from "@/store/notes.store";
import { Button } from "@/components/ui/button";

import { Check, GripVertical, Trash2, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface BlockProps {
  block: Block;
  onChange: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
  autoFocus?: boolean;
}

export const BlockRenderer = ({
  block,
  onChange,
  onDelete,
  autoFocus,
}: BlockProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [autoFocus]);

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

  return (
    <div className="group flex items-start gap-2 py-1 relative">
      {/* Drag Handle (Visual only for now) */}
      <div className="mt-1.5 text-slate-700 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity">
        <GripVertical size={16} />
      </div>

      <div className="flex-1 min-w-0">
        {block.type === "text" && (
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleInput}
            placeholder="Escribe algo..."
            className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-slate-300 leading-relaxed overflow-hidden"
            rows={1}
          />
        )}

        {block.type === "heading" && (
          <input
            value={block.content}
            onChange={handleContentChange}
            placeholder="Título"
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-2xl font-bold text-slate-100"
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
              placeholder="Tarea..."
              className={cn(
                "w-full bg-transparent border-none resize-none focus:ring-0 p-0 leading-relaxed overflow-hidden mt-0.5",
                block.isCompleted
                  ? "text-slate-500 line-through"
                  : "text-slate-300",
              )}
              rows={1}
            />
          </div>
        )}

        {block.type === "image" && (
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group/image">
            <img
              src={block.content}
              alt="Block content"
              className="w-full h-auto max-h-[500px] object-contain"
            />
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
};
