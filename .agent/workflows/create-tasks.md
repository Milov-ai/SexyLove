---
description: Generate the granular atomic checklist and Sync with GitHub Project Board.
---

1.  **Input Analysis**:
    - **Read**: `agent-os/specs/[feature]/spec.md`.
    - **Context**: Ensure you know the _current phase_ to set the correct Project Board status.

2.  **Brainstorming (Atomic Breakdown)**:
    - **Tool**: `mcp_sequential-thinking_sequentialthinking`.
    - **Constraint**: Tasks must be atomic (<1hr). Group by "Setup", "Backend", "Frontend", "Verify".

3.  **Generation (`tasks.md`)**:
    - **Write**: `agent-os/specs/[feature]/tasks.md`.
    - **Format**: `-[ ] Task Description` (Markdown checkboxes).

4.  **GitHub Synchronization (Total Sync)**:
    - **Issue Creation**:
      ```bash
      gh issue create --title "feat: [Feature Name]" --body-file agent-os/specs/[feature]/context.md
      ```
    - **Project Board**:
      - **Action**: Link the new issue to the "Agent OS" (or active) Project Board.
      - **Command**: `gh project item-create --owner [Owner] --project [Project] --format json` (or manual linkage instructions if ID unknown).
    - **Branch**:
      ```bash
      git checkout -b feature/[feature-name]
      git push -u origin feature/[feature-name]
      ```

5.  **Notify**: "Tasks generated. Issue created & linked to Board. Branch pushed. Next: `/orchestrate-tasks` (The Manager) - Strictly following the specification in `.agent/workflows/orchestrate-tasks.md` ALONG WITH any specific instructions defined in the current task context."
