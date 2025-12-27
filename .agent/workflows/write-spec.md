---
description: Draft the technical specification using MCPs for validation.
---

1.  **Context Loading**:
    - **Read**: `agent-os/specs/[feature]/context.md`.
    - **Read**: `agent-os/specs/[feature]/decisions.md`.

2.  **Technical Discovery (MCPs)**:
    - **UI**: `mcp_shadcn_search_items_in_registries` (Check availability).
    - **DB**: `mcp_supabase-mcp-server_list_tables` (Check schema).
    - **Logic**: `grep_search` (Check existing patterns).

3.  **Drafting (`spec.md`)**:
    - **Action**: Write to `agent-os/specs/[feature]/spec.md`.
    - **Structure**:
      - **Goal**: (From Context).
      - **Schema Changes**: (SQL).
      - **New Components**: (Shadcn names).
      - **API Changes**: (Edge Functions).

4.  **Decision Recording**:
    - **Action**: Update `decisions.md` with any new Architectural Decisions made during discovery (e.g., "Use Optimistic UI").

5.  **Notify**: "Spec drafted. Next: `/create-tasks` strictly following the specification in `.agent/workflows/create-tasks.md`."
