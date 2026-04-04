# Requirement: Journey stage tracking workflow decision

## Status

Accepted

## Context

The repository is implementing Requirement: Journey stage tracking. The current MVP stores `currentJourneyStage` as free-form text across the shared domain model, API, persistence layer, and UI. That makes it easy for inconsistent stage labels to enter the system and makes later reporting, transition rules, and history tracking harder to trust.

Related feature specification: `docs/features/20-requirement-journey-stage-tracking.md`

## Decision

Adopt a shared primary journey-stage catalog in the student-record domain and use it as the source of truth for validation and UI options in the first delivery slice.

The first slice keeps the current storage shape but constrains `currentJourneyStage` to the supported primary stages:

- Prospect or inquiry
- Applicant
- Admitted
- Enrolled
- Active student
- Deferred
- Withdrawn
- Inactive student
- Graduated student
- Alumni handoff

At-risk remains a risk flag and is not part of the primary stage catalog.

Later slices may add richer stage-transition records, reason codes, and role-based transition rules, but they must build on the same shared primary stage catalog rather than re-defining stage values independently in the UI or API.

## Consequences

### Positive

- Clarifies the decision for future contributors.
- Prevents inconsistent stage labels from entering new or updated records.
- Gives reporting and later workflow logic a stable set of primary stage values.
- Keeps UI options and API validation aligned through one shared domain source.

### Negative

- Adds documentation work that must be maintained as the implementation evolves.
- Does not yet deliver the full transition-history and override model described in the broader requirement.

### Follow-up implications

- Add structured stage-transition history beyond the current timeline summary.
- Add reason-code requirements and role-aware transition rules.
- Keep all future stage-related features aligned to the shared stage catalog unless a later ADR intentionally changes it.
