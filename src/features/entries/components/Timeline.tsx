import type { Entrada } from "@/schemas/vault";
import TimelineItem from "./TimelineItem";

interface TimelineProps {
  entradas: Entrada[];
  lugarId: string;
}

const Timeline = ({ entradas, lugarId }: TimelineProps) => {
  const sortedEntradas = (entradas || []).sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* The timeline line will be drawn by connecting the dots in TimelineItem */}
      {sortedEntradas.map((entrada) => (
        <TimelineItem key={entrada.id} entrada={entrada} lugarId={lugarId} />
      ))}
    </div>
  );
};

export default Timeline;
