import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Type,
  Palette,
  Plus,
  CheckSquare,
  List,
  Image as ImageIcon,
  Table as TableIcon,
  Link2,
  IndentIncrease,
  IndentDecrease,
  Maximize2,
  Minimize2,
  Camera,
} from "lucide-react";
import { AddLinkDialog } from "./AddLinkDialog";
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
  onAddBlock: (type: BlockType, props?: Record<string, unknown>) => void;
  onAuraChange: (color: string) => void;
  currentAura: string;
  onIndent: () => void;
  onOutdent: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const StyleToolbar = ({
  activeBlockId,
  currentStyle,
  onStyleChange,
  onAddBlock,
  onAuraChange,
  currentAura,
  onIndent,
  onOutdent,
  onZoomIn,
  onZoomOut,
}: StyleToolbarProps) => {
  const [isTypographyOpen, setIsTypographyOpen] = useState(false);
  const [isAuraOpen, setIsAuraOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 p-2 px-3 pb-6 z-40 flex items-center justify-between gap-1 safe-area-bottom">
        {/* Left: Essential Actions - Compact for Mobile */}
        <div
          className={cn(
            "flex items-center gap-0.5",
            !activeBlockId && "opacity-50 pointer-events-none",
          )}
        >
          {/* Typography (Opens Full Sheet) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTypographyOpen(true)}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-9 w-9"
          >
            <Type size={18} />
          </Button>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Indent Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOutdent}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-9 w-9"
          >
            <IndentDecrease size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onIndent}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-9 w-9"
          >
            <IndentIncrease size={16} />
          </Button>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Zoom Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-9 w-9"
          >
            <Minimize2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-9 w-9"
          >
            <Maximize2 size={16} />
          </Button>
        </div>

        {/* Right: Primary Actions - Always Visible */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAuraOpen(true)}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-9 w-9"
          >
            <Palette size={18} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="bg-white text-black hover:bg-slate-200 rounded-full h-10 w-10 shadow-lg shadow-violet-500/20 flex-shrink-0"
              >
                <Plus size={22} />
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
                onClick={() => setIsLinkDialogOpen(true)}
                className="gap-2"
              >
                <Link2 size={16} /> Link Smart
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddBlock("image")}
                className="gap-2"
              >
                <ImageIcon size={16} /> Imagen
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddBlock("polaroid")}
                className="gap-2"
              >
                <Camera size={16} /> Polaroid
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

      <AddLinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onSubmit={(meta) => onAddBlock("link", { meta })}
      />
    </>
  );
};
