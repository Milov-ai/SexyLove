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

      const fetchUrl = cleanUrl.startsWith("http")
        ? cleanUrl
        : `https://${cleanUrl}`;

      // 3. Movie Links (IMDb / Letterboxd)
      const isMovie = cleanUrl.match(
        /imdb\.com\/(?:[a-z]{2}\/)?title\/tt\d+|letterboxd\.com\/film\/[\w-]+/i,
      );

      if (isMovie) {
        metadata.provider = "movie";
        try {
          // Normalize IMDb URLs to English to get better/longer descriptions
          // (Localized IMDb pages often have very short descriptions without director/cast)
          let normalizedFetchUrl = fetchUrl;
          if (fetchUrl.includes("imdb.com")) {
            normalizedFetchUrl = fetchUrl.replace(
              /imdb\.com\/[a-z]{2}\//i,
              "imdb.com/",
            );
          }

          // Add custom selectors to extract specific data that might be missing in metadata
          // We ask for:
          // - jsonld: The structured data script
          // - originalTitle: The original title element
          // - castList: A specific list of actors (limited by selector, taking text)
          // - backupPersons: Any person link on the page (shotgun approach for failsafe)
          const selectorParams = [
            'data.movie.selector=script[type="application/ld+json"]&data.movie.attr=text',
            'data.originalTitle.selector=[data-testid="hero-title-block__original-title"]&data.originalTitle.attr=text',
            'data.sh_director.selector=[data-testid="title-pc-principal-credit"] li a&data.sh_director.attr=text',
            'data.sh_cast.selector=[data-testid="title-cast-item__actor"]&data.sh_cast.attr=text',
          ].join("&");

          // IMDb requires prerender for JS-rendered content. Without it, we get empty pages.
          const selectorUrl = `https://api.microlink.io?url=${encodeURIComponent(normalizedFetchUrl)}&prerender=true&${selectorParams}`;

          const microlinkRes = await fetch(selectorUrl);

          if (microlinkRes.ok) {
            const microlinkData = await microlinkRes.json();
            if (microlinkData.status === "success" && microlinkData.data) {
              const data = microlinkData.data;

              console.log("DEBUG: Raw Microlink data:", {
                url: normalizedFetchUrl,
                title: data.title,
                description: data.description?.substring(0, 100),
                movie: data.movie ? "Present" : "Missing",
                sh_director: data.sh_director,
                sh_cast: data.sh_cast,
              });

              // 0. Parse custom movie data (JSON-LD)
              let ldData: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

              try {
                if (data.movie) {
                  const rawLd = Array.isArray(data.movie)
                    ? data.movie[0]
                    : data.movie;
                  ldData = JSON.parse(rawLd);
                  // Handle cases where ldData is an array
                  if (Array.isArray(ldData)) {
                    // Check if type includes Movie or TVSeries (could be string or array)
                    ldData = ldData.find((item) => {
                      const type = item["@type"];
                      const typeStr = Array.isArray(type)
                        ? type.join(" ")
                        : type;
                      return (
                        /Movie|TVSeries|CreativeWork/.test(typeStr) &&
                        (item.director || item.actor || item.creator)
                      );
                    });
                  }
                }
              } catch (e) {
                console.warn("Failed to parse IMDb JSON-LD", e);
              }

              const fullTitle = data.title || "";
              const desc = data.description || "";

              // 1. Year Extraction
              const yearMatch = fullTitle.match(/\((\d{4})\)/);
              const year = yearMatch ? yearMatch[1] : undefined;

              // 2. Title Cleaning
              // Removes (1999), (TV Series 2025- ), IMDb suffix, stars, etc.
              const cleanTitle = fullTitle
                ?.replace(/\s\(.*?\d{4}.*?\)/i, "") // Catch (1999) or (TV Series 2025-)
                .replace(/\s⭐.*/, "")
                .replace(/\|.*/, "")
                .replace(" - IMDb", "")
                .replace(" • Letterboxd", "")
                .trim();

              // Use Original Title from selector if available
              if (
                data.originalTitle &&
                data.originalTitle.startsWith("Original title: ")
              ) {
                // We could use this, but ignoring for now to keep main logic simple
              }

              // 3. Genre Extraction
              let genre = undefined;
              // Strategy A: From Title "⭐ 8.8 | Crime, Drama"
              const genreInTitle = fullTitle.match(/\|\s*([^|]+)$/);
              if (genreInTitle) genre = genreInTitle[1].trim();

              // Strategy B: From Description "Genres: Crime, Drama"
              if (!genre || genre.length < 3) {
                const genreMatch =
                  desc.match(/Genres?:\s*([^•\-|]+)/i) ||
                  desc.match(/G\u00E9neros?:\s*([^•\-|]+)/i);
                if (genreMatch) genre = genreMatch[1].trim();
              }

              // 4. Duration Extraction
              let duration = undefined;
              // Strategy A: From Description start "2h 19m | R"
              const durationStartMatch = desc.match(
                /^(\d+h\s*\d+m|\d+h|\d+m|\d+\s*min)/i,
              );
              if (durationStartMatch) duration = durationStartMatch[1].trim();

              // Strategy B: From Description labeled "Duration: 2h 19m"
              if (!duration) {
                const durationMatchLabel = desc.match(
                  /(?:Duration|Duraci\u00F3n):\s*([^•\-|]+)/i,
                );
                if (durationMatchLabel) duration = durationMatchLabel[1].trim();
              }

              // 5. Director & Starring (Priority to JSON-LD)
              let director: string | undefined = undefined;
              let starring: string | undefined = undefined;

              if (ldData) {
                if (ldData.director || ldData.creator) {
                  const directors = ldData.director || ldData.creator; // TV series often have 'creator'
                  const dirArray = Array.isArray(directors)
                    ? directors
                    : [directors];
                  // Filter for Person types only
                  director = dirArray
                    .filter(
                      (d: { "@type"?: string; name?: string }) =>
                        d["@type"] === "Person" && d.name,
                    )
                    .map((d: { name: string }) => d.name)
                    .join(", ");
                }
                // Extract Actors (Cast)
                if (ldData.actor) {
                  const actors = Array.isArray(ldData.actor)
                    ? ldData.actor
                    : [ldData.actor];
                  starring = actors
                    .filter(
                      (a: { "@type"?: string; name?: string }) =>
                        a["@type"] === "Person" && a.name,
                    )
                    .map((a: { name: string }) => a.name)
                    .join(", "); // We'll slice later or keep all. Let's keep all from JSON-LD source first.
                }
              }

              // CSS Selector Fallback (Visual Scraping)
              // 1. Director
              if (!director && data.sh_director) {
                const directorData = Array.isArray(data.sh_director)
                  ? data.sh_director
                  : [data.sh_director];
                director = directorData.join(", ");
              }

              // 2. Cast (Logic: If JSON-LD is weak (< 5 names), try visual selector. If valid, overwrite.)
              const jsonLdCastCount = starring ? starring.split(",").length : 0;

              if (data.sh_cast && (!starring || jsonLdCastCount < 5)) {
                const castData = Array.isArray(data.sh_cast)
                  ? data.sh_cast
                  : [data.sh_cast];
                if (castData.length > 0) {
                  starring = castData.slice(0, 10).join(", ");
                }
              }

              console.log("DEBUG: Enhanced Extraction:", {
                title: cleanTitle,
                director,
                starring,
                sourceJSON: jsonLdCastCount,
                sourceCSS: data.sh_cast,
              });

              // Fallback to description parsing if JSON-LD failed
              if (!director || !starring) {
                if (
                  desc.includes("Directed by") ||
                  desc.includes("Dirigida por")
                ) {
                  if (!director) {
                    const dirMatch = desc.match(
                      /(?:Directed by|Dirigida por)\s*([^.]+)\./i,
                    );
                    if (dirMatch) director = dirMatch[1].trim();
                  }
                  if (!starring) {
                    const starsMatch = desc.match(/(?:With|Con)\s*([^.]+)\./i);
                    if (starsMatch) starring = starsMatch[1].trim();
                  }
                }
              }

              // Fallback for Director if still empty and author doesn't look like a nickname
              // (Note: Many Microlink authors for IMDb are random users, so we use with caution)
              // Fallback for Director: Ban numbers in author names (e.g. RAJA79)
              if (
                !director &&
                data.author &&
                data.author.length > 3 &&
                !data.author.includes("_") &&
                !/\d/.test(data.author)
              ) {
                director = data.author;
              }

              // 6. Rating Extraction (Priority to JSON-LD)
              let rating = undefined;
              if (ldData?.aggregateRating?.ratingValue) {
                rating = parseFloat(ldData.aggregateRating.ratingValue);
              }

              if (!rating) {
                const ratingMatch = fullTitle.match(/⭐\s*(\d+\.?\d*)/);
                if (ratingMatch) rating = parseFloat(ratingMatch[1]);
              }

              metadata.title = cleanTitle || metadata.title;
              metadata.image = data.image?.url || metadata.image;
              metadata.description = desc;
              metadata.movieProps = {
                year,
                director: director || "Director no disponible",
                starring: starring || "Reparto no disponible",
                genre: (genre || "Pel\u00EDcula").toUpperCase(),
                duration: (duration || "Duraci\u00F3n n/a").toUpperCase(),
                rating: rating,
              };
            }
          }
        } catch (e) {
          console.error("Microlink error (movie):", e);
        }
        return metadata;
      }

      // 4. Generic Links - Enhanced Fetch
      try {
        const microlinkRes = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(fetchUrl)}`,
        );
        if (microlinkRes.ok) {
          const microlinkData = await microlinkRes.json();
          if (microlinkData.status === "success" && microlinkData.data) {
            const data = microlinkData.data;
            if (data.title) metadata.title = data.title;
            if (data.image?.url) metadata.image = data.image.url;
            if (data.description) metadata.description = data.description;
          }
        }
      } catch (e) {
        console.error("Microlink error (generic):", e);
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
