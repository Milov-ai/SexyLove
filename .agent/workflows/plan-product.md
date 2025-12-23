---
description: Initialize or update the product mission, roadmap, and tech stack using the Agent OS framework.
---

1. Read the comprehensive instructions in `agent-os/commands/plan-product/plan-product.md`.
2. Check if `agent-os/product/` already contains `mission.md`, `roadmap.md`, and `tech-stack.md`.
3. If files exist, review them against the current project state.
4. If working on a new high-level vision, follow the phases in the instruction file to gather info and regenerate the Product Layer artifacts.

5. **Github Integration (Roadmap)**:
   - Use `mcp_sequential-thinking_sequentialthinking` to plan.
   - **Sync Roadmap**:
     - Identify high-level milestones in `roadmap.md`.
     - Search for corresponding tracking issues: `mcp_github-mcp-server_search_issues`.
     - Create Issues for major items using `mcp_github-mcp-server_issue_write` (method="create", labels=["roadmap", "milestone"]).
   - **Github Projects (V2 Boards) Integration**:
     - Run `run_command` 'gh project list --owner [Owner]' to identify the active project (e.g., "Roadmap").
     - Add major roadmap items (Issues) to the Project Board: `run_command` 'gh project item-add [ProjectNumber] --owner [Owner] --url [IssueURL]'.
