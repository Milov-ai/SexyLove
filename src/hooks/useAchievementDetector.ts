import { useEffect } from "react";
import { useVaultStore } from "@/store/vault.store";
import { computeAchievements } from "@/services/achievement.service";

export const useAchievementDetector = () => {
  const { decryptedVault, unlockedAchievements, setUnlockedAchievements } =
    useVaultStore();

  useEffect(() => {
    if (decryptedVault) {
      const newAchievements = computeAchievements(decryptedVault);
      const newlyUnlocked = newAchievements.filter(
        (ach) => !unlockedAchievements.includes(ach),
      );

      if (newlyUnlocked.length > 0) {
        console.log("New achievements unlocked:", newlyUnlocked);
        setUnlockedAchievements([...unlockedAchievements, ...newlyUnlocked]);
      }
    }
  }, [decryptedVault, unlockedAchievements, setUnlockedAchievements]);
};
