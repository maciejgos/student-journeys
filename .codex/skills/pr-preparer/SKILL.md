---
name: pr-preparer
description: Prepare AI-native delivery work for review by generating a PR summary, checking linked issue metadata, and ensuring validation evidence is ready. Use when work is complete enough to hand off for review.
---

# PR preparer

Use this skill once implementation and validation are complete.

## Goal

Create a review-ready handoff package that matches the repo's GitHub workflow.

## Workflow

1. Confirm the current branch and linked issue information.
2. Run `npm run codex:pr:summary -- --base <base-ref>` to refresh `.codex/tmp/pr-summary.md`.
3. Run `npm run codex:pr:validate` with the branch name and PR body file when metadata needs checking.
4. Ensure screenshots or assets exist only when UI changes require them.
5. Summarize what changed, what was validated, and what remains risky.
