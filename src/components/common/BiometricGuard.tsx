import { useEffect, useState, useCallback } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { motion } from "framer-motion";
import { Lock, Fingerprint, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { biometricService } from "@/services/biometric.service";
import { pinService } from "@/services/pin.service";
import { useVaultStore } from "@/store/vault.store";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import NotesDashboard from "@/features/notes/components/NotesDashboard";
import { ProposalOverlay } from "@/features/proposal/components/ProposalOverlay";

interface BiometricGuardProps {
  children: React.ReactNode;
}

const BiometricGuard = ({ children }: BiometricGuardProps) => {
  const { isLocked, unlockVault, showLockPrompt } = useVaultStore();
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const PIN_LENGTH = 4;

  useEffect(() => {
    const getEmail = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email);
    };
    getEmail();
  }, []);

  // Listen for App State changes (Background/Foreground)
  useEffect(() => {
    const handleAppStateChange = async (state: { isActive: boolean }) => {
      if (!state.isActive) {
        // App went to background - LOCK and FORCE PROMPT on return
        useVaultStore.setState({ isLocked: true, showLockPrompt: true });
      }
    };

    const listener = CapacitorApp.addListener(
      "appStateChange",
      handleAppStateChange,
    );
    return () => {
      listener.then((remove) => remove.remove());
    };
  }, []);

  const attemptBiometric = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const available = await biometricService.checkAvailability();
      if (!available.available) {
        setShowPinFallback(true);
        return;
      }

      const verified = await biometricService.verifyIdentity();
      if (verified) {
        unlockVault();
      } else {
        // Failed or cancelled
      }
    } catch (err) {
      console.error("Biometric error:", err);
      // Don't show pin fallback immediately on cancel, only on error
      // setShowPinFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [unlockVault]);

  // Trigger biometric if requested and not showing PIN
  useEffect(() => {
    if (isLocked && showLockPrompt && !showPinFallback) {
      attemptBiometric();
    }
  }, [isLocked, showLockPrompt, showPinFallback, attemptBiometric]);

  // Check lockout status on mount
  useEffect(() => {
    if (showPinFallback) {
      pinService.getLockoutRemaining().then(setLockoutRemaining);
    }
  }, [showPinFallback]);

  const handleDigit = (digit: string) => {
    if (lockoutRemaining > 0 || pin.length >= PIN_LENGTH) return;
    setError("");
    setPin((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setError("");
    setPin((prev) => prev.slice(0, -1));
  };

  // Verify PIN when length reached
  useEffect(() => {
    const verify = async () => {
      if (pin.length === PIN_LENGTH) {
        setIsLoading(true);
        try {
          const result = await pinService.verifyPin(pin);

          if (result.valid) {
            unlockVault();
            setPin("");
          } else {
            setError("PIN incorrecto");
            triggerShake();
            setPin("");

            if (result.forceLogout) {
              await supabase.auth.signOut();
              window.location.reload();
              return;
            }

            const remaining = await pinService.getLockoutRemaining();
            if (remaining > 0) {
              setLockoutRemaining(remaining);
            }
          }
        } catch {
          setError("Error verificando PIN");
        } finally {
          setIsLoading(false);
        }
      }
    };

    verify();
  }, [pin, unlockVault]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleCancel = () => {
    // Hide the prompt, returning to the Facade (Notes)
    useVaultStore.setState({ showLockPrompt: false });
  };

  const handleChangeUser = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Secret Facade: Render plain notes when locked (without prompt) */}
      <ProposalOverlay />
      <NotesDashboard />

      {/* Overlay: Only show if prompt is requested */}
      {showLockPrompt && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-background/95 backdrop-blur-xl transition-all duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm mx-4"
          >
            {/* Glass Container */}
            <div className="relative overflow-hidden rounded-3xl glass-dirty border border-white/10 p-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Lock Icon */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4"
                >
                  <Lock className="h-8 w-8 text-primary" />
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Acceso Seguro
                </h2>
                {userEmail && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {userEmail}
                  </p>
                )}

                {!showPinFallback ? (
                  // Biometric prompt
                  <>
                    <div className="w-full space-y-3 mt-4">
                      <Button
                        onClick={attemptBiometric}
                        disabled={isLoading}
                        className="w-full h-14 rounded-xl bg-primary/20 border border-primary/30 hover:bg-primary/30 text-foreground font-medium"
                      >
                        <Fingerprint className="h-5 w-5 mr-2" />
                        Usar Biometría
                      </Button>
                      <Button
                        onClick={() => setShowPinFallback(true)}
                        variant="ghost"
                        className="w-full h-12 rounded-xl border border-white/10 hover:bg-muted/30"
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Usar PIN
                      </Button>
                    </div>

                    <div className="pt-8 flex items-center justify-between px-2 w-full">
                      <button
                        onClick={handleCancel}
                        className="text-sm text-muted-foreground hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleChangeUser}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      >
                        <span className="text-lg">↳</span> Cambiar Usuario
                      </button>
                    </div>
                  </>
                ) : (
                  // PIN fallback
                  <>
                    <p className="text-sm text-muted-foreground mb-6">
                      Ingresa tu PIN
                    </p>

                    {/* PIN Dots */}
                    <motion.div
                      animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className="flex gap-4 mb-6"
                    >
                      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-4 h-4 rounded-full border-2 transition-all duration-200",
                            pin.length > i
                              ? "bg-primary border-primary"
                              : "border-primary/40 bg-transparent",
                          )}
                        />
                      ))}
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                      <p className="text-destructive text-sm mb-4">{error}</p>
                    )}

                    {/* Lockout Timer */}
                    {lockoutRemaining > 0 && (
                      <div className="text-amber-500 text-sm mb-4">
                        Bloqueado por {lockoutRemaining}s
                      </div>
                    )}

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <motion.button
                          key={num}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDigit(String(num))}
                          disabled={isLoading || lockoutRemaining > 0}
                          className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-semibold",
                            "bg-muted/30 border border-primary/20 text-foreground",
                            "hover:bg-primary/20 hover:border-primary/40 transition-all duration-200",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                          )}
                        >
                          {num}
                        </motion.button>
                      ))}
                      <div className="h-14 w-14" />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDigit("0")}
                        disabled={isLoading || lockoutRemaining > 0}
                        className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-semibold",
                          "bg-muted/30 border border-primary/20 text-foreground",
                          "hover:bg-primary/20 hover:border-primary/40 transition-all duration-200",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                        )}
                      >
                        0
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBackspace}
                        disabled={isLoading}
                        className="h-14 w-14 rounded-2xl flex items-center justify-center text-foreground hover:bg-muted/20"
                      >
                        ⌫
                      </motion.button>
                    </div>

                    {/* Back to biometric */}
                    <Button
                      onClick={() => {
                        setShowPinFallback(false);
                        attemptBiometric();
                      }}
                      variant="ghost"
                      className="mt-4 text-muted-foreground"
                    >
                      Usar biometría
                    </Button>

                    <div className="pt-8 flex items-center justify-between px-2 w-full">
                      <button
                        onClick={handleCancel}
                        className="text-sm text-muted-foreground hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleChangeUser}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      >
                        <span className="text-lg">↳</span> Cambiar Usuario
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default BiometricGuard;
