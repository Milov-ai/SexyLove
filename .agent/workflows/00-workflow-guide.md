---
description: MASTER GUIDE. The definitive "Step-by-Step" to the Agent OS lifecycle with Atomic Specification & Total GitHub Sync.
---

# Agent OS: Atomic Workflow Lifecycle (Total Sync Edition)

This guide defines the **Total Context Engineering** process. It uses the **Native Agent OS** commands, enhanced with **Atomic Artifacts**.

## 🔒 The Rule of Total Sync

1.  **Always Push**: Every completed task triggers a `git push`.
2.  **Always Link**: Issues and Project Boards are linked immediately.
3.  **Atomic State**: No skipping steps. Context must be preserved.
4.  **Strict Adherence**: Every Agent OS command must be executed **strictly following the specification** in its corresponding `.agent/workflows/[command].md` file.

---

## 🚀 The Execution Flow (The Strict Chain)

### Phase 0: Orientation 🧭

- **`/check-status`**: Run this anytime to verify Branch, Task execution status, and GitHub Sync state.

### Phase 1: Inception & Context

1.  **`/plan-product`**:
    - _Goal_: Update Roadmap and define high-level vision.
2.  **`/shape-spec`**:
    - _Goal_: Scaffold directory + Initialize `context.md` (Brain) & `execution_log.md`.
    - _Next Step_: `/write-spec`.
3.  **`/write-spec`**:
    - _Goal_: Draft technical design (`spec.md`) using MCPs to validate choices.
    - _Next Step_: `/create-tasks`.
4.  **`/create-tasks`**:
    - _Goal_: Generate Checklist + **Create GitHub Issue** + **Link to Board** + **Push Branch**.
    - _Next Step_: `/orchestrate-tasks`.

### Phase 2: The Implementation Loop 🔄

**Repeat until `tasks.md` is all `[x]`.**

5.  **`/orchestrate-tasks`** (Manager):
    - _Action_: Picks the next task.
    - _Next Step_: Delegates to `/implement-tasks`.
6.  **`/implement-tasks`** (Worker):
    - _Action_: Code -> Log -> Build -> Test.
    - **SYNC**: On success, **Commits & Pushes** immediately.
    - **Error**: Fail? -> Run `/fix-error`.
    - **Success**: Done? -> Return to `/orchestrate-tasks`.
7.  **`/fix-error`** (Healer):
    - _Action_: Diagnose -> Fix -> Verify -> Push.
    - _Next Step_: Return to `/implement-tasks`.

### Phase 3: Finalization 🚢

8.  **`/verify-feature`**:
    - _Action_: Generate `walkthrough.md` & `final-verification.md` -> **PUSH**.
    - _Next Step_: `/finalize-feature`.
9.  **`/finalize-feature`**:
    - _Action_: Merge PR + Update Board to "Done" + Cleanup.

---

## 💡 Correct Usage Example

```text
User: "Refactor the Login."

1. /check-status (Where am I?)
2. /shape-spec "auth-refactor"
   (Creates folder, context, logs).
3. /write-spec
   (Checks DB, creates spec.md).
4. /create-tasks
   (Gen tasks. Creates Issue #123. Links to Board. Pushes).
5. /orchestrate-tasks
   (Decides to start Item 1).
6. /implement-tasks
   (Codes Item 1. Tests Pass. PUSHES).
7. /orchestrate-tasks
   (Decides to start Item 2).
8. /implement-tasks
   (Codes Item 2. Tests FAIL).
9. /fix-error
   (Fixes code. PUSHES).
10. /verify-feature
    (Generates Proof. PUSHES).
11. /finalize-feature
    (Merges PR. Updates Board. Done).
```
