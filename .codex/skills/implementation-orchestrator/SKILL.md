---
name: implementation-orchestrator
description: Execute the implementation stage of the AI-native SDLC and PDLC flow. Use when feature docs and planning are ready and Codex should make code or documentation changes in bounded slices with explicit validation and subagent decisions.
---

# Implementation orchestrator

Use this skill for the execution stage after the feature spec and ExecPlan are in place.

## Goal

Deliver the next meaningful slice of work while keeping the plan, tests, and repository artifacts aligned.

## Read first

- the active ExecPlan,
- the feature spec,
- the ADR when present,
- `.codex/skills/implementation-orchestrator/references/subagent-delegation-rules.md`

## Workflow

1. Identify the next smallest useful slice from the ExecPlan.
2. Read only the code and tests needed for that slice.
3. Decide whether subagents help; if so, assign bounded ownership and keep integration local.
4. Implement directly in the repo, then update the ExecPlan.
5. Run the smallest relevant checkpoint validation before moving to the next slice.

## Outputs

- code or document changes,
- updated nearby tests,
- updated ExecPlan progress and decisions,
- explicit residual risks when a gap remains.
