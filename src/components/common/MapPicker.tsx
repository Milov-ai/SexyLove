// src/components/common/MapPicker.tsx
// Map location picker component for selecting coordinates

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface MapPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoords?: { lat: number; lon: number };
  onSelect: (coords: { lat: number; lon: number }) => void;
}

export function MapPicker({
  open,
  onOpenChange,
  initialCoords,
  onSelect,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(initialCoords || null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!open) return;

    const loadLeaflet = async () => {
      // Check if Leaflet is already loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && !(window as any).L) {
        // Load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    };

    loadLeaflet();
  }, [open]);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!mapLoaded || !open || !mapContainerRef.current || mapRef.current)
      return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    const defaultCenter: [number, number] = initialCoords
      ? [initialCoords.lat, initialCoords.lon]
      : [-34.6037, -58.3816]; // Buenos Aires default

    const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Add initial marker if coords exist
    if (initialCoords) {
      markerRef.current = L.marker([
        initialCoords.lat,
        initialCoords.lon,
      ]).addTo(map);
    }

    // Click handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lon: lng });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapLoaded, open, initialCoords]);

  const handleConfirm = () => {
    if (selectedCoords) {
      onSelect(selectedCoords);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col p-0 gap-0 bg-background border-border">
        <DialogTitle className="sr-only">Seleccionar Ubicación</DialogTitle>
        <DialogDescription className="sr-only">
          Toca el mapa para seleccionar una ubicación
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Seleccionar Ubicación
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCoords ? (
              <span className="font-mono">
                {selectedCoords.lat.toFixed(6)}, {selectedCoords.lon.toFixed(6)}
              </span>
            ) : (
              "Toca el mapa para seleccionar"
            )}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCoords}
            className="bg-primary text-primary-foreground"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Confirmar Ubicación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
