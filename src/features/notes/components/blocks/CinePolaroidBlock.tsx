import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Block } from "@/store/notes.store";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, Clapperboard, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaUpload } from "../../hooks/useMediaUpload";

interface BlockProps {
  block: Block;
  onChange: (id: string, updates: Partial<Block>) => void;
}

export interface CinePolaroidProps {
  imageUrl?: string;
  title?: string;
  year?: string;
  genre?: string;
  duration?: string;
  director?: string;
  starring?: string;
  officialRating?: number;
  personalRating?: number;
  isSeen?: boolean;
  comment?: string;
  rotation?: number;
}

export const CinePolaroidBlock = ({ block, onChange }: BlockProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Upload Logic
  const { uploadMedia, isUploading } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadMedia(file, "cine_polaroids");
      if (url) {
        updateProps({ imageUrl: url });
      }
    }
  };

  // Safe Property Updates
  const props = (block.props || {}) as CinePolaroidProps;
  const updateProps = useCallback(
    (newProps: Partial<CinePolaroidProps>) => {
      onChange(block.id, { props: { ...props, ...newProps } });
    },
    [block.id, props, onChange],
  );

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Stabilize Rotation (Local only to prevent update-loop flickering)
  const localRotation = useRef(Math.random() * 4 - 2).current;

  // Device Orientation Tilt (Mobile First)
  useEffect(() => {
    if (typeof window === "undefined" || !window.DeviceOrientationEvent) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isFlipped) return;
      const { beta, gamma } = e;
      if (beta !== null && gamma !== null) {
        const yPct = (beta - 70) / 40;
        const xPct = gamma / 40;
        x.set(Math.max(-0.5, Math.min(0.5, xPct)));
        y.set(Math.max(-0.5, Math.min(0.5, yPct)));
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [isFlipped, x, y]);

  // Handle Title Textarea Auto-height on Mount/Change
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const adjustTitleHeight = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure styles are applied
    const timer = setTimeout(adjustTitleHeight, 50);
    return () => clearTimeout(timer);
  }, [props.title, adjustTitleHeight]);

  return (
    <div className="flex justify-center py-8 perspective-1000 will-change-transform">
      <motion.div
        ref={containerRef}
        className={cn(
          "relative w-[320px] h-[460px] preserve-3d cursor-pointer select-none ring-1 ring-black/5",
          isFlipped ? "z-50" : "z-0",
        )}
        style={{
          rotateX: isFlipped ? 0 : rotateX,
          rotateY: isFlipped ? 180 : rotateY,
          rotateZ: isFlipped ? 0 : localRotation,
        }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          boxShadow: isFlipped
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if (
            (e.target as HTMLElement).tagName === "INPUT" ||
            (e.target as HTMLElement).tagName === "TEXTAREA" ||
            (e.target as HTMLElement).closest("button") ||
            (e.target as HTMLElement).closest("[role='switch']")
          )
            return;
          setIsFlipped(!isFlipped);
        }}
      >
        {/* FRONT FACE (The Poster & Specs) */}
        <div
          className="absolute inset-0 w-full h-full bg-[#fdfcf8] shadow-sm rounded-sm p-3 flex flex-col items-center backface-hidden border border-gray-100 overflow-hidden"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
          }}
        >
          {/* Movie Poster Area */}
          <div
            className="relative w-full h-[280px] bg-slate-200 overflow-hidden shadow-inner group"
            onClick={(e) => {
              e.stopPropagation();
              if (!props.imageUrl) handleUploadClick();
              else setIsFlipped(true);
            }}
          >
            {props.imageUrl ? (
              <img
                src={props.imageUrl}
                alt={props.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Clapperboard size={40} className="opacity-30" />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  Cine Poster
                </span>
                {isUploading && <Loader2 className="animate-spin" />}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Cinematic Metadata (The Chin) */}
          <div className="mt-3 w-full flex flex-col gap-1.5 px-0.5">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <textarea
                  ref={titleRef}
                  value={props.title || ""}
                  onChange={(e) => {
                    adjustTitleHeight();
                    updateProps({ title: e.target.value });
                  }}
                  onFocus={adjustTitleHeight}
                  placeholder="MOVIE TITLE"
                  rows={1}
                  className="w-full text-[21px] font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-200 uppercase tracking-tighter leading-none resize-none overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <input
                value={props.year || ""}
                onChange={(e) => updateProps({ year: e.target.value })}
                placeholder="YEAR"
                className="text-sm font-bold text-slate-400 bg-transparent border-none focus:ring-0 p-0 w-12 text-right mt-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex flex-col gap-0 border-t border-slate-100 pt-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-300 w-12 uppercase tracking-tight shrink-0">
                  Genre
                </span>
                <input
                  value={props.genre || ""}
                  onChange={(e) => updateProps({ genre: e.target.value })}
                  placeholder="GENRE"
                  className="text-[10px] font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 uppercase flex-1 truncate"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-300 w-12 uppercase tracking-tight shrink-0">
                  Duration
                </span>
                <input
                  value={
                    props.duration && props.duration !== "DURACI\u00D3N N/A"
                      ? props.duration
                      : ""
                  }
                  onChange={(e) => updateProps({ duration: e.target.value })}
                  placeholder="DURATION"
                  className="text-[10px] font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 uppercase flex-1 truncate"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-300 w-12 uppercase tracking-tight shrink-0">
                  Director
                </span>
                <input
                  value={
                    props.director &&
                    props.director !== "Director no disponible"
                      ? props.director
                      : ""
                  }
                  onChange={(e) => updateProps({ director: e.target.value })}
                  placeholder="DIRECTOR"
                  className="text-[10px] font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 uppercase flex-1 truncate"
                />
              </div>
              <div className="flex items-start gap-2 mt-0.5">
                <span className="text-[8px] font-bold text-slate-300 w-12 uppercase tracking-tight shrink-0 mt-0.5">
                  Starring
                </span>
                <textarea
                  value={
                    props.starring && props.starring !== "Reparto no disponible"
                      ? props.starring
                      : ""
                  }
                  onChange={(e) => updateProps({ starring: e.target.value })}
                  placeholder="STARRING"
                  rows={2}
                  className="text-[10px] font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 uppercase flex-1 resize-none leading-tight overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BACK FACE (Interactive Memories) */}
        <div
          className="absolute inset-0 w-full h-full bg-[#fdfcf8] shadow-sm rounded-sm p-6 flex flex-col gap-6 backface-hidden rotate-y-180 border border-gray-100"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-['Caveat'] text-2xl text-slate-800">
              Memorias de Cine
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Ya la vimos
              </span>
              <Switch
                checked={props.isSeen}
                onCheckedChange={(checked) => updateProps({ isSeen: checked })}
                className="scale-75 data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Metascore
              </span>
              <div className="flex items-center gap-1 text-slate-700 font-bold">
                <Star
                  size={12}
                  fill="currentColor"
                  className="text-amber-500"
                />
                <span>{props.officialRating || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Voto Pareja
              </span>
              <div className="flex gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    fill={
                      s <= (props.personalRating || 0) ? "currentColor" : "none"
                    }
                    className="cursor-pointer hover:scale-125 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateProps({ personalRating: s });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Nuestra Crítica
            </span>
            <Textarea
              placeholder="¿Qué nos pareció esta película?"
              value={props.comment || ""}
              onChange={(e) => updateProps({ comment: e.target.value })}
              className="flex-1 resize-none bg-slate-50/50 border-none focus-visible:ring-1 focus-visible:ring-slate-100 text-slate-700 text-sm p-3 font-['Caveat'] text-lg shadow-inner rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex justify-center">
            {props.isSeen && (
              <div className="flex items-center gap-1 text-emerald-600 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  Completada
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
