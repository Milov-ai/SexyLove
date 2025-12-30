# Task Breakdown: Minecraft Web Client Integration

## Overview

Total Tasks: 10

## Task List

### Feature Module

#### Task Group 1: Minecraft Feature Setup

**Dependencies:** None

- [x] 1.1 Create feature folder structure
  - Create `src/features/minecraft/`
  - Create `index.ts` barrel file
- [x] 1.2 Create MinecraftLauncher dialog component
  - Bottom sheet with username + server inputs
  - Persist to localStorage
  - "Play" button triggers onPlay callback
  - Reuse pattern from: `IdentitySelectorDialog.tsx`
- [x] 1.3 Create MinecraftGame full-screen component
  - Sandboxed iframe embedding `mcon.vercel.app`
  - Pass `?username=...&server=...` query params
  - Exit button returns to dashboard
  - Handle mobile safe areas

**Acceptance Criteria:**

- Components render without errors
- Dialog opens and accepts input
- Game view displays iframe correctly

---

### Integration

#### Task Group 2: Dashboard & Router Integration

**Dependencies:** Task Group 1

- [x] 2.1 Add "minecraft" search trigger in NotesDashboard
  - Detect keyword in search input (case-insensitive)
  - Open MinecraftLauncher dialog
  - Clear search after trigger
- [x] 2.2 Integrate MinecraftGame as full-screen overlay
  - Render when isMinecraftPlaying is true
  - Pass username/server props
  - onClose returns to dashboard

**Acceptance Criteria:**

- Typing "minecraft" opens launcher dialog
- Playing opens full-screen game view

---

### Verification

#### Task Group 3: Manual Testing

**Dependencies:** Task Groups 1-2

- [ ] 3.1 Test trigger detection (type "minecraft" in search)
- [ ] 3.2 Test username/server input and persistence
- [ ] 3.3 Test game loads in iframe
- [ ] 3.4 Test exit button returns to dashboard
- [ ] 3.5 Test on mobile viewport (touch controls visible)

**Acceptance Criteria:**

- All manual tests pass
- Feature works on both desktop and mobile

---

## Execution Order

1. Task Group 1: Feature Setup (components)
2. Task Group 2: Integration (triggers + routes)
3. Task Group 3: Verification (manual testing)
