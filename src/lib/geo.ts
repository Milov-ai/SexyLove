import { z } from "zod";
import type { Lugar } from "@/schemas/vault";

const CoordsSchema = z.object({
  lat: z.string(),
  lon: z.string(),
});

export const getCoordsFromName = async (address: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address,
      )}&format=json&limit=1`,
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = CoordsSchema.parse(data[0]);
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      if (isNaN(parsedLat) || isNaN(parsedLon)) return null;
      return { lat: parsedLat, lon: parsedLon };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

export const getBounds = (
  lugares: Lugar[],
): [[number, number], [number, number]] | null => {
  if (lugares.length === 0) {
    return null;
  }

  const bounds = lugares.reduce(
    (acc, lugar) => {
      if (
        lugar.coordinates &&
        !isNaN(lugar.coordinates.lon) &&
        !isNaN(lugar.coordinates.lat)
      ) {
        acc.minLon = Math.min(acc.minLon, lugar.coordinates.lon);
        acc.maxLon = Math.max(acc.maxLon, lugar.coordinates.lon);
        acc.minLat = Math.min(acc.minLat, lugar.coordinates.lat);
        acc.maxLat = Math.max(acc.maxLat, lugar.coordinates.lat);
      }
      return acc;
    },
    {
      minLon: Infinity,
      maxLon: -Infinity,
      minLat: Infinity,
      maxLat: -Infinity,
    },
  );

  if (bounds.minLon === Infinity) {
    return null;
  }

  return [
    [bounds.minLon, bounds.minLat],
    [bounds.maxLon, bounds.maxLat],
  ];
};
