import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-lg bg-card/20 backdrop-blur-md">
      <div className="p-4 bg-primary/10 rounded-full mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="border-border hover:bg-accent hover:text-accent-foreground"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
