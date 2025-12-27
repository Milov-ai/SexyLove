---
description: "Draft the technical specification using MCPs for validation."
---

# /write-spec

> **Role**: Technical Design | **Phase**: 1
> **Purpose**: Create detailed technical spec with MCP discovery
> **Next**: `/validate-spec`

---

## 📋 Detailed Instructions

**For complete step-by-step execution, read:**

```
agent-os/commands/write-spec/write-spec.md
```

---

## 🛠️ MCP Integration

### Database Discovery (Supabase)

```
mcp_supabase-mcp-server_list_tables
  project_id: [from context]
  schemas: ["public"]
```

```
mcp_supabase-mcp-server_execute_sql
  project_id: [from context]
  query: "SELECT column_name, data_type FROM information_schema.columns
          WHERE table_name = '[table]'"
```

### UI Component Discovery (Shadcn)

```
mcp_shadcn_search_items_in_registries
  registries: ["@shadcn"]
  query: "[component type]"
```

### Strategic Planning

```
mcp_sequential-thinking_sequentialthinking
  thought: "Planning implementation for [feature]..."
  thoughtNumber: 1
  totalThoughts: 5
  nextThoughtNeeded: true
```

---

## 📝 Spec Structure

Write to `agent-os/specs/[feature]/spec.md`:

```markdown
# Specification: [Feature Name]

## Goal

[1-2 sentences]

## User Stories

- As a [user], I want to [action] so that [benefit]

## Specific Requirements

**Requirement Name**

- [Sub-requirements]

## Existing Code to Leverage

**Code/Component**

- [How to reuse]

## Out of Scope

- [Excluded items]
```

---

## ✅ Verification

- [ ] `spec.md` has all required sections
- [ ] Database schema documented
- [ ] Components identified

---

## 🔗 Handoff

```
Spec drafted at: agent-os/specs/[feature]/spec.md
Next: /validate-spec
```
