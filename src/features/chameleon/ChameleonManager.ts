import { registerPlugin, Capacitor } from "@capacitor/core";

export interface ChameleonPlugin {
  setAlias(options: { alias: string }): Promise<void>;
}

const Chameleon = registerPlugin<ChameleonPlugin>("Chameleon");

export const ALIASES = [
  "AliasPideUnDeseo",
  "AliasNaaam",
  "AliasAzulinaa",
  "AliasMuaah",
  "AliasTamuu",
  "AliasKissKiss",
  "AliasUuuf",
  "AliasPlop",
  "AliasHohoho",
  "AliasWow",
  "AliasXoxo",
] as const;

export type AliasType = (typeof ALIASES)[number];

let currentIdentity: AliasType = "AliasPideUnDeseo"; // Default fallback

export const ChameleonManager = {
  /**
   * Returns the currently active identity.
   */
  getCurrentIdentity: (): AliasType => {
    return currentIdentity;
  },

  /**
   * Switches the App Icon and Name using Native Android Activity Aliases.
   * @param aliasName The name of the alias to enable (e.g., 'AliasAzulinaa')
   */
  setIdentity: async (aliasName: AliasType) => {
    try {
      if (Capacitor.isNativePlatform()) {
        console.log(`[Chameleon] Switching identity to: ${aliasName}`);
        currentIdentity = aliasName;
        await Chameleon.setAlias({ alias: aliasName });
        console.log(`[Chameleon] Identity switch successful.`);
      } else {
        currentIdentity = aliasName;
        console.log(
          `[Chameleon] Web platform detected. Skipping native icon switch (Simulated: ${aliasName}).`,
        );
      }
    } catch (error) {
      console.error(`[Chameleon] Failed to switch identity:`, error);
    }
  },

  /**
   * PURE RANDOM CHAOS: As requested by User.
   * Rotates through all available themes (Curious, Love, Seasonal).
   */
  switchRandom: async () => {
    const randomIndex = Math.floor(Math.random() * ALIASES.length);
    const target = ALIASES[randomIndex];

    console.log(`[Chameleon] Random Rotation -> ${target}`);
    await ChameleonManager.setIdentity(target);
  },
};
