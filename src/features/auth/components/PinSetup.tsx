import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { pinService } from "@/services/pin.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PinSetupProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const PIN_LENGTH = 4;

const PinSetup = ({ onSuccess, onCancel }: PinSetupProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle digit input
  const handleDigit = (digit: string) => {
    if (isProcessing) return;
    setError("");

    if (step === "enter") {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + digit;
        setPin(newPin);

        if (newPin.length === PIN_LENGTH) {
          setTimeout(() => {
            setStep("confirm");
          }, 300);
        }
      }
    } else {
      if (confirmPin.length < PIN_LENGTH) {
        const newConfirm = confirmPin + digit;
        setConfirmPin(newConfirm);

        if (newConfirm.length === PIN_LENGTH) {
          handleVerify(newConfirm);
        }
      }
    }
  };

  const handleBackspace = () => {
    setError("");
    if (step === "enter") {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleVerify = async (finalConfirm: string) => {
    if (pin !== finalConfirm) {
      setError("Los PINs no coinciden");
      setTimeout(() => {
        setConfirmPin("");
        setError("");
      }, 1000);
      return;
    }

    setIsProcessing(true);
    try {
      const success = await pinService.setPin(pin);
      if (success !== false) {
        // Assuming void or true
        toast.success("PIN configurado correctamente");
        onSuccess();
      } else {
        // Fallback for boolean type
        setError("Error al guardar PIN");
        setStep("enter");
        setPin("");
        setConfirmPin("");
      }
    } catch {
      setError("Error del sistema");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background">
      {/* Ambient Glows */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-pink-500/15 blur-[80px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm mx-4"
      >
        <div className="relative overflow-hidden rounded-3xl glass-dirty border border-white/10 p-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Header Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-border flex items-center justify-center mb-6"
            >
              <ShieldCheck className="h-8 w-8 text-foreground" />
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {step === "enter" ? "Configura tu PIN" : "Confirma tu PIN"}
            </h2>
            <p className="text-muted-foreground text-sm mb-8 text-center">
              {step === "enter"
                ? "Crea un código de acceso para proteger tu Vault"
                : "Ingresa el código nuevamente para verificar"}
            </p>

            {/* PIN Dots */}
            <div className="flex gap-4 mb-8">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-300",
                    (step === "enter" ? pin.length > i : confirmPin.length > i)
                      ? "bg-primary border-primary shadow-[0_0_10px_rgba(var(--neon-primary-rgb),0.5)]"
                      : "border-border bg-transparent",
                  )}
                />
              ))}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-sm mb-4 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDigit(String(num))}
                  disabled={isProcessing}
                  className={cn(
                    "h-16 rounded-2xl flex items-center justify-center text-2xl font-light text-foreground",
                    "bg-muted/30 hover:bg-muted/50 border border-border transition-colors",
                  )}
                >
                  {num}
                </motion.button>
              ))}
              <div className="h-16" /> {/* Empty slot */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDigit("0")}
                disabled={isProcessing}
                className={cn(
                  "h-16 rounded-2xl flex items-center justify-center text-2xl font-light text-foreground",
                  "bg-muted/30 hover:bg-muted/50 border border-border transition-colors",
                )}
              >
                0
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBackspace}
                disabled={isProcessing}
                className="h-16 rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                ⌫
              </motion.button>
            </div>

            {/* Back / Cancel Actions */}
            <div className="w-full mt-6 flex justify-center">
              {step === "confirm" ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("enter");
                    setPin("");
                    setConfirmPin("");
                    setError("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
              ) : (
                onCancel && (
                  <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PinSetup;
