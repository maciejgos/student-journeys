---
name: ux-reviewer
description: Review implemented UI and UX work for usability, consistency, responsiveness, and accessibility before handoff. Use when a task changes the product interface and Codex should assess the result against the intended experience.
---

# UX reviewer

Use this skill after implementing user-facing work and before final PR handoff.

## Goal

Identify design, usability, and accessibility gaps that functional validation alone will miss.

## Inputs to inspect

- the active feature spec,
- any related `docs/design/*.md` note,
- changed UI files in `src/`,
- `.codex/skills/ux-reviewer/references/review-checklist.md`

## Workflow

1. Compare the implemented UI to the feature and design intent.
2. Check hierarchy, affordance, state coverage, and copy clarity.
3. Review responsive behavior and obvious accessibility risks.
4. Report findings ordered by severity, with file references when possible.
5. If the user asked for fixes, update the UI directly and re-run the relevant validation.

## Outputs

- findings or explicit confirmation that no meaningful design issues were found,
- identified missing states or interaction gaps,
- accessibility or responsive risks,
- direct fixes when requested.
