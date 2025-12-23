import { describe, it, expect } from "vitest";
import { LinkResolver } from "./link-resolver";

describe("LinkResolver - Movie Enrichement", () => {
  it("should identify IMDb links as a movie provider", async () => {
    const url = "https://www.imdb.com/title/tt0117665/"; // Sleepers
    const metadata = await LinkResolver.resolve(url);

    expect(metadata.provider).toBe("movie");
    expect(metadata.title).toContain("Sleepers");
  });

  it("should identify Letterboxd links as a movie provider", async () => {
    const url = "https://letterboxd.com/film/sleepers/";
    const metadata = await LinkResolver.resolve(url);

    expect(metadata.provider).toBe("movie");
  });

  it("should extract movie-specific metadata (mocking or real fetch)", async () => {
    const url = "https://www.imdb.com/title/tt0117665/";
    const metadata = await LinkResolver.resolve(url);

    // We expect these custom props to be present for the Cine-Polaroid
    if (metadata.provider === "movie") {
      expect(metadata.movieProps).toBeDefined();
      expect(metadata.movieProps?.director).toBeDefined();
      expect(metadata.movieProps?.year).toBeDefined();
    }
  });
});
