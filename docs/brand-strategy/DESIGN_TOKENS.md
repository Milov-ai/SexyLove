# Atomic Design Specifications: "Neon Noir"

Use these specifications strictly. Do not deviate.

## 1. Color Palette (OkLCH)

We use `Oklch` for perceptual uniformity and vibrant neons impossible in sRGB.

### The Void (Backgrounds)

- **Deep Void:** `oklch(0.05 0.01 280)` (Main Background)
- **Obsidian Glass:** `oklch(0.12 0.02 280)` (Card/Panel Backgrounds - Use with 40-70% opacity)
- **Abyss:** `oklch(0.02 0.01 280)` (Darker sections/Footer)

### The Neon (Accents)

- **Electric Magenta (Pulse):** `oklch(0.6 0.25 300)` - Primary Action / Key Highlight
- **Cyber Violet (Glow):** `oklch(0.7 0.2 260)` - Secondary / Ambient Glow
- **Toxic Acid (Success/Tech):** `oklch(0.8 0.2 140)` - Status: Active / Consoles
- **Solar Flare (Warning):** `oklch(0.75 0.2 50)` - Destructive / Alert

### The Light (Contrast)

- **White Hot:** `oklch(1 0 0)` (Headings)
- **Mist:** `oklch(0.85 0 0)` (Body Text)
- **Smoke:** `oklch(0.5 0 0)` (Muted Text)

---

## 2. Typography System

### Headings: "The Statement"

- **Font:** `Plus Jakarta Sans`
- **Weight:** `800` (ExtraBold)
- **Tracking:** `-0.05em` (Tighter than default)
- **Usage:** Big, Bold, In-your-face.

### Body & UI: "The Machine"

- **Font:** `IBM Plex Mono`
- **Weight:** `400` / `500`
- **Tracking:** `-0.02em`
- **Usage:** Button labels, technical data, small captions. Adds the "Cyber-Industrial" feel.

### Accent: "The Whisper"

- **Font:** `Lora` (Italic)
- **Weight:** `500`
- **Usage:** Quotes, "Seductive" copy, Empty states.

---

## 3. Effects & Physics

### Glassmorphism 3.0 (The "Dirty" Glass)

Standard glass is boring. We use "Structured Glass".

- **Blur:** `backdrop-filter: blur(20px)`
- **Noise:** Add a subtle noise texture overlay (opacity 0.03).
- **Border:** `1px solid rgba(255,255,255, 0.1)` + Top Inner Shadow for highlight.
- **Shadow:** Colored shadows (`oklch(0.6 0.25 300 / 0.2)`), not black shadows.

### Animations (Framer Motion / GSAP)

- **Curve:** `[0.22, 1, 0.36, 1]` (Custom Bezier - Snappy start, smooth end)
- **Duration:** `0.6s` (Standard)
- **Entrance:** Staggered. Content creates a "wave" on load.
- **Hover:** `scale(1.02)` + `brightness(1.1)` + `glow expansion`.

---

## 4. Spacing & Layout

- **Grid:** 4px baseline.
- **Gaps:** Large. Allow the content to breathe. (e.g., `gap-8`, `gap-12`).
- **Borders:** `rounded-2xl` or `rounded-3xl` (Smooth, organic corners).
