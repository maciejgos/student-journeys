# Interaction logging

## Description

As a backoffice campus worker, I need to log every student interaction so that communication history, outcomes, and follow-up needs are visible across teams.

## Acceptance criteria

- A backoffice campus worker, backoffice team lead, or campus administrator can log an interaction against a student record they are permitted to access.
- Supported interaction channels are email, phone call, in-person meeting, internal note, and SMS or message.
- Each interaction stores interaction date and time, entered-by user, channel, summary, and outcome.
- Summary and outcome are required for all interaction entries except internal note, where summary is required and outcome is optional.
- An interaction may include an optional follow-up action description and optional follow-up due date.
- Saving an interaction does not create a task automatically unless the user explicitly creates or links one through task functionality.
- Interaction history is visible in the student timeline and in a dedicated interaction history view on the student record.
- Users cannot edit another user's interaction entry unless their role includes elevated edit permission.
- Any edit to an existing interaction preserves the original created-by user and original created timestamp in audit history.
