export interface LinkMetadata {
  provider: "youtube" | "spotify" | "generic";
  url: string;
  title: string;
  description?: string;
  image?: string;
  embedUrl?: string; // For iframes
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

      // 3. Generic Links - Enhanced Fetch
      try {
        const microlinkRes = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`,
        );
        const microlinkData = await microlinkRes.json();
        if (
          microlinkData.status === "success" &&
          microlinkData.data &&
          microlinkData.data.title
        ) {
          metadata.title = microlinkData.data.title;
        }
      } catch {
        // Silently fail to default
      }

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
