import { useCallback } from "react";

export const useHaptics = () => {
  const triggerHaptic = useCallback(() => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(200); // Vibrate for 200ms
    } else {
      console.log("Haptic feedback not supported");
    }
  }, []);

  return { triggerHaptic };
};
