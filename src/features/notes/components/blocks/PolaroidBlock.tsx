import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Block } from "@/store/notes.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Image as ImageIcon,
  RotateCw,
  Star,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMediaUpload } from "../../hooks/useMediaUpload";

interface BlockProps {
  block: Block;
  onChange: (id: string, updates: Partial<Block>) => void;
}

interface PolaroidProps {
  imageUrl?: string;
  rotation?: number;
  rating?: number;
  date?: string;
  location?: string;
  review?: string;
}

export const PolaroidBlock = ({ block, onChange }: BlockProps) => {
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
      const url = await uploadMedia(file, "polaroids");
      if (url) {
        updateProps({ imageUrl: url });
      }
    }
  };

  // Safe Property Updates
  const props = (block.props || {}) as PolaroidProps;
  const updateProps = useCallback(
    (newProps: Partial<PolaroidProps>) => {
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

  // Rotation Randomness (Stored in props to persist)
  // Rotation Randomness (Stored in props to persist)
  const randomRotation = useRef(Math.random() * 4 - 2).current;

  useEffect(() => {
    if (!props.rotation) {
      updateProps({ rotation: randomRotation });
    }
  }, [props.rotation, randomRotation, updateProps]); // Run once on mount or if rotation missing

  return (
    <div className="flex justify-center py-8 perspective-1000">
      <motion.div
        ref={containerRef}
        className={cn(
          "relative w-[300px] h-[360px] preserve-3d cursor-pointer select-none",
          isFlipped ? "z-50" : "z-0",
        )}
        style={{
          rotateX: isFlipped ? 0 : rotateX,
          rotateY: isFlipped ? 180 : rotateY,
          rotateZ: isFlipped ? 0 : randomRotation,
        }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          // Prevent flip if clicking inputs
          if (
            (e.target as HTMLElement).tagName === "INPUT" ||
            (e.target as HTMLElement).tagName === "TEXTAREA"
          )
            return;
          // setFlipped(!isFlipped); // Let the flip button handle explicitly or container?
          // Better UX: Click container to flip ONLY if not editing inputs.
          // But let's use a specific button for clarity or double click.
          // Let's rely on a specific interaction or just container click for now.
          setIsFlipped(!isFlipped);
        }}
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full bg-white shadow-xl rounded-sm p-4 flex flex-col items-center backface-hidden border border-gray-200">
          {/* Photo Area */}
          <div
            className="relative w-full h-[240px] bg-slate-100 overflow-hidden shadow-inner cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              if (!props.imageUrl) handleUploadClick();
              else setIsFlipped(true); // Click photo to flip
            }}
          >
            {props.imageUrl ? (
              <>
                <motion.img
                  src={props.imageUrl}
                  alt="Polaroid Memory"
                  className="w-full h-full object-cover"
                  initial={{ filter: "sepia(1) blur(4px) contrast(0.8)" }}
                  animate={{ filter: "sepia(0) blur(0) contrast(1)" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                {/* Gloss Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10 opacity-60 pointer-events-none mix-blend-overlay" />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-slate-200/50 transition-colors">
                <ImageIcon size={32} />
                <span className="text-xs font-handwriting">Upload Memory</span>
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
          </div>

          {/* Chin Content */}
          <div className="mt-4 w-full flex flex-col items-center gap-1 font-['Caveat'] text-slate-800">
            <input
              value={block.content || ""}
              onChange={(e) => onChange(block.id, { content: e.target.value })}
              placeholder="Write a caption..."
              className="text-2xl text-center w-full bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-300"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-1 text-yellow-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= (props.rating || 0) ? "currentColor" : "none"}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateProps({ rating: s });
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          className="absolute inset-0 w-full h-full bg-[#fdfbf6] shadow-xl rounded-sm p-6 flex flex-col gap-4 backface-hidden rotate-y-180 border border-gray-200"
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-['Caveat'] text-2xl text-slate-800">
              Details
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="h-6 w-6 rounded-full hover:bg-slate-200"
            >
              <RotateCw size={14} className="text-slate-600" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} />
              <Input
                type="date"
                value={props.date || ""}
                onChange={(e) => updateProps({ date: e.target.value })}
                className="h-8 bg-transparent border-none shadow-none text-sm p-0 focus-visible:ring-0 font-handwriting placeholder:text-slate-300"
              />
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin size={14} />
              <Input
                placeholder="Location..."
                value={props.location || ""}
                onChange={(e) => updateProps({ location: e.target.value })}
                className="h-8 bg-transparent border-none shadow-none text-sm p-0 focus-visible:ring-0 font-handwriting placeholder:text-slate-300"
              />
            </div>
          </div>

          <Textarea
            placeholder="Write your review or memory here..."
            value={props.review || ""}
            onChange={(e) => updateProps({ review: e.target.value })}
            className="flex-1 resize-none bg-transparent border-none focus-visible:ring-0 text-slate-700 text-sm leading-relaxed p-0 shadow-none font-sans"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="text-xs text-center text-slate-400 font-mono opacity-50">
            {props.date
              ? format(new Date(props.date), "MMMM d, yyyy")
              : "No Date"}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
