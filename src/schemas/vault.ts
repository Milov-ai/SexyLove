import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const UserSchema = z.object({
  mainPin: z.string().length(6),
  duressPin: z.string().length(6),
  username: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const EntradaSchema = z.object({
  id: z.string().uuid().default(uuidv4),
  title: z.string().min(1, "El título es requerido"),
  fecha: z.coerce.date(),
  rating: z.number().min(0).max(5).default(2.5),
  participants: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  fotos: z.array(z.string()).default([]), // Store image IDs
  toys: z.array(z.string()).default([]),
  settingPlaces: z.array(z.string()).default([]),
});

export type Entrada = z.infer<typeof EntradaSchema>;

export const LugarSchema = z.object({
  id: z.string().uuid().default(uuidv4),
  nombre: z.string(),
  direccion: z.string(),
  calidad: z.array(z.string()).default([]),
  precio: z.array(z.string()).default([]),
  fotos: z.array(z.string()).default([]),
  description: z.string().optional(),
  privacy: z.enum(["public", "semi-private", "private"]).optional(),
  categories: z.array(z.string()).default([]),

  coordinates: z
    .object({
      lat: z.number(),
      lon: z.number(),
    })
    .optional(),
  entradas: z.array(EntradaSchema),
  favorite: z.boolean().default(false),
});

export type Lugar = z.infer<typeof LugarSchema>;

export const WishlistItemSchema = z.object({
  id: z.string().uuid().default(uuidv4),
  nombre: z.string(),
  notas: z.string().optional(),
  fotosInspiracion: z.array(z.string().startsWith("data:image")).optional(),
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;

export const FantasySchema = z.object({
  id: z.string().uuid().default(uuidv4),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  created_by: z.string(),
  created_at: z.coerce.date(),
  toys: z.array(z.string()).default([]),
  settingPlaces: z.array(z.string()).default([]),
  location_id: z.string().uuid().optional(),
  reference_image: z.string().optional(),
  priority: z.number().min(1).max(5).default(3),
});

export type Fantasy = z.infer<typeof FantasySchema>;

export const AchievementID = {
  FIRST_FIVE_STAR_ENTRY: "FIRST_FIVE_STAR_ENTRY",
  FIFTH_VISIT_SAME_PLACE: "FIFTH_VISIT_SAME_PLACE",
} as const;

export type AchievementID = keyof typeof AchievementID;

export const VaultSchema = z.object({
  user: UserSchema,
  lugares: z.array(LugarSchema),
  entradas: z.array(EntradaSchema).default([]),
  wishlist: z.array(WishlistItemSchema),
  unlockedAchievements: z.array(z.nativeEnum(AchievementID)).default([]),
  toys: z.array(z.string()).default([]),
  settingPlaces: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  fantasies: z.array(FantasySchema).default([]),
  tagImages: z.record(z.string(), z.string()).default({}),
});

export type Vault = z.infer<typeof VaultSchema>;
