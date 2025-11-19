import { useState, useRef } from "react";
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <ChevronRightIcon ref={iconRef} className="size-4" />
            <h2 className="text-2xl font-bold">Nuestros Lugares</h2>
          </div>
        </CollapsibleTrigger>
        <div className="flex gap-2">
          <Button size="icon" onClick={() => setShouldFitBounds(true)}>
            <Globe />
          </Button>
          <Button size="icon" onClick={onAddLugar}>
            <PlusIcon />
          </Button>
        </div>
      </div>
      <CollapsibleContent className="mt-4">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="flex flex-col gap-4">
          {filteredLugares.length > 0 ? (
            filteredLugares.map((lugar) => (
              <LugarCard key={lugar.id} lugar={lugar} />
            ))
          ) : searchTerm ? (
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LugaresCollapsible;
