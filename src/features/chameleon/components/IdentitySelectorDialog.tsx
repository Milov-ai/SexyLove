import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ALIASES, type AliasType } from "@/features/chameleon/ChameleonManager";
import { ChameleonRemote } from "@/features/chameleon/logic/ChameleonRemote";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface IdentitySelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IdentitySelectorDialog = ({
  open,
  onOpenChange,
}: IdentitySelectorDialogProps) => {
  const handleSelect = async (alias: AliasType) => {
    try {
      await ChameleonRemote.setGlobalIdentity(alias);
      onOpenChange(false);
    } catch {
      // Error handled in Remote
    }
  };

  const getMeta = (alias: string) => {
    // Manual metadata map for UI
    const meta: Record<
      string,
      { label: string; color: string; emoji: string }
    > = {
      AliasPideUnDeseo: { label: "Base", color: "bg-violet-600", emoji: "✨" },
      AliasNaaam: { label: "Ñaaam", color: "bg-orange-500", emoji: "🍖" },
      AliasAzulinaa: { label: "Azulinaa", color: "bg-cyan-500", emoji: "💊" },
      AliasMuaah: { label: "Muaah", color: "bg-pink-600", emoji: "💋" },
      AliasTamuu: { label: "T'amuu", color: "bg-rose-400", emoji: "🥰" },
      AliasKissKiss: {
        label: "Kiss Kiss",
        color: "bg-fuchsia-600",
        emoji: "💥",
      },
      AliasUuuf: { label: "Uuuf", color: "bg-red-600", emoji: "🫠" },
      AliasPlop: { label: "Plop", color: "bg-blue-400", emoji: "🫧" },
      AliasOops: { label: "Oops", color: "bg-amber-400", emoji: "🩹" }, // Fixed Alias Name in array?
      AliasHohoho: { label: "Hohoho", color: "bg-red-700", emoji: "🎅" },
      AliasWow: { label: "Wow", color: "bg-yellow-400", emoji: "🤩" },
      AliasXoxo: { label: "XOXO", color: "bg-pink-400", emoji: "❌⭕" },
      AliasShhh: { label: "Shhh", color: "bg-violet-900", emoji: "🤫" },
    };
    return meta[alias] || { label: alias, color: "bg-slate-700", emoji: "❓" };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-premium border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold font-serif tracking-widest uppercase">
            <Sparkles className="text-yellow-400" />
            Control Camaleón
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Selecciona la identidad global de la aplicación.
            <br />
            Se actualizará en todos los dispositivos conectados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-1">
          {ALIASES.map((alias) => {
            const { label, color, emoji } = getMeta(alias);
            return (
              <motion.button
                key={alias}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(alias)}
                className={`relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-white/30 transition-colors ${color}/20`}
              >
                <div className={`absolute inset-0 opacity-20 ${color}`} />
                <div className="text-4xl filter drop-shadow-lg z-10">
                  {emoji}
                </div>
                <span className="text-xs font-bold tracking-wider uppercase z-10">
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
