# Student Journey Tracking Application

This repository contains the specification and early project structure for a Student Journey Tracking Application. The system is intended to help campus backoffice teams manage a student lifecycle from first inquiry through enrollment, active study, support interventions, graduation, and alumni handoff.

## Purpose

The application centralizes student journey data in one operational system. Its main goals are to reduce fragmented recordkeeping, improve follow-up discipline, give staff a clear view of student status and history, and support auditable administrative workflows.

## Primary Users

- Backoffice campus workers managing records, tasks, interactions, and cases
- Backoffice team leads overseeing workload, escalations, and reporting
- Campus administrators configuring roles, statuses, queues, and rules

## Core Scope

The application supports these journey stages:

1. Prospect or inquiry
2. Applicant
3. Admitted
4. Enrolled
5. Active student
6. At-risk student
7. Deferred, withdrawn, or inactive student
8. Graduated student
9. Alumni handoff

## Planned Functional Areas

- Student record management with identifiers, profile data, and history
- Journey stage tracking with audit history and controlled transitions
- Task and follow-up management
- Case and issue management
- Interaction logging across email, phone, meetings, notes, and messages
- Document and attachment handling
- Alerts, risk flags, dashboards, reporting, search, and notifications
- Role-based access control for workers, team leads, and administrators

## MVP Scope

The initial scope focuses on student records, stage tracking, tasks, cases, interaction logging, basic document uploads, and role-based permissions.

## Repository Documents

- `docs/requirements.md`: full product requirements
- `docs/PLAN.md`: delivery planning
- `docs/architecture.md`: architecture notes
- `docs/adr/`: architecture decision records
- `docs/features/`: feature specifications and templates
- `src/`: future application source code

## Development commands

This repository now includes a frontend application, a Hono API, local relational persistence for development, unit tests, Playwright e2e tests, and a Docker/devcontainer workflow.

- `npm run codex:feature:start -- --title "Feature title"`: scaffold a feature spec, ADR, and ExecPlan for a new piece of work
- `npm run codex:checkpoint -- --suites unit,build`: run implementation checkpoint validation and clean transient artifacts
- `npm run codex:finish`: run release-ready validation and clean transient artifacts
- `npm run codex:pr:summary -- --base main`: generate a PR summary draft with linked issue and validation sections
- `npm run codex:pr:validate -- --branch-name issue-123-sample --pr-body-file .codex/tmp/pr-summary.md`: validate PR metadata for CI or local checks
- `docker compose run --rm workspace npm install`: install project dependencies inside Docker Desktop
- `docker compose run --rm --service-ports workspace npm run dev`: run the frontend and API locally in Docker
- `docker compose run --rm workspace npm run test:unit`: run unit tests
- `docker compose run --rm workspace npm run test:e2e`: run Playwright e2e tests
- `docker compose run --rm workspace npm run build`: verify the production build

## Codex lifecycle workflow

Codex can now support a more complete SDLC/PDLC loop directly in the repository.

1. Start a feature with `npm run codex:feature:start -- --title "Feature title"`.
2. Link the work to a GitHub issue with `--issue 123` and optionally create the suggested branch with `--create-branch`.
3. Fill in the generated feature spec, ADR, and ExecPlan before or alongside implementation.
4. Implement in small slices and run `npm run codex:checkpoint -- --suites unit,build` after each feature checkpoint.
5. Run `npm run codex:finish -- --base main` before opening a pull request to execute the broader validation suite, remove transient build and test artifacts, and write a PR summary draft to `.codex/tmp/pr-summary.md`.
6. Open the pull request using the generated summary and the GitHub templates. GitHub Actions will validate PR metadata plus unit, build, and e2e checks automatically.

The automation does not replace product thinking or architecture judgment, but it removes the repetitive setup and cleanup work that usually slows down disciplined delivery.

## AI-native SDLC and PDLC

The repository now treats the lifecycle as a layered Codex workflow:

- Skills define the stage behavior.
- Subagents execute bounded parallel tasks inside a stage.
- `npm run codex:*` commands provide the repeatable mechanical steps.

Use the flow documented in [docs/ai-native-sdlc-pdlc.md](./docs/ai-native-sdlc-pdlc.md) when you want Codex to run the delivery thread end to end. The default path is:

1. `delivery-orchestrator`
2. `intake-orchestrator`
3. `business-reviewer`
4. `ux-concept-designer` for user-facing work
5. `architecture-reviewer` when needed
6. `execplan-runner`
7. `implementation-orchestrator`
8. `ux-reviewer` for user-facing work
9. `verification-operator`
10. `pr-preparer`

## AI-native workflow examples

Use prompts like these when you want Codex to follow the repository workflow instead of treating the task as an isolated edit.

### New feature

Start the repository artifacts:

```bash
npm run codex:feature:start -- --title "Bulk student import" --issue 54 --create-branch
```

Then prompt Codex:

```text
Use the AI-native delivery workflow for bulk student import. Start from the generated feature spec, improve the scope and acceptance criteria, update the ADR if needed, maintain the ExecPlan, implement the first delivery slice, run checkpoint validation, and prepare the next step.
```

Typical stages:

1. `delivery-orchestrator`
2. `intake-orchestrator`
3. `business-reviewer`
4. `architecture-reviewer`
5. `execplan-runner`
6. `implementation-orchestrator`
7. `verification-operator`

### UI or UX-heavy feature

Start the repository artifacts:

```bash
npm run codex:feature:start -- --title "Student dashboard redesign" --issue 55 --create-branch
```

Then prompt Codex:

```text
Use the AI-native delivery workflow for the student dashboard redesign. Create or update the feature spec, produce a design note from docs/design/TEMPLATE.md, define the key flows and states, update the ExecPlan, implement the first UI slice, review the implemented UX, and run the relevant validation.
```

Typical stages:

1. `delivery-orchestrator`
2. `intake-orchestrator`
3. `business-reviewer`
4. `ux-concept-designer`
5. `architecture-reviewer`
6. `execplan-runner`
7. `implementation-orchestrator`
8. `ux-reviewer`
9. `verification-operator`

### Small bug fix

Prompt Codex:

```text
Use the AI-native delivery workflow to fix duplicate risk flags in the dashboard. Keep the docs minimal if the change is small, update the ExecPlan only if the task becomes significant, implement the fix, run the smallest relevant validation, and summarize residual risk.
```

Typical stages:

1. `delivery-orchestrator`
2. `implementation-orchestrator`
3. `verification-operator`
4. `pr-preparer`

### Review handoff

Before opening a pull request:

```bash
npm run codex:finish -- --base main
npm run codex:pr:summary -- --base main
npm run codex:pr:validate -- --branch-name codex/issue-54-bulk-student-import --pr-body-file .codex/tmp/pr-summary.md
```
