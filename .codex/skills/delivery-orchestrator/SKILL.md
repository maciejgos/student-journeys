---
name: delivery-orchestrator
description: Orchestrate the repository's AI-native SDLC and PDLC flow from intake through PR handoff. Use when the user wants Codex to drive a feature, bug fix, or delivery task end to end using repository artifacts, stage skills, and bounded subagents.
---

# AI-native delivery orchestrator

Use this skill when the task is not just a single edit, but a delivery flow that should move through discovery, planning, implementation, validation, and review handoff with Codex doing the operational work.

## Goal

Keep the main agent responsible for the full delivery thread while moving work through explicit stages, preserving repo artifacts, and deciding when bounded subagents add value.

## Read first

Read these references before choosing the next stage:

- `.codex/skills/delivery-orchestrator/references/lifecycle-map.md`
- `.codex/skills/delivery-orchestrator/references/definition-of-done.md`
- `.codex/skills/delivery-orchestrator/references/stage-transition-rules.md`

Read only the repo documents needed for the current stage. Prefer the generated feature spec, ADR, and ExecPlan when they exist.

## Stage order

Default order:

1. Intake with `intake-orchestrator`
2. Feature shaping with `business-reviewer` when the spec is incomplete or risky
3. UI and UX concept work with `ux-concept-designer` when the task changes user-facing behavior
4. Architecture review with `architecture-reviewer` when long-lived technical choices are in play
5. Plan maintenance with `execplan-runner`
6. Coding with `implementation-orchestrator`
7. UI and UX review with `ux-reviewer` for user-facing changes
8. Validation with `verification-operator`
9. Review handoff with `pr-preparer`

Use feedback-closure behavior inside the implementation and verification stages when review comments or CI failures arrive.

## Orchestration rules

- Keep the main agent accountable for stage transitions and repository state.
- Require repository artifacts, not chat-only memory.
- Use the existing `npm run codex:*` commands for deterministic setup, validation, cleanup, and PR summary generation.
- Update the active ExecPlan when work progresses or changes course.
- Re-run only the smallest relevant validation suite while iterating, then broaden before handoff.

## Subagents

Use subagents only when the task is parallelizable and bounded. Common cases:

- codebase exploration,
- doc consistency checks,
- frontend and backend slices with disjoint ownership,
- test-gap inspection.

Do not hand stage ownership to a subagent. The main agent decides scope, integrates results, updates the ExecPlan, and owns the final answer.
