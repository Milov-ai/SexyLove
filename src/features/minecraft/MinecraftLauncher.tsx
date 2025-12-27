import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Gamepad2, Server, User, Play, Sparkles } from "lucide-react";

interface MinecraftLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlay: (params: { username: string; server: string }) => void;
}

const STORAGE_KEYS = {
  USERNAME: "minecraft_username",
  SERVER: "minecraft_server",
};

export const MinecraftLauncher = ({
  open,
  onOpenChange,
  onPlay,
}: MinecraftLauncherProps) => {
  const [username, setUsername] = useState("");
  const [serverAddress, setServerAddress] = useState("");

  // Load persisted values on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const savedServer = localStorage.getItem(STORAGE_KEYS.SERVER);
    if (savedUsername) setUsername(savedUsername);
    if (savedServer) setServerAddress(savedServer);
  }, []);

  const handlePlay = () => {
    if (!username.trim()) return;

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.USERNAME, username.trim());
    if (serverAddress.trim()) {
      localStorage.setItem(STORAGE_KEYS.SERVER, serverAddress.trim());
    }

    // Call parent with params
    onPlay({
      username: username.trim(),
      server: serverAddress.trim(),
    });
  };

  const isValid = username.trim().length >= 3;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[32px] border-t border-white/10 bg-background/95 backdrop-blur-xl p-6 pb-10"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3 text-2xl font-serif font-medium text-white">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Gamepad2 size={24} />
            </div>
            Minecraft
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Ingresa tu nombre y servidor para jugar.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Username Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <User size={14} />
              Nombre de Jugador
            </Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Steve"
              maxLength={16}
              className="h-12 bg-black/30 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-white placeholder:text-slate-600"
            />
            {username.length > 0 && username.length < 3 && (
              <p className="text-xs text-amber-500">Mínimo 3 caracteres</p>
            )}
          </div>

          {/* Server Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Server size={14} />
              Servidor (Opcional)
            </Label>
            <Input
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              placeholder="tuservidor.aternos.me:12345"
              className="h-12 bg-black/30 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-white placeholder:text-slate-600 font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Déjalo vacío para jugar en solitario
            </p>
          </div>

          {/* Play Button */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handlePlay}
              disabled={!isValid}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <Play size={22} />
              Jugar
              <Sparkles size={18} className="text-yellow-300" />
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
