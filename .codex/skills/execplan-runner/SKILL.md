---
name: execplan-runner
description: Create and maintain living ExecPlans for significant implementation work in this repository. Use when a task needs milestone-based execution, decision tracking, validation evidence, or restartable implementation guidance.
---

# ExecPlan runner

Use this skill whenever the active task is large enough to merit an ExecPlan under `docs/execplans/`.

## Required context

Read:

- `.codex/PLANS.md`
- the active feature spec in `docs/features/`
- the related ADR in `docs/adr/` when one exists
- the existing ExecPlan if it already exists

## Operating rules

- Treat the ExecPlan as a living implementation document, not a static proposal.
- Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.
- Record concrete timestamps and evidence, not vague status.
- Update the plan before and after material implementation steps.
- If the implementation changes direction, explain why in the plan.

## Output

An ExecPlan that a new contributor could use to continue the work with only the repository and the plan file.
