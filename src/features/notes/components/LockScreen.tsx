import { useState } from "react";
import { motion } from "framer-motion";
import { PinPad } from "@/components/ui/PinPad";
import { Lock } from "lucide-react";
import CryptoJS from "crypto-js";

interface LockScreenProps {
  isOpen: boolean;
  onUnlock: () => void;
  lockCode: string | null; // The stored hash
  onCancel?: () => void;
}

export const LockScreen = ({
  isOpen,
  onUnlock,
  lockCode,
  onCancel,
}: LockScreenProps) => {
  const [error, setError] = useState(false);

  const handleComplete = (pin: string) => {
    // Hash the entered PIN
    const hashedPin = CryptoJS.SHA256(pin).toString();

    if (hashedPin === lockCode) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80"
    >
      <div className="mb-8 p-4 rounded-full bg-slate-900/50 border border-slate-800">
        <Lock size={32} className="text-pink-500" />
      </div>

      <PinPad
        onComplete={handleComplete}
        onCancel={onCancel}
        title="Carpeta Privada"
        error={error}
      />
    </motion.div>
  );
};
