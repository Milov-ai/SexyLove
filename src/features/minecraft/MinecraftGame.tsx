import { useState, useRef, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

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
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Build iframe URL with performance-optimized params
  const buildGameUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("username", username || "Player");
    if (server) {
      params.set("server", server);
    }
    // Performance optimizations
    params.set("touchControlsType", "joystick-buttons");
    params.set("renderDistance", "4"); // Reduce render distance for performance
    params.set("lowMemoryMode", "true"); // Enable low memory mode
    return `${MINECRAFT_CLIENT_URL}?${params.toString()}`;
  }, [username, server]);

  // Lock screen to landscape on mount
  useEffect(() => {
    const lockLandscape = async () => {
      try {
        // Web Screen Orientation API (works in Android WebView)
        if (screen.orientation && "lock" in screen.orientation) {
          await (
            screen.orientation as ScreenOrientation & {
              lock: (orientation: string) => Promise<void>;
            }
          ).lock("landscape");
        }
      } catch (error) {
        // Fallback: Log but don't crash - some browsers don't support orientation lock
        console.log("[Minecraft] Orientation lock not supported:", error);
      }
    };

    const unlockOrientation = () => {
      try {
        if (screen.orientation && "unlock" in screen.orientation) {
          (
            screen.orientation as ScreenOrientation & { unlock: () => void }
          ).unlock();
        }
      } catch {
        // Fallback
      }
    };

    lockLandscape();

    // Cleanup: unlock orientation when component unmounts
    return () => {
      unlockOrientation();
    };
  }, []);

  // Simulate loading progress for better UX
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleIframeLoad = () => {
    setLoadProgress(100);
    // Slight delay for smoother transition
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Handle back button / gesture on Android
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const handleBackButton = (e: Event) => {
        e.preventDefault();
        onClose();
      };
      document.addEventListener("backbutton", handleBackButton);
      return () => {
        document.removeEventListener("backbutton", handleBackButton);
      };
    }
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col overflow-hidden">
      {/* Loading State with Progress */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950 via-black to-cyan-950 z-20">
          <div className="flex flex-col items-center gap-6">
            {/* Minecraft-style loading block */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg shadow-2xl animate-pulse" />
              <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-md" />
              <div className="absolute inset-4 bg-emerald-900/50 rounded-sm animate-ping" />
            </div>

            <div className="text-center">
              <p className="text-white text-xl font-bold tracking-wider mb-2">
                Cargando Minecraft
              </p>
              <p className="text-emerald-400 text-sm font-mono">
                {Math.round(loadProgress)}%
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-black/50 rounded-full overflow-hidden border border-emerald-900">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>

            <p className="text-slate-500 text-xs mt-2">
              Gira tu dispositivo a horizontal para mejor experiencia
            </p>
          </div>
        </div>
      )}

      {/* Minimal Exit Button - Only visible after loading */}
      {!isLoading && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all active:scale-90"
          style={{
            paddingTop: "env(safe-area-inset-top, 0)",
            marginTop: "env(safe-area-inset-top, 0)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Game Iframe - Optimized for performance */}
      <iframe
        ref={iframeRef}
        src={buildGameUrl()}
        onLoad={handleIframeLoad}
        className="w-full h-full border-0"
        allow="gamepad; autoplay; fullscreen; pointer-lock"
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
        loading="eager"
        referrerPolicy="no-referrer"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
};
