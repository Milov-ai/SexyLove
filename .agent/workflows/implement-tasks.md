---
description: The Worker. Execute implementation loop with Continuous GitHub Sync.
---

1.  **Total Context Loading**:
    - **Read**: `agent-os/specs/[feature]/context.md`, `decisions.md`, `tasks.md`.
    - **Git Sync**: `git pull origin feature/[name]` (Ensure we are up to date).
    - **Log**: Append `## Starting Task: [Name]` to `execution_log.md`.

2.  **Atomic Planning**:
    - **Tool**: `mcp_sequential-thinking_sequentialthinking`.
    - **Goal**: Plan the specific code change.

3.  **Execution (Code)**:
    - **Action**: `mcp_shadcn_get_add_command`, `replace_file_content`, etc.
    - **Log**: Track changes in `execution_log.md`.

4.  **Safety Net (Build & Test)**:
    - **Action**: `npm run build` && `npm test`.
    - **Control de Errores**:
      - **IF FAILURE**: 🛑 STOP. Run `/fix-error` strictly following the specification in `.agent/workflows/fix-error.md` ALONG WITH any specific instructions defined in the current task context.
      - **IF SUCCESS**: Proceed to Sync.

5.  **Total GitHub Sync (The Commit)**:
    - **Local**:
      - Mark `[x]` in `tasks.md`.
      - `git commit -am "feat: [Task Name]"`
    - **Remote**:
      - `git push origin feature/[name]` (Continuous Backup).
    - **Project Board / Issue**:
      - _Optional_: `gh issue comment [IssueID] --body "Completed: [Task Name]"` to keep the board alive.

6.  **Loop**: Return to `/orchestrate-tasks` strictly following the specification in `.agent/workflows/orchestrate-tasks.md` ALONG WITH any specific instructions defined in the current task context.
