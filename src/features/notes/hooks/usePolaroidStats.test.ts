// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePolaroidStats } from "./usePolaroidStats";
import { Block } from "@/store/notes.store";

describe("usePolaroidStats", () => {
  const mockBlocks: Block[] = [
    {
      id: "1",
      type: "cine_polaroid",
      content: "",
      props: {
        genre: "Horror",
        year: "1980",
        director: "Stanley Kubrick",
        officialRating: 8.4,
        isSeen: true,
      },
    },
    {
      id: "2",
      type: "cine_polaroid",
      content: "",
      props: {
        genre: "Sci-Fi",
        year: "2010",
        director: "Christopher Nolan",
        officialRating: 8.8,
        isSeen: false,
      },
    },
    {
      id: "3",
      type: "text", // Should be ignored
      content: "Just a text block",
    },
    {
      id: "4",
      type: "cine_polaroid",
      content: "",
      props: {
        genre: "Horror", // Duplicate genre
        year: "2010", // Duplicate year
        director: "Ari Aster",
        officialRating: 7.1,
        isSeen: false,
      },
    },
  ];

  it("extracts unique genres", () => {
    const { result } = renderHook(() => usePolaroidStats(mockBlocks));
    expect(result.current.genres).toEqual(
      expect.arrayContaining(["Horror", "Sci-Fi"]),
    );
    expect(result.current.genres).toHaveLength(2);
  });

  it("calculates min and max years", () => {
    const { result } = renderHook(() => usePolaroidStats(mockBlocks));
    expect(result.current.years).toEqual({ min: 1980, max: 2010 });
    // Should return entire range or list? Spec says min/max or list. Logic usually needs min/max for sliders or list for dropdowns. Let's assume list for now as per spec "unique list"
    expect(result.current.uniqueYears).toEqual(
      expect.arrayContaining(["1980", "2010"]),
    );
  });

  it("extracts unique directors", () => {
    const { result } = renderHook(() => usePolaroidStats(mockBlocks));
    expect(result.current.directors).toEqual(
      expect.arrayContaining([
        "Stanley Kubrick",
        "Christopher Nolan",
        "Ari Aster",
      ]),
    );
  });

  it("counts total and seen movies", () => {
    const { result } = renderHook(() => usePolaroidStats(mockBlocks));
    expect(result.current.totalMovies).toBe(3);
    expect(result.current.seenCount).toBe(1);
  });
});
