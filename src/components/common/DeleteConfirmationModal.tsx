import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemType: string;
  itemName: string;
  usageCount: number;
}

const DeleteConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemType,
  itemName,
  usageCount,
}: DeleteConfirmationModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-slate-200 dark:border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        <AlertDialogHeader className="pt-6">
          <AlertDialogTitle className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-500 mb-2">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              {title}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-center px-4">
              <p className="text-base text-muted-foreground leading-relaxed">
                Estás a punto de eliminar {itemType}{" "}
                <span className="font-bold text-foreground px-1.5 py-0.5 rounded bg-muted mx-1">
                  "{itemName}"
                </span>
              </p>

              {usageCount > 0 ? (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 border border-red-100 dark:border-red-900/50 text-left">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <p className="font-bold mb-1">
                        ¡Atención! Este elemento se usa en {usageCount} lugares.
                      </p>
                      <p className="opacity-90">
                        Si lo eliminas, desaparecerá de todas las entradas y
                        estadísticas asociadas.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Esta acción es irreversible y los datos no podrán recuperarse.
                </p>
              )}

              {description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {description}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="p-6 bg-slate-50/50 dark:bg-black/20 mt-4 gap-3 sm:gap-4">
          <AlertDialogCancel className="w-full sm:w-auto h-11 rounded-xl border-border hover:bg-accent text-muted-foreground hover:text-accent-foreground font-medium transition-all">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="w-full sm:w-auto h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all border-none"
          >
            {usageCount > 0 ? "Eliminar Todo" : "Sí, Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;
