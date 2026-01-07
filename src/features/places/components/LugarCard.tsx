import { useRef, useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/premium/GlassCard";

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
      <GlassCard
        variant="platinum"
        hoverEffect={true}
        className="cursor-pointer overflow-hidden relative group/card border-white/5 bg-white/5 backdrop-blur-md"
        onClick={handleCenterMap}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-12 z-20 hover:text-neon-primary transition-colors hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditModalOpen(true);
          }}
        >
          <Pencil className="w-5 h-5 text-white/50" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 hover:text-red-500 transition-colors hover:bg-white/10"
          onClick={toggleFavorite}
        >
          <Heart
            className={`w-6 h-6 transition-colors duration-300 ${lugar.favorite ? "text-red-500 fill-red-500" : "text-white/50"}`}
          />
        </Button>

        <div className="flex items-center px-4 py-4 gap-4">
          <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-2xl shadow-inner-lg border border-white/10">
            {imageUrls.length > 0 ? (
              <div
                ref={carouselRef}
                className="flex w-full h-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick(currentImageIndex);
                }}
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
              <div className="w-full h-full bg-black/20 flex items-center justify-center text-muted-foreground">
                <MapPin className="opacity-50" />
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-between min-h-[6rem]">
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug line-clamp-1">
                {lugar.nombre}
              </h3>
              <p className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
                {lugar.direccion}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-neon-primary hover:bg-neon-primary/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCenterMap();
                }}
              >
                <MapPin className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-neon-primary hover:bg-neon-primary/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChronicleOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
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
