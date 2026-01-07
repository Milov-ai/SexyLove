import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft, Stars } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/common/BrandLogo";

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

      // Force vault store to re-initialize after login
      const { initialize } = await import("@/store/vault.store").then((m) => ({
        initialize: m.useVaultStore.getState().initialize,
      }));
      await initialize();

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] border-none bg-transparent shadow-none p-0 !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%]">
          <div className="relative overflow-hidden rounded-[32px] glass-dirty border border-white/10 p-8 flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="p-4 bg-green-500/10 rounded-full mb-6 border border-green-500/20"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            </motion.div>

            <DialogTitle className="text-2xl font-black mb-2 text-foreground">
              ¡Revisa tu correo!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground max-w-[280px] mb-6">
              Hemos enviado un enlace mágico a{" "}
              <span className="text-primary">{email}</span>
            </DialogDescription>

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl bg-muted/20 border-border hover:bg-accent text-foreground transition-all hover:scale-[1.02] backdrop-blur-md"
              onClick={() => setIsSuccess(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] border-none bg-transparent shadow-none p-0 overflow-visible !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%]">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative group"
        >
          {/* Animated Glow Halo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[34px] opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-1000 animate-pulse-glow" />

          <div className="relative overflow-hidden rounded-[32px] glass-dirty border border-white/10 p-8 shadow-2xl backdrop-blur-2xl">
            {/* Top Shine Accent */}
            <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <DialogHeader className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <BrandLogo
                  size={64}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>

              <div className="text-center space-y-1">
                <DialogTitle className="text-3xl font-black tracking-tighter text-foreground drop-shadow-sm">
                  Sex&Love
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium tracking-wide text-xs uppercase">
                  Acceso Privado a la Bóveda
                </DialogDescription>
              </div>
            </DialogHeader>

            <Tabs
              defaultValue="login"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-2xl mb-6 border border-border">
                <TabsTrigger
                  value="login"
                  className="rounded-xl data-[state=active]:bg-background/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground transition-all duration-300"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-xl data-[state=active]:bg-background/80 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground transition-all duration-300"
                >
                  Registro
                </TabsTrigger>
              </TabsList>

              <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{
                      opacity: 0,
                      x: activeTab === "login" ? -20 : 20,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="login" className="mt-0 space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                            Email
                          </Label>
                          <div className="relative group/input">
                            <Input
                              type="email"
                              placeholder="tu@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-12 bg-muted/10 border-border rounded-xl focus:border-primary/50 focus:bg-muted/20 transition-all text-foreground placeholder:text-muted-foreground/30 pl-4"
                              required
                            />
                            <div className="absolute inset-0 rounded-xl ring-1 ring-border/0 group-hover/input:ring-border/40 pointer-events-none transition-all" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                            Contraseña
                          </Label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 bg-muted/10 border-border rounded-xl focus:border-primary/50 focus:bg-muted/20 transition-all text-foreground placeholder:text-muted-foreground/30 pl-4"
                            required
                          />
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center"
                          >
                            {error}
                          </motion.div>
                        )}

                        {showResend && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-xs text-primary hover:text-primary/80 h-auto py-1"
                            onClick={handleResendConfirmation}
                            disabled={isLoading}
                          >
                            Reenviar confirmación
                          </Button>
                        )}

                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Acceder a la Bóveda"
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register" className="mt-0 space-y-4">
                      <form onSubmit={handleSignUp} className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                            Código de Invitación
                          </Label>
                          <div className="relative">
                            <Input
                              placeholder="SECRET-CODE"
                              value={accessCode}
                              onChange={(e) => setAccessCode(e.target.value)}
                              className="h-11 bg-muted/10 border-border rounded-xl focus:border-secondary/50 focus:bg-muted/20 text-foreground placeholder:text-muted-foreground/30 font-mono tracking-widest text-center"
                              required
                            />
                            <Stars className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                              Usuario
                            </Label>
                            <Input
                              placeholder="Alias"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="h-11 bg-muted/10 border-border rounded-xl focus:border-secondary/50 text-foreground"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                              Email
                            </Label>
                            <Input
                              type="email"
                              placeholder="tu@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-11 bg-muted/10 border-border rounded-xl focus:border-secondary/50 text-foreground"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                              Contraseña
                            </Label>
                            <Input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="h-11 bg-muted/10 border-border rounded-xl focus:border-secondary/50 text-foreground"
                              required
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center">
                            {error}
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-foreground font-bold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-70 mt-2"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Crear Identidad"
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthScreen;
