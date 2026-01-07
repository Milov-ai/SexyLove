import { Preferences } from "@capacitor/preferences";

const hybridStorage = {
  getItem: async (key: string): Promise<string | null> => {
    // Try localStorage first (fast)
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(key);
      if (local) return local;
    }

    // Try Capacitor Preferences
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
    await Preferences.remove({ key });
  },
};

export default hybridStorage;
