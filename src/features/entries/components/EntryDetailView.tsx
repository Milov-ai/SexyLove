import { useState, useEffect } from "react";
import type { Entrada } from "@/schemas/vault";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getImage } from "../../../services/image.service";
import StarRating from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/badge";
import { Users, Tag } from "lucide-react";

interface EntryDetailViewProps {
  entrada: Entrada;
}

const EntryDetailView = ({ entrada }: EntryDetailViewProps) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      if (entrada.fotos) {
        const urls = await Promise.all(entrada.fotos.map((id) => getImage(id)));
        setImageUrls(urls.filter(Boolean) as string[]);
      }
    };
    fetchImages();
  }, [entrada.fotos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-6 max-h-[80vh] overflow-y-auto">
      <div className="w-full">
        {imageUrls.length > 0 ? (
          <div className="embla rounded-lg overflow-hidden" ref={emblaRef}>
            <div className="embla__container">
              {imageUrls.map((url, index) => (
                <div className="embla__slide" key={index}>
                  <img
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
            <p>No hay imágenes</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{entrada.title}</h1>
        <p className="text-muted-foreground">
          {new Date(entrada.fecha).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <StarRating rating={entrada.rating} />

        {(entrada.participants || []).length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Participantes</h3>
            <div className="flex flex-wrap gap-2">
              {(entrada.participants || []).map((p) => (
                <Badge key={p} variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(entrada.tags || []).length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {(entrada.tags || []).map((t) => (
                <Badge key={t} variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold">Descripción</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {entrada.description || "No hay descripción."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailView;
