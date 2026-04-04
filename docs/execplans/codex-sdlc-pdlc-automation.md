# Codex SDLC and PDLC automation

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document must be maintained in accordance with `.codex/PLANS.md`.

The related architecture decision record is `docs/adr/0002-codex-sdlc-pdlc-lifecycle-automation.md`. Update it whenever the plan changes the long-lived technical approach.

## Purpose / Big Picture

After this change, a contributor can start a new feature with one command, get the required documentation scaffolding automatically, run validation checkpoints with one command, and finish the work with cleanup handled for them. The outcome is visible by running the new npm scripts from the repository root and observing that the expected docs are created, the requested validation suites run, and transient artifacts are removed.

## Progress

- [x] 2026-04-04 08:15Z Defined the workflow scope and chose a repository-local CLI exposed through npm scripts.
- [x] 2026-04-04 08:32Z Implemented scaffolding, checkpoint validation, and cleanup automation in `scripts/codexWorkflow.ts`.
- [x] 2026-04-04 08:40Z Added unit coverage, documentation updates, feature specification, and ADR for the workflow.
- [x] 2026-04-04 08:56Z Updated Vitest discovery to include `scripts/**/*.test.ts` so the new automation tests run under the standard unit test command.
- [x] 2026-04-04 09:12Z Validated the feature with containerized unit, build, and e2e runs, then removed generated artifacts from the workspace.
- [x] 2026-04-04 09:35Z Extended the workflow with issue-linked branch naming, PR summary generation, GitHub templates, and CI metadata validation.
- [x] 2026-04-04 09:36Z Ran the updated validation suite for the GitHub integration changes, smoke-tested PR summary generation, and cleaned transient artifacts again.

## Surprises & Discoveries

- Observation: the existing feature template was intentionally minimal, so scaffolding automation needed a slightly richer structure to be useful for product and delivery work.
  Evidence: `docs/features/TEMPLATE.md` previously contained only description and acceptance criteria headings.

- Observation: build and Playwright runs leave behind generated directories and `*.tsbuildinfo` files in the repository root.
  Evidence: `dist/`, `test-results/`, and `tsconfig.node.tsbuildinfo` were present in the workspace before automation changes.

- Observation: the repository’s Vitest config explicitly limited discovery to `src/**/*.test.ts`, which meant the new workflow tests were initially skipped.
  Evidence: the first `npm run test:unit` run reported only `src/studentRecords.test.ts` and `src/server/app.test.ts`.

- Observation: the Docker workspace needed an explicit `npm install` before `build` could find `tsc`, even though `test:unit` already had access to `vitest`.
  Evidence: the first containerized `npm run build` failed with `sh: 1: tsc: not found`, then passed after `docker compose run --rm workspace npm install --include=dev`.

- Observation: branch-link enforcement is safest when CI checks consistency between an issue-linked branch and the PR body, rather than hard-failing every branch that lacks an issue number.
  Evidence: the active implementation branch `codex/sdlc-pdlc-automation` predates the new naming convention, so a strict branch-only rule would reject legitimate in-flight work.

## Decision Log

- Decision: implement the workflow as a TypeScript script run with `tsx` instead of introducing another CLI framework.
  Rationale: the repository already depends on `tsx`, and the workflow only needs lightweight argument parsing and child-process execution.
  Date/Author: 2026-04-04 / Codex

- Decision: make `checkpoint` default to unit tests while `finish-feature` defaults to unit, build, and e2e validation.
  Rationale: the everyday checkpoint should be fast enough to run frequently, while the finishing step should be broader and closer to release validation.
  Date/Author: 2026-04-04 / Codex

- Decision: keep cleanup focused on generated build and test artifacts instead of trying to terminate arbitrary user processes.
  Rationale: deleting transient files is safe and deterministic, while terminating processes could disrupt unrelated local work.
  Date/Author: 2026-04-04 / Codex

- Decision: add GitHub issue templates, a PR template, and a CI workflow in the repository rather than relying on external configuration.
  Rationale: keeping the collaboration rules in version control makes the automation visible, reviewable, and portable with the codebase.
  Date/Author: 2026-04-04 / Codex

## Outcomes & Retrospective

The automation now covers the repetitive lifecycle mechanics that were previously manual. Contributors can scaffold delivery artifacts with one command, validate implementation checkpoints more consistently, clean generated artifacts without hand-curating the cleanup list each time, and carry the work into GitHub with issue templates, branch naming guidance, PR summaries, metadata checks, and CI.

Validation results for this implementation were:

- `docker compose run --rm workspace npm run test:unit` passed with 3 test files and 19 tests.
- `docker compose run --rm workspace npm run build` passed after ensuring container dependencies were installed.
- `docker compose run --rm workspace npm run test:e2e` passed with 4 Playwright tests.
- `docker compose run --rm workspace npm run codex:pr:summary -- --base main --output .codex/tmp/pr-summary.md` wrote a PR summary draft successfully.

The remaining gap is direct GitHub API-backed issue or pull request creation from the CLI, which can be layered on later without changing the local workflow contract.

## Context and Orientation

The repository already includes product and architecture documentation in `docs/`, application code in `src/`, and automated validation through `npm run test:unit`, `npm run test:e2e`, and `npm run build`. Before this change, there was no repository-native command that created the expected feature-delivery artifacts or bundled validation and cleanup into a consistent routine.

The new implementation centers on `scripts/codexWorkflow.ts`, which adds a command-line interface for feature intake and validation checkpoints. Supporting files include `scripts/codexWorkflow.test.ts` for unit coverage, `package.json` for npm entry points, `tsconfig.node.json` so the script is type-checked with other Node-side code, `README.md` for usage guidance, `docs/features/TEMPLATE.md` for richer generated specs, and the related documentation artifacts for this feature.

## Plan of Work

Add a repository-local workflow CLI that can create feature documents and run validation suites. The CLI should inspect `docs/features/` and `docs/adr/` to determine the next sequence numbers, create new Markdown files with useful starter content, and refresh the feature index so the generated artifacts become visible immediately.

Extend the same CLI with two validation-oriented commands. One should support small checkpoint validation after each implementation slice, and the other should support broader finishing validation. Both commands should optionally remove transient build and test artifacts so the environment is left clean for the next task.

Add tests for the file-sequencing, scaffolding, suite parsing, and cleanup behavior. Update documentation so contributors know when to use the new commands and why they exist.

## Concrete Steps

Run these commands from the repository root:

    npm run codex:feature:start -- --title "Example feature"
    npm run codex:checkpoint -- --suites unit,build
    npm run codex:finish

Expected evidence:

    [workflow] Feature scaffolding created:
    - Feature spec: docs/features/NN-example-feature.md
    - ADR: docs/adr/NNNN-example-feature.md
    - ExecPlan: docs/execplans/example-feature.md

The checkpoint and finish commands should stream the underlying npm validation output and end with a cleanup message describing removed transient artifacts or stating that none were present.

## Validation and Acceptance

Run `npm run test:unit` and expect the new workflow unit tests to pass alongside the existing student-record tests. Run `npm run build` and expect the Node-side workflow script to type-check with the existing application code. Run `npm run codex:checkpoint -- --suites unit,build` and expect unit tests and the build to succeed, followed by cleanup of generated artifacts. The final acceptance condition is that the repository documents the workflow and the generated artifacts for this feature exist in `docs/features/`, `docs/adr/`, and `docs/execplans/`.

## Idempotence and Recovery

The scaffolding command is intentionally not destructive. It refuses to overwrite an existing feature, ADR, or ExecPlan file so it can be re-run safely with a new title or slug if the first attempt was wrong. The checkpoint and finish commands can be rerun repeatedly because tests and builds are already repeatable, and cleanup only removes transient artifacts that can be regenerated by the same commands.

If validation fails, fix the reported issue and rerun the same command. If cleanup removes an artifact you still need, regenerate it with the appropriate build or test command.

## Artifacts and Notes

Important files introduced by this plan:

    scripts/codexWorkflow.ts
    scripts/codexWorkflow.test.ts
    docs/features/19-codex-sdlc-pdlc-automation.md
    docs/adr/0002-codex-sdlc-pdlc-lifecycle-automation.md
    docs/execplans/codex-sdlc-pdlc-automation.md

## Interfaces and Dependencies

The workflow CLI depends on the existing `tsx` runtime, Node.js filesystem and child-process APIs, and the existing npm scripts for unit tests, build, and Playwright e2e validation. The public interface added by this feature is the npm command surface:

    npm run codex:feature:start
    npm run codex:checkpoint
    npm run codex:finish

These commands are the contract future contributors should preserve even if the underlying implementation changes.
