import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Plus,
  CheckSquare,
  List,
  Image as ImageIcon,
  Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypographySheet } from "./TypographySheet";
import { ColorPicker } from "@/components/ui/ColorPicker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { BlockStyle, BlockType } from "@/store/notes.store";

interface StyleToolbarProps {
  activeBlockId: string | null;
  activeBlockType: BlockType | null;
  currentStyle: BlockStyle;
  onStyleChange: (updates: Partial<BlockStyle>) => void;
  onAddBlock: (type: BlockType) => void;
  onAuraChange: (color: string) => void;
  currentAura: string;
}

export const StyleToolbar = ({
  activeBlockId,
  currentStyle,
  onStyleChange,
  onAddBlock,
  onAuraChange,
  currentAura,
}: StyleToolbarProps) => {
  const [isTypographyOpen, setIsTypographyOpen] = useState(false);
  const [isAuraOpen, setIsAuraOpen] = useState(false);

  const toggleStyle = (key: keyof BlockStyle) => {
    onStyleChange({ [key]: !currentStyle[key] });
  };

  // if (!activeBlockId) return null; // Allow rendering for Add Block button

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 p-2 px-4 pb-6 z-40 flex items-center justify-between gap-2 safe-area-bottom">
        {/* Left: Quick Format */}
        <div
          className={cn(
            "flex items-center gap-1",
            !activeBlockId && "opacity-50 pointer-events-none",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTypographyOpen(true)}
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Type size={20} />
          </Button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleStyle("isBold")}
            className={cn(
              "text-slate-400 hover:text-white hover:bg-white/10",
              currentStyle.isBold && "text-violet-400 bg-violet-500/10",
            )}
          >
            <Bold size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleStyle("isItalic")}
            className={cn(
              "text-slate-400 hover:text-white hover:bg-white/10",
              currentStyle.isItalic && "text-violet-400 bg-violet-500/10",
            )}
          >
            <Italic size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleStyle("isUnderline")}
            className={cn(
              "text-slate-400 hover:text-white hover:bg-white/10",
              currentStyle.isUnderline && "text-violet-400 bg-violet-500/10",
            )}
          >
            <Underline size={18} />
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAuraOpen(true)}
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Palette size={20} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="bg-white text-black hover:bg-slate-200 rounded-full h-10 w-10 shadow-lg shadow-violet-500/20"
              >
                <Plus size={24} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="bg-slate-900 border-slate-800 text-slate-200 w-56 mb-2"
            >
              <DropdownMenuItem
                onClick={() => onAddBlock("text")}
                className="gap-2"
              >
                <Type size={16} /> Texto
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddBlock("todo")}
                className="gap-2"
              >
                <CheckSquare size={16} /> Tarea
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddBlock("bullet")}
                className="gap-2"
              >
                <List size={16} /> Lista
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddBlock("table")}
                className="gap-2"
              >
                <TableIcon size={16} /> Tabla
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddBlock("image")}
                className="gap-2"
              >
                <ImageIcon size={16} /> Imagen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TypographySheet
        open={isTypographyOpen}
        onOpenChange={setIsTypographyOpen}
        currentStyle={currentStyle}
        onStyleChange={onStyleChange}
      />

      <Sheet open={isAuraOpen} onOpenChange={setIsAuraOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[32px] border-t border-white/10 bg-slate-950/95 backdrop-blur-xl p-6 pb-10"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-serif font-medium text-white flex items-center gap-2">
              <Palette size={24} className="text-pink-400" />
              Cambiar Aura
            </SheetTitle>
            <SheetDescription className="sr-only">
              Selecciona un color para el aura de la nota
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <ColorPicker
              selectedColor={currentAura}
              onSelect={(color) => {
                onAuraChange(color);
                setIsAuraOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
