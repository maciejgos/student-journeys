# Journey Stage Tracking

## Description

As a backoffice user, I need to track each student’s current journey stage and history so that progression, exceptions, and ownership changes are auditable and controlled.

## Acceptance criteria

- The system stores a current journey stage and sub-status for each student.
- Each status update records the effective date and the user who made the change.
- Previous stages and changes remain available in audit history.
- Authorized users can move students between stages only through allowed workflow transitions.
- The system supports reason codes for key changes such as deferment, withdrawal, and graduation.
- The supported lifecycle includes prospect, applicant, admitted, enrolled, active, at-risk, inactive states, graduated, and alumni handoff.
