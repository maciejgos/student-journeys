# Repository Guidelines

## Project Structure & Module Organization

This repository contains both product documentation in `docs/` and a working application in `src/`.

- `README.md`: repository overview and current development workflow.
- `docs/requirements.md`: primary product requirements for the Student Journey Tracking Application.
- `docs/architecture.md`: architecture notes and system design decisions.
- `docs/adr/`: architecture decision records and the ADR template.
- `docs/features/`: feature specifications with user stories and acceptance criteria.
- `docs/pr-assets/`: screenshots and other assets referenced by pull requests or documentation.
- `src/`: React frontend, student-record domain logic, and Hono server code.
- `src/server/`: Hono application, local development server entrypoint, and persistence layer.
- `tests/e2e/`: Playwright end-to-end coverage.
- `.data/`: local development database files; do not commit real data.
- `dist/`, `test-results/`, and `playwright-report/`: generated build and test artifacts; do not edit or commit them.
- `docker-compose.yml`, `.devcontainer/`, `vite.config.ts`, `playwright.config.ts`, and `tsconfig*.json`: local development and tooling configuration.

Organize new application code by feature or domain inside `src/`. Keep browser UI code and server code separated by responsibility. Place unit tests close to the code they verify, for example `src/studentRecords.test.ts` or `src/server/app.test.ts`. Keep end-to-end coverage in `tests/e2e/`.

## Build, Test, and Development Commands

Use the existing npm scripts as the source of truth.

- `npm run dev`: run the Vite frontend and Hono API together.
- `npm run dev:api`: run the Hono API in watch mode.
- `npm run dev:web`: run the Vite frontend dev server.
- `npm run build`: type-check the app and server entrypoints, then build the frontend bundle.
- `npm run preview`: serve the production frontend build locally.
- `npm run test:unit`: run Vitest unit tests.
- `npm run test:e2e`: run Playwright end-to-end tests.
- `npm test`: run both unit and end-to-end suites.

Docker Desktop workflow is also available through `docker compose run --rm workspace ...` when you want to run the project in the provided Playwright container. Use `docker compose run --rm --service-ports workspace npm run dev` when the frontend and API both need to be reachable from the container.

## Coding Style & Naming Conventions

Use names that match the domain language in `docs/requirements.md`, such as `student-record`, `journey-stage`, and `risk-flag`.

- Use Markdown headings in sentence case for docs.
- Prefer short sections, flat bullet lists, and direct language.
- Name new documentation files by topic, for example `docs/data-model.md`.
- Name ADR files with a numeric prefix based on `docs/adr/TEMPLATE.md`.
- Start feature specs from `docs/features/TEMPLATE.md`.
- Keep source directories and modules descriptive and domain-oriented.
- Follow the existing TypeScript and React conventions already present in `src/`.

## Testing Guidelines

Automated tests are present and should be updated with code changes.

- Add or update unit tests near the code under test in `src/`.
- Keep browser workflow coverage in `tests/e2e/`.
- Execute the relevant automated tests after each feature implementation before moving on to the next feature.
- Run the smallest relevant test command while iterating, then run the broader affected suite before finishing.
- If you add behavior without automated coverage, explain the gap in the change summary.

## Architecture Decisions

- Record notable technical decisions in `docs/adr/`. Each ADR should state status, context, decision, and consequences.
- Document your decisions in an ADR whenever the work introduces or changes an architectural, integration, security, persistence, or operational choice that should be preserved for future contributors.
- Create or update an ADR in the same piece of work for major changes to system boundaries, deployment model, data model strategy, security model, integration patterns, or core framework choices.

## Feature Specifications

Store feature-level requirements in `docs/features/`. Each spec should capture a short description and clear acceptance criteria before implementation starts or when scope materially changes.

## Commit & Pull Request Guidelines

Use short, imperative commit messages such as `Add student record filters`.

Pull requests should:

- explain the problem being solved,
- summarize the files changed,
- link any related issue, requirement, feature spec, or ADR,
- describe validation performed,
- include screenshots only when UI work is introduced.

## Security Notes

This project handles student-administration workflows, so avoid committing real student data, secrets, or environment-specific credentials. Use sanitized examples only. Treat files under `.data/` as local development state unless a task explicitly requires fixture updates.
Do not commit generated outputs from `dist/`, `test-results/`, `playwright-report/`, `node_modules/`, or `*.tsbuildinfo`.

## Environment cleanup

- Clean up the local environment after completing implementation work.
- Stop temporary development processes, remove transient test or build artifacts that should not persist, and leave the workspace ready for the next task.
- Do not delete user data, committed assets, or intentionally preserved local fixtures unless the task explicitly requires it.

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan as described in `.codex/PLANS.md`. Keep the plan updated as implementation progresses.
