---
name: business-reviewer
description: Review feature specifications in docs/features from a business analyst perspective. Use when the user wants analytical feedback on feature docs, wants gaps or ambiguities identified, wants acceptance criteria challenged for completeness or testability, or wants a feature spec improved before implementation planning.
---

# Business analyst feature review

Use this skill when working with feature specifications in `docs/features/` for the Student Journey Tracking Application.

## Goal

Assess whether a feature document is clear, complete, consistent, and implementation-ready from a business analysis perspective.

Prioritize:

- unclear business intent,
- ambiguous scope,
- missing business rules,
- untestable acceptance criteria,
- cross-feature inconsistencies,
- missing operational or compliance considerations.

## Inputs to inspect

Start with the requested feature file. If the request is broad, review all files in `docs/features/`.

Read only the documents needed for context:

- `docs/features/TEMPLATE.md` for the expected structure,
- `docs/features/README.md` for feature inventory,
- `docs/requirements.md` when business intent or scope needs confirmation,
- adjacent feature specs when checking overlaps, dependencies, or contradictions.

## Review workflow

1. Identify the feature or set of features under review.
2. Confirm the document covers the core sections used in this repo: title, description, acceptance criteria.
3. Evaluate the description:
   - Is the business actor clear?
   - Is the business outcome clear?
   - Is the problem worth solving stated in operational terms?
4. Evaluate the acceptance criteria:
   - Are they specific, observable, and testable?
   - Do they describe system behavior rather than vague intent?
   - Do they cover normal flow, important edge cases, and constraints?
5. Check for missing analytical detail:
   - business rules,
   - data requirements,
   - permissions and roles,
   - audit/compliance implications,
   - lifecycle or status impacts,
   - reporting/notification/search dependencies,
   - exception handling and validation.
6. Check consistency with neighboring features and shared domain language.
7. Produce findings ordered by severity, then suggest concrete improvements.

## Analytical checklist

Use this checklist selectively. Do not force every category into every review.

- Business value: does the feature explain why it matters to campus operations?
- Actor clarity: is the primary user or stakeholder explicit?
- Scope boundary: is it clear what is included and excluded?
- Data definition: are key entities, identifiers, and required fields clear?
- Workflow fit: does it align with the student journey stages and operational flow?
- Rules and constraints: are validations, permissions, or policy rules missing?
- Exception handling: are duplicates, invalid states, missing data, or failed actions addressed?
- Dependencies: does the feature rely on alerts, notifications, reporting, audit, or RBAC behavior that is unstated?
- Testability: could a delivery team convert the criteria into tests without guessing?
- Consistency: does wording align with repository terms such as student record, case, journey stage, campus worker, and administrator?

## Output format

Default to a review-style response.

Present:

1. Findings first, ordered by severity, with file references.
2. Open questions or assumptions that need stakeholder clarification.
3. A brief improvement summary or a proposed rewrite only if useful.

If no meaningful issues are found, say that explicitly and mention residual risks such as missing edge cases or limited cross-feature context.

## Editing guidance

If the user asks for fixes, update the feature documents directly after the review.

Keep the repository's documentation style:

- short sections,
- flat bullet lists,
- direct business language,
- names aligned to the domain used in `docs/requirements.md`.
