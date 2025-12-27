---
description: The Manager. Decides which task group to implement next.
---

1.  **Status Check**:
    - **Read**: `agent-os/specs/[feature]/tasks.md`.
    - **Identify**: Next unchecked `[ ]` Item.

2.  **Delegation**:
    - **Action**: Call `/implement-tasks`.
    - **Context**: Pass the specific Task Name/ID.
    - **Constraint**: Execute strictly following the specification in `.agent/workflows/implement-tasks.md`.

3.  **Loop Management**:
    - **Condition**: If `implement-tasks` returns success, check `tasks.md` again.
    - **Loop**: Continue delegating until all are `[x]`.

4.  **Completion**:
    - **Condition**: All tasks `[x]`.
    - **Action**: Notify user to run `/verify-feature` strictly following the specification in `.agent/workflows/verify-feature.md`.
