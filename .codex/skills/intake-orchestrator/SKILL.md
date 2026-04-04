---
name: intake-orchestrator
description: Start repository-native delivery work by turning a feature idea, issue, or request into the required feature spec, ADR, and ExecPlan artifacts. Use when a new piece of work needs structured intake before implementation starts.
---

# Intake orchestrator

Use this skill at the beginning of a feature or significant fix.

## Goal

Create or normalize the repository artifacts that let Codex carry the work without relying on chat memory.

## Inputs to inspect

- the user request,
- `docs/features/TEMPLATE.md`,
- `docs/adr/TEMPLATE.md`,
- `.codex/PLANS.md`,
- `scripts/codexWorkflow.ts` and `package.json` for the current automation surface.

## Workflow

1. Decide whether the request is significant enough to require a feature spec, ADR, and ExecPlan.
2. If scaffolding is needed, run `npm run codex:feature:start -- --title "<title>"` with issue linkage when available.
3. Fill or improve the generated docs enough that implementation can proceed.
4. Record open questions directly in the feature spec or ExecPlan instead of leaving them implicit.
5. Hand off to `business-reviewer`, `architecture-reviewer`, or `execplan-runner` as needed.

## Outputs

- feature spec in `docs/features/`,
- ADR in `docs/adr/` when the work changes long-lived technical choices,
- ExecPlan in `docs/execplans/` for significant work.
