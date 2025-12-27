---
description: "MASTER GUIDE: The definitive Agent OS lifecycle with Atomic Specification, MCP Synergy, and Total GitHub Sync."
---

# Agent OS v2.0: Unified Workflow System

> **Protocol ID**: #AgentOS_Unified_v2
> **Status**: ACTIVE | UNIVERSAL SPECIFICATION

---

## 🚀 AI Entry Point Protocol

**CRITICAL**: When starting a new AI chat session, ALWAYS:

1. **Read this file first** to understand the workflow system
2. **Load active context** from `agent-os/specs/[most-recent-spec]/context.md`
3. **Check status** with `/check-status` to understand current state
4. **Reference detailed instructions** in `agent-os/commands/[command]/`

---

## 📂 Architecture Overview

```
.agent/workflows/           ← Quick-reference workflows (this directory)
   └── Points to...

agent-os/                   ← Detailed instructions & artifacts
   ├── agent-connector.md   ← Command mapping reference
   ├── commands/            ← DETAILED step-by-step instructions
   │   ├── plan-product/
   │   ├── shape-spec/
   │   ├── write-spec/
   │   ├── create-tasks/
   │   ├── orchestrate-tasks/
   │   └── implement-tasks/
   ├── product/             ← Mission, roadmap, tech-stack
   ├── specs/               ← Feature specifications
   └── standards/           ← Coding standards
```

---

## 🔒 Core Axioms

1. **Context First**: Always load existing context before any action
2. **Atomic Precision**: Every step has explicit inputs, outputs, verification
3. **MCP Synergy**: Sequential Thinking for ALL complex decisions
4. **Total Sync**: Every action triggers Git + GitHub sync
5. **Reference Commands**: `.agent/workflows` → `agent-os/commands/`

---

## 🛠️ MCP Integration Matrix

| MCP Server            | Primary Tools                                                          | Usage                          |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| `sequential-thinking` | `sequentialthinking`                                                   | All complex planning/debugging |
| `supabase-mcp-server` | `list_tables`, `execute_sql`, `apply_migration`, `get_advisors`        | Schema, migrations, security   |
| `shadcn`              | `search_items`, `view_items`, `get_add_command`, `get_audit_checklist` | UI components                  |

---

## 📋 Command Reference

### Phase 0: Orientation

| Command         | Purpose              | Detailed Instructions              |
| --------------- | -------------------- | ---------------------------------- |
| `/check-status` | Verify current state | `.agent/workflows/check-status.md` |
| `/check-health` | Lint, build, test    | `.agent/workflows/check-health.md` |

### Phase 1: Inception

| Command          | Purpose           | Detailed Instructions                            |
| ---------------- | ----------------- | ------------------------------------------------ |
| `/plan-product`  | Vision & roadmap  | `agent-os/commands/plan-product/plan-product.md` |
| `/shape-spec`    | Scaffold spec dir | `agent-os/commands/shape-spec/shape-spec.md`     |
| `/write-spec`    | Technical design  | `agent-os/commands/write-spec/write-spec.md`     |
| `/validate-spec` | Quality gate      | `.agent/workflows/validate-spec.md`              |
| `/create-tasks`  | Task breakdown    | `agent-os/commands/create-tasks/create-tasks.md` |

### Phase 2: Implementation

| Command              | Purpose        | Detailed Instructions                                      |
| -------------------- | -------------- | ---------------------------------------------------------- |
| `/orchestrate-tasks` | Task selection | `agent-os/commands/orchestrate-tasks/orchestrate-tasks.md` |
| `/implement-tasks`   | Code execution | `agent-os/commands/implement-tasks/implement-tasks.md`     |
| `/fix-error`         | Error recovery | `.agent/workflows/fix-error.md`                            |
| `/commit-sync`       | Git operations | `.agent/workflows/commit-sync.md`                          |

### Phase 3: Finalization

| Command             | Purpose           | Detailed Instructions                  |
| ------------------- | ----------------- | -------------------------------------- |
| `/verify-feature`   | QA with artifacts | `.agent/workflows/verify-feature.md`   |
| `/finalize-feature` | Merge & cleanup   | `.agent/workflows/finalize-feature.md` |
| `/rollback`         | Emergency revert  | `.agent/workflows/rollback.md`         |

---

## 🔄 GitHub Sync Protocol

### Issue Linking to Project Board

When creating tasks (`/create-tasks`):

```bash
# 1. Create issue
gh issue create --title "feat: [Feature]" --body-file context.md

# 2. Get issue URL
ISSUE_URL=$(gh issue view [NUMBER] --json url -q '.url')

# 3. Add to project board
gh project item-add [PROJECT_NUMBER] --owner [OWNER] --url $ISSUE_URL

# 4. Update status
gh project item-edit --id [ITEM_ID] --field "Status" --value "In Progress"
```

### Continuous Sync

- Every `/commit-sync` pushes to remote
- Every task completion updates issue comments
- `/finalize-feature` updates board to "Done"

---

## 📁 Context Loading Protocol

**At session start**, read in this order:

1. `agent-os/product/mission.md` (product vision)
2. `agent-os/product/roadmap.md` (current priorities)
3. `agent-os/specs/[most-recent]/context.md` (active feature)
4. `agent-os/specs/[most-recent]/tasks.md` (current progress)
5. `agent-os/specs/[most-recent]/execution_log.md` (history)

---

## 💡 Quick Start

```text
# New feature
1. /check-status           → Understand current state
2. /plan-product           → Update roadmap (if new vision)
3. /shape-spec "feature"   → Create spec directory
4. /write-spec             → Technical design
5. /create-tasks           → Breakdown + GitHub sync
6. /orchestrate-tasks      → Start implementation loop

# Resume work
1. /check-status           → Find active spec
2. /orchestrate-tasks      → Continue where left off
```

---

## ⚠️ Error Protocol

On ANY failure:

1. **STOP** current action
2. Log error to `execution_log.md`
3. Run `/fix-error` (uses Sequential Thinking)
4. If unrecoverable, run `/rollback`
