export interface PlatformInfo {
  name: string;
  color: string;
  className: string; // Tailwind text class
}

/**
 * Identifies the platform from a URL and returns branding info.
 */
export const getPlatformInfo = (url: string): PlatformInfo => {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = urlObj.hostname.toLowerCase();

    // 1. YouTube Music
    if (hostname.includes("music.youtube.com")) {
      return {
        name: "YouTube Music",
        color: "#ef4444",
        className: "text-red-500",
      };
    }

    // 2. YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return { name: "YouTube", color: "#ff0000", className: "text-red-600" };
    }

    // 3. Spotify
    if (hostname.includes("spotify.com")) {
      return { name: "Spotify", color: "#22c55e", className: "text-green-500" };
    }

    // 4. Instagram
    if (hostname.includes("instagram.com")) {
      return {
        name: "Instagram",
        color: "#e1306c",
        className: "text-pink-500",
      };
    }

    // 5. TikTok
    if (hostname.includes("tiktok.com")) {
      return { name: "TikTok", color: "#00f2ea", className: "text-teal-400" };
    }

    // 6. Netflix
    if (hostname.includes("netflix.com")) {
      return { name: "Netflix", color: "#e50914", className: "text-red-600" };
    }

    // 7. Twitter / X
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return {
        name: "X / Twitter",
        color: "#3b82f6",
        className: "text-blue-500",
      };
    }

    // 8. GitHub
    if (hostname.includes("github.com")) {
      return { name: "GitHub", color: "#ffffff", className: "text-white" };
    }

    // 9. LinkedIn
    if (hostname.includes("linkedin.com")) {
      return { name: "LinkedIn", color: "#0a66c2", className: "text-blue-600" };
    }

    // Default: Clean Domain Name
    const cleanDomain = hostname.replace(/^www\./, "").split(".")[0];
    return {
      name: cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1),
      color: "#a78bfa", // violet-400
      className: "text-violet-400",
    };
  } catch {
    return { name: "Link", color: "#a78bfa", className: "text-violet-400" };
  }
};

/**
 * Attempts to intelligently format a title from a URL when metadata is missing.
 */
export const smartFormatTitle = (url: string, currentTitle: string): string => {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);

    // If the title is just the domain or a URL, try to improve it
    const isGenericTitle =
      currentTitle.includes(urlObj.hostname) || currentTitle.startsWith("http");

    if (!isGenericTitle) return currentTitle;

    const path = urlObj.pathname;

    // Instagram
    if (urlObj.hostname.includes("instagram.com")) {
      if (path.includes("/reel/")) return "Instagram Reel";
      if (path.includes("/p/")) return "Instagram Post";
      if (path.length > 1) return `Instagram: ${path.split("/")[1]}`;
    }

    // TikTok
    if (urlObj.hostname.includes("tiktok.com")) {
      // /@user/video/id
      const parts = path.split("/");
      const user = parts.find((p) => p.startsWith("@"));
      if (user) return `TikTok by ${user}`;
      return "TikTok Video";
    }

    // Twitter / X
    if (
      urlObj.hostname.includes("twitter.com") ||
      urlObj.hostname.includes("x.com")
    ) {
      if (path.includes("/status/")) return "X Post";
      const user = path.split("/")[1];
      if (user && !user.includes("status")) return `X Profile: @${user}`;
    }

    // GitHub
    if (urlObj.hostname.includes("github.com")) {
      const parts = path.split("/").filter(Boolean);
      if (parts.length === 1) return `GitHub Profile: ${parts[0]}`;
      if (parts.length === 2) return `Repo: ${parts[0]}/${parts[1]}`;
      if (path.includes("/blob/") || path.includes("/tree/"))
        return `GitHub: ${parts[parts.length - 1]}`;
    }

    // Generic Path Cleanup with Decal Speed
    if (path.length > 1 && path !== "/") {
      // /foo/bar-baz -> "Foo Bar Baz"
      const lastSegment = path.split("/").filter(Boolean).pop();
      if (lastSegment) {
        // Remove common extensions
        const cleanSegment = lastSegment
          .replace(/\.(html|php|jsp|asp|aspx)$/, "")
          .replace(/[-_]/g, " ");

        // Capitalize words
        return cleanSegment.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    return currentTitle;
  } catch {
    console.warn("Clipboard read failed");
    return "";
  }
};
