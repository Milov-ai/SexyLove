---
description: "Emergency rollback procedure."
---

# /rollback

> **Role**: Emergency | **Phase**: Any
> **Purpose**: Revert changes when unrecoverable error occurs
> **Next**: Investigate root cause

---

## ⚠️ Warning

This command should only be used when:

- `/fix-error` has failed 3+ times
- Critical bug discovered in merged code
- Irreversible corruption detected

---

## Step 1: Assess Damage

**Objective**: Understand what needs rollback

**MCP Tool**:

```
mcp_sequential-thinking_sequentialthinking
  thought: "Assessing rollback need.
            Symptoms: [describe]
            Last working state: [commit hash or date]
            Affected files: [list]
            Best rollback strategy: ..."
  thoughtNumber: 1
  totalThoughts: 3
  nextThoughtNeeded: true
```

---

## Step 2: Choose Strategy

**Options**:

### Option A: Revert Single Commit

```bash
git revert [COMMIT_HASH]
git push origin [branch]
```

### Option B: Reset to Known Good State

```bash
# WARNING: Destructive
git reset --hard [COMMIT_HASH]
git push --force origin [branch]
```

### Option C: Supabase Migration Rollback

```bash
# Via Supabase Dashboard or MCP
mcp_supabase-mcp-server_reset_branch
  branch_id: [branch_id]
  migration_version: [version_to_reset_to]
```

---

## Step 3: Execute Rollback

**Actions**:

1. Execute chosen strategy
2. Verify build:
   ```bash
   npm run build
   ```
3. Verify state matches expected

---

## Step 4: Document

**Append to `execution_log.md`**:

```markdown
## [TIMESTAMP] ⚠️ ROLLBACK

- **Reason**: [why rollback was needed]
- **Strategy**: [A/B/C]
- **Reverted to**: [commit or state]
- **Author**: Agent

### Post-Mortem

[Brief description of what went wrong]

### Prevention

[How to avoid this in future]
```

---

## Step 5: Notify

**Notify**:

```
⚠️ ROLLBACK EXECUTED

Reason: [description]
State: Reverted to [commit/date]

Action Required:
1. Investigate root cause
2. Update decisions.md with learnings
3. Re-attempt with fix: /shape-spec or /implement-tasks
```
