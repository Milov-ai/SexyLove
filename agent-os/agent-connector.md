# Agent OS Connector

This document formalizes how AI agents interpret and execute commands.

## 🚀 Entry Point Protocol

**CRITICAL**: At the start of ANY new session:

1. Read `.agent/workflows/00-master-guide.md`
2. Load active context from `agent-os/specs/[most-recent]/`
3. Run `/check-status` to understand current state

---

## 📋 Command Mapping

### Phase 1: Inception

| Command         | Workflow                           | Detailed Instructions                            |
| --------------- | ---------------------------------- | ------------------------------------------------ |
| `/plan-product` | `.agent/workflows/plan-product.md` | `agent-os/commands/plan-product/plan-product.md` |
| `/shape-spec`   | `.agent/workflows/shape-spec.md`   | `agent-os/commands/shape-spec/shape-spec.md`     |
| `/write-spec`   | `.agent/workflows/write-spec.md`   | `agent-os/commands/write-spec/write-spec.md`     |
| `/create-tasks` | `.agent/workflows/create-tasks.md` | `agent-os/commands/create-tasks/create-tasks.md` |

### Phase 2: Implementation

| Command              | Workflow                                | Detailed Instructions                                      |
| -------------------- | --------------------------------------- | ---------------------------------------------------------- |
| `/orchestrate-tasks` | `.agent/workflows/orchestrate-tasks.md` | `agent-os/commands/orchestrate-tasks/orchestrate-tasks.md` |
| `/implement-tasks`   | `.agent/workflows/implement-tasks.md`   | `agent-os/commands/implement-tasks/implement-tasks.md`     |

### Auxiliary Commands

| Command             | Workflow                               | Purpose           |
| ------------------- | -------------------------------------- | ----------------- |
| `/check-status`     | `.agent/workflows/check-status.md`     | Current state     |
| `/check-health`     | `.agent/workflows/check-health.md`     | Lint/Build/Test   |
| `/validate-spec`    | `.agent/workflows/validate-spec.md`    | Quality gate      |
| `/fix-error`        | `.agent/workflows/fix-error.md`        | Error recovery    |
| `/commit-sync`      | `.agent/workflows/commit-sync.md`      | Git operations    |
| `/verify-feature`   | `.agent/workflows/verify-feature.md`   | QA with artifacts |
| `/finalize-feature` | `.agent/workflows/finalize-feature.md` | Merge & cleanup   |
| `/rollback`         | `.agent/workflows/rollback.md`         | Emergency revert  |

---

## 🔄 Execution Protocol

1. **Read Workflow**: Load the corresponding `.agent/workflows/[command].md`
2. **Check for Detailed Instructions**: If workflow references `agent-os/commands/`, read those too
3. **Verify Context**: Check existing spec files in `agent-os/specs/`
4. **Execute with MCPs**: Use Sequential Thinking, Supabase, Shadcn as specified
5. **Sync**: Commit and push after significant actions
6. **Confirm**: Update user on completion with next step

---

## 🛠️ MCP Integration

All commands should leverage MCPs when appropriate:

- **Sequential Thinking**: Complex planning, debugging, task breakdown
- **Supabase**: Schema discovery, migrations, security advisors
- **Shadcn**: Component discovery, installation, audit
