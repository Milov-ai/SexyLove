---
description: "Atomic commit + push operation."
---

# /commit-sync

> **Role**: Auxiliary | **Phase**: 2
> **Purpose**: Atomic Git commit and push
> **Next**: Return to calling workflow

---

## Step 1: Pre-Commit Check

**Objective**: Ensure clean state for commit

**Actions**:

```bash
# Check for changes
git status --short

# Verify build passes
npm run build
```

**Gate**: Only proceed if build passes

---

## Step 2: Stage Changes

**Objective**: Prepare changes for commit

**Actions**:

```bash
# Stage all changes (code + logs)
git add -A

# Alternative: stage specific files
git add src/ agent-os/specs/[feature]/
```

---

## Step 3: Commit

**Objective**: Create atomic commit

**Commit Message Format**:

```
[type]: [description]

- [change 1]
- [change 2]

Spec: agent-os/specs/[feature]/
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance
- `docs`: Documentation
- `refactor`: Code restructure

**Actions**:

```bash
git commit -m "[type]: [description]"
```

---

## Step 4: Push

**Objective**: Sync with remote

**Actions**:

```bash
git push origin feature/[name]
```

**Fallback** (if rejected):

```bash
git pull --rebase origin feature/[name]
git push origin feature/[name]
```

---

## Step 5: Verify Sync

**Objective**: Confirm remote state

**Actions**:

```bash
# Confirm push succeeded
git log origin/feature/[name] -1 --oneline
```

---

## Step 6: Log & Return

**Append to `execution_log.md`**:

```markdown
## [TIMESTAMP]

- **Action**: Commit & Push
- **Commit**: [hash]
- **Message**: [commit message]
```

**Notify**:

```
Committed: [hash]
Message: [type]: [description]
Pushed to: origin/feature/[name]
```
