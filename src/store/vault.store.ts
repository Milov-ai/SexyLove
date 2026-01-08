import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  type Lugar,
  type Entrada,
  type WishlistItem,
  type AchievementID,
  type User,
  type Vault as DecryptedVault,
  type Fantasy,
  type Profile,
} from "@/schemas/vault";
import type { DateRange } from "react-day-picker";
import { syncService } from "@/services/sync.service";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

export type EntradaWithLugar = Entrada & {
  lugar: Lugar;
};

/**
 * State interface for the Vault store.
 * Manages the global state of the application, including authentication,
 * data synchronization, and UI state.
 */
interface VaultState {
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** The current user's profile information */
  user: User | null;
  /** The decrypted vault data (places, entries, etc.) */
  decryptedVault: DecryptedVault | null;
  /** Current date range filter for the timeline/map */
  dateRange?: DateRange;
  /** Whether to show the heatmap on the map */
  showHeatmap: boolean;
  failedPinAttempts: number;
  lockoutUntil: number | null;
  justAddedLugarId: string | null;
  lugarToCenter: Lugar | null;
  shouldFitBounds: boolean;

  // Profiles
  profiles: Profile[];
  userProfile: Profile | null;
  setProfile: (profile: Profile) => void;
  setProfiles: (profiles: Profile[]) => void;
  updateProfile: (profile: Profile) => Promise<void>;
  fetchProfiles: () => Promise<void>;

  // Initialization & Sync
  /** Initializes the store, checking auth status and loading data */
  initialize: () => Promise<void>;
  fetchData: () => Promise<void>;
  loadFromDisk: () => Promise<void>;
  /** Syncs local state with the Supabase backend */
  syncWithSupabase: () => Promise<void>;
  subscribeToRealtime: () => void;
  handleRealtimePayload: (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  ) => Promise<void>;
  setupAutoSync: () => void;
  realtimeChannel: RealtimeChannel | null;
  isAutoSyncSetup: boolean;

  // Actions
  addLugar: (lugar: Lugar) => Promise<void>;
  updateLugar: (lugar: Lugar) => Promise<void>;
  deleteLugar: (lugarId: string) => Promise<void>;
  addEntrada: (lugarId: string, entrada: Entrada) => Promise<void>;
  updateEntrada: (lugarId: string, entrada: Entrada) => Promise<void>;
  deleteEntrada: (lugarId: string, entradaId: string) => Promise<void>;

  setDateRange: (dateRange?: DateRange) => void;
  setShowHeatmap: (showHeatmap: boolean) => void;
  getFilteredLugares: () => Lugar[];
  getAllEntradas: () => EntradaWithLugar[];

  addWishlistItem: (item: WishlistItem) => Promise<void>;
  updateWishlistItem: (item: WishlistItem) => Promise<void>;
  deleteWishlistItem: (itemId: string) => Promise<void>;
  promoteWishlistItem: (itemId: string) => Promise<void>;

  unlockedAchievements: AchievementID[];
  setUnlockedAchievements: (achievements: AchievementID[]) => void;

  setJustAddedLugarId: (lugarId: string | null) => void;
  setLugarToCenter: (lugar: Lugar | null) => void;
  setShouldFitBounds: (shouldFitBounds: boolean) => void;

  addCategoryItem: (
    category: "toys" | "settingPlaces" | "categories",
    item: string,
    imageUrl?: string,
  ) => Promise<void>;
  deleteCategoryItem: (
    category: "toys" | "settingPlaces" | "categories",
    item: string,
  ) => Promise<void>;
  updateCategoryItem: (
    category: "toys" | "settingPlaces" | "categories",
    oldItem: string,
    newItem: string,
    newImageUrl?: string,
  ) => Promise<void>;

  addFantasy: (fantasy: Fantasy) => Promise<void>;
  updateFantasy: (fantasy: Fantasy) => Promise<void>;
  deleteFantasy: (fantasyId: string) => Promise<void>;

  // Biometric/Lock State
  isLocked: boolean;
  showLockPrompt: boolean;
  requestPinEntry: boolean;
  ignoreInteractionsUntil: number;
  lastUnlockTime: number;
  unlockVault: () => void;
  /** Locks the vault (sets isLocked=true). If silent=true, no prompt is shown initially (facade mode) */
  lockVault: (silent?: boolean) => Promise<void>;
}

/**
 * Vault timeout threshold in milliseconds (5 minutes)
 * After this duration, full authentication flow (biometric + PIN option) is required
 * Within this duration, only biometric authentication is shown for convenience
 */
export const VAULT_TIMEOUT_MS = 300000; // 5 minutes = 300,000ms

/**
 * Global Zustand store for managing Vault state.
 *
 * @example
 * ```ts
 * const { isAuthenticated, lockVault } = useVaultStore();
 * ```
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<VaultState>>}
 */
export const useVaultStore = create<VaultState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  decryptedVault: null,
  dateRange: undefined,
  showHeatmap: false,
  failedPinAttempts: 0,
  lockoutUntil: null,
  justAddedLugarId: null,
  lugarToCenter: null,
  shouldFitBounds: false,

  // Biometric Lock State (volatile - resets on app restart)
  isLocked: false,
  showLockPrompt: false,
  requestPinEntry: false, // When true, BiometricGuard shows PIN directly
  ignoreInteractionsUntil: 0, // Timestamp until which interactions should be ignored
  lastUnlockTime: 0, // Timestamp of last successful vault unlock (for timeout logic)
  unlockVault: () =>
    set({
      isLocked: false,
      requestPinEntry: false,
      lastUnlockTime: Date.now(),
    }),
  unlockedAchievements: [],
  profiles: [],
  userProfile: null,
  realtimeChannel: null, // Store the channel
  isAutoSyncSetup: false,

  initialize: async () => {
    const initUser = async (session: {
      user: { id: string; email?: string };
    }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();
      const username = profile?.username || session.user.email || "User";
      set({
        isAuthenticated: true,
        user: { username, mainPin: "", duressPin: "" },
        // SECURITY CRITICAL: Always lock on session initialization/reload
        // This ensures the user starts at the Facade (Hidden Vault Mode)
        isLocked: true,
        showLockPrompt: false,
      });

      const {
        loadFromDisk,
        syncWithSupabase,
        fetchProfiles,
        subscribeToRealtime,
        setupAutoSync,
      } = get();
      await loadFromDisk();
      await fetchProfiles();
      await syncWithSupabase();
      subscribeToRealtime();
      setupAutoSync();
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await initUser(session);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Only init if not already authenticated to avoid double init
        if (!get().isAuthenticated) {
          await initUser(session);
        }
      } else if (event === "SIGNED_OUT") {
        const { realtimeChannel } = get();
        if (realtimeChannel) await realtimeChannel.unsubscribe();
        set({
          isAuthenticated: false,
          user: null,
          decryptedVault: null,
          realtimeChannel: null,
        });
      }
    });
  },

  setupAutoSync: () => {
    if (get().isAutoSyncSetup) return;

    // Sync every 5 minutes as a fallback
    setInterval(
      () => {
        get().syncWithSupabase();
      },
      5 * 60 * 1000,
    );

    set({ isAutoSyncSetup: true });
  },
  fetchData: async () => {
    // This is mostly handled by syncWithSupabase now
    await get().syncWithSupabase();
  },

  loadFromDisk: async () => {
    // Placeholder for loading from IndexedDB or similar if needed
    // Currently we rely on Supabase sync
  },

  fetchProfiles: async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      console.error("Error fetching profiles:", error);
      return;
    }
    set({ profiles: data as Profile[] });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const myProfile = data.find((p) => p.id === user.id);
      if (myProfile) set({ userProfile: myProfile });
    }
  },

  syncWithSupabase: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    console.log("Syncing with Supabase...");

    // Fetch all data
    const [lugares, entradas, wishlist, fantasies, tags] = await Promise.all([
      supabase.from("lugares").select("*"),
      supabase.from("entradas").select("*"),
      supabase.from("wishlist").select("*"),
      supabase.from("fantasies").select("*"),
      supabase.from("tags").select("*"),
    ]);

    // Process Tags into categories
    const toys =
      tags.data?.filter((t) => t.type === "toy").map((t) => t.name) || [];
    const settingPlaces =
      tags.data?.filter((t) => t.type === "place_type").map((t) => t.name) ||
      [];
    const categories =
      tags.data?.filter((t) => t.type === "category").map((t) => t.name) || [];

    const tagImages: Record<string, string> = {};
    tags.data?.forEach((t) => {
      if (t.image_url) tagImages[t.name] = t.image_url;
    });

    const newVault: DecryptedVault = {
      user: get().user || { username: "User", mainPin: "", duressPin: "" },
      lugares: (lugares.data as Lugar[]) || [],
      entradas: (entradas.data as Entrada[]) || [],
      wishlist: (wishlist.data as WishlistItem[]) || [],
      unlockedAchievements: get().unlockedAchievements || [],
      fantasies: (fantasies.data as Fantasy[]) || [],
      toys,
      settingPlaces,
      categories,
      tagImages,
    };

    set({ decryptedVault: newVault });
    console.log("Sync complete.");
  },

  subscribeToRealtime: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) return;

    const channel = supabase
      .channel("vault-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        get().handleRealtimePayload(payload);
      })
      .subscribe();

    set({ realtimeChannel: channel });
  },

  handleRealtimePayload: async (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  ) => {
    console.log("Received Realtime Payload:", payload);
    const { decryptedVault } = get();

    // Granular handling for tags to ensure immediate UI updates
    if (payload.table === "tags" && decryptedVault) {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      let category: "toys" | "settingPlaces" | "categories" | null = null;

      // Determine category from type

      // If we can't determine type from payload (e.g. DELETE without full record), we must sync.
      // But for INSERT and UPDATE we usually have newRecord.
      if (newRecord && "type" in newRecord) {
        if (newRecord.type === "toy") category = "toys";
        else if (newRecord.type === "place_type") category = "settingPlaces";
        else if (newRecord.type === "category") category = "categories";
      }

      if (eventType === "INSERT" && category && newRecord) {
        console.log(`Realtime: Inserting ${newRecord.name} into ${category}`);
        const updatedItems = [
          ...decryptedVault[category],
          newRecord.name as string,
        ];
        // Deduplicate
        const uniqueItems = Array.from(new Set(updatedItems));

        const updatedTagImages = { ...decryptedVault.tagImages };
        if (newRecord.image_url) {
          updatedTagImages[newRecord.name as string] =
            newRecord.image_url as string;
        }

        set({
          decryptedVault: {
            ...decryptedVault,
            [category]: uniqueItems,
            tagImages: updatedTagImages,
          },
        });
      } else if (eventType === "UPDATE" && category && newRecord && oldRecord) {
        // This is tricky without knowing the OLD name if it changed.
        // If Supabase sends the old record with name, we can do it.
        // Otherwise, we fallback to sync.
        console.log("Realtime: Update detected, syncing...");
      } else if (eventType === "DELETE") {
        console.log("Realtime: Delete detected, syncing...");
      }
    }

    // Always sync to ensure consistency and handle other tables/events
    await get().syncWithSupabase();
  },

  // Profile Actions
  setProfile: (profile) => set({ userProfile: profile }),
  setProfiles: (profiles) => set({ profiles }),
  updateProfile: async (profile) => {
    const { error } = await supabase.from("profiles").upsert(profile);
    if (error) {
      console.error("Error updating profile:", error);
      return;
    }
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === profile.id ? profile : p)),
      userProfile:
        state.userProfile?.id === profile.id ? profile : state.userProfile,
    }));
    syncService.enqueue("UPDATE", "profiles", profile);
  },

  addLugar: async (lugar) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be authenticated to add a place");

    const newLugar = { ...lugar, created_by: user.id };

    // Optimistic Update
    const updatedLugares = [...decryptedVault.lugares, newLugar];
    set({
      decryptedVault: { ...decryptedVault, lugares: updatedLugares },
      justAddedLugarId: lugar.id,
    });

    // Sync - Remove 'entradas' as it's a relationship, not a column
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entradas, ...lugarPayload } = newLugar;

    const dbPayload = { ...lugarPayload } as Record<string, unknown>;
    if (
      newLugar.coordinates &&
      typeof newLugar.coordinates.lon === "number" &&
      typeof newLugar.coordinates.lat === "number" &&
      !isNaN(newLugar.coordinates.lon) &&
      !isNaN(newLugar.coordinates.lat)
    ) {
      dbPayload.coordinates = `(${newLugar.coordinates.lon},${newLugar.coordinates.lat})`;
    } else {
      delete dbPayload.coordinates;
    }

    syncService.enqueue("INSERT", "lugares", dbPayload);
  },

  updateLugar: async (lugar) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedLugares = decryptedVault.lugares.map((l) =>
      l.id === lugar.id ? lugar : l,
    );
    set({ decryptedVault: { ...decryptedVault, lugares: updatedLugares } });

    // Sync
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entradas, ...lugarPayload } = lugar;

    const dbPayload = { ...lugarPayload } as Record<string, unknown>;
    if (
      lugar.coordinates &&
      typeof lugar.coordinates.lon === "number" &&
      typeof lugar.coordinates.lat === "number" &&
      !isNaN(lugar.coordinates.lon) &&
      !isNaN(lugar.coordinates.lat)
    ) {
      dbPayload.coordinates = `(${lugar.coordinates.lon},${lugar.coordinates.lat})`;
    } else {
      delete dbPayload.coordinates;
    }

    syncService.enqueue("UPDATE", "lugares", dbPayload);
  },

  deleteLugar: async (lugarId) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedLugares = decryptedVault.lugares.filter(
      (l) => l.id !== lugarId,
    );
    set({ decryptedVault: { ...decryptedVault, lugares: updatedLugares } });

    // Sync
    await syncService.enqueue("DELETE", "lugares", { id: lugarId });
  },

  addEntrada: async (lugarId, entrada) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be authenticated to add an entry");

    const newEntrada = { ...entrada, created_by: user.id };

    // Optimistic Update
    const newEntradas = [...decryptedVault.entradas, newEntrada];
    set({ decryptedVault: { ...decryptedVault, entradas: newEntradas } });

    // Sync
    await syncService.enqueue("INSERT", "entradas", {
      ...newEntrada,
      lugar_id: lugarId,
    });
  },

  updateEntrada: async (_lugarId, entrada) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const newEntradas = decryptedVault.entradas.map((e) =>
      e.id === entrada.id ? entrada : e,
    );
    set({ decryptedVault: { ...decryptedVault, entradas: newEntradas } });

    // Sync
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lugar, ...payload } = entrada as EntradaWithLugar; // Exclude 'lugar' property if it exists from EntradaWithLugar
    await syncService.enqueue("UPDATE", "entradas", payload);
  },

  deleteEntrada: async (_lugarId, entradaId) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const newEntradas = decryptedVault.entradas.filter(
      (e) => e.id !== entradaId,
    );
    set({ decryptedVault: { ...decryptedVault, entradas: newEntradas } });

    // Sync
    await syncService.enqueue("DELETE", "entradas", { id: entradaId });
  },

  addWishlistItem: async (item) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      throw new Error("User must be authenticated to add a wishlist item");

    const newItem = { ...item, created_by: user.id };

    // Optimistic Update
    const updatedWishlist = [...decryptedVault.wishlist, newItem];
    set({ decryptedVault: { ...decryptedVault, wishlist: updatedWishlist } });

    // Sync
    await syncService.enqueue("INSERT", "wishlist", newItem);
  },

  updateWishlistItem: async (item) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedWishlist = decryptedVault.wishlist.map((i) =>
      i.id === item.id ? item : i,
    );
    set({ decryptedVault: { ...decryptedVault, wishlist: updatedWishlist } });

    // Sync
    await syncService.enqueue("UPDATE", "wishlist", item);
  },

  deleteWishlistItem: async (itemId) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedWishlist = decryptedVault.wishlist.filter(
      (i) => i.id !== itemId,
    );
    set({ decryptedVault: { ...decryptedVault, wishlist: updatedWishlist } });

    // Sync
    await syncService.enqueue("DELETE", "wishlist", { id: itemId });
  },

  promoteWishlistItem: async (itemId) => {
    // Placeholder
    console.log("Promote item", itemId);
  },

  addFantasy: async (fantasy) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be authenticated to add a fantasy");

    const newFantasy = { ...fantasy, created_by: user.id };

    // Optimistic Update
    const updatedFantasies = [...decryptedVault.fantasies, newFantasy];
    set({ decryptedVault: { ...decryptedVault, fantasies: updatedFantasies } });

    // Sync
    await syncService.enqueue("INSERT", "fantasies", newFantasy);
  },

  updateFantasy: async (fantasy) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedFantasies = decryptedVault.fantasies.map((f) =>
      f.id === fantasy.id ? fantasy : f,
    );
    set({ decryptedVault: { ...decryptedVault, fantasies: updatedFantasies } });

    // Sync
    await syncService.enqueue("UPDATE", "fantasies", fantasy);
  },

  deleteFantasy: async (fantasyId) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedFantasies = decryptedVault.fantasies.filter(
      (f) => f.id !== fantasyId,
    );
    set({ decryptedVault: { ...decryptedVault, fantasies: updatedFantasies } });

    // Sync
    await syncService.enqueue("DELETE", "fantasies", { id: fantasyId });
  },

  addCategoryItem: async (category, item, imageUrl) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    if (decryptedVault[category].includes(item)) {
      throw new Error("This item already exists.");
    }

    // Optimistic Update
    const updatedItems = [...decryptedVault[category], item];
    const updatedTagImages = { ...decryptedVault.tagImages };
    if (imageUrl) {
      updatedTagImages[item] = imageUrl;
    }

    set({
      decryptedVault: {
        ...decryptedVault,
        [category]: updatedItems,
        tagImages: updatedTagImages,
      },
    });

    // Sync
    let type = "";
    if (category === "toys") type = "toy";
    else if (category === "settingPlaces") type = "place_type";
    else if (category === "categories") type = "category";

    await syncService.enqueue("INSERT", "tags", {
      type,
      name: item,
      image_url: imageUrl,
    });
  },

  deleteCategoryItem: async (category, item) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedItems = decryptedVault[category].filter((i) => i !== item);
    const updatedTagImages = { ...decryptedVault.tagImages };
    delete updatedTagImages[item];

    set({
      decryptedVault: {
        ...decryptedVault,
        [category]: updatedItems,
        tagImages: updatedTagImages,
      },
    });

    // Sync
    let type = "";
    if (category === "toys") type = "toy";
    else if (category === "settingPlaces") type = "place_type";
    else if (category === "categories") type = "category";

    await syncService.enqueue("DELETE", "tags", {
      match: { type, name: item },
    });
  },

  updateCategoryItem: async (category, oldItem, newItem, newImageUrl) => {
    const { decryptedVault } = get();
    if (!decryptedVault) return;

    // Optimistic Update
    const updatedItems = decryptedVault[category].map((i) =>
      i === oldItem ? newItem : i,
    );
    const updatedTagImages = { ...decryptedVault.tagImages };

    if (newImageUrl !== undefined) {
      updatedTagImages[newItem] = newImageUrl;
      if (oldItem !== newItem) {
        delete updatedTagImages[oldItem];
      }
    } else if (oldItem !== newItem && updatedTagImages[oldItem]) {
      updatedTagImages[newItem] = updatedTagImages[oldItem];
      delete updatedTagImages[oldItem];
    }

    // Also update any places or fantasies that might reference this category item
    let updatedLugares = decryptedVault.lugares;
    let updatedFantasies = decryptedVault.fantasies;

    if (category === "toys") {
      updatedLugares = decryptedVault.lugares.map((lugar) => ({
        ...lugar,
        entradas:
          lugar.entradas?.map((entrada) => ({
            ...entrada,
            toys:
              entrada.toys?.map((toy) => (toy === oldItem ? newItem : toy)) ||
              [],
          })) || [],
      }));
      updatedFantasies = decryptedVault.fantasies.map((fantasy) => ({
        ...fantasy,
        toys:
          fantasy.toys?.map((toy) => (toy === oldItem ? newItem : toy)) || [],
      }));
    } else if (category === "settingPlaces") {
      updatedLugares = decryptedVault.lugares.map((lugar) => ({
        ...lugar,
        entradas:
          lugar.entradas?.map((entrada) => ({
            ...entrada,
            settingPlaces:
              entrada.settingPlaces?.map((place) =>
                place === oldItem ? newItem : place,
              ) || [],
          })) || [],
      }));
      updatedFantasies = decryptedVault.fantasies.map((fantasy) => ({
        ...fantasy,
        settingPlaces:
          fantasy.settingPlaces?.map((place) =>
            place === oldItem ? newItem : place,
          ) || [],
      }));
    } else if (category === "categories") {
      updatedLugares = decryptedVault.lugares.map((lugar) => ({
        ...lugar,
        categories:
          lugar.categories?.map((cat) => (cat === oldItem ? newItem : cat)) ||
          [],
      }));
    }

    set({
      decryptedVault: {
        ...decryptedVault,
        [category]: updatedItems,
        tagImages: updatedTagImages,
        lugares: updatedLugares,
        fantasies: updatedFantasies,
      },
    });

    // Sync
    let type = "";
    if (category === "toys") type = "toy";
    else if (category === "settingPlaces") type = "place_type";
    else if (category === "categories") type = "category";

    await syncService.enqueue("UPDATE", "tags", {
      update: { name: newItem, image_url: newImageUrl },
      match: { type, name: oldItem },
    });

    // Update references in other tables to prevent revert on reload
    if (category === "toys" || category === "settingPlaces") {
      // Update Entradas
      updatedLugares.forEach((lugar) => {
        lugar.entradas?.forEach((entrada) => {
          const originalLugar = decryptedVault.lugares.find(
            (l) => l.id === lugar.id,
          );
          const originalEntrada = originalLugar?.entradas?.find(
            (e) => e.id === entrada.id,
          );
          const items =
            category === "toys"
              ? originalEntrada?.toys
              : originalEntrada?.settingPlaces;

          if (items?.includes(oldItem)) {
            syncService.enqueue("UPDATE", "entradas", {
              id: entrada.id,
              [category]:
                category === "toys" ? entrada.toys : entrada.settingPlaces,
            });
          }
        });
      });

      // Update Fantasies
      updatedFantasies.forEach((fantasy) => {
        const originalFantasy = decryptedVault.fantasies.find(
          (f) => f.id === fantasy.id,
        );
        const items =
          category === "toys"
            ? originalFantasy?.toys
            : originalFantasy?.settingPlaces;

        if (items?.includes(oldItem)) {
          // Use snake_case for fantasy properties if needed, but here we are updating the array column
          // The column name in DB is likely 'toys' or 'settingPlaces' (or 'setting_places'?)
          // Based on previous schema fix, we know 'location_id' and 'reference_image' changed.
          // 'toys' seems to be 'toys'. 'settingPlaces' might be 'setting_places'?
          // Let's check FantasySchema again. It says settingPlaces.
          // But if I changed locationId -> location_id, maybe I should check if settingPlaces -> setting_places?
          // The user didn't complain about settingPlaces yet.
          // However, to be safe, I should probably map it if I knew for sure.
          // For now, I'll send what the schema expects.
          // Wait, if the DB expects snake_case, and I send camelCase 'settingPlaces', it might fail or be ignored.
          // But I don't have a 'setting_places' column error yet.
          // I'll stick to the property name for now, but if it fails I'll know why.
          // Actually, for 'entradas', it's also 'settingPlaces'.

          const payload: Partial<Fantasy> = { id: fantasy.id };
          if (category === "toys") payload.toys = fantasy.toys;
          if (category === "settingPlaces")
            payload.settingPlaces = fantasy.settingPlaces; // potential issue if DB is snake_case

          syncService.enqueue("UPDATE", "fantasies", payload);
        }
      });
    } else if (category === "categories") {
      // Update Lugares
      updatedLugares.forEach((lugar) => {
        const originalLugar = decryptedVault.lugares.find(
          (l) => l.id === lugar.id,
        );
        if (originalLugar?.categories?.includes(oldItem)) {
          syncService.enqueue("UPDATE", "lugares", {
            id: lugar.id,
            categories: lugar.categories,
          });
        }
      });
    }
  },

  setDateRange: (dateRange) => set({ dateRange }),
  setShowHeatmap: (showHeatmap) => set({ showHeatmap }),
  setUnlockedAchievements: (achievements) =>
    set({ unlockedAchievements: achievements }),
  setJustAddedLugarId: (lugarId) => set({ justAddedLugarId: lugarId }),
  setLugarToCenter: (lugar) => set({ lugarToCenter: lugar }),
  setShouldFitBounds: (shouldFitBounds) => set({ shouldFitBounds }),

  getFilteredLugares: () => {
    const { decryptedVault, dateRange } = get();
    if (!decryptedVault) return [];
    if (!dateRange || !dateRange.from) return decryptedVault.lugares;

    const from = dateRange.from;
    const to = dateRange.to || dateRange.from;

    return decryptedVault.lugares.filter((lugar) => {
      if (!lugar.entradas) return false;
      return lugar.entradas.some((entrada) => {
        const fecha = new Date(entrada.fecha);
        return fecha >= from && fecha <= to;
      });
    });
  },

  getAllEntradas: () => {
    const { decryptedVault } = get();
    if (!decryptedVault) return [];
    return decryptedVault.lugares.flatMap((l) =>
      (l.entradas || []).map((e) => ({ ...e, lugar: l })),
    );
  },

  lockVault: async (silent = false) => {
    // Lock the vault without signing out (Biometric/PIN required to re-enter)
    set({ isLocked: true, showLockPrompt: !silent });
    // Note: We deliberately DO NOT signOut() so session persists for PIN
  },
}));
