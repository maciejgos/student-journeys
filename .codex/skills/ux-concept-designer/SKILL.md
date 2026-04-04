---
name: ux-concept-designer
description: Design the UI and UX approach for a feature before implementation. Use when a task introduces or changes user-facing screens, workflows, interactions, states, or visual direction and Codex should define the intended experience before coding.
---

# UX concept designer

Use this skill before implementing user-facing work.

## Goal

Turn a feature idea or spec into an implementation-guiding UI and UX concept so coding does not invent the experience ad hoc.

## Inputs to inspect

- the active feature spec in `docs/features/`
- relevant requirements in `docs/requirements.md`
- current UI code in `src/`
- `docs/design/TEMPLATE.md` when creating a new feature-level design note
- `.codex/skills/ux-concept-designer/references/design-checklist.md`

## Workflow

1. Identify the primary user, the goal, and the key journey for the feature.
2. Define the screen or component inventory and the main interaction flow.
3. Record required states: empty, loading, success, validation, and failure.
4. Note responsive behavior, accessibility expectations, and copy constraints.
5. Write the design guidance to `docs/design/` from `docs/design/TEMPLATE.md` when the work is more than a trivial tweak.
6. Hand the implementation stage concrete design constraints instead of vague style advice.

## Outputs

- a feature-specific design note in `docs/design/` when needed,
- screen and interaction guidance,
- state inventory,
- accessibility and responsive expectations.
