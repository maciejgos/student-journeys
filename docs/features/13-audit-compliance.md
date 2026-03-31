# Audit and compliance

## Description

As a campus administrator or compliance stakeholder, I need sensitive actions to be auditable so that operational changes can be reviewed and the system can support campus retention and privacy obligations.

## Acceptance criteria

- The system keeps an audit log for create, update, delete where allowed, assignment, status change, permission-sensitive, and sensitive document access actions.
- Each audit entry records action type, affected record type, affected record identifier, changed-by user, timestamp, and changed fields or outcome summary.
- Audit history for a record remains available after later updates to that record.
- The system supports retention rule configuration or documented retention handling aligned to campus policy for student records, documents, interactions, and audit history.
- Personally identifiable information and sensitive student data are protected in accordance with the security feature and must not be exposed through audit access beyond the viewer's permission level.
- Only users with audit access permission can view audit logs beyond the operational history visible on an individual student record.
- Audit data used for investigations can be filtered by record, user, action type, and date range.
