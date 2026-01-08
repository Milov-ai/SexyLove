import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft, Stars, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import { BrandLogo } from "@/components/common/BrandLogo";

interface AuthScreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthScreen = ({ open, onOpenChange }: AuthScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Reset state on open
  useEffect(() => {
    if (open) {
      setIsSuccess(false);
      setShowResend(false);
      setActiveTab("login");
      setError(null);
    }
  }, [open]);

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResend(false);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Force vault store to re-initialize after login & Auto-Unlock
      // Use backgroundSync: true to avoid waiting for heavy data sync (instant unlock)
      // Use autoLock: false to enter vault immediately
      const { initialize } = await import("@/store/vault.store").then((m) => ({
        initialize: m.useVaultStore.getState().initialize,
      }));
      await initialize({ autoLock: false, backgroundSync: true });

      // EXPLICIT UNLOCK is handled by autoLock: false, but calling it ensures state consistency
      // unlockVault(); // Redundant now

      onOpenChange(false);
      toast.success("¡Bienvenido de nuevo!", {
        icon: "✨",
        style: {
          background: "#0f0f12",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        },
      });
    } catch (error: unknown) {
      console.error(error);
      const err = error as { message?: string; status?: number };
      if (err.message?.includes("Email not confirmed")) {
        setError("Correo no confirmado. Por favor revisa tu bandeja.");
        setShowResend(true);
      } else if (err.status === 429) {
        setError("Demasiados intentos. Espera un momento.");
      } else {
        setError("Credenciales incorrectas.");
      }
      toast.error("Error de acceso");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Verify Access Code
      const { data: codes, error: codeError } = await supabase
        .from("access_codes")
        .select("id")
        .eq("code", accessCode)
        .eq("is_active", true)
        .single();

      if (codeError || !codes) {
        setError("Código de acceso inválido.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username,
          updated_at: new Date().toISOString(),
        });
        if (profileError) console.error("Error saving profile:", profileError);
      }

      setIsSuccess(true);
      toast.success("¡Cuenta creada!", { icon: "🥂" });
    } catch (error: unknown) {
      console.error(error);
      const err = error as { message?: string; status?: number };
      setError(err.message || "Error al registrarse");
      toast.error("Error de registro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      toast.success("Correo enviado.");
      setShowResend(false);
    } catch {
      toast.error("Error al reenviar correo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md flex flex-col items-center justify-center p-4"
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            >
              <CheckCircle2 className="h-12 w-12 text-green-500 drop-shadow-lg" />
            </motion.div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ¡Bienvenido!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Tu identidad ha sido verificada correctamente.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl bg-muted/20 border-border hover:bg-accent text-foreground transition-all hover:scale-[1.02] backdrop-blur-md"
              onClick={() => setIsSuccess(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // RENDER: Use Fixed Overlay instead of Dialog to guarantee transparency
  // This matches the architecture of BiometricGuard.tsx exactly.
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        >
          {/* BLOCK 1: HEADER (Cloned from BiometricGuard) */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="mb-12 relative z-50"
          >
            <div className="relative group cursor-default">
              {/* Outer Glass Shell */}
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative flex items-center gap-3 px-6 py-2.5 bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:bg-white/15 dark:group-hover:bg-black/50 group-hover:border-violet-500/30 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]">
                {/* Icon Container with Rotate Animation */}
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 shadow-inner group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out">
                  <Lock className="w-4 h-4 text-white drop-shadow-md" />
                </div>

                {/* Text with Gradient */}
                <span className="text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:from-violet-400 group-hover:to-indigo-400 transition-all duration-300">
                  Bóveda Segura
                </span>
              </div>
            </div>
          </motion.div>

          {/* BLOCK 2: FLOATING LEGO BLOCKS (Deconstructed Form) */}
          <div
            className="w-full max-w-[320px] flex flex-col gap-6 z-40 pointer-events-auto items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Tabs
              defaultValue="login"
              className="w-full flex flex-col items-center gap-6"
              onValueChange={setActiveTab}
            >
              {/* LEGO 1: Tabs Pill (Matches Action Buttons in BiometricGuard) */}
              <TabsList className="grid w-full grid-cols-2 bg-white/60 dark:bg-black/60 backdrop-blur-xl p-1.5 rounded-full border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)] h-14">
                <TabsTrigger
                  value="login"
                  className="rounded-full data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 data-[state=active]:border-violet-500/30 border border-transparent transition-all duration-300 text-[10px] font-bold uppercase tracking-wider h-full"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-full data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 data-[state=active]:border-violet-500/30 border border-transparent transition-all duration-300 text-[10px] font-bold uppercase tracking-wider h-full"
                >
                  Registro
                </TabsTrigger>
              </TabsList>

              <div className="w-full min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <TabsContent
                      value="login"
                      className="mt-0 space-y-5 w-full"
                    >
                      <form
                        onSubmit={handleLogin}
                        className="flex flex-col gap-5 w-full"
                      >
                        {/* LEGO 2: Email Field */}
                        <motion.div
                          className="group relative"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="absolute inset-x-6 top-0 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                            <span className="bg-white/90 dark:bg-black/90 px-3 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-300 uppercase tracking-widest rounded-full border border-violet-500/20 shadow-sm backdrop-blur-md">
                              Email
                            </span>
                          </div>
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 rounded-full bg-white/40 dark:bg-black/40 border-violet-500/20 focus:border-violet-500/50 focus:bg-white/60 dark:focus:bg-black/60 transition-all text-center text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] focus:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                            required
                          />
                        </motion.div>

                        {/* LEGO 3: Password Field */}
                        <motion.div
                          className="group relative"
                          initial={{ x: 10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="absolute inset-x-6 top-0 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                            <span className="bg-white/90 dark:bg-black/90 px-3 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-300 uppercase tracking-widest rounded-full border border-violet-500/20 shadow-sm backdrop-blur-md">
                              Contraseña
                            </span>
                          </div>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 rounded-full bg-white/40 dark:bg-black/40 border-violet-500/20 focus:border-violet-500/50 focus:bg-white/60 dark:focus:bg-black/60 transition-all text-center text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] focus:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                            required
                          />
                        </motion.div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-200 text-[9px] font-bold uppercase tracking-wider text-center backdrop-blur-md"
                          >
                            {error}
                          </motion.div>
                        )}

                        {showResend && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-[10px] text-violet-600 dark:text-violet-400 hover:text-violet-700 h-8 rounded-full hover:bg-violet-500/10 uppercase tracking-wider font-bold"
                            onClick={handleResendConfirmation}
                            disabled={isLoading}
                          >
                            Reenviar confirmación
                          </Button>
                        )}

                        {/* LEGO 4: Action Button (Matches "Biometrics" Button) */}
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button
                            type="submit"
                            className="w-full h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-black text-xs shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.02] active:scale-95 border border-violet-400/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <span>Abrir Bóveda</span>
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </TabsContent>

                    <TabsContent
                      value="register"
                      className="mt-0 space-y-5 w-full"
                    >
                      <form
                        onSubmit={handleSignUp}
                        className="flex flex-col gap-4 w-full"
                      >
                        {/* LEGO: Code */}
                        <motion.div
                          className="group relative"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="absolute inset-x-6 top-0 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                            <span className="bg-white/90 dark:bg-black/90 px-3 py-0.5 text-[9px] font-bold text-violet-600 dark:text-violet-300 uppercase tracking-widest rounded-full border border-violet-500/20 shadow-sm backdrop-blur-md">
                              Código Secreto
                            </span>
                          </div>
                          <div className="relative">
                            <Input
                              placeholder="CODE"
                              value={accessCode}
                              onChange={(e) => setAccessCode(e.target.value)}
                              className="h-12 rounded-full bg-white/40 dark:bg-black/40 border-violet-500/20 focus:border-violet-500/50 focus:bg-white/60 dark:focus:bg-black/60 transition-all text-center text-sm font-mono tracking-[0.2em] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] focus:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                              required
                            />
                            <Stars className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 opacity-50 animate-pulse pointer-events-none" />
                          </div>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-4">
                          {/* LEGO: Username */}
                          <motion.div
                            className="group relative"
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Input
                              placeholder="Alias"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="h-12 rounded-full bg-white/40 dark:bg-black/40 border-violet-500/20 focus:border-violet-500/50 text-center text-sm text-slate-900 dark:text-white"
                              required
                            />
                            <div className="absolute inset-x-6 top-0 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                              <span className="bg-white/90 dark:bg-black/90 px-3 py-0.5 text-[8px] font-bold text-slate-500 uppercase tracking-wider rounded-full border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                                Usuario
                              </span>
                            </div>
                          </motion.div>

                          {/* LEGO: Email */}
                          <motion.div
                            className="group relative"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="absolute inset-x-6 top-0 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                              <span className="bg-white/90 dark:bg-black/90 px-3 py-0.5 text-[8px] font-bold text-slate-500 uppercase tracking-wider rounded-full border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                                Email
                              </span>
                            </div>
                            <Input
                              type="email"
                              placeholder="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-12 rounded-full bg-white/40 dark:bg-black/40 border-violet-500/20 focus:border-violet-500/50 text-center text-sm text-slate-900 dark:text-white"
                              required
                            />
                          </motion.div>

                          {/* LEGO: Password */}
                          <motion.div
                            className="group relative"
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="absolute inset-x-6 top-0 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                              <span className="bg-white/90 dark:bg-black/90 px-3 py-0.5 text-[8px] font-bold text-slate-500 uppercase tracking-wider rounded-full border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                                Contraseña
                              </span>
                            </div>
                            <Input
                              type="password"
                              placeholder="Contraseña"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="h-12 rounded-full bg-white/40 dark:bg-black/40 border-violet-500/20 focus:border-violet-500/50 text-center text-sm text-slate-900 dark:text-white"
                              required
                            />
                          </motion.div>
                        </div>

                        {error && (
                          <div className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-200 text-[9px] font-bold uppercase tracking-wider text-center backdrop-blur-md">
                            {error}
                          </div>
                        )}

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Button
                            type="submit"
                            className="w-full h-12 rounded-full bg-white/80 dark:bg-black/40 hover:bg-violet-500/20 border border-violet-500/30 text-slate-900 dark:text-white font-bold text-xs transition-all hover:scale-[1.02] disabled:opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-widest"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Crear Identidad"
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthScreen;
