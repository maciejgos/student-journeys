# Stage transition rules

Advance only when the current stage produced the required artifact or evidence.

Move from intake to planning when:

- `docs/features/*.md` exists or is updated for the work,
- the linked ADR requirement is clear,
- an ExecPlan exists for significant work.

Move from planning to implementation when:

- the feature scope is specific enough to test,
- the UI and UX approach is explicit for user-facing changes,
- architecture decisions are accepted or intentionally deferred,
- the ExecPlan has current progress, validation, and recovery guidance.

Move from implementation to verification when:

- code and tests for the current slice are in place,
- UI and UX review has been performed for user-facing changes,
- the ExecPlan progress reflects what changed,
- the next validation command is known.

Move from verification to PR preparation when:

- relevant tests and build checks passed,
- residual risk is recorded,
- generated artifacts are cleaned up unless intentionally preserved.

If a stage fails, stay in that stage and repair the missing artifact or evidence before moving on.
