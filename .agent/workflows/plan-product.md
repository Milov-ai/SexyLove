---
description: "High-level product planning and roadmap update."
---

# /plan-product

> **Role**: Strategic | **Phase**: 1
> **Purpose**: Define vision and update roadmap
> **Next**: `/shape-spec`

---

## 📋 Detailed Instructions

**For complete step-by-step execution, read:**

```
agent-os/commands/plan-product/plan-product.md
```

This command executes a 4-phase process:

1. **Product Concept** - Gather product info
2. **Create Mission** - Write `agent-os/product/mission.md`
3. **Create Roadmap** - Write `agent-os/product/roadmap.md`
4. **Create Tech Stack** - Write `agent-os/product/tech-stack.md`

---

## 🛠️ MCP Enhancement

**Use Sequential Thinking for strategic analysis:**

```
mcp_sequential-thinking_sequentialthinking
  thought: "Analyzing product vision for [feature]. Consider:
            user needs, market fit, technical feasibility,
            dependencies, risks."
  thoughtNumber: 1
  totalThoughts: 5
  nextThoughtNeeded: true
```

---

## ✅ Verification

- [ ] `agent-os/product/mission.md` exists
- [ ] `agent-os/product/roadmap.md` exists
- [ ] `agent-os/product/tech-stack.md` exists

---

## 🔗 Handoff

```
Roadmap updated with [Feature Name].
Next: /shape-spec "[feature-slug]"
```
