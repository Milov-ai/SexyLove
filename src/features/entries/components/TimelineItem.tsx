import { useState } from "react";
import type { Entrada } from "@/schemas/vault";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EntryDetailView from "./EntryDetailView";
import EntradaEditModal from "./EntradaEditModal";
import EntradaCard from "./EntradaCard";

interface TimelineItemProps {
  entrada: Entrada;
  lugarId: string;
}

const TimelineItem = ({ entrada, lugarId }: TimelineItemProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="relative w-full max-w-3xl flex justify-center items-start my-4">
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-border" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

      <Dialog>
        <DialogTrigger asChild>
          <div className="w-full">
            <EntradaCard
              entrada={entrada}
              lugarId={lugarId}
              onEdit={() => setIsEditModalOpen(true)}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">Detalles de la entrada</DialogTitle>
          <DialogDescription className="sr-only">
            Vista detallada de la entrada
          </DialogDescription>
          <EntryDetailView entrada={entrada} />
        </DialogContent>
      </Dialog>

      <EntradaEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        lugarId={lugarId}
        entrada={entrada}
      />
    </div>
  );
};

export default TimelineItem;
