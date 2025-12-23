---
description: Generate a detailed tasks.md checklist for a specific feature implementation and sync with Github.
---

1. Read the instructions in `agent-os/commands/create-tasks/create-tasks.md`.
2. Analyze the relevant `requirements.md` and technical specs for the feature.
3. Breakdown the implementation into atomic, testable steps.
4. Create or update `agent-os/specs/[feature-name]/tasks.md`.
5. **Github Integration (Traceability & Planning)**:
   - **Plan**: Use `mcp_sequential-thinking_sequentialthinking` to plan the Github sync strategy.
   - **Identify Context**: Run `git remote -v` to confirm the Repository Owner and Name.
   - **Sync Issue**:
     - Search for an existing Tracking Issue: `mcp_github-mcp-server_search_issues` (query="[Feature Name] is:issue").
     - **IF Found**: Update the issue body with the new checklist from `tasks.md` using `mcp_github-mcp-server_issue_write` (method="update").
     - **IF Not Found**: Create a new Tracking Issue using `mcp_github-mcp-server_issue_write` (method="create") with:
       - Title: "Feature: [Feature Name]"
       - Body: content of `tasks.md`
       - Labels: `enhancement`, `planned`
   - **Branch Strategy**:
     - Check if a feature branch exists (`git branch --list`).
     - If not, create one remotely using `mcp_github-mcp-server_create_branch` (name="feature/[feature-name]", from_branch="main") OR locally (`git checkout -b ...`).
   - **Github Projects (V2 Boards) Integration**:
     - Run `run_command` 'gh project list --owner [Owner]' to identify the active project (e.g., "Roadmap", "Backlog").
     - Get the Project Number.
     - Add the confirmed Tracking Issue to the Project: `run_command` 'gh project item-add [ProjectNumber] --owner [Owner] --url [IssueURL]'.
