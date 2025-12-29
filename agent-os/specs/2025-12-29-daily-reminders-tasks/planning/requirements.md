# Spec Requirements: Daily Rituals System ("Rituales")

## Initial Description

> "Ya tenemos un sistema de notificaciones nativas personalizadas con Capacitor y Kotlin, ahora se quiere hacer esto: Verificar sistema de recordatorios y tareas diarias, con notificaciones, etc."
>
> Additional context: "Revisa toda la app, además tenemos un diseño de marca también, revisa todo y haz el sistema de recordatorios / asignación de tareas futuras con notis y etc etc lo mejor de lo mejor, sorpréndeme."

## Requirements Discussion

### Clarification Round (Auto-resolved based on app analysis)

**Q1:** ¿Dónde guardar los datos de las tareas/recordatorios?
**Answer:** Supabase con sync en tiempo real (consistente con notes.store.ts pattern) + Zustand para estado local optimista.

**Q2:** ¿Qué estilo de notificación usar?
**Answer:** Usar el estilo "Supreme" existente (CustomNotificationPlugin.kt) con emoji y color del ritual.

**Q3:** ¿Dónde ubicar la funcionalidad en la UI?
**Answer:** Nueva pestaña "Rituales" en el NotesDashboard, junto a las carpetas/notas existentes.

**Q4:** ¿Qué nivel de gamificación?
**Answer:** Intermedio - streaks con animación de llama, anillo de progreso, confetti en completado.

**Q5:** ¿Patrones de recurrencia necesarios?
**Answer:** Daily, Weekdays, Weekends, Custom (días específicos de la semana).

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Notes/Folders system - Path: `src/features/notes/`
- Feature: Custom Notifications - Path: `src/services/NotificationService.ts`, `android/.../CustomNotificationPlugin.kt`
- Feature: Chameleon (identity colors/emojis) - Path: `src/features/chameleon/`
- Components to reuse: `ColorPicker.tsx`, `IconPicker.tsx`, `PinPad.tsx`, `calendar.tsx`
- Store pattern: `src/store/notes.store.ts` (Zustand + Supabase sync)

## Visual Assets

### Files Provided:

No visual mockups provided.

### Design System Reference:

- `docs/brand-strategy/DESIGN_TOKENS.md` - Color palette, typography, effects
- `docs/brand-strategy/MANIFESTO.md` - Design philosophy ("Morbo Visual")
- `docs/brand-strategy/QUALITY_CHECKLIST.md` - Verification checklist
- `src/index.css` - Implemented design system with glass utilities

### Visual Insights:

- **Palette**: Neon Noir (Deep Void background, Electric Magenta accents, Cyber Violet glow)
- **Typography**: Plus Jakarta Sans (headings), IBM Plex Mono (UI), Lora (accents)
- **Effects**: Glassmorphism 3.0 with noise texture, neon glow shadows
- **Animations**: Custom bezier [0.22, 1, 0.36, 1], staggered entrances, 60fps target

## Requirements Summary

### Functional Requirements

**Ritual Management:**

- Create rituals with: title, description, emoji, color, time, recurrence pattern
- Edit existing rituals
- Delete rituals with confirmation
- Toggle ritual active/inactive status

**Scheduling & Notifications:**

- Schedule notifications at exact times using Android AlarmManager
- Persist alarms across device reboots (Boot Receiver)
- Display Supreme-style notifications with ritual emoji/color
- Notification actions: Complete, Snooze (configurable), Skip Today

**Daily Dashboard:**

- View all rituals for today with completion status
- Circular progress ring showing daily completion percentage
- Week calendar showing 7-day completion history
- Quick-complete from dashboard without opening editor

**Streak & Gamification:**

- Track consecutive days of 100% completion
- Animated streak flame counter with pulse glow
- Best streak record
- Confetti/celebration animation on ritual completion
- Satisfying checkbox animation with haptic feedback

**Verification System:**

- Mark rituals as complete with timestamp
- Optional completion note
- View completion history for any ritual

### Reusability Opportunities

- **ColorPicker**: Already exists for folder/note colors → reuse for ritual color
- **IconPicker**: Adapt for emoji picker (or create EmojiPicker based on structure)
- **calendar.tsx**: Extend for completion heat map
- **Glass utilities**: `.glass-dirty`, `.text-neon`, `.animate-pulse-glow`
- **NotificationService**: Extend with `scheduleRitualNotification()` method
- **notes.store.ts pattern**: Clone for `rituals.store.ts`

### Scope Boundaries

**In Scope:**

- Full CRUD for rituals
- Time-based scheduling with recurrence
- Supreme notification integration
- Streak tracking and basic gamification
- Week calendar visualization
- Boot receiver for alarm persistence
- Brand-compliant "Morbo Visual" design

**Out of Scope:**

- Sharing rituals with other users
- External calendar integration (Google, Apple)
- AI-based ritual suggestions
- Complex conflict resolution (simple last-write-wins)
- iOS implementation (Android only for notifications)

### Technical Considerations

**Integration Points:**

- Supabase: `rituals` and `ritual_completions` tables
- Android: AlarmManager, BroadcastReceivers, SharedPreferences
- Capacitor: Extend CustomNotificationPlugin with ritual methods
- Zustand: New `rituals.store.ts` following existing pattern
- TanStack Query: Optional for server-state if needed

**Existing System Constraints:**

- Must follow "Neon Noir" design system strictly
- Must integrate with Chameleon identity system (aura colors)
- Notifications must work in background and after reboot
- Must maintain 60fps animations per Manifesto Rule #4

**Technology Preferences:**

- Framer Motion for complex animations (already in tech-stack)
- GSAP for micro-interactions (already available)
- date-fns for time handling (already in project)
- zod for validation schemas (already available)
