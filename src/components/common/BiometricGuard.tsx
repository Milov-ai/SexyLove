import { useEffect, useState, useCallback } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Fingerprint, LogOut, NotebookText } from "lucide-react";
import { cn } from "@/lib/utils";
import { biometricService } from "@/services/biometric.service";
import { pinService } from "@/services/pin.service";
import { useVaultStore } from "@/store/vault.store";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import NotesDashboard from "@/features/notes/components/NotesDashboard";
import PinSetup from "@/features/auth/components/PinSetup";
import { useSecurityMonitor } from "@/hooks/useSecurityMonitor";

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

  const [biometricFailures, setBiometricFailures] = useState(0);
  const [isPinSetupRequired, setIsPinSetupRequired] = useState(false);

  // SECURITY: Detect DOM tampering (only when overlay is visible)
  useSecurityMonitor({
    targetSelector: "[data-security-overlay]",
    enabled: showLockPrompt, // Only monitor when overlay is showing
    onTamperDetected: () => {
      console.error("[BiometricGuard] TAMPERING DETECTED!");
    },
  });

  const PIN_LENGTH = 4;

  useEffect(() => {
    if (biometricFailures > 0)
      console.log("Biometric failures:", biometricFailures);
  }, [biometricFailures]);

  // Check if PIN exists on mount
  useEffect(() => {
    const checkPin = async () => {
      // Only check if we are locked and actually logged in
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const hasPin = await pinService.hasPin();
        if (!hasPin) {
          setIsPinSetupRequired(true);
        }
      }
    };
    checkPin();
  }, []);

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
        // App went to background - SILENT LOCK (Facade Mode)
        // User must triple-click again to enter.
        useVaultStore.setState({ isLocked: true, showLockPrompt: false });
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
    // If PIN setup is required, do NOT attempt biometric
    if (isPinSetupRequired) return;

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
        setBiometricFailures(0);
        unlockVault();
      } else {
        // Increment failure counter
        setBiometricFailures((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            // Auto-switch to PIN after 3 failures
            setShowPinFallback(true);
            return 0; // Reset counter after switching
          }
          return newCount;
        });
      }
    } catch (err) {
      console.error("Biometric error:", err);
      // On actual error (not just user cancellation), increment failure too
      setBiometricFailures((prev) => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setShowPinFallback(true);
          return 0;
        }
        return newCount;
      });
    } finally {
      setIsLoading(false);
    }
  }, [unlockVault, isPinSetupRequired]);

  // Trigger biometric if requested and not showing PIN
  useEffect(() => {
    if (isLocked && showLockPrompt && !showPinFallback && !isPinSetupRequired) {
      // Logic for intelligent prompt:
      // If we are within timeout window, we still want to trigger biometric automatically.
      // But we might want to hide the "Use PIN" button content-wise.
      // The requirement says: "Re-entry within 5 min sets: Biometric only (no PIN screen)"
      // Actually, BiometricGuard logic currently shows both buttons or PIN screen.
      // We will adjust the RENDERING based on shouldRequireFullAuth.
      // But we still ALWAYS attempt biometric on mount if locked.
      attemptBiometric();
    }
  }, [
    isLocked,
    showLockPrompt,
    showPinFallback,
    attemptBiometric,
    isPinSetupRequired,
  ]);

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

  // Countdown Timer for Lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;

    const interval = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutRemaining]);

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

  const handleChangeUser = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handlePinSetupSuccess = () => {
    setIsPinSetupRequired(false);
    unlockVault();
  };

  // FORCE PIN SETUP IF REQUIRED (High Priority - Overrides Lock State)
  if (isPinSetupRequired) {
    return <PinSetup onSuccess={handlePinSetupSuccess} />;
  }

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
            data-security-overlay
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-md transition-all duration-500"
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              console.log("[BiometricGuard] Overlay backdrop click blocked");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BLOCK 1: HEADER (Floating Pill) */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-violet-500/30 px-8 py-4 flex items-center gap-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                >
                  <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">
                    Bóveda Segura
                  </span>
                  {userEmail && (
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wider">
                      {userEmail.split("@")[0]}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* BLOCK 2: AUTH DISPLAY (Floating Card) */}
              <div className="w-full relative group z-20">
                {/* Violet Glow Halo */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/40 via-purple-500/40 to-violet-600/40 rounded-[34px] opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-1000 animate-pulse-aura pointer-events-none" />

                <div className="relative overflow-hidden rounded-[32px] bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-violet-500/20 p-6 shadow-[0_0_40px_rgba(139,92,246,0.15)] transition-all duration-500">
                  {/* Background Elements */}
                  <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-violet-600/20 blur-[60px] rounded-full pointer-events-none" />

                  <div className="relative z-10 min-h-[160px] flex flex-col justify-center items-center">
                    {!showPinFallback ? (
                      <motion.div
                        key="biometric"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-6 py-4"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-violet-500/30 blur-xl rounded-full animate-pulse" />
                          <Button
                            onClick={attemptBiometric}
                            disabled={isLoading}
                            className="w-24 h-24 rounded-full bg-white/50 dark:bg-black/50 border-2 border-violet-500/50 text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white hover:scale-105 hover:border-violet-400 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.3)] z-10 p-0 grid place-items-center"
                          >
                            <Fingerprint className="h-10 w-10" />
                          </Button>
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Autenticación Biométrica
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                            Pulsa el icono para verificar identidad
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pin-display"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full flex flex-col items-center justify-center gap-6"
                      >
                        <div className="text-center">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600/80 dark:text-violet-300/80">
                            Introduce PIN
                          </h3>
                        </div>

                        {/* PIN Dots */}
                        <motion.div
                          animate={
                            isShaking ? { x: [-10, 10, -10, 10, 0] } : {}
                          }
                          transition={{ duration: 0.4 }}
                          className="flex justify-center gap-4"
                        >
                          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-4 h-4 rounded-full border-2 transition-all duration-300 shadow-md",
                                pin.length > i
                                  ? "bg-violet-500 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.8)] scale-110"
                                  : "border-slate-300 dark:border-white/10 bg-white/50 dark:bg-black/40",
                              )}
                            />
                          ))}
                        </motion.div>

                        {/* Error Message */}
                        <div className="h-8 flex items-center justify-center w-full">
                          <AnimatePresence mode="wait">
                            {error && (
                              <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-300 text-[10px] font-bold py-1 px-3 rounded-full"
                              >
                                {error}
                              </motion.div>
                            )}
                            {lockoutRemaining > 0 && (
                              <motion.div
                                key="lockout"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-300 text-[10px] font-bold py-1 px-3 rounded-full"
                              >
                                Bloqueado por {lockoutRemaining}s
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOCK 3: FLOATING NUMPAD (Detached Keys) */}
              <AnimatePresence>
                {showPinFallback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full z-10"
                  >
                    <div className="grid grid-cols-3 gap-6 px-4 justify-items-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 + 0.1 }}
                          key={num}
                          whileTap={{
                            scale: 0.9,
                            backgroundColor: "rgba(139,92,246,0.2)",
                          }}
                          onClick={() => handleDigit(String(num))}
                          disabled={isLoading || lockoutRemaining > 0}
                          className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold bg-white/40 dark:bg-black/40 border border-violet-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:bg-violet-600/20 hover:border-violet-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all text-slate-800 dark:text-white active:shadow-inner"
                        >
                          {num}
                        </motion.button>
                      ))}
                      {/* Empty Slot Left */}
                      <div />

                      {/* Zero */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        whileTap={{
                          scale: 0.9,
                          backgroundColor: "rgba(139,92,246,0.2)",
                        }}
                        onClick={() => handleDigit("0")}
                        disabled={isLoading || lockoutRemaining > 0}
                        className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold bg-white/40 dark:bg-black/40 border border-violet-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:bg-violet-600/20 hover:border-violet-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all text-slate-800 dark:text-white active:shadow-inner"
                      >
                        0
                      </motion.button>

                      {/* Backspace */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45 }}
                        whileTap={{ scale: 0.9, x: -5 }}
                        onClick={handleBackspace}
                        disabled={isLoading}
                        className="h-16 w-16 rounded-full flex items-center justify-center text-violet-600/50 dark:text-violet-300/50 hover:text-red-400 transition-colors"
                      >
                        <span className="text-2xl font-light">⌫</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BLOCK 4: ACTIONS (Floating Pill) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-full bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-violet-500/20 px-6 py-3 flex items-center gap-4 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
              >
                <button
                  onClick={handleChangeUser}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Salir
                  </span>
                </button>

                <div className="w-[1px] h-8 bg-slate-300 dark:bg-white/10" />

                {!showPinFallback ? (
                  <button
                    onClick={() => setShowPinFallback(true)}
                    className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider transition-all border border-black/5 dark:border-white/5"
                  >
                    Usar PIN
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowPinFallback(false);
                      attemptBiometric();
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider transition-all border border-violet-500/30"
                  >
                    Biometría
                  </button>
                )}

                <div className="w-[1px] h-8 bg-slate-300 dark:bg-white/10" />

                <button
                  onClick={handleCancel}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-violet-500/20 text-slate-500 dark:text-zinc-400 hover:text-violet-500 transition-colors"
                >
                  <NotebookText className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Notas
                  </span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BiometricGuard;
