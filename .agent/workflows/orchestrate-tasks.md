---
description: "The Manager. Decides which task group to implement next."
---

# /orchestrate-tasks

> **Role**: Manager | **Phase**: 2
> **Purpose**: Select and delegate next task
> **Next**: `/implement-tasks` or `/verify-feature`

---

## 📋 Detailed Instructions

**For complete step-by-step execution, read:**

```
agent-os/commands/orchestrate-tasks/orchestrate-tasks.md
```

---

## 🔄 Execution Flow

```
1. Read tasks.md
2. IF all [x]: → /verify-feature
3. ELSE: Select next [ ] task
4. Delegate to /implement-tasks
5. On return: Loop to Step 1
```

---

## 🛠️ MCP Enhancement (Complex Selection)

```
mcp_sequential-thinking_sequentialthinking
  thought: "Selecting next task from: [list unchecked].
            Consider: dependencies, risk, value.
            Best choice is..."
  thoughtNumber: 1
  totalThoughts: 2
  nextThoughtNeeded: true
```

---

## 📝 Actions

1. **Read** `agent-os/specs/[feature]/tasks.md`
2. **Count** `[x]` vs `[ ]`
3. **Select** next unchecked task
4. **Log** to `execution_log.md`:
   ```markdown
   ## [TIMESTAMP]

   - **Action**: Task selected
   - **Task**: [description]
   ```
5. **Delegate** to `/implement-tasks`

---

## ✅ Completion Check

```
IF all tasks [x]:
  → "All tasks complete. Next: /verify-feature"
ELSE:
  → Continue loop
```
