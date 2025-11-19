import { toast } from "sonner";
import type { AchievementID } from "@/schemas/vault";

// Toaster is already rendered in main.tsx via src/components/ui/sonner.tsx
// We don't need another instance here.

export const showAchievementToast = (achievementId: AchievementID) => {
  toast.success("¡Logro Desbloqueado!", {
    description: achievementId,
  });
};
