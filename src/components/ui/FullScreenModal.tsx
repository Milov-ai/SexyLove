import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface FullScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

const FullScreenModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: FullScreenModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-screen w-screen max-h-screen md:h-[80vh] md:w-[80vw] md:max-h-[80vh]">
        <DialogHeader className="p-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-4">{children}</div>
        <DialogFooter className="p-4">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenModal;
