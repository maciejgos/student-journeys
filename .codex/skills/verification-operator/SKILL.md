---
name: verification-operator
description: Run checkpoint and finish validation for the AI-native delivery workflow. Use when Codex needs to choose the right validation suites, execute them, capture evidence, and clean up generated artifacts before the next stage.
---

# Verification operator

Use this skill after an implementation slice and before review handoff.

## Goal

Validate the change proportionally, keep evidence in the repo workflow, and leave the workspace clean.

## Workflow

1. Choose the smallest relevant suite while iterating.
2. Use `npm run codex:checkpoint -- --suites ...` for slice validation.
3. Use `npm run codex:finish` before review handoff unless the task is docs-only or a narrower suite is clearly sufficient.
4. Capture what passed, what could not be run, and any residual risk.
5. Confirm generated build or test artifacts were removed unless intentionally preserved.

## Typical suite mapping

- docs-only changes: targeted unit tests only if template or script behavior changed
- workflow or Node-side automation changes: `unit`, then `build`
- end-user behavior changes: `unit`, `build`, and `e2e` before handoff
