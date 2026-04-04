# Codex SDLC and PDLC lifecycle automation workflow

## Status

Accepted

## Context

The repository already includes product requirements, feature specifications, architecture documentation, and automated tests, but contributors still have to create and maintain much of the delivery scaffolding by hand.

That manual setup makes it easier to skip important steps such as:

- creating a feature specification before coding,
- capturing long-lived technical decisions in an ADR,
- starting a living ExecPlan for significant work,
- linking work back to a GitHub issue and a predictable branch name,
- drafting a pull request summary that captures validation and documentation,
- running validation consistently after each feature checkpoint,
- enforcing metadata and CI checks before merge,
- cleaning up generated artifacts before handing work to the next contributor.

The project needs a lightweight automation layer that keeps those practices close to the codebase instead of relying on memory.

## Decision

Adopt a layered repository-local Codex workflow.

The deterministic automation surface remains a workflow CLI in `scripts/codexWorkflow.ts` exposed through npm scripts. On top of that, the repository now adds stage skills under `.codex/skills/` so Codex can execute intake, planning, UI and UX design, implementation, UX review, verification, and PR preparation as explicit delivery stages. Bounded subagents are allowed inside a stage for parallel exploration or implementation, but stage ownership stays with the main agent.

The lifecycle workflow provides five commands:

- `npm run codex:feature:start -- --title "Feature title" --issue 123 --create-branch` scaffolds a feature specification, related ADR, and ExecPlan, and can create an issue-linked branch.
- `npm run codex:checkpoint -- --suites unit,build` runs targeted validation after an implementation checkpoint and removes transient artifacts.
- `npm run codex:finish` runs broader release-ready validation, removes transient artifacts, and writes a PR summary draft.
- `npm run codex:pr:summary` generates a PR summary draft on demand.
- `npm run codex:pr:validate` checks branch and PR metadata for CI.

The repository also adds project-local skills, shared lifecycle references, visual workflow documentation, GitHub issue templates, a pull request template, and a GitHub Actions workflow so that issue intake, planning, implementation, PR formatting, metadata checks, unit tests, build verification, and Playwright e2e coverage all run in a consistent GitHub-native path.

This approach keeps the automation:

- versioned with the repository,
- easy to inspect and modify,
- aligned with existing documentation conventions,
- usable by both Codex and human contributors without external services.

## Consequences

### Positive

- Reduces the friction of following the repository’s intended lifecycle process.
- Makes feature intake, architectural documentation, and implementation planning more consistent.
- Creates a stronger bridge between local delivery automation and GitHub collaboration.
- Gives Codex a repository-native process model instead of leaving stage behavior implicit in prompts.
- Creates an explicit design lane so user-facing work is shaped and reviewed before handoff.
- Makes it clear where subagents help and where the main agent must keep control.
- Encourages disciplined validation and workspace cleanup.
- Keeps workflow rules visible in code and documentation instead of hidden in tribal knowledge.

### Negative

- Adds a small amount of maintenance overhead for the automation script and tests.
- Adds maintenance overhead for the stage skills and workflow documentation.
- The workflow still depends on contributors filling in the generated documents with meaningful content.
- GitHub collaboration still depends on repository permissions and authenticated clients outside the repository code itself.

### Follow-up implications

- Future work can extend the CLI with GitHub API-backed issue creation, draft PR creation, or CI status reporting.
- Contributors should treat the generated ExecPlan as a living document and keep it updated during substantial implementation work.
