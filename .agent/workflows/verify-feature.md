---
description: Quality Assurance. Generate proof of work and Push Artifacts.
---

1.  **Pre-Flight Check**:
    - **Task Verify**: All items in `tasks.md` MUST be `[x]`.
    - **Code Verify**: `npm run build` MUST pass.

2.  **Artifact Generation**:
    - **Walkthrough**: Create `agent-os/specs/[feature]/verifications/walkthrough.md`.
    - **Final Report**: Create `agent-os/specs/[feature]/verifications/final-verification.md`.

3.  **Artifact Synchronization**:
    - **Action**: `git add agent-os/specs/[feature]/verifications/`
    - **Action**: `git commit -m "chore: add verification reports"`
    - **Action**: `git push origin feature/[name]`
    - **Identify**: Run `gh pr list` to see if a PR exists. If not, note this for `/finalize-feature`.

4.  **Handoff**:
    - **Notify**: "Feature verified and artifacts PUSHED to remote. Ready to ship. Run `/finalize-feature` strictly following the specification in `.agent/workflows/finalize-feature.md` ALONG WITH any specific instructions defined in the current task context."
