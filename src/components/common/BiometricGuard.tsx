import { useEffect, useState, useCallback, useRef } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Fingerprint, KeyRound, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { biometricService } from "@/services/biometric.service";
import { pinService } from "@/services/pin.service";
import { useVaultStore } from "@/store/vault.store";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import NotesDashboard from "@/features/notes/components/NotesDashboard";

interface BiometricGuardProps {
  children: React.ReactNode;
}

const BiometricGuard = ({ children }: BiometricGuardProps) => {
  const { isLocked, unlockVault, showLockPrompt, requestPinEntry } =
    useVaultStore();
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [titleClickCount, setTitleClickCount] = useState(0);
  const clickTracker = useRef({ count: 0, lastTime: 0 });
  const [debugToast, setDebugToast] = useState("");
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

  // Watch for direct PIN entry requests (e.g. from facade triple-click)
  useEffect(() => {
    if (requestPinEntry) {
      setShowPinFallback(true);
    }
  }, [requestPinEntry]);

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
    setShowPinFallback(false);

    // Set global cooldown to prevent clicks from hitting the facade immediately
    useVaultStore.setState({
      ignoreInteractionsUntil: Date.now() + 500,
      showLockPrompt: false,
      requestPinEntry: false,
    });
  };

  // Triple-click on title exits to facade (consistent with app UX pattern)
  const handleTitleClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent clicking through to NotesDashboard
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    const now = Date.now();
    const tracker = clickTracker.current;

    // Use a very generous 2-second window for the triple-click
    if (now - tracker.lastTime < 2000) {
      tracker.count += 1;
    } else {
      tracker.count = 1;
    }

    tracker.lastTime = now;

    // Sync to state ONLY for the visual counter feedback
    setTitleClickCount(tracker.count);

    console.log(
      `[BiometricGuard] [${new Date().toISOString()}] SYNC Click. Count: ${tracker.count}`,
    );

    if (tracker.count >= 3) {
      console.log(
        `[BiometricGuard] [${new Date().toISOString()}] Triple click detected! Exiting to facade.`,
      );
      setDebugToast("¡SALIDA DETECTADA!");
      handleCancel();
      tracker.count = 0;
      setTitleClickCount(0);
    } else {
      setDebugToast(`Click ${tracker.count}/3`);
      // Hide toast after pulse
      setTimeout(() => setDebugToast(""), 1000);
    }
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
      {/* 
        CRITICAL: Capture Phase Blocker
        Instead of just pointer-events: none, we use a capture phase listener to 
        PHYSICALLY INTERCEPT and kill any click event before it reaches the facade logic.
      */}
      <div
        onClickCapture={(e) => {
          if (showLockPrompt) {
            console.log(
              `[BiometricGuard] [${new Date().toISOString()}] 🛡️ CAPTURED & KILLED click on Facade`,
            );
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }
        }}
        style={{
          // Keep visual blocking too just in case
          pointerEvents: showLockPrompt ? "none" : "auto",
        }}
      >
        <NotesDashboard isFacade={true} />
      </div>

      {/* Overlay: Only show if prompt is requested */}
      <AnimatePresence>
        {showLockPrompt && (
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-background/60 backdrop-blur-xl transition-all duration-500"
            onClick={(e) => {
              // BLOCK EVERYTHING: Prevent any click on the overlay from reaching the facade
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              console.log("[BiometricGuard] Overlay backdrop click blocked");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm mx-4"
            >
              {/* Glow Halo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 rounded-[34px] opacity-30 blur-xl animate-pulse-aura pointer-events-none" />

              {/* Glass Container */}
              <div className="relative overflow-hidden rounded-[32px] glass-dirty border border-border p-8 shadow-2xl shadow-primary/10">
                {/* Top Shine Accent */}
                <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                {/* Background Ambient Blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[90px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                  {/* Lock Icon */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    onClick={handleTitleClick}
                    className="h-20 w-20 rounded-full bg-muted/20 border border-border flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--primary),0.3)] backdrop-blur-md cursor-pointer"
                  >
                    <Lock className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  </motion.div>

                  <div
                    onClick={handleTitleClick}
                    className="p-4 -m-4 cursor-pointer z-50 select-none active:scale-95 transition-transform"
                  >
                    <h2
                      className={cn(
                        "text-3xl font-black mb-2 tracking-tight drop-shadow-md transition-colors duration-100",
                        titleClickCount > 0
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      Bóveda Segura{" "}
                      {titleClickCount > 0 && `(${titleClickCount})`}
                    </h2>
                  </div>
                  {userEmail ? (
                    <p className="text-sm font-medium text-muted-foreground mb-8 bg-muted/30 py-1 px-3 rounded-full border border-border">
                      {userEmail}
                    </p>
                  ) : (
                    <div className="mb-8" />
                  )}

                  {!showPinFallback ? (
                    // Biometric prompt
                    <motion.div
                      key="biometric"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full space-y-4"
                    >
                      <Button
                        onClick={attemptBiometric}
                        disabled={isLoading}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 border-none text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                      >
                        <Fingerprint className="h-6 w-6 mr-2" />
                        <span className="text-lg">Acceso Biométrico</span>
                      </Button>
                      <Button
                        onClick={() => setShowPinFallback(true)}
                        variant="ghost"
                        className="w-full h-12 rounded-2xl border border-border hover:bg-muted/30 text-foreground transition-all"
                      >
                        <KeyRound className="h-5 w-5 mr-2" />
                        Usar PIN
                      </Button>
                    </motion.div>
                  ) : (
                    // PIN fallback
                    <motion.div
                      key="pin"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="w-full"
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold text-center mb-6">
                        Introduce tu Código
                      </p>

                      {/* PIN Dots */}
                      <motion.div
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="flex justify-center gap-4 mb-8"
                      >
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all duration-300 shadow-md",
                              pin.length > i
                                ? "bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] scale-110"
                                : "border-border bg-transparent",
                            )}
                          />
                        ))}
                      </motion.div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-destructive/10 border border-destructive/20 text-destructive text-sm py-2 px-4 rounded-xl mb-4 text-center backdrop-blur-sm"
                          >
                            {error}
                          </motion.div>
                        )}
                        {lockoutRemaining > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-accent/20 border border-accent/30 text-accent-foreground text-sm py-2 px-4 rounded-xl mb-4 text-center backdrop-blur-sm"
                          >
                            Bloqueado por {lockoutRemaining}s
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Numpad */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <motion.button
                            key={num}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDigit(String(num))}
                            disabled={isLoading || lockoutRemaining > 0}
                            className={cn(
                              "h-16 w-full rounded-2xl flex items-center justify-center text-2xl font-bold glass-premium",
                              "text-foreground border border-border",
                              "active:bg-white/20 transition-all duration-100",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                            )}
                          >
                            {num}
                          </motion.button>
                        ))}
                        <div className="h-16 w-full" />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDigit("0")}
                          disabled={isLoading || lockoutRemaining > 0}
                          className={cn(
                            "h-16 w-full rounded-2xl flex items-center justify-center text-2xl font-bold glass-premium",
                            "text-foreground border border-border",
                            "active:bg-white/20 transition-all duration-100",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                          )}
                        >
                          0
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={handleBackspace}
                          disabled={isLoading}
                          className="h-16 w-full rounded-2xl flex items-center justify-center text-muted-foreground hover:text-foreground glass-premium border border-border active:bg-muted/30"
                        >
                          ⌫
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-2 flex items-center justify-between px-2 w-full mt-auto">
                    {!showPinFallback ? (
                      <button
                        onClick={handleChangeUser}
                        className="text-xs font-semibold text-destructive/80 hover:text-destructive uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" /> Salir
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowPinFallback(false);
                          attemptBiometric();
                        }}
                        className="text-xs font-semibold text-primary/80 hover:text-primary uppercase tracking-wider transition-colors"
                      >
                        Usar Biometría
                      </button>
                    )}

                    <button
                      onClick={handleCancel}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {debugToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200000] bg-primary text-primary-foreground px-6 py-3 rounded-full font-black shadow-[0_0_30px_rgba(var(--primary),0.5)] border-2 border-border"
          >
            {debugToast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BiometricGuard;
