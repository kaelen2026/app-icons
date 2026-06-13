# Agent Workflow

This project uses a coordinator-led, subagent-driven workflow for non-trivial
changes. The goal is to keep planning, implementation, and review as separate
responsibilities instead of letting one worker own the whole flow.

## Roles

- The main agent owns planning, sequencing, integration decisions, verification,
  and final reporting.
- Coding subagents own scoped implementation tasks from an approved plan.
- Review subagents own independent code review after coding work is complete.
- A subagent that wrote code for a task must not be the sole reviewer for that
  same task.

## Required Flow

1. Create or update a short implementation plan for multi-step changes.
2. Split the plan into independently reviewable tasks when the work crosses
   modules, file boundaries, or behavior surfaces.
3. Assign coding tasks to one or more coding subagents when practical.
4. Integrate completed subagent work in the main workspace.
5. Run focused verification for each completed task before moving to broad
   verification.
6. Use a separate review subagent for code review after implementation.
7. Fix review findings before final verification and completion.

Small one-file fixes may be handled directly by the main agent, but the main
agent should still separate implementation and review when risk is meaningful.

## Review Expectations

Review subagents should focus on:

- behavioral regressions;
- project architecture and module boundaries;
- test gaps for changed behavior;
- TypeScript strictness and public contracts;
- GitFlow, coding standards, and design-system compliance where relevant.

Review output must lead with findings, ordered by severity. If there are no
findings, the reviewer should say so directly and call out any residual risk or
verification gap.

## Completion Gate

Do not mark work complete until:

- coding tasks are integrated;
- review findings are addressed or explicitly documented;
- required local verification passes;
- the worktree status is checked.
