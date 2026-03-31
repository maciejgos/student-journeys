# Performance

## Description

As an operational user, I need searches, record views, and queues to respond quickly so that the system remains practical during day-to-day campus work.

## Acceptance criteria

- For standard business usage, global search returns initial results within 2 seconds for typical indexed queries.
- The primary student record view loads within 3 seconds for a record with typical related history, excluding unusually large file downloads.
- Personal and team task or case queue views load within 3 seconds for standard filtered views.
- Performance targets are measured using representative business data volumes for the initial release, including multiple campuses, programs, students, tasks, and cases.
- If a request exceeds the target threshold, the system logs the event for operational investigation.
