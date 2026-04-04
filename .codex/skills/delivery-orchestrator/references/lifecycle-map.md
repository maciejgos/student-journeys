# AI-native lifecycle map

The repository uses three layers for delivery automation:

- Skills define stage behavior and entry or exit rules.
- Subagents provide bounded parallel execution inside a stage.
- `npm run codex:*` commands handle deterministic mechanics such as scaffolding, validation, cleanup, and PR summary generation.

Default lifecycle:

1. Intake
2. Feature shaping
3. UI and UX concept design
4. Architecture review
5. ExecPlan maintenance
6. Implementation
7. UI and UX review
8. Verification
9. PR preparation
10. Feedback closure

Primary repository artifacts:

- `docs/features/*.md` for problem framing and acceptance criteria
- `docs/adr/*.md` for long-lived technical decisions
- `docs/execplans/*.md` for living execution state
- `src/` and `tests/e2e/` for implementation and verification
- `.codex/tmp/pr-summary.md` for review handoff
