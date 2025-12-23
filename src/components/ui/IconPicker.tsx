import { useState, useMemo } from "react";
import { icons } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string) => void;
}

export const IconPicker = ({
  open,
  onOpenChange,
  onSelect,
}: IconPickerProps) => {
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const term = search.toLowerCase().trim();
    const allIcons = Object.keys(icons);

    if (!term) return allIcons.slice(0, 100); // Limit initial view

    return allIcons
      .filter((iconName) => iconName.toLowerCase().includes(term))
      .slice(0, 100); // Limit search results
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-[500px] bg-background/95 backdrop-blur-xl border-white/10 text-foreground p-0 gap-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-serif">
            Seleccionar Icono
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-0 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar icono... (ej. home, work, star)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-white/5 rounded-xl"
            />
          </div>

          <ScrollArea className="h-[40vh] md:h-[300px] pr-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pb-4">
              {filteredIcons.map((iconName) => {
                const IconComponent = icons[
                  iconName as keyof typeof icons
                ] as unknown as React.ElementType;
                return (
                  <Button
                    key={iconName}
                    variant="ghost"
                    className="flex flex-col items-center justify-center p-2 h-20 gap-2 hover:bg-primary/10 hover:text-primary transition-colors rounded-xl"
                    onClick={() => {
                      onSelect(iconName);
                      onOpenChange(false);
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {iconName}
                    </span>
                  </Button>
                );
              })}
              {filteredIcons.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  No se encontraron iconos
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
