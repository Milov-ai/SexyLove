# Agent OS Connector

This document formalizes how I (Antigravity) interpret and execute the commands in `agent-os/commands/`.

## Operative Rule

Whenever the USER invokes an Agent OS command (prepended with `/`) or asks for a task that corresponds to one of the following phases, I will immediately refer to the specified instruction set and follow it step-by-step.

## Command Mapping

| Command              | Instruction File                                           | Primary Agent Role |
| :------------------- | :--------------------------------------------------------- | :----------------- |
| `/plan-product`      | `agent-os/commands/plan-product/plan-product.md`           | Product Planner    |
| `/write-spec`        | `agent-os/commands/write-spec/write-spec.md`               | Spec Writer        |
| `/shape-spec`        | `agent-os/commands/shape-spec/shape-spec.md`               | Spec Shaper        |
| `/create-tasks`      | `agent-os/commands/create-tasks/create-tasks.md`           | Task Creator       |
| `/implement-tasks`   | `agent-os/commands/implement-tasks/implement-tasks.md`     | Implementer        |
| `/orchestrate-tasks` | `agent-os/commands/orchestrate-tasks/orchestrate-tasks.md` | Orchestrator       |

## Execution Protocol

1.  **Read**: Load the corresponding `.md` instruction.
2.  **Verify Context**: Check existing `agent-os/product/` or `agent-os/specs/` files.
3.  **Execute**: Perform the tool calls (Write, Read, Bash) as directed in the phases.
4.  **Confirm**: Update the user on completion and link the generated artifacts.
