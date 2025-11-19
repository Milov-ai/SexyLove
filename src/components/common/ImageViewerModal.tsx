import { useState, useEffect, useRef } from "react";
import FullScreenModal from "@/components/ui/FullScreenModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

interface ImageViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrls: string[];
  initialIndex?: number;
}

const ImageViewerModal = ({
  open,
  onOpenChange,
  imageUrls,
  initialIndex = 0,
}: ImageViewerModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length,
    );
  };

  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" },
      );
    }
  }, [currentIndex]);

  return (
    <FullScreenModal
      open={open}
      onOpenChange={onOpenChange}
      title="Ver Imagen"
      description=""
      footer={<></>}
    >
      <div className="relative flex items-center justify-center h-full w-full">
        {imageUrls.length > 0 && (
          <img
            ref={imageRef}
            src={imageUrls[currentIndex]}
            alt="Full size view"
            className="max-w-full max-h-full object-contain"
          />
        )}
        {imageUrls.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}
        {imageUrls.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70"
            onClick={handleNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}
      </div>
    </FullScreenModal>
  );
};

export default ImageViewerModal;
