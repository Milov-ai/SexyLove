---
description: "Initialize the directory structure and Atomic Artifacts for a new feature."
---

# /shape-spec

> **Role**: Scaffolding | **Phase**: 1
> **Purpose**: Create spec directory with atomic artifacts
> **Next**: `/write-spec`

---

## 📋 Detailed Instructions

**For complete step-by-step execution, read:**

```
agent-os/commands/shape-spec/shape-spec.md
```

---

## 🚀 Quick Reference

### Required Inputs

| Input        | Description            | Example                 |
| ------------ | ---------------------- | ----------------------- |
| Feature Slug | kebab-case identifier  | `comment-reactions`     |
| Mission Goal | 1-2 sentence objective | "Allow emoji reactions" |

### Directory Structure Created

```
agent-os/specs/[YYYY-MM-DD]-[feature-slug]/
├── context.md          # Goal, scope, constraints
├── spec.md             # Technical design (empty)
├── tasks.md            # Checklist (empty)
├── decisions.md        # ADRs (empty)
├── execution_log.md    # Action journal
├── planning/
│   ├── requirements.md
│   └── visuals/
└── verifications/
```

---

## ✅ Verification

- [ ] Spec directory created
- [ ] `context.md` populated with goal
- [ ] `execution_log.md` has initial entry

---

## 🔗 Handoff

```
Spec shaped at: agent-os/specs/[DATE]-[feature-slug]/
Context initialized. Artifacts ready.

Next: /write-spec
```
