import { useState, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import type { Entrada } from "@/schemas/vault";
import { Button } from "@/components/ui/button";
import { useVaultStore } from "../../../store/vault.store";
import { Pencil, Trash2, Users, Tag } from "lucide-react";
import { getImage } from "../../../services/image.service";
import { Badge } from "@/components/ui/badge";

interface EntradaCardProps {
  entrada: Entrada;
  lugarId: string;
  onEdit: () => void;
}

import StarRating from "@/components/ui/StarRating";

const EntradaCard = ({ entrada, lugarId, onEdit }: EntradaCardProps) => {
  const { deleteEntrada } = useVaultStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (entrada.fotos && entrada.fotos.length > 0) {
        const url = await getImage(entrada.fotos[0]);
        setImageUrl(url || null);
      }
    };
    fetchImage();
  }, [entrada.fotos]);

  return (
    <Card className="cursor-pointer overflow-hidden relative w-full">
      <div className="flex items-start py-4 px-0">
        <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-md mr-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={entrada.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg mb-1">{entrada.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-2">
            {new Date(entrada.fecha).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
          <div className="mb-2">
            <StarRating rating={entrada.rating} />
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {(entrada.participants || []).map((p) => (
              <Badge key={p} variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {p}
              </Badge>
            ))}
            {(entrada.tags || []).map((t) => (
              <Badge key={t} variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {t}
              </Badge>
            ))}
          </div>
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              deleteEntrada(lugarId, entrada.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EntradaCard;
