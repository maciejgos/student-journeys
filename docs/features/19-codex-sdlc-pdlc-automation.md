# 19 Codex SDLC and PDLC automation

## Description

Provide repository-native automation that helps Codex and human contributors move work from intake through planning, implementation, GitHub collaboration, validation, and cleanup with less manual coordination, while making Codex itself the primary operator of each delivery stage.

## Problem statement

- Current pain point: starting a feature and handing it off through GitHub requires repetitive manual setup for specs, ADRs, plans, branch naming, PR summaries, validation, and cleanup.
- Desired outcome: a contributor can start a feature, link it to a GitHub issue, prepare a PR summary, and finish the work with consistent repository artifacts and validation steps.
- Non-goals: replacing product judgment, architecture review, or human approval for risky decisions.

## User stories

- As a contributor
- I want a single workflow command to scaffold feature-delivery documents
- So that I can begin work with the right SDLC and PDLC artifacts already in place

- As a maintainer
- I want validation and cleanup to be automated
- So that the repository stays consistent and ready for the next task

## Acceptance criteria

- A command can scaffold a new feature specification, ADR, and ExecPlan from the repository root.
- The workflow can suggest or create an issue-linked branch name.
- A checkpoint command can run relevant validation suites after implementation milestones.
- A finish command can run broader validation, remove transient build and test artifacts, and generate a PR summary draft.
- Repository-local skills define the delivery stages Codex should execute.
- The repository-native flow includes explicit UI and UX concept plus UI and UX review stages for user-facing work.
- The workflow documentation includes a visual stage map and explains when subagents are allowed.
- GitHub templates and CI validate pull request metadata plus unit, build, and e2e checks.
- Repository documentation explains how to use the new lifecycle workflow.

## Delivery notes

- GitHub Issue: `#22`
- Suggested branch: `codex/sdlc-pdlc-automation`
- Related ADR: `docs/adr/0002-codex-sdlc-pdlc-lifecycle-automation.md`
- Related ExecPlan: `docs/execplans/codex-sdlc-pdlc-automation.md`
