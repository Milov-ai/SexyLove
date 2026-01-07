import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useVaultStore } from "@/store/vault.store";

interface CrudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: string[];
  onAdd: (item: string) => Promise<void>;
  onEdit: (oldItem: string, newItem: string) => Promise<void>;
  onDelete: (item: string) => Promise<void>;
}

export function CrudModal({
  open,
  onOpenChange,
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
}: CrudModalProps) {
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { syncWithSupabase } = useVaultStore();

  useEffect(() => {
    if (open) {
      syncWithSupabase();
    }
  }, [open, syncWithSupabase]);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd(newItem.trim());
      setNewItem("");
      toast.success("Elemento añadido correctamente");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al añadir elemento";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (item: string) => {
    if (!editValue.trim() || editValue === item) {
      setEditingItem(null);
      return;
    }
    setIsSubmitting(true);
    try {
      await onEdit(item, editValue.trim());
      setEditingItem(null);
      toast.success("Elemento actualizado");
    } catch {
      toast.error("Error al actualizar elemento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: string) => {
    // Confirmation is handled by the parent component via onDelete
    try {
      await onDelete(item);
      // We don't show success toast here because the actual delete happens after the second modal confirmation
      // But wait, onDelete in HomePage just opens the modal. It doesn't delete yet.
      // So this try/catch block is actually just opening the modal.
      // The actual delete happens in HomePage's confirmDelete.
    } catch {
      toast.error("Error al iniciar eliminación");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-muted-foreground">
            Gestiona tus opciones personalizadas para {title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Nuevo elemento..."
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={isSubmitting}
            />
            <Button
              onClick={handleAdd}
              disabled={!newItem.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-muted-foreground text-sm italic">
                No hay elementos. ¡Añade uno!
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 group hover:border-primary/20 transition-all"
                >
                  {editingItem === item ? (
                    <div className="flex gap-2 flex-1 mr-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 bg-white dark:bg-black/20 text-slate-900 dark:text-white border-slate-200 dark:border-transparent"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(item)}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                        onClick={() => handleEdit(item)}
                        disabled={isSubmitting}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingItem(null)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 dark:text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditingItem(item);
                            setEditValue(item);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 dark:text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
