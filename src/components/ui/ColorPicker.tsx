import { motion } from "framer-motion";
import { THEMES } from "@/lib/theme-constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
  className?: string;
}

export const ColorPicker = ({
  selectedColor,
  onSelect,
  className,
}: ColorPickerProps) => {
  const handleSelect = (themeId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    onSelect(themeId);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-4 gap-4 place-items-center">
        {Object.values(THEMES).map((theme) => {
          const isSelected =
            selectedColor === theme.id ||
            (!selectedColor && theme.id === "default");

          return (
            <motion.button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              whileTap={{ scale: 0.9 }}
              animate={{
                scale: isSelected ? 1.1 : 1,
              }}
              className={cn(
                "relative flex-shrink-0 w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                theme.bg,
                isSelected ? theme.border : "border-transparent",
                isSelected ? theme.glow : "",
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn("text-white drop-shadow-md")}
                >
                  <Check size={16} strokeWidth={3} />
                </motion.div>
              )}

              {/* Ring for unselected state to show border color hint */}
              {!isSelected && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-full border opacity-30",
                    theme.border,
                  )}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
