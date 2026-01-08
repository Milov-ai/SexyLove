import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRightIcon,
  PlusIcon,
  Globe,
  MapPin,
  SearchX,
} from "lucide-react";
import LugarCard from "./LugarCard";
import type { Lugar } from "../../../schemas/vault";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Input } from "@/components/ui/input";
import { useVaultStore } from "../../../store/vault.store";
import EmptyState from "@/components/ui/EmptyState";

interface LugaresCollapsibleProps {
  lugares: Lugar[];
  onAddLugar: () => void;
}

const LugaresCollapsible = ({
  lugares,
  onAddLugar,
}: LugaresCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const iconRef = useRef(null);
  const { setShouldFitBounds } = useVaultStore();

  useGSAP(() => {
    gsap.to(iconRef.current, { rotation: isOpen ? 90 : 0, duration: 0.3 });
  }, [isOpen]);

  const filteredLugares = lugares.filter((lugar) =>
    lugar.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-violet-500/30 p-4 rounded-3xl shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 hover:bg-white/90 dark:hover:bg-black/50 group mb-4">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-black/60 border border-violet-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-500">
              <ChevronRightIcon
                ref={iconRef}
                className="size-5 text-violet-600 dark:text-violet-400 group-hover:text-violet-800 dark:group-hover:text-white transition-colors"
              />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-lg group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
              Nuestros Lugares
            </h2>
          </div>
        </CollapsibleTrigger>
        <div className="flex gap-2">
          <Button
            size="icon"
            onClick={() => setShouldFitBounds(true)}
            className="rounded-full bg-white/5 hover:bg-neon-primary text-foreground hover:text-white transition-colors border border-white/5 hover:shadow-neon"
          >
            <Globe className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={onAddLugar}
            className="rounded-full bg-slate-200 hover:bg-white text-black dark:text-black font-bold shadow-[0_0_15px_-3px_rgba(255,255,255,0.5)]"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <div className="space-y-4">
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/20 border-white/10 text-foreground placeholder:text-muted-foreground/50 h-10 rounded-xl backdrop-blur-md"
          />
          <div className="flex flex-col gap-4">
            {filteredLugares.length > 0 ? (
              filteredLugares.map((lugar) => (
                <LugarCard key={lugar.id} lugar={lugar} />
              ))
            ) : (
              <div className="glass-dirty p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                {searchTerm ? (
                  <EmptyState
                    icon={SearchX}
                    title="Sin resultados"
                    description={`No encontramos lugares que coincidan con "${searchTerm}".`}
                  />
                ) : (
                  <EmptyState
                    icon={MapPin}
                    title="Mapa vacío"
                    description="Aún no has agregado ningún lugar especial."
                    actionLabel="Agregar Lugar"
                    onAction={onAddLugar}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LugaresCollapsible;
