# Journey stage tracking

## Description

As a backoffice campus worker or team lead, I need to track each student's current journey stage and history so that progression, exceptions, and ownership changes are auditable and controlled.

## Acceptance criteria

- Each student record has exactly one current journey stage and one current sub-status.
- The supported journey stages are prospect or inquiry, applicant, admitted, enrolled, active student, deferred, withdrawn, inactive student, graduated student, and alumni handoff.
- At-risk status is recorded as a risk flag that can coexist with an eligible journey stage. It is not stored as the primary journey stage.
- Each stage change records the previous stage, new stage, sub-status, effective date, changed-by user, and optional reason code.
- Reason code is mandatory when the new stage is deferred, withdrawn, inactive student, graduated student, or alumni handoff.
- The system blocks a stage change if the target stage is not allowed by the configured workflow transition rules for the user's role.
- Backoffice team leads may use an override transition only where an override rule is explicitly configured, and the override is written to the audit log.
- Users can view the full stage history for a student, including prior values and timestamps, after later edits are made.
- A student cannot have more than one active current stage at the same time.
- When a stage change is saved, reporting, alerts, notifications, and timeline history use the updated stage data.
- If a stage change request is invalid, the system returns a clear validation message and leaves the existing stage unchanged.
