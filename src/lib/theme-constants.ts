export const THEMES = {
  // --- DEFAULT (Obsidian) ---
  default: {
    id: "default",
    name: "Obsidian Void",
    bg: "bg-slate-950/40",
    border: "border-white/5",
    glow: "shadow-none hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]",
    icon: "text-slate-500",
    gradient: "from-slate-400 to-slate-600",
    text: "text-slate-300",
    hex: "#64748B", // slate-500
  },

  // --- AURA SERIES (Complex 3-Stop Flows) ---
  aura_sunset: {
    id: "aura_sunset",
    name: "Sunset Aura",
    bg: "bg-gradient-to-br from-orange-950/60 via-red-950/40 to-purple-950/60",
    border: "border-orange-500/20",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:shadow-[0_0_50px_rgba(249,115,22,0.25)]",
    icon: "text-orange-400",
    gradient: "from-orange-400 via-red-400 to-purple-500",
    text: "text-orange-100",
    hex: "#F97316", // orange-500
  },
  aura_mystic: {
    id: "aura_mystic",
    name: "Mystic Aura",
    bg: "bg-gradient-to-br from-teal-950/60 via-cyan-950/40 to-fuchsia-950/60",
    border: "border-teal-500/20",
    glow: "shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:shadow-[0_0_50px_rgba(217,70,239,0.25)]",
    icon: "text-teal-400",
    gradient: "from-teal-400 via-cyan-400 to-fuchsia-500",
    text: "text-teal-100",
    hex: "#14B8A6", // teal-500
  },
  aura_galaxy: {
    id: "aura_galaxy",
    name: "Galaxy Aura",
    bg: "bg-gradient-to-br from-blue-950/60 via-indigo-950/40 to-violet-950/60",
    border: "border-blue-500/20",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_50px_rgba(139,92,246,0.25)]",
    icon: "text-blue-400",
    gradient: "from-blue-400 via-indigo-400 to-violet-500",
    text: "text-blue-100",
    hex: "#3B82F6", // blue-500
  },
  aura_toxic: {
    id: "aura_toxic",
    name: "Toxic Aura",
    bg: "bg-gradient-to-br from-lime-950/60 via-green-950/40 to-purple-950/60",
    border: "border-lime-500/20",
    glow: "shadow-[0_0_30px_rgba(132,204,22,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)]",
    icon: "text-lime-400",
    gradient: "from-lime-400 via-green-400 to-purple-500",
    text: "text-lime-100",
    hex: "#84CC16", // lime-500
  },
  aura_pluto: {
    id: "aura_pluto",
    name: "Pluto Aura",
    bg: "bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-rose-950/60",
    border: "border-indigo-500/20",
    glow: "shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:shadow-[0_0_50px_rgba(244,63,94,0.25)]",
    icon: "text-indigo-400",
    gradient: "from-indigo-400 via-purple-400 to-rose-500",
    text: "text-indigo-100",
    hex: "#6366F1", // indigo-500
  },
  aura_love: {
    id: "aura_love",
    name: "Love Aura",
    bg: "bg-gradient-to-br from-red-950/60 via-pink-950/40 to-rose-950/60",
    border: "border-red-500/20",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.1)] hover:shadow-[0_0_50px_rgba(236,72,153,0.25)]",
    icon: "text-rose-400",
    gradient: "from-red-400 via-pink-400 to-rose-500",
    text: "text-rose-100",
    hex: "#EC4899", // pink-500
  },
  aura_golden: {
    id: "aura_golden",
    name: "Golden Aura",
    bg: "bg-gradient-to-br from-yellow-950/60 via-amber-950/40 to-orange-950/60",
    border: "border-yellow-500/20",
    glow: "shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]",
    icon: "text-yellow-400",
    gradient: "from-yellow-400 via-amber-400 to-orange-500",
    text: "text-yellow-100",
    hex: "#EAB308", // yellow-500
  },

  // --- NEON SERIES (High Voltage) ---
  neon_cyber: {
    id: "neon_cyber",
    name: "Cyber Punk",
    bg: "bg-gradient-to-br from-cyan-950/80 via-blue-950/60 to-fuchsia-950/80",
    border: "border-cyan-400/40",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(236,72,153,0.35)]",
    icon: "text-cyan-400",
    gradient: "from-cyan-400 via-blue-500 to-fuchsia-500",
    text: "text-cyan-50",
    hex: "#22D3EE", // cyan-400
  },
  neon_laser: {
    id: "neon_laser",
    name: "Laser Green",
    bg: "bg-gradient-to-br from-green-950/80 via-emerald-950/60 to-lime-950/80",
    border: "border-green-400/40",
    glow: "shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_40px_rgba(132,204,22,0.35)]",
    icon: "text-green-400",
    gradient: "from-green-400 via-emerald-500 to-lime-500",
    text: "text-green-50",
    hex: "#4ADE80", // green-400
  },
  neon_acid: {
    id: "neon_acid",
    name: "Acid Yellow",
    bg: "bg-gradient-to-br from-yellow-950/80 via-amber-950/60 to-orange-950/80",
    border: "border-yellow-400/40",
    glow: "shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_40px_rgba(249,115,22,0.35)]",
    icon: "text-yellow-400",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    text: "text-yellow-50",
    hex: "#FACC15", // yellow-400
  },
  neon_plasma: {
    id: "neon_plasma",
    name: "Plasma Red",
    bg: "bg-gradient-to-br from-red-950/80 via-rose-950/60 to-pink-950/80",
    border: "border-red-500/40",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(244,63,94,0.35)]",
    icon: "text-red-400",
    gradient: "from-red-500 via-rose-500 to-pink-500",
    text: "text-red-50",
    hex: "#F87171", // red-400
  },
  neon_ultraviolet: {
    id: "neon_ultraviolet",
    name: "Ultra Violet",
    bg: "bg-gradient-to-br from-violet-950/80 via-purple-950/60 to-indigo-950/80",
    border: "border-violet-500/40",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(124,58,237,0.35)]",
    icon: "text-violet-400",
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    text: "text-violet-50",
    hex: "#A78BFA", // violet-400
  },

  // --- LUXE SERIES (Metallic Finishes) ---
  luxe_gold: {
    id: "luxe_gold",
    name: "Midas Gold",
    bg: "bg-gradient-to-br from-yellow-900/50 via-amber-900/30 to-yellow-950/50",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_25px_rgba(251,191,36,0.15)] hover:shadow-[0_0_40px_rgba(251,191,36,0.25)]",
    icon: "text-amber-400",
    gradient: "from-amber-200 via-yellow-400 to-amber-600",
    text: "text-amber-100",
    hex: "#FBBF24", // amber-400
  },
  luxe_silver: {
    id: "luxe_silver",
    name: "Starlight Silver",
    bg: "bg-gradient-to-br from-slate-800/60 via-gray-800/40 to-slate-900/60",
    border: "border-slate-400/30",
    glow: "shadow-[0_0_25px_rgba(211,211,211,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]",
    icon: "text-slate-300",
    gradient: "from-slate-200 via-gray-300 to-slate-400",
    text: "text-slate-100",
    hex: "#CBD5E1", // slate-300
  },
  luxe_rose: {
    id: "luxe_rose",
    name: "Rose Gold",
    bg: "bg-gradient-to-br from-rose-900/50 via-pink-900/30 to-rose-950/50",
    border: "border-rose-400/30",
    glow: "shadow-[0_0_25px_rgba(251,113,133,0.15)] hover:shadow-[0_0_40px_rgba(251,113,133,0.25)]",
    icon: "text-rose-300",
    gradient: "from-rose-200 via-pink-300 to-rose-400",
    text: "text-rose-100",
    hex: "#FDA4AF", // rose-300
  },

  // --- DEEP SERIES (Abyssal Contexts) ---
  deep_ocean: {
    id: "deep_ocean",
    name: "Abyssal Ocean",
    bg: "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950",
    border: "border-blue-900/30",
    glow: "shadow-[0_0_20px_rgba(30,58,138,0.1)] hover:shadow-[0_0_35px_rgba(30,58,138,0.2)]",
    icon: "text-blue-500",
    gradient: "from-blue-600 to-slate-400",
    text: "text-blue-200",
    hex: "#3B82F6", // blue-500
  },
  deep_forest: {
    id: "deep_forest",
    name: "Forbidden Forest",
    bg: "bg-gradient-to-b from-slate-950 via-green-950 to-slate-950",
    border: "border-green-900/30",
    glow: "shadow-[0_0_20px_rgba(20,83,45,0.1)] hover:shadow-[0_0_35px_rgba(20,83,45,0.2)]",
    icon: "text-green-500",
    gradient: "from-green-600 to-slate-400",
    text: "text-green-200",
    hex: "#22C55E", // green-500
  },
  deep_blood: {
    id: "deep_blood",
    name: "Vampire Blood",
    bg: "bg-gradient-to-b from-slate-950 via-red-950 to-slate-950",
    border: "border-red-900/30",
    glow: "shadow-[0_0_20px_rgba(127,29,29,0.1)] hover:shadow-[0_0_35px_rgba(127,29,29,0.2)]",
    icon: "text-red-500",
    gradient: "from-red-600 to-slate-400",
    text: "text-red-200",
    hex: "#EF4444", // red-500
  },
} as const;

export type ThemeId = keyof typeof THEMES;

/**
 * Reverse mapping to find theme ID from hex color
 * Useful for backward compatibility or exact matching
 */
export const HEX_TO_THEME_ID = Object.values(THEMES).reduce(
  (acc, theme) => {
    if (theme.hex) {
      acc[theme.hex] = theme.id as ThemeId;
      // Also map lowercase just in case
      acc[theme.hex.toLowerCase()] = theme.id as ThemeId;
    }
    return acc;
  },
  {} as Record<string, ThemeId>,
);
