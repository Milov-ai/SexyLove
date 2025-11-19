import { useState } from "react";
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
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

interface AuthScreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthScreen = ({ open, onOpenChange }: AuthScreenProps) => {
  // const { initialize } = useVaultStore();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResend(false);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // initialize() is called automatically by the onAuthStateChange listener in the store
      // But we can call it here to be safe if the listener is slow
      // await initialize();
      onOpenChange(false);
      toast.success("¡Bienvenido de nuevo!");
    } catch (error: unknown) {
      console.error(error);
      const err = error as { message?: string; status?: number };
      if (err.message?.includes("Email not confirmed")) {
        toast.error(
          "Correo no confirmado. Por favor revisa tu bandeja de entrada.",
        );
        setShowResend(true);
      } else if (err.status === 429) {
        toast.error("Demasiados intentos. Por favor espera un momento.");
      } else {
        toast.error(err.message || "Error al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Verify Access Code
      const { data: codes, error: codeError } = await supabase
        .from("access_codes")
        .select("id")
        .eq("code", accessCode)
        .eq("is_active", true)
        .single();

      if (codeError || !codes) {
        toast.error("Código de acceso inválido.");
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

      // ... profile creation ...

      if (data.user) {
        // We can't insert if the trigger already did it, so we upsert or update.
        // Ideally, we rely on the metadata passed in options.data if we have a trigger setup to use it.
        // Let's assume for now we might need to manually ensure it's set if no trigger exists.
        // Checking if we can write to profiles:
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username,
          updated_at: new Date().toISOString(),
        });
        if (profileError) {
          console.error("Error saving profile:", profileError);
          // Don't block success if profile fails, but log it.
        }
      }

      setIsSuccess(true);
      toast.success("¡Cuenta creada exitosamente!");
    } catch (error: unknown) {
      console.error(error);
      const err = error as { message?: string; status?: number };
      if (err.status === 429) {
        toast.error(
          "Demasiados intentos de registro. Por favor espera un momento.",
        );
      } else {
        toast.error(err.message || "Error al registrarse");
      }
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
      toast.success("Correo de confirmación reenviado.");
      setShowResend(false);
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err.status === 429) {
        toast.error("Espera unos segundos antes de reenviar.");
      } else {
        toast.error("Error al reenviar correo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] bg-slate-950 text-slate-50 border-slate-800">
          <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              ¡Revisa tu correo!
            </DialogTitle>
            <DialogDescription className="text-slate-400 max-w-[280px]">
              Hemos enviado un enlace de confirmación a{" "}
              <span className="font-medium text-slate-200">{email}</span>.
            </DialogDescription>
            <p className="text-sm text-slate-500">
              Haz clic en el enlace para activar tu cuenta y luego inicia
              sesión.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-slate-700 hover:bg-slate-900"
              onClick={() => setIsSuccess(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-slate-950 text-slate-50 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            Acceso Privado
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            Ingresa tus credenciales para acceder a tu bóveda segura.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Correo electrónico</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">Contraseña</Label>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-800"
                  required
                />
              </div>

              {showResend && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm text-pink-400 hover:text-pink-300"
                  onClick={handleResendConfirmation}
                  disabled={isLoading}
                >
                  ¿No recibiste el correo? Reenviar confirmación
                </Button>
              )}

              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Código de Acceso</Label>
                <Input
                  id="access-code"
                  type="text"
                  placeholder="Código secreto"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="bg-slate-900 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username-register">Nombre de usuario</Label>
                <Input
                  id="username-register"
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-900 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">Correo electrónico</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">Contraseña</Label>
                <Input
                  id="password-register"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-800"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Crear Cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthScreen;
