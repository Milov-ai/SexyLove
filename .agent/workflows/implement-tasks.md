---
description: "The Worker. Execute implementation loop with Continuous GitHub Sync."
---

# /implement-tasks

> **Role**: Worker | **Phase**: 2  
> **Purpose**: Execute code changes with verification
> **Next**: `/commit-sync` → `/orchestrate-tasks`

---

## 📋 Detailed Instructions

**For complete step-by-step execution, read:**

```
agent-os/commands/implement-tasks/implement-tasks.md
```

This contains 3 phases:

1. **Determine Tasks** - Which tasks to implement
2. **Implement** - Execute code changes
3. **Verify** - Create verification report

---

## 🛠️ MCP Integration

### Supabase (Migrations)

```
mcp_supabase-mcp-server_apply_migration
  project_id: [id]
  name: "[migration_name]"
  query: "[SQL DDL]"
```

### Shadcn (Components)

```
mcp_shadcn_get_add_command_for_items
  items: ["@shadcn/[component]"]
```

### Sequential Thinking (Planning)

```
mcp_sequential-thinking_sequentialthinking
  thought: "Planning implementation for: [task].
            Files: [list], Approach: [strategy]"
  thoughtNumber: 1
  totalThoughts: 3
  nextThoughtNeeded: true
```

---

## 🔄 Execution Flow

```
1. Load context + sync git
2. Plan implementation (MCP)
3. Execute code changes
4. Verify: npm run build && npm test
5. IF FAIL: /fix-error
6. IF PASS: Mark [x], /commit-sync
7. Return to /orchestrate-tasks
```

---

## ✅ On Completion

- Update `[ ]` → `[x]` in tasks.md
- Log to `execution_log.md`
- Run `/commit-sync`
