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

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer. Esto eliminará permanentemente el elemento.",
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-dirty !fixed z-[100] border-white/10 text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500/80 hover:bg-red-500 text-white border-none shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
