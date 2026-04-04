# 20 Requirement: Journey stage tracking

## Description

Provide controlled student journey-stage tracking so backoffice users can assign a valid current stage, see consistent stage values across the product, and build later workflow, history, and reporting behavior on a shared domain model.

## Problem statement

- Current pain point: the current MVP stores `currentJourneyStage` as free-form text in the shared domain, API, persistence layer, and UI forms, which allows inconsistent stage names and weakens reporting, validation, and later workflow rules.
- Desired outcome: the product uses a single shared stage catalog so users can only create or update student records with supported primary journey stages and the UI reflects those choices consistently.
- Non-goals: this first slice does not yet deliver stage history records separate from timeline notes, reason-code enforcement, role-based transition rules, or override workflows.

## User stories

- As a backoffice campus worker
- I want to select a valid journey stage from the supported list
- So that student records use consistent operational stage values

- As a team lead or administrator
- I want the product to reject invalid stage names
- So that reporting and later workflow automation can depend on trusted stage data

## Acceptance criteria

- The system exposes a shared primary journey-stage catalog containing prospect or inquiry, applicant, admitted, enrolled, active student, deferred, withdrawn, inactive student, graduated student, and alumni handoff.
- At-risk status remains modeled outside the primary stage catalog and is not stored as the primary journey stage.
- Student record validation rejects any `currentJourneyStage` value that is not in the shared catalog.
- The create and edit flows present `currentJourneyStage` as a controlled selection instead of a free-text input.
- Existing seeded and default student data continue to use valid supported stage values.
- Unit and API tests cover the controlled stage validation behavior.

## Planned follow-up slices

- Add structured stage history records with previous stage, new stage, timestamps, actor, and optional reason details.
- Add reason-code requirements for deferred, withdrawn, inactive student, graduated student, and alumni handoff transitions.
- Add role-aware transition rules and override handling.
- Extend timeline, reporting, alerts, and notifications to consume the richer stage-transition model.

## Delivery notes

- Feature slug: `requirement-journey-stage-tracking`
- Owner: Codex
- GitHub Issue: #4
- Suggested branch: `codex/issue-4-requirement-journey-stage-tracking`
- Related ADR: `docs/adr/0003-requirement-journey-stage-tracking.md`
- Related ExecPlan: `docs/execplans/requirement-journey-stage-tracking.md`
- Recommended Codex skill flow:
  - `delivery-orchestrator`
  - `intake-orchestrator`
  - `business-reviewer` when the scope or acceptance criteria need refinement
  - `ux-concept-designer` for user-facing work
  - `architecture-reviewer` when long-lived technical choices are involved
  - `execplan-runner`
  - `implementation-orchestrator`
  - `ux-reviewer` for user-facing work
  - `verification-operator`
  - `pr-preparer`
