import { useState } from "react";
import Timeline from "../../entries/components/Timeline";
import EntradaCreateModal from "../../entries/components/EntradaCreateModal";
import type { Lugar } from "../../../schemas/vault";
import FullScreenModal from "../../../components/ui/FullScreenModal";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/EmptyState";
import { BookOpen } from "lucide-react";

interface ChronicleViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lugar: Lugar;
}

const ChronicleView = ({ open, onOpenChange, lugar }: ChronicleViewProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <FullScreenModal
      open={open}
      onOpenChange={onOpenChange}
      title={lugar.nombre}
      description={`Bienvenido a la crónica de ${lugar.nombre}.`}
      footer={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Crear Entrada
        </Button>
      }
    >
      {lugar.entradas && lugar.entradas.length > 0 ? (
        <Timeline entradas={lugar.entradas} lugarId={lugar.id} />
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Crónica vacía"
          description="Aún no hay historias escritas en este lugar. ¡Sé el primero en inmortalizar un recuerdo!"
          actionLabel="Crear Entrada"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}
      <EntradaCreateModal
        lugarId={lugar.id}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </FullScreenModal>
  );
};

export default ChronicleView;
