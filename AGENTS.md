# Repository Guidelines

## Project Structure & Module Organization

This repository is planning-first. Keep product and design material in `docs/` and use `src/` for application code.

- `README.md`: short repository overview.
- `docs/requirements.md`: primary product requirements for the Student Journey Tracking Application.
- `docs/architecture.md`: architecture notes and system design decisions.
- `docs/PLAN.md`: implementation planning and delivery sequencing.
- `docs/adr/`: architecture decision records and the ADR template.
- `docs/features/`: feature specifications with user stories and acceptance criteria.
- `src/README.md`: placeholder that marks `src/` as the code root.

Organize new code by feature or domain inside `src/`, mirror tests under `tests/`, and place assets in `assets/` or the framework public directory.

## Build, Test, and Development Commands

No build, test, or local run commands are defined yet.

Useful commands:

- `ls docs`: inspect the documentation set.
- `sed -n '1,200p' docs/requirements.md`: review the main requirements document.
- `sed -n '1,200p' docs/architecture.md`: review architecture notes.
- `ls docs/adr`: inspect decision records and templates.
- `ls docs/features`: inspect feature specs and templates.
- `ls src`: inspect the application source root.

When tooling is added, document the exact commands here.

## Coding Style & Naming Conventions

Use clear names that match the domain language in `docs/requirements.md`, such as `student-record` and `journey-stage`.

- Use Markdown headings in sentence case for docs.
- Prefer short sections, flat bullet lists, and direct language.
- Name new documentation files by topic, for example `docs/data-model.md`.
- Name ADR files consistently and start from `docs/adr/TEMPLATE.md`.
- Start feature specs from `docs/features/TEMPLATE.md`.
- Keep source directories descriptive and domain-oriented, for example `src/student-records/`.

## Testing Guidelines

There is no automated test suite yet. For now, verify documentation changes for accuracy, consistency, and broken references.

If you add code, include tests in the same PR and document how to run them. Prefer names such as `student-record.test.ts`.

## Architecture Decisions

Record notable technical decisions in `docs/adr/`. Each ADR should state status, context, decision, and consequences.

## Feature Specifications

Store feature-level requirements in `docs/features/`. Each spec should capture a short description and clear acceptance criteria before implementation starts.

## Commit & Pull Request Guidelines

The visible history still starts with `Initial commit`, so use short, imperative commit messages such as `Add architecture outline`.

Pull requests should:

- explain the problem being solved,
- summarize the files changed,
- link any related issue or requirement section,
- include screenshots only when UI work is introduced.

## Security Notes

This project handles student-administration requirements, so avoid committing real student data, secrets, or environment-specific credentials. Use sanitized examples only.
