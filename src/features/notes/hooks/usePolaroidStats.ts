import { useMemo } from "react";
import type { Block } from "@/store/notes.store";

export interface PolaroidStats {
  genres: string[];
  directors: string[];
  uniqueYears: string[];
  years: { min: number; max: number };
  totalMovies: number;
  seenCount: number;
}

export const usePolaroidStats = (blocks: Block[]): PolaroidStats => {
  return useMemo(() => {
    const movieBlocks = blocks.filter((b) => b.type === "cine_polaroid");
    const totalMovies = movieBlocks.length;

    const genresSet = new Set<string>();
    const directorsSet = new Set<string>();
    const yearsSet = new Set<string>();
    let minYear = Infinity;
    let maxYear = -Infinity;
    let seenCount = 0;

    movieBlocks.forEach((block) => {
      const props = block.props || {};
      console.log("Processing block:", block.id, "Genre:", props.genre);

      // Genre
      if (typeof props.genre === "string" && props.genre.trim()) {
        // Handle comma-separated genres if needed, for now exact match per spec "unique genres found"
        // Splitting by comma if multiple genres are stored as "Action, Sci-Fi"
        props.genre.split(",").forEach((g) => genresSet.add(g.trim()));
      }

      // Director
      if (typeof props.director === "string" && props.director.trim()) {
        directorsSet.add(props.director.trim());
      }

      // Year
      if (typeof props.year === "string" && props.year.trim()) {
        yearsSet.add(props.year.trim());
        const yearNum = parseInt(props.year.trim());
        if (!isNaN(yearNum)) {
          if (yearNum < minYear) minYear = yearNum;
          if (yearNum > maxYear) maxYear = yearNum;
        }
      }

      // Seen
      if (props.isSeen === true) {
        seenCount++;
      }
    });

    return {
      genres: Array.from(genresSet).sort(),
      directors: Array.from(directorsSet).sort(),
      uniqueYears: Array.from(yearsSet).sort().reverse(), // Newest first
      years: {
        min: minYear === Infinity ? 0 : minYear,
        max: maxYear === -Infinity ? 0 : maxYear,
      },
      totalMovies,
      seenCount,
    };
  }, [blocks]);
};
