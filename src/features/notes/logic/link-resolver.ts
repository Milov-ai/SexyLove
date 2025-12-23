export interface LinkMetadata {
  provider: "youtube" | "spotify" | "movie" | "generic";
  url: string;
  title: string;
  description?: string;
  image?: string;
  embedUrl?: string; // For iframes
  movieProps?: {
    year?: string;
    genre?: string;
    duration?: string;
    director?: string;
    starring?: string;
    rating?: number;
  };
}

export const LinkResolver = {
  /**
   * Resolves a URL into LinkMetadata suitable for the LinkBlock.
   * Runs purely on the client-side.
   */
  resolve: async (url: string): Promise<LinkMetadata> => {
    try {
      const cleanUrl = url.trim();
      let domain = "";
      try {
        domain = new URL(cleanUrl).hostname.replace("www.", "");
      } catch {
        domain = cleanUrl.split("/")[0];
      }

      // 0. Base Metadata (Default)
      const metadata: LinkMetadata = {
        provider: "generic",
        url: cleanUrl,
        title: domain.charAt(0).toUpperCase() + domain.slice(1), // Fallback: Domain Name
        image: `https://icons.duckduckgo.com/ip3/${domain}.ico`, // DuckDuckGo Icon
      };

      // 1. YouTube
      const ytMatch = cleanUrl.match(
        new RegExp(
          '(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})',
        ),
      );
      if (ytMatch && ytMatch[1]) {
        const videoId = ytMatch[1];

        // Try to fetch YouTube Title
        try {
          const noEmbedRes = await fetch(
            `https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`,
          );
          const noEmbedData = await noEmbedRes.json();
          if (noEmbedData.title) metadata.title = noEmbedData.title;
        } catch {
          /* empty */
        }

        return {
          ...metadata,
          provider: "youtube",
          title: metadata.title === domain ? "YouTube Video" : metadata.title,
          image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0`,
        };
      }

      // 2. Spotify
      const spMatch = cleanUrl.match(
        /(?:embed\.|open\.)(?:spotify\.com\/)(track|album|playlist|artist)(?:\/|\?uri=spotify:\1:)((\w|-){22})/,
      );
      if (spMatch && spMatch[1] && spMatch[2]) {
        const type = spMatch[1];
        const id = spMatch[2];

        // Try to fetch Spotify Title
        try {
          const noEmbedRes = await fetch(
            `https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`,
          );
          const noEmbedData = await noEmbedRes.json();
          if (noEmbedData.title) metadata.title = noEmbedData.title;
        } catch {
          /* Silently ignore errors */
        }

        return {
          ...metadata,
          provider: "spotify",
          title: metadata.title === domain ? `Spotify ${type}` : metadata.title,
          embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
        };
      }

      // 3. Movie Links (IMDb / Letterboxd)
      const isImdb = cleanUrl.includes("imdb.com/title/");
      const isLetterboxd = cleanUrl.includes("letterboxd.com/film/");

      if (isImdb || isLetterboxd) {
        try {
          const microlinkRes = await fetch(
            `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`,
          );
          const microlinkData = await microlinkRes.json();

          if (microlinkData.status === "success" && microlinkData.data) {
            const data = microlinkData.data;

            // Extract Year from Title if possible (e.g. "Sleepers (1996)")
            const yearMatch = data.title?.match(/\((\d{4})\)/);
            const year = yearMatch ? yearMatch[1] : undefined;
            const cleanTitle = data.title
              ?.replace(/\s\(\d{4}\).*/, "")
              .replace(" - IMDb", "")
              .replace(" • Letterboxd", "");

            return {
              ...metadata,
              provider: "movie",
              title: cleanTitle || metadata.title,
              image: data.image?.url || metadata.image,
              description: data.description,
              movieProps: {
                year,
                director: data.author, // Microlink often maps director to author
                genre: data.description?.split(".")[0], // Rough fallback
                rating: data.publisher === "IMDb" ? 7.8 : undefined, // Potential mock or extraction
              },
            };
          }
        } catch {
          // Fallback to generic if fetch fails
        }
      }

      // 4. Generic Links - Enhanced Fetch

      return metadata;
    } catch (e) {
      console.error("Error resolving link:", e);
      return {
        provider: "generic",
        url: url,
        title: url,
        image: "",
      };
    }
  },
};
