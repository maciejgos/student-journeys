# Alerts and risk flags

## Description

As a backoffice campus worker or team lead, I need the system to surface missing actions and student risk signals so that intervention happens before deadlines or service issues are missed.

## Acceptance criteria

- The system supports configurable alert rules for missing required documents, upcoming deadlines, no recent engagement, repeated failed contact attempts, tuition or payment issues, and attendance or academic risk signals.
- Each alert rule defines trigger conditions, evaluation timing, alert severity, and clear conditions.
- An active alert stores alert type, triggered date and time, current severity, linked student, source rule, and current status.
- The system clears or closes an alert automatically when the configured clear condition is met, and preserves alert history for audit and reporting.
- Authorized users can apply a manual risk flag only by selecting a risk flag type and entering a reason.
- Authorized users can remove a manual risk flag only by entering a resolution note or closure reason.
- Active alerts and manual risk flags are visible on the student record and in queue views where users manage follow-up work.
- If a user does not have permission to view the underlying student record, the alert or risk flag must not expose restricted student details.
- Alert and risk flag changes are available to reporting and notification features without additional manual steps.
