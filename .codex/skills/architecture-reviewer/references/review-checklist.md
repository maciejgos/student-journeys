# Architecture review checklist

Use this reference when the architecture review needs a more explicit coverage pass.

## Requirement coverage

- Student record lifecycle support is reflected in modules, data, and workflows.
- Tasks, cases, interactions, documents, alerts, and reporting are all represented.
- The architecture accounts for the three roles: campus worker, team lead, administrator.
- Audit and permission-sensitive actions are addressed.

## Common architecture gaps in this repository context

- Workflow transitions are described without enforcement points.
- Reporting and search expectations exceed the chosen query model.
- Document storage is defined, but access control and metadata rules are underspecified.
- Notifications are mentioned without clarifying synchronous versus asynchronous handling.
- Audit logging is named as a concern, but write paths or event scope are unclear.
- Security language is high level and does not define identity source, session expiry, or privileged actions.
- Reliability, backup, retention, or recovery expectations are omitted even though student administration data is operationally sensitive.

## Suggested severity rubric

- High: likely to create a control gap, non-compliant behavior, or architecture that cannot meet stated requirements.
- Medium: important design detail is missing, weakly justified, or may force rework.
- Low: wording, consistency, or minor completeness issue with limited delivery risk.
