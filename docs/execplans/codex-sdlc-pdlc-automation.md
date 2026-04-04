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
- [x] 2026-04-04 11:52Z Created a dedicated implementation branch for the AI-native SDLC/PDLC upgrade and re-read `.codex/PLANS.md`, the feature spec, ADR, and current workflow code before editing.
- [x] 2026-04-04 12:05Z Extended the workflow from CLI-only automation into a layered Codex process with stage skills, shared references, and visual delivery maps.
- [x] 2026-04-04 12:08Z Updated scaffolding templates and repository docs so newly started work points to the AI-native process and artifacts.
- [x] 2026-04-04 12:22Z Ran targeted unit and build validation, then removed transient artifacts from the workspace with `codex:checkpoint`.
- [x] 2026-04-04 12:40Z Added explicit UI and UX concept plus UI and UX review stages, including dedicated skills and design documentation for user-facing work.

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

- Observation: the repository already contains the mechanical lifecycle pieces, so the missing layer is process orchestration rather than more shell automation.
  Evidence: `scripts/codexWorkflow.ts` already supports feature intake, checkpoints, finish validation, and PR summary generation, but `.codex/skills/` only contains review-oriented skills.

- Observation: containerized builds can still fail until optional Rollup binaries are refreshed inside the workspace image.
  Evidence: `docker compose run --rm workspace npm run build` first failed with `Cannot find module @rollup/rollup-linux-arm64-gnu`, then passed after `docker compose run --rm workspace npm install`.

- Observation: the original stage map was still too engineering-centric for frontend work because it assumed design decisions would emerge during implementation.
  Evidence: the first AI-native workflow version had business and architecture review stages, but no dedicated UI and UX concept or review step.

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

- Decision: implement the AI-native workflow as a process layer above the existing CLI, using stage skills plus shared references instead of replacing the current commands.
  Rationale: the CLI already handles deterministic scaffolding and validation well, while skills are the right place to encode stage ownership, handoff rules, and subagent usage.
  Date/Author: 2026-04-04 / Codex

- Decision: reuse the existing `business-reviewer` and `architecture-reviewer` skills as specialist review gates instead of creating duplicate stage-specific review skills.
  Rationale: the repo already has those review concepts encoded, so the new orchestrator should compose them rather than fragment responsibility further.
  Date/Author: 2026-04-04 / Codex

- Decision: add explicit `ux-concept-designer` and `ux-reviewer` stages to the workflow instead of folding design into implementation.
  Rationale: user-facing work needs a pre-build design pass and a post-build experience review, and those checks are distinct from product analysis, architecture review, or code validation.
  Date/Author: 2026-04-04 / Codex

## Outcomes & Retrospective

The automation now covers both the repetitive lifecycle mechanics and the AI-native process layer above them. Contributors can scaffold delivery artifacts with one command, route work through explicit Codex stage skills, use subagents only where bounded parallel work helps, validate implementation checkpoints more consistently, clean generated artifacts without hand-curating the cleanup list each time, and carry the work into GitHub with issue templates, branch naming guidance, PR summaries, metadata checks, and CI.

Validation results for this implementation were:

- `docker compose run --rm workspace npm run test:unit` passed with 3 test files and 20 tests.
- `docker compose run --rm workspace npm install` refreshed missing optional build dependencies in the container.
- `docker compose run --rm workspace npm run build` passed after the container dependency refresh.
- `docker compose run --rm workspace npm run codex:checkpoint -- --suites unit,build` passed and removed `dist` plus `tsconfig.node.tsbuildinfo`.

The remaining gap is direct GitHub API-backed issue or pull request creation from the CLI, which can be layered on later without changing the local workflow contract. A second future extension could add dedicated feedback-closure skills once review-loop automation becomes a frequent task in this repository.

## Context and Orientation

The repository already includes product and architecture documentation in `docs/`, application code in `src/`, and automated validation through `npm run test:unit`, `npm run test:e2e`, and `npm run build`. Before this change, there was no repository-native command that created the expected feature-delivery artifacts or bundled validation and cleanup into a consistent routine.

The new implementation centers on `scripts/codexWorkflow.ts`, which adds a command-line interface for feature intake and validation checkpoints. Supporting files include `scripts/codexWorkflow.test.ts` for unit coverage, `package.json` for npm entry points, `tsconfig.node.json` so the script is type-checked with other Node-side code, `README.md` for usage guidance, `docs/features/TEMPLATE.md` for richer generated specs, and the related documentation artifacts for this feature.

## Plan of Work

Keep the existing repository-local workflow CLI as the deterministic automation surface for scaffolding, validation, cleanup, and PR summary generation. Extend its generated templates so every new feature scaffold points contributors toward the stage-based Codex process and its expected repository artifacts.

Add a small set of project-local skills under `.codex/skills/` for orchestration, intake, ExecPlan maintenance, implementation, verification, and PR preparation. These skills should explain when to call the existing workflow commands, when to invoke the existing review skills, and when bounded subagents are appropriate.

Add shared lifecycle references and a dedicated documentation page with Mermaid diagrams so the process is visible outside the skill files. Update `README.md`, `docs/architecture.md`, the feature spec, and the ADR so the repo consistently describes the workflow as a layered model: skills for process, subagents for parallel execution, CLI commands for deterministic mechanics.

## Concrete Steps

Run these commands from the repository root:

    npm run codex:feature:start -- --title "Example feature"
    npm run test:unit -- scripts/codexWorkflow.test.ts
    npm run build

Expected evidence:

    [workflow] Feature scaffolding created:
    - Feature spec: docs/features/NN-example-feature.md
    - ADR: docs/adr/NNNN-example-feature.md
    - ExecPlan: docs/execplans/example-feature.md

The generated feature spec and ExecPlan should include references to the AI-native stage flow. The documentation should render Mermaid diagrams for the stage map and the skill-to-subagent execution model. Targeted tests should confirm that new scaffolds include the expected process guidance.

## Validation and Acceptance

Run `npm run test:unit` and expect the workflow unit tests to pass alongside the existing application tests. Run `npm run build` and expect the Node-side workflow script and the documentation-linked TypeScript code to type-check with the rest of the project. Acceptance requires three visible outcomes: the repository contains reusable stage skills under `.codex/skills/`, the documentation contains a visual AI-native SDLC/PDLC map, and newly generated scaffolds include the orchestration guidance that points contributors to the new process.

## Idempotence and Recovery

The scaffolding command is intentionally not destructive. It refuses to overwrite an existing feature, ADR, or ExecPlan file so it can be re-run safely with a new title or slug if the first attempt was wrong. The checkpoint and finish commands can be rerun repeatedly because tests and builds are already repeatable, and cleanup only removes transient artifacts that can be regenerated by the same commands.

If validation fails, fix the reported issue and rerun the same command. If cleanup removes an artifact you still need, regenerate it with the appropriate build or test command.

## Artifacts and Notes

Important files introduced by this plan:

    scripts/codexWorkflow.ts
    scripts/codexWorkflow.test.ts
    .codex/skills/delivery-orchestrator/SKILL.md
    .codex/skills/intake-orchestrator/SKILL.md
    .codex/skills/execplan-runner/SKILL.md
    .codex/skills/implementation-orchestrator/SKILL.md
    .codex/skills/verification-operator/SKILL.md
    .codex/skills/pr-preparer/SKILL.md
    .codex/skills/shared/references/lifecycle-map.md
    docs/ai-native-sdlc-pdlc.md
    docs/features/19-codex-sdlc-pdlc-automation.md
    docs/adr/0002-codex-sdlc-pdlc-lifecycle-automation.md
    docs/execplans/codex-sdlc-pdlc-automation.md

## Interfaces and Dependencies

The workflow CLI depends on the existing `tsx` runtime, Node.js filesystem and child-process APIs, and the existing npm scripts for unit tests, build, and Playwright e2e validation. The public interface added by this feature is the npm command surface:

    npm run codex:feature:start
    npm run codex:checkpoint
    npm run codex:finish

These commands are the contract future contributors should preserve even if the underlying implementation changes.

Revision note: 2026-04-04 / Codex. Expanded the plan from CLI-focused automation into an AI-native workflow implementation so the living plan matches the newly requested skills, subagent usage, and visual process documentation.
