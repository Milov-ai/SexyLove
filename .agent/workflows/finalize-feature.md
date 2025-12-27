---
description: Ship it. Merge, Update Board, and Cleanup.
---

1.  **Sync Gate (Strict)**:
    - **Check Verification**: Has `/verify-feature` been run?
    - **Check State**: `git status` must be clean.
    - **Check Remote**: `git fetch` && `git status`. Ensure no divergence.

2.  **Pull Request Management**:
    - **Create**:
      ```bash
      gh pr create --title "feat: [Feature Name]" --body-file agent-os/specs/[feature]/verifications/final-verification.md --web
      ```
    - **Wait**: If manual approval is needed, wait. If auto, proceed.

3.  **Merge Execution**:
    - **Merge**: `gh pr merge --squash --delete-branch`.
    - **Local Cleanup**:
      ```bash
      git checkout main
      git pull origin main
      git branch -D feature/[name]
      ```

4.  **Project Board Finalization**:
    - **Action**: Update the GitHub Project Item status to "Done".
    - **Command**: `gh project item-edit --id [ItemID] --field status="Done"` (or equivalent).
    - **Fallback**: If automated command fails, explicitly tell User: "Please move Issue #[ID] to Done on the Board."

5.  **Celebrate**:
    - **Notify**: "Feature Merged. Board Updated. Main is current."
