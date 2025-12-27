---
description: "Health check: Lint, build, and test verification."
---

# /check-health

> **Role**: Auxiliary | **Phase**: 0
> **Purpose**: Verify codebase health before/after changes
> **Called by**: `/verify-feature`, `/implement-tasks`, orientation

---

## Step 1: Lint Check

**Objective**: Ensure code style compliance

**Actions**:

```bash
npm run lint
```

**Success**: Exit code 0, no errors
**Failure**: Log errors, recommend `/fix-error`

---

## Step 2: Build Check

**Objective**: Ensure project compiles

**Actions**:

```bash
npm run build
```

**Success**: Exit code 0, build artifacts created
**Failure**: Log errors, recommend `/fix-error`

---

## Step 3: Test Check

**Objective**: Ensure tests pass

**Actions**:

```bash
npm test
```

**Success**: All tests pass
**Failure**: Log failures, recommend `/fix-error`

---

## Step 4: Database Advisors (Optional)

**Objective**: Check for DB security/performance issues

**Condition**: Only if Supabase project is connected

**MCP Tools**:

```
mcp_supabase-mcp-server_get_advisors
  project_id: [from context]
  type: "security"
```

**Action**: Report any warnings

---

## Step 5: Report

**Format**:

```markdown
## Health Report

| Check       | Status | Details           |
| ----------- | ------ | ----------------- |
| Lint        | ✅/❌  | [error count]     |
| Build       | ✅/❌  | [duration]        |
| Tests       | ✅/❌  | [pass/fail count] |
| DB Security | ✅/⚠️  | [advisory count]  |

**Overall**: HEALTHY / UNHEALTHY
**Action**: [Continue / Run /fix-error]
```

---

## Decision Tree

```
IF all pass:
  → Continue with next command
ELSE:
  → Run /fix-error for first failure
  → Re-run /check-health after fix
```
