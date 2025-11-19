import type { Vault, Lugar, Entrada } from "@/schemas/vault";
import { AchievementID } from "@/schemas/vault";

export const computeAchievements = (vault: Vault): AchievementID[] => {
  const unlocked: AchievementID[] = [];

  // Example: FIRST_FIVE_STAR_ENTRY
  const fiveStarEntries = vault.lugares.flatMap((lugar: Lugar) =>
    (lugar.entradas || []).filter((entrada: Entrada) => {
      return entrada.rating === 5;
    }),
  );
  if (fiveStarEntries.length > 0) {
    unlocked.push(AchievementID.FIRST_FIVE_STAR_ENTRY);
  }

  // Example: FIFTH_VISIT_SAME_PLACE
  const visitCounts: { [key: string]: number } = {};
  vault.lugares.forEach((lugar: Lugar) => {
    visitCounts[lugar.id] = (lugar.entradas || []).length;
  });
  for (const lugarId in visitCounts) {
    if (visitCounts[lugarId] >= 5) {
      unlocked.push(AchievementID.FIFTH_VISIT_SAME_PLACE);
      break;
    }
  }

  return unlocked;
};
