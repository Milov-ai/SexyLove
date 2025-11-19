import { useState, useEffect, useRef } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Lugar } from "../../../schemas/vault";
import ChronicleView from "./ChronicleView";
import { Button } from "@/components/ui/button";
import { useVaultStore } from "../../../store/vault.store";
import LugarEditModal from "./LugarEditModal";
import { Heart, MapPin, Plus, Pencil } from "lucide-react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { getImage } from "../../../services/image.service";
import ImageViewerModal from "../../../components/common/ImageViewerModal";

gsap.registerPlugin(ScrollToPlugin);

interface LugarCardProps {
  lugar: Lugar;
}

const LugarCard = ({ lugar }: LugarCardProps) => {
  const [isChronicleOpen, setIsChronicleOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const { updateLugar, setLugarToCenter } = useVaultStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const urls: string[] = [];
      for (const id of lugar.fotos || []) {
        const url = await getImage(id);
        if (url) urls.push(url);
      }
      setImageUrls(urls);
    };
    fetchImages();
  }, [lugar.fotos]);

  useEffect(() => {
    if (imageUrls.length > 1 && carouselRef.current) {
      gsap.to(carouselRef.current, {
        x: -currentImageIndex * 100 + "%",
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [currentImageIndex, imageUrls]);

  useEffect(() => {
    if (imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(interval);
    }
  }, [imageUrls]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLugar({ ...lugar, favorite: !lugar.favorite });
  };

  const handleCenterMap = () => {
    setLugarToCenter(lugar);
    gsap.to(window, { duration: 1, scrollTo: "#mapa" });
  };

  const handleImageClick = (index: number) => {
    setViewerInitialIndex(index);
    setIsImageViewerOpen(true);
  };

  return (
    <>
      <Card className="cursor-pointer overflow-hidden relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-12 z-10 hover:text-blue-500"
          onClick={() => setIsEditModalOpen(true)}
        >
          <Pencil className="w-8 h-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 hover:text-red-500"
          onClick={toggleFavorite}
        >
          <Heart
            className={`w-10 h-10 ${lugar.favorite ? "text-red-500" : "text-primary"}`}
            fill={lugar.favorite ? "currentColor" : "none"}
          />
        </Button>
        <div className="flex items-center px-4">
          <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-md">
            {imageUrls.length > 0 ? (
              <div
                ref={carouselRef}
                className="flex w-full h-full"
                onClick={() => handleImageClick(currentImageIndex)}
              >
                {imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={lugar.nombre}
                    className="w-full h-full object-cover flex-shrink-0"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div className="flex-grow flex flex-col justify-between p-4 mt-2">
            <CardTitle className="text-xl">{lugar.nombre}</CardTitle>
            <CardDescription className="-mt-1">
              {lugar.direccion}
            </CardDescription>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-blue-500"
                onClick={handleCenterMap}
              >
                <MapPin className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-green-500"
                onClick={() => setIsChronicleOpen(true)}
              >
                <Plus className="w-8 h-8" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <ChronicleView
        open={isChronicleOpen}
        onOpenChange={setIsChronicleOpen}
        lugar={lugar}
      />
      <LugarEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        lugar={lugar}
      />
      <ImageViewerModal
        open={isImageViewerOpen}
        onOpenChange={setIsImageViewerOpen}
        imageUrls={imageUrls}
        initialIndex={viewerInitialIndex}
      />
    </>
  );
};

export default LugarCard;
