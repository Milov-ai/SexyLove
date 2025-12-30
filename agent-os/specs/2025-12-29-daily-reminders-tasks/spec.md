# Technical Specification: Daily Rituals System ("Rituales")

> **Feature ID**: `2025-12-29-daily-reminders-tasks`
> **Status**: DRAFT
> **Size**: XL (25-35 tasks)

---

## 1. Overview

### 1.1 Problem Statement

Users need a way to create recurring daily tasks and receive reliable notifications to complete them. The current app has notes and folders but lacks a dedicated system for time-based reminders with completion tracking and gamification elements.

### 1.2 Solution

Implement a "Rituales" (Daily Rituals) feature that:

1. Allows creating tasks with scheduled reminders using the existing Supreme notification system
2. Tracks daily completion with streaks for motivation
3. Provides a beautiful dashboard aligned with the "Morbo Visual" brand
4. Uses Android AlarmManager for reliable, background-safe scheduling

---

## 2. Data Model

### 2.1 Supabase Schema

```sql
-- Rituals table
CREATE TABLE rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '✨',
  color TEXT DEFAULT '#FF69B4',

  -- Scheduling
  time TIME NOT NULL,  -- HH:MM:SS
  recurrence TEXT NOT NULL DEFAULT 'daily',  -- 'daily', 'weekdays', 'weekends', 'custom'
  days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],  -- 0=Sunday, 6=Saturday
  snooze_minutes INTEGER DEFAULT 10,

  -- State
  is_active BOOLEAN DEFAULT true,
  streak_count INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_completed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own rituals" ON rituals
  FOR ALL USING (auth.uid() = user_id);

-- Completions table
CREATE TABLE ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id UUID REFERENCES rituals(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,

  UNIQUE(ritual_id, completed_at::date)  -- One completion per day per ritual
);

-- RLS via ritual ownership
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own completions" ON ritual_completions
  FOR ALL USING (
    ritual_id IN (SELECT id FROM rituals WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_rituals_user_active ON rituals(user_id, is_active);
CREATE INDEX idx_completions_ritual_date ON ritual_completions(ritual_id, completed_at);
```

### 2.2 TypeScript Types

```typescript
// src/features/rituals/types.ts

export type RecurrencePattern = "daily" | "weekdays" | "weekends" | "custom";

export interface Ritual {
  id: string;
  user_id: string;

  // Content
  title: string;
  description?: string;
  emoji: string;
  color: string;

  // Scheduling
  time: string; // "HH:MM" format
  recurrence: RecurrencePattern;
  days_of_week: number[]; // 0-6
  snooze_minutes: number;

  // State
  is_active: boolean;
  streak_count: number;
  best_streak: number;

  // Metadata
  created_at: string;
  updated_at: string;
  last_completed_at: string | null;
}

export interface RitualCompletion {
  id: string;
  ritual_id: string;
  completed_at: string;
  note?: string;
}

export interface RitualWithStatus extends Ritual {
  completed_today: boolean;
  is_due: boolean; // Current time >= scheduled time
}
```

---

## 3. Architecture

### 3.1 Directory Structure

```
src/features/rituals/
├── components/
│   ├── RitualCard.tsx          # Individual ritual display
│   ├── RitualEditor.tsx        # Create/Edit modal (Sheet)
│   ├── RitualList.tsx          # Scrollable list with filters
│   ├── DailyProgress.tsx       # Circular progress ring
│   ├── StreakFlame.tsx         # Animated streak counter
│   ├── WeekCalendar.tsx        # 7-day mini calendar
│   ├── TimePicker.tsx          # Time selection wheel
│   ├── EmojiPicker.tsx         # Curated emoji selection
│   └── RecurrenceSelector.tsx  # Day selection chips
├── hooks/
│   ├── useRituals.ts           # Main data hook
│   ├── useRitualScheduler.ts   # Native scheduling bridge
│   └── useStreakCalculator.ts  # Streak logic
├── store/
│   └── rituals.store.ts        # Zustand store
├── services/
│   └── RitualScheduler.ts      # Capacitor bridge to native
├── types.ts                    # Type definitions
└── index.ts                    # Barrel exports
```

### 3.2 Component Hierarchy

```
NotesDashboard
└── [Tab: Rituales]
    ├── DailyProgress (top section)
    │   ├── ProgressRing
    │   └── StreakFlame
    ├── WeekCalendar (horizontal)
    └── RitualList
        └── RitualCard (×n)
            ├── EmojiAvatar
            ├── TitleBlock
            ├── TimeLabel
            └── ActionButtons

RitualEditor (Sheet overlay)
├── TitleInput
├── DescriptionInput
├── EmojiPicker
├── ColorPicker (reuse from ui)
├── TimePicker
├── RecurrenceSelector
└── SaveButton
```

---

## 4. Native Implementation (Android)

### 4.1 New Kotlin Files

#### RitualScheduler.kt

```kotlin
// android/app/src/main/java/com/sexylove/app/RitualScheduler.kt

package com.sexylove.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

object RitualScheduler {

    fun scheduleRitual(
        context: Context,
        ritualId: String,
        hour: Int,
        minute: Int,
        title: String,
        emoji: String,
        color: String
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(context, RitualAlarmReceiver::class.java).apply {
            action = "com.sexylove.app.RITUAL_ALARM"
            putExtra("ritualId", ritualId)
            putExtra("title", title)
            putExtra("emoji", emoji)
            putExtra("color", color)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            ritualId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)

            // If time has passed today, schedule for tomorrow
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            }
        } else {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                pendingIntent
            )
        }

        // Save to SharedPreferences for boot recovery
        saveScheduledRitual(context, ritualId, hour, minute, title, emoji, color)
    }

    fun cancelRitual(context: Context, ritualId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, RitualAlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            ritualId.hashCode(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        pendingIntent?.let { alarmManager.cancel(it) }
        removeScheduledRitual(context, ritualId)
    }

    private fun saveScheduledRitual(context: Context, ritualId: String, hour: Int, minute: Int, title: String, emoji: String, color: String) {
        val prefs = context.getSharedPreferences("rituals", Context.MODE_PRIVATE)
        val data = "$hour,$minute,$title,$emoji,$color"
        prefs.edit().putString(ritualId, data).apply()
    }

    private fun removeScheduledRitual(context: Context, ritualId: String) {
        val prefs = context.getSharedPreferences("rituals", Context.MODE_PRIVATE)
        prefs.edit().remove(ritualId).apply()
    }

    fun getAllScheduledRituals(context: Context): Map<String, String> {
        val prefs = context.getSharedPreferences("rituals", Context.MODE_PRIVATE)
        return prefs.all.filterValues { it is String }.mapValues { it.value as String }
    }
}
```

#### RitualAlarmReceiver.kt

```kotlin
// android/app/src/main/java/com/sexylove/app/RitualAlarmReceiver.kt

package com.sexylove.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class RitualAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val ritualId = intent.getStringExtra("ritualId") ?: return
        val title = intent.getStringExtra("title") ?: "Ritual"
        val emoji = intent.getStringExtra("emoji") ?: "✨"
        val color = intent.getStringExtra("color") ?: "#FF69B4"

        Log.d("RitualAlarm", "Alarm triggered for ritual: $ritualId")

        // Show Supreme notification
        RitualNotificationHelper.showRitualNotification(
            context, ritualId, title, emoji, color
        )

        // Re-schedule for tomorrow
        val prefs = context.getSharedPreferences("rituals", Context.MODE_PRIVATE)
        val data = prefs.getString(ritualId, null)
        if (data != null) {
            val parts = data.split(",")
            val hour = parts[0].toInt()
            val minute = parts[1].toInt()
            RitualScheduler.scheduleRitual(context, ritualId, hour, minute, title, emoji, color)
        }
    }
}
```

#### RitualBootReceiver.kt

```kotlin
// android/app/src/main/java/com/sexylove/app/RitualBootReceiver.kt

package com.sexylove.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class RitualBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d("RitualBoot", "Device booted, rescheduling rituals...")

            val rituals = RitualScheduler.getAllScheduledRituals(context)
            rituals.forEach { (ritualId, data) ->
                val parts = data.split(",")
                if (parts.size >= 5) {
                    val hour = parts[0].toInt()
                    val minute = parts[1].toInt()
                    val title = parts[2]
                    val emoji = parts[3]
                    val color = parts[4]

                    RitualScheduler.scheduleRitual(context, ritualId, hour, minute, title, emoji, color)
                }
            }
        }
    }
}
```

### 4.2 Manifest Updates

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />

<application>
    <!-- Existing content... -->

    <receiver
        android:name=".RitualAlarmReceiver"
        android:exported="false" />

    <receiver
        android:name=".RitualBootReceiver"
        android:enabled="true"
        android:exported="false">
        <intent-filter>
            <action android:name="android.intent.action.BOOT_COMPLETED" />
        </intent-filter>
    </receiver>
</application>
```

---

## 5. UI Design Specifications

### 5.1 RitualCard

```
┌─────────────────────────────────────────────────────────────┐
│ ┌───────┐                                                   │
│ │  🧘   │  Morning Meditation                    ⏰ 07:00   │
│ │       │  ─────────────────────────────────────────────    │
│ └───────┘  Start your day with 10 min of mindfulness        │
│                                                             │
│            ○ Daily                    [ ✓ Done ]            │
└─────────────────────────────────────────────────────────────┘

States:
- Pending: glass-dirty bg, muted colors
- Due Now: Electric Magenta border glow, pulse animation
- Completed: Toxic Acid checkmark, reduced opacity
- Missed: Solar Flare indicator
```

**CSS Classes:**

```css
.ritual-card {
  @apply glass-dirty rounded-2xl p-4 transition-all duration-300;
}

.ritual-card--pending {
  @apply opacity-80;
}

.ritual-card--due {
  @apply border-glow animate-pulse-glow;
  border-color: oklch(0.6 0.25 300);
}

.ritual-card--completed {
  @apply opacity-60;
  background: linear-gradient(135deg, oklch(0.8 0.2 140 / 0.1), transparent);
}

.ritual-card--missed {
  border-left: 3px solid oklch(0.75 0.2 50);
}
```

### 5.2 DailyProgress

```
        ┌─────────────────┐
        │      ╭───╮      │
        │    ╱       ╲    │
        │   │  4/6    │   │
        │   │  67%    │   │
        │    ╲       ╱    │
        │      ╰───╯      │
        │                 │
        │   🔥 7 days     │
        └─────────────────┘

- SVG circular progress with gradient stroke
- Animated stroke-dashoffset on load
- Center: fraction + percentage
- Below: streak flame + count
```

### 5.3 StreakFlame

```tsx
// Animated flame icon that grows with streak
<motion.div
  animate={{
    scale: [1, 1.1, 1],
    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
  }}
  transition={{ duration: 2, repeat: Infinity }}
>
  <Flame className="w-8 h-8 text-orange-500" />
</motion.div>
```

### 5.4 WeekCalendar

```
     S   M   T   W   T   F   S
    ─── ─── ─── ─── ─── ─── ───
    [●] [●] [○] [●] [●] [ ] [ ]

● = All rituals completed (Toxic Acid)
○ = Partial completion (Cyber Violet)
[ ] = No data / Future
```

---

## 6. Verification Plan

### 6.1 Automated Tests

```bash
# Run unit tests
npm run test -- --filter=rituals

# Test coverage targets
# - rituals.store.ts: 90%+
# - useRituals.ts: 85%+
# - RitualCard.tsx: 80%+
```

### 6.2 Manual Verification

1. **Notification Scheduling**
   - Create ritual for 2 minutes from now
   - Lock phone / minimize app
   - Verify notification appears at exact time
   - Tap "Complete" action, verify state updates

2. **Boot Persistence**
   - Create ritual for future time
   - Reboot device
   - Verify notification still triggers at correct time

3. **Streak Logic**
   - Complete all rituals for 3 days
   - Verify streak shows "3"
   - Miss one day
   - Verify streak resets to 0

4. **UI Quality (Morbo Checklist)**
   - [ ] Dark mode uses Deep Void background
   - [ ] Glass effects have noise texture
   - [ ] Animations run at 60fps
   - [ ] Hover states on all interactive elements
   - [ ] Empty state is designed beautifully

---

## 7. Rollout Plan

### Phase 1: Foundation

- Database migration
- Native Kotlin implementation
- Basic store and types

### Phase 2: Core UI

- RitualCard, RitualList, RitualEditor
- Integration in NotesDashboard
- Basic CRUD operations

### Phase 3: Notifications

- Connect scheduling to native layer
- Test notification flow end-to-end
- Boot receiver verification

### Phase 4: Gamification

- Streak tracking
- DailyProgress component
- WeekCalendar visualization
- Completion animations

### Phase 5: Polish

- Morbo Visual quality pass
- Performance optimization
- Edge case handling
- Verification artifacts

---

## 8. Appendix

### 8.1 Curated Emoji Set

```typescript
const RITUAL_EMOJIS = [
  // Morning
  "🌅",
  "☀️",
  "🧘",
  "💪",
  "🏃",
  // Productivity
  "📚",
  "💻",
  "✍️",
  "🎯",
  "📊",
  // Health
  "💊",
  "🥗",
  "💧",
  "😴",
  "🧘‍♀️",
  // Creative
  "🎨",
  "🎵",
  "📷",
  "✨",
  "🌟",
  // Self-care
  "🛁",
  "💆",
  "🧖",
  "💅",
  "🌸",
  // Social
  "💬",
  "📞",
  "🤝",
  "❤️",
  "👨‍👩‍👧",
  // Special
  "🔥",
  "⚡",
  "🌙",
  "🌈",
  "🎁",
];
```

### 8.2 Default Colors

```typescript
const RITUAL_COLORS = [
  "#FF69B4", // Hot Pink (default)
  "#7C3AED", // Electric Violet
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#FBBF24", // Amber
];
```
