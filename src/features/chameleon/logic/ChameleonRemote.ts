import { supabase } from "@/lib/supabase";
import { ChameleonManager, type AliasType } from "../ChameleonManager";
import { toast } from "sonner";

export const ChameleonRemote = {
  /**
   * Subscribes to Realtime changes on the 'app_settings' table.
   * When 'global_identity' changes, it updates the local app icon.
   */
  subscribe: () => {
    console.log("[ChameleonRemote] Subscribing to global identity...");

    // Initial Fetch
    ChameleonRemote.sync();

    supabase
      .channel("global-chameleon")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_settings",
          filter: "key=eq.global_identity",
        },
        (payload) => {
          console.log("[ChameleonRemote] Realtime Payload:", payload);
          const newRecord = payload.new as { key: string; value: string };
          if (newRecord && newRecord.value) {
            ChameleonManager.setIdentity(newRecord.value as AliasType);
            toast.info(
              `Identidad Global Actualizada: ${newRecord.value.replace("Alias", "")}`,
            );
          }
        },
      )
      .subscribe();
  },

  /**
   * Fetches the current global identity and applies it.
   */
  sync: async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "global_identity")
        .single();

      if (error) {
        // Table might not exist yet
        console.warn(
          "[ChameleonRemote] Sync failed (Table missing?):",
          error.message,
        );
        return;
      }

      if (data && data.value) {
        ChameleonManager.setIdentity(data.value as AliasType);
      }
    } catch (err) {
      console.error("[ChameleonRemote] Sync error:", err);
    }
  },

  /**
   * Updates the Global Identity in Supabase.
   * This will trigger the realtime listener on ALL devices.
   */
  setGlobalIdentity: async (alias: AliasType) => {
    // Optimistic local update
    ChameleonManager.setIdentity(alias);

    // Remote update
    const { error } = await supabase
      .from("app_settings")
      .upsert({
        key: "global_identity",
        value: alias,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("[ChameleonRemote] Update failed:", error);
      toast.error("Error al sincronizar identidad global.");
      throw error;
    }

    toast.success("Camaleón Global Activado");
  },
};
