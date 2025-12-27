---
description: "Validate spec completeness before task creation."
---

# /validate-spec

> **Role**: Quality Gate | **Phase**: 1
> **Purpose**: Ensure spec is complete and implementable
> **Next**: `/create-tasks` (if valid)

---

## Step 1: Load Spec

**Objective**: Read the specification

**Actions**:

1. Read `agent-os/specs/[feature]/spec.md`
2. Read `agent-os/specs/[feature]/context.md`

---

## Step 2: Completeness Checklist

**Objective**: Verify all required sections exist

**Checklist**:
| Section | Required | Present |
|---------|----------|---------|
| Overview | ✅ | [ ] |
| Database Schema | ✅ | [ ] |
| Components | ✅ | [ ] |
| API/Functions | Optional | [ ] |
| Security/RLS | ✅ | [ ] |
| Dependencies | ✅ | [ ] |

---

## Step 3: Technical Validation

**Objective**: Verify technical feasibility

**MCP Tool**:

```
mcp_sequential-thinking_sequentialthinking
  thought: "Validating spec for [feature]. Checking:
            1. Are all schema references valid?
            2. Do components exist in Shadcn?
            3. Are RLS policies complete?
            4. Are there any blocking dependencies?"
  thoughtNumber: 1
  totalThoughts: 3
  nextThoughtNeeded: true
```

---

## Step 4: Gap Analysis

**If gaps found**:

1. Document gaps in `execution_log.md`
2. Return to `/write-spec` to address gaps
3. Re-run `/validate-spec`

**If complete**:
Proceed to handoff

---

## Step 5: Handoff

**Notify**:

```
Spec validated. All sections complete.

Validation Summary:
- Schema: [N] tables defined
- Components: [M] identified
- RLS: [X] policies defined

Next: /create-tasks
```
