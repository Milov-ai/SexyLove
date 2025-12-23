---
description: Execute the implementation of assigned tasks for a feature and sync with Github.
---

1. **Github Setup**:
   - Use `mcp_sequential-thinking_sequentialthinking` to plan.
   - Run `git remote -v`.
   - **Branch**: Ensure you are on the correct branch `feature/[feature-name]`.
     - Check: `git branch`
     - Create/Switch: `mcp_github-mcp-server_create_branch` or `git checkout -b feature/[name]`.
   - **Project Status (In Progress)**:
     - Find the Tracking Issue in the Project Board using `gh project item-list [ProjectNumber] --owner [Owner]`.
     - Move it to the **"In Progress"** column:
       - Get Project ID: Use the Project Number from context or list projects.
       - Get Field IDs: `gh project field-list [ProjectNumber] --owner [Owner]`.
       - Update Item: `gh project item-edit --project-id [ProjectID] --id [ItemID] --field-id [StatusFieldID] --single-select-option-id [InProgressOptionID]`.

2. Read the instructions in `agent-os/commands/implement-tasks/implement-tasks.md`.
3. Identify pending tasks in `agent-os/specs/[feature-name]/tasks.md`.
4. Implement the feature according to the `agent-os/standards/` and the technical spec.

5. **Github Sync (Implementation Phase)**:
   - **Push**: Run `run_command` 'git push origin feature/[name]' (ensure upstream set).
   - **Update Issue**:
     - Find the Tracking Issue: `mcp_github-mcp-server_search_issues` (query="[Feature Name] is:issue").
     - Update the issue body checkboxes to reflect completed tasks using `mcp_github-mcp-server_issue_write`.
   - **Project Status (Done/Review)**:
     - Move the Project Item to **"Ready for Review"** (or "Done") using `gh project item-edit` as described above (requiring `--project-id`).
   - **Pull Request**:
     - Check for existing PR: `mcp_github-mcp-server_search_pull_requests`.
     - IF Ready for Verify/Review and NO PR exists: Create one using `mcp_github-mcp-server_create_pull_request`:
       - base: "main"
       - head: "feature/[name]"
       - title: "feat: [Feature Name]"
       - body: "Closes #[TrackingIssueNumber]\n\n## Implementation Details\n..."

6. Self-verify with tests/screenshots and mark tasks as complete `[x]`.

7. **Final Verification & Close**:
   - Ask the user: "Does the feature work well? Are there any errors?"
   - **IF Verified/No Errors**:
     - Move the Project Item to **"Done"**:
       - `gh project item-edit --project-id [ProjectID] --id [ItemID] --field-id [StatusFieldID] --single-select-option-id [DoneOptionID]`.
     - **Merge to Main**:
       - **Prerequisite**: Ensure all CI/CD checks have passed.
       - Execution: `gh pr merge --squash --delete-branch` (Preferred for clean history) OR `--merge`.
       - _Note_: The "Closes #[IssueID]" in the PR body will automatically close the tracking issue.
