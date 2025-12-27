---
description: Check the detailed status of the current feature, branch, and GitHub sync.
---

1. **GitHub Status & Context**:
   - Run `gh pr status` to see if there is an open Pull Request.
   - Run `gh issue status --current` (or list assigned) to find the active Tracking Issue.
   - Run `git status` to check for uncommitted changes or untracked files.

2. **Branch & Environment**:
   - Identify current branch: `git branch --show-current`.
   - List local branches: `git branch`.
   - (Optional) Check Supabase branches: `mcp_supabase-mcp-server_list_branches` (requires `project_id` from context).

3. **Task Progress Analysis**:
   - Locate the active `tasks.md`. Look in `agent-os/specs/`.
     - _Heuristic_: Find the most recently modified directory in `agent-os/specs`.
   - Read `tasks.md`.
   - **Report to User**:
     - "Current Branch: [Name]"
     - "Active Task Spec: [Path]"
     - "Progress: [X] Done / [Y] Total"
     - "Next Action: [Next unchecked item]"

4. **Health Check** (Quick):
   - Run `npm run lint` (optional, skip if just checking status).
