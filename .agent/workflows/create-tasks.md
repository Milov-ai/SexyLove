---
description: "Generate the granular atomic checklist and Sync with GitHub Project Board."
---

# /create-tasks

> **Role**: Task Breakdown | **Phase**: 1
> **Purpose**: Atomic task creation + GitHub Issue + Board sync
> **Next**: `/orchestrate-tasks`

---

## 📋 Detailed Instructions

**For complete step-by-step execution, read:**

```
agent-os/commands/create-tasks/create-tasks.md
```

---

## 🛠️ MCP Enhancement

**Use Sequential Thinking for task breakdown:**

```
mcp_sequential-thinking_sequentialthinking
  thought: "Breaking down [feature] into atomic tasks.
            Rules: Each task < 1 hour, independently testable.
            Groups: Setup, Backend, Frontend, Verify."
  thoughtNumber: 1
  totalThoughts: 5
  nextThoughtNeeded: true
```

---

## 🔄 GitHub Sync Protocol

### 1. Create Issue

```bash
gh issue create \
  --title "feat: [Feature Name]" \
  --body-file agent-os/specs/[feature]/context.md \
  --label "enhancement"
```

### 2. Link to Project Board

```bash
# Get issue URL
ISSUE_URL=$(gh issue view [NUMBER] --json url -q '.url')

# Add to project
gh project item-add [PROJECT_NUMBER] --owner [OWNER] --url $ISSUE_URL
```

### 3. Create & Push Branch

```bash
git checkout -b feature/[feature-slug]
git add agent-os/specs/[feature]/
git commit -m "chore: initialize spec for [feature]"
git push -u origin feature/[feature-slug]
```

---

## ✅ Verification

- [ ] `tasks.md` has atomic tasks grouped by category
- [ ] GitHub Issue created
- [ ] Issue linked to Project Board
- [ ] Branch pushed to remote

---

## 🔗 Handoff

```
Tasks generated: [N] atomic tasks
GitHub Issue: #[number]
Branch: feature/[feature-slug]

Next: /orchestrate-tasks
```
