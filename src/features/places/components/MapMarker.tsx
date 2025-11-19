import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface MapMarkerProps {
  nombre: string;
  onClick: () => void;
}

const MapMarker = ({ nombre, onClick }: MapMarkerProps) => {
  const markerRef = useRef(null);

  useGSAP(
    () => {
      gsap.to(markerRef.current, {
        scale: 1.1,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: "power1.inOut",
      });
    },
    { scope: markerRef },
  );

  const onEnter = () => {
    gsap.to(markerRef.current, { scale: 1.3, duration: 0.2 });
  };

  const onLeave = () => {
    gsap.to(markerRef.current, { scale: 1.1, duration: 0.2 });
  };

  return (
    <div
      ref={markerRef}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="bg-background border-2 border-primary text-foreground text-xs font-bold p-2 rounded-lg shadow-lg cursor-pointer"
    >
      {nombre}
    </div>
  );
};

export default MapMarker;
