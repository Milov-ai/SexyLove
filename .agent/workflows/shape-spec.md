---
description: Initialize the directory structure and Atomic Artifacts for a new feature.
---

1.  **Input Analysis**:
    - **Action**: Ask user for Feature Name (e.g., `auth-flow`).
    - **Action**: Ask user for "Mission Goal" (to populate Context).

2.  **Scaffolding (Atomic Structure)**:
    - **Directory**: `mkdir -p agent-os/specs/[YYYY-MM-DD]-[feature-name]/verifications`.
    - **Files**:
      - `touch agent-os/specs/[...]/spec.md` (Native).
      - `touch agent-os/specs/[...]/tasks.md` (Native).
      - `touch agent-os/specs/[...]/execution_log.md` (Atomic).
      - `touch agent-os/specs/[...]/context.md` (Atomic).
      - `touch agent-os/specs/[...]/decisions.md` (Atomic).

3.  **Context Engineering (Seed the Brain)**:
    - **Write `context.md`**:

      ```markdown
      # Context: [Feature Name]

      ## Goal

      [User Goal]

      ## Definition of Done

      - [ ] All tasks in tasks.md completed.
      - [ ] Build passes.
      - [ ] Tests pass.
      ```

    - **Write `execution_log.md`**:

      ```markdown
      # Execution Log

      [Timestamp] Spec shaped.
      ```

4.  **Notify**: "Spec shaped at `agent-os/specs/[...]`. Context initialized. Next: `/write-spec` strictly following the specification in `.agent/workflows/write-spec.md` ALONG WITH any specific instructions defined in the current task context."
