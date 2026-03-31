# Search and filtering

## Description

As a backoffice campus worker or team lead, I need fast search and filtering tools so that I can quickly find student records, work queues, and common operational views.

## Acceptance criteria

- Global search supports queries by student ID, application ID, full or partial name, email address, and phone number.
- Search results return only records the current user is permitted to view.
- Search results show enough context to identify the correct record, including student name, primary identifier, campus, and current journey stage when visible to the user.
- Users can sort and filter student lists, task queues, case queues, and reporting input lists using fields relevant to each view.
- Users can save named filters for common operational views they are permitted to access.
- Saved filters preserve filter values, sort order, and the view where the filter applies.
- The system distinguishes between no results and no permission to view results without leaking restricted data.
