# Case and issue management

## Description

As a backoffice campus worker or team lead, I need to manage operational cases on student records so that blockers, risks, and support issues can be tracked through resolution.

## Acceptance criteria

- A backoffice campus worker, backoffice team lead, or campus administrator can open a case against a student record.
- A case cannot be saved unless linked student record, category, priority, status, opened date, and assignee or queue are provided.
- Supported baseline case categories are missing documents, payment issues, registration blockers, attendance concerns, and student support requests. Campus administrators can configure additional categories.
- Supported baseline statuses are open, in progress, waiting on student, escalated, resolved, and cancelled.
- Each case stores case title, description, linked student, category, priority, status, assignee, owning queue, opened date, SLA target date, resolution date, and escalation history.
- Users can add case notes and attach supporting documents while the case remains visible in the student record timeline.
- When a case is escalated, the system records the escalated date, escalating user, target team lead or queue, and escalation reason.
- Backoffice campus workers can escalate a case only to allowed targets. Team leads can reassign escalated cases within their permitted scope.
- When a case status changes to resolved, the system requires a resolution summary and records the resolution date.
- When a case status changes to cancelled, the system requires a cancellation reason.
- The system calculates whether a case is within or beyond SLA target based on the current status and target date.
- Reporting must distinguish open, overdue, escalated, and resolved cases without requiring manual data cleanup.
