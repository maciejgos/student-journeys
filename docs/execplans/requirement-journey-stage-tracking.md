# Requirement: Journey stage tracking implementation plan

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `.codex/PLANS.md`.
The related architecture decision record is `docs/adr/0003-requirement-journey-stage-tracking.md`. Update it whenever the plan changes the long-lived technical approach.

Use the repository AI-native delivery flow as the default orchestration model:

- `delivery-orchestrator` for stage selection and artifact order
- `intake-orchestrator` for initial scaffolding and issue linkage
- `business-reviewer` and `architecture-reviewer` for specialist review gates when needed
- `ux-concept-designer` before implementing user-facing changes
- `implementation-orchestrator` for code and documentation execution
- `ux-reviewer` before handoff for user-facing changes
- `verification-operator` for checkpoint and finish validation
- `pr-preparer` for review handoff

## Purpose / Big Picture

After this change, a contributor can create or update a student record using a controlled list of supported primary journey stages instead of free-form text. The result is visible by opening the record forms in the app and by sending API requests with invalid stage values, which should now fail with a clear validation error.

## Progress

- [x] 2026-04-04 13:21Z Reviewed the existing journey-stage requirement, the generated scaffolding docs, and the current student-record domain, API, UI, and persistence code.
- [x] 2026-04-04 13:21Z Chose a phased first slice: shared primary stage catalog, validation, and controlled UI selection before richer history and transition rules.
- [x] 2026-04-04 13:24Z Implemented the first slice in the shared domain and UI by centralizing the supported primary journey stages, validating them, and rendering `currentJourneyStage` as a select.
- [x] 2026-04-04 13:24Z Added unit and API coverage for unsupported journey-stage values.
- [x] 2026-04-04 13:24Z Ran checkpoint validation with `unit,build` and captured the next-step handoff for later slices.

## Surprises & Discoveries

- Observation: the current implementation already logs stage changes in the timeline and audit trail, but it does so from a single free-form `currentJourneyStage` field.
  Evidence: `src/server/db.ts` writes `status-change` timeline items when `currentJourneyStage` changes, without any shared stage catalog validation.

- Observation: the create and edit forms currently render every student-record field as a text input except for role and visibility controls.
  Evidence: `src/App.tsx` maps `studentRecordFieldGroups` directly to `<input>` elements for `currentJourneyStage`, `currentSubStatus`, and `riskFlagStatus`.

- Observation: the Docker build path still depends on refreshing optional Rollup binaries in the workspace image before Vite can build successfully.
  Evidence: `docker compose run --rm workspace npm run build` failed with `Cannot find module @rollup/rollup-linux-arm64-gnu`, then `docker compose run --rm workspace npm install` followed by `npm run codex:checkpoint -- --suites unit,build` passed.

## Decision Log

- Decision: ExecPlan created automatically during feature intake.
  Rationale: keeps implementation planning attached to the feature from the start.
  Date/Author: 2026-04-04 / Codex automation

- Decision: deliver journey-stage tracking in phases and use the first slice to lock down supported primary stage values before adding richer transition workflows.
  Rationale: the current codebase can support meaningful validation and UI control now, while the fuller transition-history and override model requires broader schema and behavior changes.
  Date/Author: 2026-04-04 / Codex

- Decision: keep the first slice focused on the primary stage catalog and not introduce reason-code or transition-rule fields yet.
  Rationale: those capabilities require new data structures and UI surfaces, while the immediate operational risk is inconsistent stage values entering the current shared record model.
  Date/Author: 2026-04-04 / Codex

## Outcomes & Retrospective

The first slice now ships controlled primary stage values across the shared domain, API validation path, and UI forms. `src/studentRecords.ts` exports the supported primary journey-stage catalog, the domain validation rejects unsupported stage values, and `src/App.tsx` renders `currentJourneyStage` as a select fed from that catalog. Tests now cover both the domain rule and the API rejection path.

Validation results:

- `docker compose run --rm workspace npm run test:unit` passed with 3 files and 22 tests.
- `docker compose run --rm workspace npm install` refreshed optional build dependencies in the workspace image.
- `docker compose run --rm workspace npm run codex:checkpoint -- --suites unit,build` passed and removed `dist` plus `tsconfig.node.tsbuildinfo`.

Next step recommendation: add a structured stage-transition model with previous stage, new stage, actor, timestamp, and reason metadata, then move reason-code enforcement onto those transition records instead of the flat student-record shape.

## Context and Orientation

Start from the feature specification at `docs/features/20-requirement-journey-stage-tracking.md` and the design note at `docs/design/journey-stage-tracking.md`. The current student-record domain lives in `src/studentRecords.ts`, where `currentJourneyStage` is just a string field with no allowed-value validation. The API surface in `src/server/app.ts` accepts any string for that field, and the persistence plus timeline behavior in `src/server/db.ts` records changes but does not constrain stage names. The record-create and record-edit forms in `src/App.tsx` render `currentJourneyStage` as a normal text input inside the operational profile section.

## Plan of Work

First, tighten the requirement, ADR, and design note so the repo clearly describes the phased first slice. Then update `src/studentRecords.ts` to export the supported primary journey stages and enforce them in validation while keeping at-risk status separate. After that, update `src/App.tsx` so the create and edit forms render `currentJourneyStage` as a select fed from the shared stage catalog instead of a free-text input. Keep seeded and default record values valid, then add or update tests in `src/studentRecords.test.ts` and `src/server/app.test.ts` to prove invalid stage values are rejected and valid ones continue to work.

## Concrete Steps

List the exact commands to run from the repository root and the expected evidence of success.

    docker compose run --rm workspace npm run test:unit
    docker compose run --rm workspace npm run codex:checkpoint -- --suites unit

Expected evidence:

    ✓ src/studentRecords.test.ts
    ✓ src/server/app.test.ts

An invalid `currentJourneyStage` sent through the API should now return status `400` with an inline field error for `currentJourneyStage`.

## Validation and Acceptance

Run `docker compose run --rm workspace npm run test:unit` and expect the student-record domain and API tests to pass. The new validation tests for unsupported stage values should fail before the change and pass after it. Manually, the create and edit forms should show `currentJourneyStage` as a select with the supported stage list instead of a text input.

## Idempotence and Recovery

Explain how to re-run the workflow safely and how to clean up generated artifacts or partial state if implementation is interrupted.

## Artifacts and Notes

Capture the most important snippets, outputs, or examples needed to verify the work.

## Interfaces and Dependencies

Name the modules, commands, APIs, or documents that must exist or be updated by the end of the work.

Change note: created by Codex lifecycle automation to ensure feature work starts with a living execution plan.
