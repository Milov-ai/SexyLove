import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockStyle } from "@/store/notes.store";

interface TypographySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle: BlockStyle;
  onStyleChange: (updates: Partial<BlockStyle>) => void;
}

export const TypographySheet = ({
  open,
  onOpenChange,
  currentStyle,
  onStyleChange,
}: TypographySheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-slate-950/95 backdrop-blur-xl p-6 pb-10"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif font-medium text-white flex items-center gap-2">
            <Type size={24} className="text-violet-400" />
            Tipografía
          </SheetTitle>
          <SheetDescription className="sr-only">
            Ajustes de tipografía para el bloque seleccionado
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Font Family */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Fuente
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => onStyleChange({ fontFamily: "sans" })}
                className={cn(
                  "h-12 border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white transition-all",
                  currentStyle.fontFamily === "sans" &&
                    "border-violet-500 bg-violet-500/10 text-violet-400",
                )}
              >
                <span className="font-sans text-lg">Sans</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onStyleChange({ fontFamily: "serif" })}
                className={cn(
                  "h-12 border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white transition-all",
                  currentStyle.fontFamily === "serif" &&
                    "border-violet-500 bg-violet-500/10 text-violet-400",
                )}
              >
                <span className="font-serif text-lg">Serif</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onStyleChange({ fontFamily: "mono" })}
                className={cn(
                  "h-12 border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white transition-all",
                  currentStyle.fontFamily === "mono" &&
                    "border-violet-500 bg-violet-500/10 text-violet-400",
                )}
              >
                <span className="font-mono text-lg">Mono</span>
              </Button>
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Alineación
            </Label>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <Button
                variant="ghost"
                onClick={() => onStyleChange({ textAlign: "left" })}
                className={cn(
                  "flex-1 h-10 rounded-lg hover:bg-slate-800 hover:text-white transition-all",
                  (currentStyle.textAlign === "left" ||
                    !currentStyle.textAlign) &&
                    "bg-slate-800 text-white shadow-sm",
                )}
              >
                <AlignLeft size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => onStyleChange({ textAlign: "center" })}
                className={cn(
                  "flex-1 h-10 rounded-lg hover:bg-slate-800 hover:text-white transition-all",
                  currentStyle.textAlign === "center" &&
                    "bg-slate-800 text-white shadow-sm",
                )}
              >
                <AlignCenter size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => onStyleChange({ textAlign: "right" })}
                className={cn(
                  "flex-1 h-10 rounded-lg hover:bg-slate-800 hover:text-white transition-all",
                  currentStyle.textAlign === "right" &&
                    "bg-slate-800 text-white shadow-sm",
                )}
              >
                <AlignRight size={20} />
              </Button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Tamaño
            </Label>
            <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-xl border border-slate-800">
              {(["sm", "base", "lg", "xl", "2xl"] as const).map((size) => (
                <Button
                  key={size}
                  variant="ghost"
                  onClick={() => onStyleChange({ fontSize: size })}
                  className={cn(
                    "w-10 h-10 rounded-lg hover:bg-slate-800 hover:text-white transition-all",
                    (currentStyle.fontSize === size ||
                      (!currentStyle.fontSize && size === "base")) &&
                      "bg-slate-800 text-white shadow-sm border border-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "leading-none",
                      size === "sm" && "text-xs",
                      size === "base" && "text-sm",
                      size === "lg" && "text-base",
                      size === "xl" && "text-lg",
                      size === "2xl" && "text-xl font-bold",
                    )}
                  >
                    Aa
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
