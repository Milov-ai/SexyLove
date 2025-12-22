import { motion } from "framer-motion";
import { ExternalLink, ArrowUpRight, Copy, Check } from "lucide-react";
import type { LinkMetadata } from "@/features/notes/logic/link-resolver";
import { useState } from "react";
import { toast } from "sonner";
import {
  getPlatformInfo,
  smartFormatTitle,
} from "@/features/notes/logic/platform-utils";

interface LinkBlockProps {
  id: string;
  meta: LinkMetadata;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export const LinkBlockSecure = ({
  meta,
}: Omit<LinkBlockProps, "id" | "onRemove" | "readOnly">) => {
  const [imgError, setImgError] = useState(false);
  // richTitle state is removed because we rely 100% on the DB persisted title (meta.title)
  // or the fallback smartFormatTitle if DB title is generic.
  // We do NOT fetch again here.
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(meta.url);
      setCopied(true);
      toast.success("Enlace copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Error al copiar enlace");
    }
  };

  if (!meta) return null;

  // 1. Platform Info & Colors
  const platform = getPlatformInfo(meta.url);

  // 2. Determine Final Title Display
  // We prioritize the persistent meta.title (which was fetched via Microlink at creation).
  // If that's missing or generic, we try smart formatting.
  const finalTitle = smartFormatTitle(meta.url, meta.title);

  // 4. Favicon (DuckDuckGo - Secure & Stable)
  let imageSrc: string | undefined;
  try {
    let urlToParse = meta.url || "";
    if (!urlToParse.startsWith("http")) urlToParse = `https://${urlToParse}`;
    const domain = new URL(urlToParse).hostname;
    imageSrc = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    imageSrc = undefined;
  }

  // --- EMBEDS ---

  // 1. YouTube Embed
  if (meta.provider === "youtube" && meta.embedUrl) {
    return (
      <div className="relative group my-2 rounded-xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg ring-1 ring-white/5">
        <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
          <button
            onClick={handleCopy}
            className="p-2 bg-black/60 text-white/90 hover:text-white rounded-full backdrop-blur-md active:scale-90 transition-transform"
            title="Copy link"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
        <iframe
          src={meta.embedUrl}
          title={finalTitle}
          className="absolute inset-0 w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Spotify Embed
  if (meta.provider === "spotify" && meta.embedUrl) {
    return (
      <div className="relative group my-2">
        <div className="absolute -top-2 -right-2 flex items-center gap-1 z-20 scale-90">
          <button
            onClick={handleCopy}
            className="p-1.5 bg-black/80 text-white/90 hover:text-white rounded-full shadow-lg border border-white/10 active:scale-90 transition-transform"
            title="Copy link"
          >
            {copied ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
        <iframe
          style={{ borderRadius: "12px" }}
          src={meta.embedUrl}
          width="100%"
          height="80"
          frameBorder="0"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    );
  }

  // 3. Premium Generic Link Card
  return (
    <motion.a
      href={meta.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group flex items-center gap-3 p-3 my-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer overflow-hidden backdrop-blur-md shadow-sm"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Favicon Container */}
      <div className="relative shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt=""
            className="w-5 h-5 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <ExternalLink size={18} className="text-white/40" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* Title */}
        <h4 className="font-medium text-slate-200 truncate pr-8 text-[13px] leading-snug group-hover:text-white transition-colors">
          {finalTitle}
        </h4>

        {/* Platform & Domain Footer */}
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold truncate">
          <span className={platform.className}>{platform.name}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/40 font-mono font-normal">
            {new URL(meta.url).hostname.replace("www.", "")}
          </span>
        </div>
      </div>

      {/* Hover Action Indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 duration-200">
        <ArrowUpRight size={14} className="text-white/40" />
      </div>

      {/* Actions Group - Always visible for Mobile First */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10 pl-2 bg-gradient-to-l from-[#18181b] via-[#18181b]/80 to-transparent">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-90"
          title="Copy link"
        >
          {copied ? (
            <Check size={14} className="text-green-400" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    </motion.a>
  );
};
