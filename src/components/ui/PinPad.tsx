import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinPadProps {
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  error?: boolean;
}

export const PinPad = ({
  onComplete,
  onCancel,
  title = "Ingresa el PIN",
  error,
}: PinPadProps) => {
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (error) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        setPin("");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handlePress = (num: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => onComplete(newPin), 100);
      }
    }
  };

  const handleDelete = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setPin((prev) => prev.slice(0, -1));
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto">
      <h2 className="text-xl font-medium text-slate-200 mb-8">{title}</h2>

      {/* PIN Dots */}
      <motion.div
        className="flex gap-4 mb-12"
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border border-slate-600 transition-all duration-300",
              pin.length > i
                ? "bg-pink-500 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                : "bg-transparent",
            )}
          />
        ))}
      </motion.div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        {numbers.map((num) => {
          if (num === "") return <div key="empty" />;
          if (num === "del") {
            return (
              <button
                key="del"
                onClick={handleDelete}
                className="w-16 h-16 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
              >
                <Delete size={24} />
              </button>
            );
          }
          return (
            <button
              key={num}
              onClick={() => handlePress(num)}
              className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-2xl font-light text-white backdrop-blur-sm transition-all active:scale-95 active:bg-white/20 flex items-center justify-center"
            >
              {num}
            </button>
          );
        })}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-12 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Cancelar
        </button>
      )}
    </div>
  );
};
