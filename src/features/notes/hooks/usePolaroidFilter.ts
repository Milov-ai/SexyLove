import { useMemo } from "react";
import type { Block } from "@/store/notes.store";
import type { CinePolaroidProps } from "../components/blocks/CinePolaroidBlock";

export interface FilterState {
  searchQuery: string;
  selectedGenre: string | null;
  selectedYear: string | null;
  selectedDirector: string | null;
  watchedStatus: "all" | "seen" | "unseen";
  minRating: number;
}

export const usePolaroidFilter = (
  blocks: Block[],
  filters: FilterState,
): Set<string> => {
  return useMemo(() => {
    const hiddenBlockIds = new Set<string>();

    blocks.forEach((block) => {
      // Only filter cine_polaroid blocks
      if (block.type !== "cine_polaroid") return;

      const props = (block.props || {}) as CinePolaroidProps;
      const {
        searchQuery,
        selectedGenre,
        selectedYear,
        selectedDirector,
        watchedStatus,
        minRating,
      } = filters;

      let isVisible = true;

      // 1. Search Query (Title)
      if (searchQuery.trim()) {
        const title = props.title?.toLowerCase() || "";
        if (!title.includes(searchQuery.toLowerCase())) {
          isVisible = false;
        }
      }

      // 2. Genre
      if (isVisible && selectedGenre && selectedGenre !== "all") {
        const genres = (props.genre || "").toLowerCase();
        if (!genres.includes(selectedGenre.toLowerCase())) {
          isVisible = false;
        }
      }

      // 3. Director
      if (isVisible && selectedDirector && selectedDirector !== "all") {
        const director = (props.director || "").toLowerCase();
        if (!director.includes(selectedDirector.toLowerCase())) {
          isVisible = false;
        }
      }

      // 4. Year
      if (isVisible && selectedYear && selectedYear !== "all") {
        if (props.year !== selectedYear) {
          isVisible = false;
        }
      }

      // 5. Watched Status
      if (isVisible && watchedStatus !== "all") {
        const isSeen = !!props.isSeen;
        if (watchedStatus === "seen" && !isSeen) isVisible = false;
        if (watchedStatus === "unseen" && isSeen) isVisible = false;
      }

      // 6. Rating (Official)
      if (isVisible && minRating > 0) {
        const rating = props.officialRating || 0;
        if (rating < minRating) {
          isVisible = false;
        }
      }

      if (!isVisible) {
        hiddenBlockIds.add(block.id);
      }
    });

    return hiddenBlockIds;
  }, [blocks, filters]);
};
