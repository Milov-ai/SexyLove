import { useState } from "react";
import type { Block } from "@/store/notes.store";
import type { FilterState } from "../hooks/usePolaroidFilter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Filter,
  Search,
  Star,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolaroidStats } from "../hooks/usePolaroidStats";

interface PolaroidFilterBarProps {
  blocks: Block[];
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  className?: string;
}

export const PolaroidFilterBar = ({
  blocks,
  filters,
  onFilterChange,
  className,
}: PolaroidFilterBarProps) => {
  const stats = usePolaroidStats(blocks);
  const [isOpen, setIsOpen] = useState(false);

  if (stats.totalMovies === 0) return null;

  return (
    <div className={cn("sticky top-0 z-40 w-full px-4 py-2", className)}>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full relative"
      >
        <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                isOpen
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-white/5 text-slate-400",
              )}
            >
              <Filter size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white/90 leading-none">
                Polaroid Filters
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                {stats.seenCount}/{stats.totalMovies} Vistas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-white/5 border-white/10 text-xs hidden md:flex"
            >
              {stats.genres.length} Géneros
            </Badge>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-white/10 active:scale-95 transition-all"
              >
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform duration-300 text-slate-400",
                    isOpen ? "rotate-180 text-white" : "",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="mt-2 p-4 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl space-y-4 animate-in slide-in-from-top-2 fade-in duration-300 shadow-2xl">
            {/* Search & Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <Input
                  placeholder="Buscar película..."
                  value={filters.searchQuery || ""}
                  onChange={(e) =>
                    onFilterChange({ searchQuery: e.target.value })
                  }
                  className="pl-9 bg-white/5 border-white/10 text-white h-10 rounded-xl focus-visible:ring-indigo-500/50"
                />
              </div>

              {/* Genre Select (Using DropdownMenu) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white/5 border-white/10 text-white h-10 rounded-xl hover:bg-white/10 hover:text-white"
                  >
                    {filters.selectedGenre || "Todos los géneros"}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] bg-slate-900 border-white/10 text-white max-h-60 overflow-y-auto">
                  <DropdownMenuItem
                    onClick={() => onFilterChange({ selectedGenre: null })}
                  >
                    <span
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center",
                      )}
                    >
                      {!filters.selectedGenre && <Check className="h-4 w-4" />}
                    </span>
                    Todos los géneros
                  </DropdownMenuItem>
                  {stats.genres.map((g) => (
                    <DropdownMenuItem
                      key={g}
                      onClick={() => onFilterChange({ selectedGenre: g })}
                    >
                      <span
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center",
                        )}
                      >
                        {filters.selectedGenre === g && (
                          <Check className="h-4 w-4" />
                        )}
                      </span>
                      {g}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-px bg-white/5" />

            {/* Advanced Filters */}
            <div className="grid grid-cols-2 gap-4">
              {/* Watched Toggle (3-way) */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Estado
                </span>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                  <button
                    onClick={() => onFilterChange({ watchedStatus: "all" })}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                      filters.watchedStatus === "all"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => onFilterChange({ watchedStatus: "seen" })}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex justify-center items-center gap-1",
                      filters.watchedStatus === "seen"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    <Eye size={12} />
                    Vistos
                  </button>
                  <button
                    onClick={() => onFilterChange({ watchedStatus: "unseen" })}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex justify-center items-center gap-1",
                      filters.watchedStatus === "unseen"
                        ? "bg-rose-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    <EyeOff size={12} />
                    Part Pend.
                  </button>
                </div>
              </div>

              {/* Rating Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Calificación Min.
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                    <Star size={10} fill="currentColor" />
                    {filters.minRating > 0 ? filters.minRating : "Cualquiera"}
                  </span>
                </div>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={(vals) =>
                    onFilterChange({ minRating: vals[0] })
                  }
                  max={10}
                  step={1}
                  className="py-2"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
