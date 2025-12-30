# Context: Daily Rituals System ("Rituales")

## Goal

Create a world-class daily rituals and reminders system that leverages the existing Supreme notification infrastructure. The system allows users to create recurring tasks with scheduled notifications, track completion streaks, and visualize progress—all designed with "Morbo Visual" aesthetics that match the SexyLove brand identity.

## Scope

**IN:**

- Ritual CRUD with time scheduling, recurrence patterns, emoji/color customization
- Android native alarm scheduling (AlarmManager + Boot Receiver)
- Supreme-style notifications with action buttons (Complete/Snooze/Skip)
- Daily dashboard with progress ring, streak flame, week calendar
- Completion tracking and streak gamification
- Supabase persistence with real-time sync

**OUT:**

- iOS notification implementation
- Sharing rituals with other users
- External calendar integration
- AI-based suggestions

## Constraints

- Must adhere to "Neon Noir" design system (DESIGN_TOKENS.md)
- Must follow Manifesto principles (Wow Factor, 60fps, Atomic Precision)
- Must integrate with existing CustomNotificationPlugin.kt
- Must use Zustand + Supabase pattern from notes.store.ts
- Must work reliably in background and after device reboot

## Definition of Done

- [ ] All tasks in tasks.md completed
- [ ] Database migrations applied successfully
- [ ] Native alarm scheduling verified on Android
- [ ] Notifications trigger at correct times
- [ ] Streak counter increments correctly
- [ ] UI passes Morbo Visual Quality Checklist
- [ ] Verification artifacts generated (screenshots/recordings)

## Active Branch

`feature/daily-rituals`

## Related Specs

- `2025-12-27-custom-notification-plugin` (prerequisite, completed)
