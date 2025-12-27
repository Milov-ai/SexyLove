import { motion } from "framer-motion";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Hosted Minecraft Web Client URL
const MINECRAFT_CLIENT_URL = "https://mcon.vercel.app";

interface MinecraftGameProps {
  username: string;
  server: string;
  onClose: () => void;
}

export const MinecraftGame = ({
  username,
  server,
  onClose,
}: MinecraftGameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Build iframe URL with params
  const buildGameUrl = () => {
    const params = new URLSearchParams();
    params.set("username", username || "Player");
    if (server) {
      params.set("server", server);
    }
    // Enable touch controls by default
    params.set("touchControlsType", "joystick-buttons");
    return `${MINECRAFT_CLIENT_URL}?${params.toString()}`;
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Control Bar */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-10 p-2 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent"
        style={{ paddingTop: "env(safe-area-inset-top, 8px)" }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10 rounded-full w-10 h-10"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-2 hidden sm:block">
            {username} {server && `• ${server}`}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:bg-white/10 rounded-full w-10 h-10"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10 rounded-full w-10 h-10"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-white text-lg font-medium">
              Cargando Minecraft...
            </p>
            <p className="text-slate-400 text-sm">
              Esto puede tardar unos segundos
            </p>
          </div>
        </div>
      )}

      {/* Game Iframe */}
      <iframe
        ref={iframeRef}
        src={buildGameUrl()}
        onLoad={handleIframeLoad}
        className="flex-1 w-full h-full border-0"
        allow="gamepad; autoplay; fullscreen; microphone"
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
        style={{
          paddingTop: "env(safe-area-inset-top, 0)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      />
    </div>
  );
};
