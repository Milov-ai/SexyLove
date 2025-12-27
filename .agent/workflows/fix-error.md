---
description: The Healer. Diagnose and fix errors without losing context.
---

1.  **Context Recovery**:
    - **Read**: `agent-os/specs/[feature]/execution_log.md` (Read the last error).
    - **Read**: `agent-os/specs/[feature]/decisions.md` (Ensure fix is legal).

2.  **Diagnosis**:
    - **Tool**: `mcp_sequential-thinking_sequentialthinking`.
    - **Hypothesis**: Why did it fail? (Type error, import missing, logic bug).
    - **Log**: Append "Hypothesis: ..." to `execution_log.md`.

3.  **Correction**:
    - **Action**: Apply fix (`replace_file_content`).
    - **Log**: Append "Applied Fix..." to `execution_log.md`.

4.  **Verification (The Check)**:
    - **Action**: Retry the failing command (Build/Test).
    - **Condition**:
      - **Pass**: Return to `/implement-tasks`.
      - **Fail**: **REPEAT STEP 2** (Loop).

5.  **Return**: Notify user to resume `/implement-tasks` strictly following the specification in `.agent/workflows/implement-tasks.md`.
