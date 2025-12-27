---
description: "MASTER GUIDE: The definitive Agent OS lifecycle with Atomic Specification, MCP Synergy, and Total GitHub Sync."
---

# Agent OS v2.0: Atomic Workflow Lifecycle

> **Protocol ID**: #AgentOS_Atomic_Lifecycle_v2
> **Status**: ACTIVE | UNIVERSAL SPECIFICATION
> **Total Workflows**: 15

---

## 🔒 Core Axioms

1. **Atomic Precision**: Every step has explicit inputs, outputs, and verification.
2. **MCP Synergy**: Sequential Thinking for ALL complex decisions. Supabase/Shadcn for discovery.
3. **Total Sync**: Every completed action triggers Git push. No orphan work.
4. **Strict Adherence**: Execute EXACTLY as specified. No shortcuts.

---

## 🛠️ MCP Integration Matrix

| MCP Server            | Primary Tools                                                          | Used In                                     |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `sequential-thinking` | `sequentialthinking`                                                   | ALL complex decisions                       |
| `supabase-mcp-server` | `list_tables`, `execute_sql`, `apply_migration`, `get_advisors`        | write-spec, implement-tasks, verify-feature |
| `shadcn`              | `search_items`, `view_items`, `get_add_command`, `get_audit_checklist` | write-spec, implement-tasks, verify-feature |

---

## 🚀 The Execution Flow

### Phase 0: Orientation 🧭

| Command         | Purpose                           |
| --------------- | --------------------------------- |
| `/check-status` | Verify branch, tasks, GitHub sync |
| `/check-health` | Lint, build, test, DB advisors    |

### Phase 1: Inception & Context 📐

| #   | Command          | Purpose                                 | Next                 |
| --- | ---------------- | --------------------------------------- | -------------------- |
| 1   | `/plan-product`  | Update roadmap, define vision           | `/shape-spec`        |
| 2   | `/shape-spec`    | Scaffold directory + atomic artifacts   | `/write-spec`        |
| 3   | `/write-spec`    | Technical design with MCP discovery     | `/validate-spec`     |
| 4   | `/validate-spec` | Verify spec completeness                | `/create-tasks`      |
| 5   | `/create-tasks`  | Atomic checklist + GitHub Issue + Board | `/orchestrate-tasks` |

### Phase 2: Implementation Loop 🔄

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  /orchestrate-tasks ──► /implement-tasks            │
│         ▲                      │                    │
│         │                      ▼                    │
│         │              [Build/Test]                 │
│         │                 │    │                    │
│         │           PASS◄─┘    └─►FAIL              │
│         │                           │               │
│         │    /commit-sync           ▼               │
│         │         │           /fix-error            │
│         │         │                 │               │
│         └─────────┴─────────────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Phase 3: Finalization 🚢

| #   | Command             | Purpose                            | Next                |
| --- | ------------------- | ---------------------------------- | ------------------- |
| 1   | `/verify-feature`   | QA with artifacts + security check | `/finalize-feature` |
| 2   | `/finalize-feature` | Merge PR, update board, cleanup    | DONE                |
| E   | `/rollback`         | Emergency: revert changes          | Investigate         |

---

## 📁 Spec Directory Structure

```
agent-os/specs/[YYYY-MM-DD]-[feature-name]/
├── context.md          # Goal, scope, constraints
├── spec.md             # Schema, components, APIs
├── decisions.md        # Architectural decisions
├── tasks.md            # Atomic task checklist
├── execution_log.md    # Timestamped actions
└── verifications/
    ├── walkthrough.md
    └── final-verification.md
```

---

## 📋 Complete Workflow List (15)

| #   | File                   | Role         | Phase |
| --- | ---------------------- | ------------ | ----- |
| 1   | `00-master-guide.md`   | Reference    | -     |
| 2   | `check-status.md`      | Orientation  | 0     |
| 3   | `check-health.md`      | Verification | 0     |
| 4   | `plan-product.md`      | Strategic    | 1     |
| 5   | `shape-spec.md`        | Scaffolding  | 1     |
| 6   | `write-spec.md`        | Design       | 1     |
| 7   | `validate-spec.md`     | Gate         | 1     |
| 8   | `create-tasks.md`      | Breakdown    | 1     |
| 9   | `orchestrate-tasks.md` | Manager      | 2     |
| 10  | `implement-tasks.md`   | Worker       | 2     |
| 11  | `fix-error.md`         | Healer       | 2     |
| 12  | `commit-sync.md`       | Git Ops      | 2     |
| 13  | `verify-feature.md`    | QA           | 3     |
| 14  | `finalize-feature.md`  | Release      | 3     |
| 15  | `rollback.md`          | Emergency    | E     |

---

## 💡 Usage Example

```text
User: "Add comment reactions"

1.  /check-status           → Branch: main, clean state
2.  /shape-spec "reactions" → Creates agent-os/specs/2025-12-27-reactions/
3.  /write-spec             → Uses Supabase + Shadcn MCPs
4.  /validate-spec          → Confirms completeness
5.  /create-tasks           → Issue #45, Board link, Branch push
6.  /orchestrate-tasks      → Picks first task
7.  /implement-tasks        → Executes, logs, tests
8.  /commit-sync            → Commits, pushes
9.  (loop 6-8 until done)
10. /verify-feature         → Security check, artifacts
11. /finalize-feature       → Merge, board update
```

---

## ⚠️ Error Protocol

On ANY failure:

1. **STOP** current action
2. Log error to `execution_log.md`
3. Run `/fix-error`
4. If unrecoverable, run `/rollback`
