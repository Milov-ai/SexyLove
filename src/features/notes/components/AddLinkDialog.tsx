import { useState, useEffect } from "react";
import { Link2, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LinkResolver } from "@/features/notes/logic/link-resolver";

interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (link: { url: string; title?: string }) => void;
  initialText?: string;
}

export const AddLinkDialog = ({
  isOpen,
  onClose,
  onSubmit,
  initialText = "",
}: AddLinkDialogProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl("");
    }
  }, [isOpen, initialText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const meta = await LinkResolver.resolve(url);
      onSubmit({ url, title: meta.title || url }); // Assuming meta has a title property
      setUrl("");
      onClose();
      toast.success("Enlace añadido ✨");
    } catch {
      toast.error("Error al procesar el enlace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-premium border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Link2 className="text-violet-400" size={20} />
            Añadir Smart Link
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Pega un enlace de YouTube, Spotify o cualquier web.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <input
            autoFocus
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-hidden focus:border-violet-500/50 transition-colors"
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onClose()}
              className="text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!url || loading}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              Añadir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
