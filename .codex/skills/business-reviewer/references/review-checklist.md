# Business analyst review checklist

Use this reference when a feature review needs more structure than the core workflow in `SKILL.md`.

## Description quality

- The actor is identified.
- The business objective is identified.
- The operational benefit is stated clearly.
- The wording avoids solution ambiguity such as "support", "handle", or "manage" without defining expected behavior.

## Acceptance criteria quality

- Each criterion is observable.
- Each criterion can be tested without hidden assumptions.
- The criteria use concrete nouns and verbs.
- The criteria avoid vague qualifiers such as "appropriate", "basic", or "sensitive" unless defined elsewhere.
- The criteria cover at least the main success path.

## Common gaps in this repository context

- Missing identifiers or key fields for student records.
- Missing role distinctions between campus worker, team lead, and administrator.
- Missing stage-transition constraints or auditability.
- Missing duplicate handling, validation, or error states.
- Missing links to search, reporting, alerts, or notifications.
- Missing retention, privacy, or compliance expectations for student data.
- Missing scalability or performance implications where the feature affects lists, dashboards, or search.

## Suggested severity rubric

- High: likely to cause wrong implementation, rework, or a business/control gap.
- Medium: important detail is missing, ambiguous, or weakly testable.
- Low: wording, consistency, or completeness issue with limited delivery risk.
