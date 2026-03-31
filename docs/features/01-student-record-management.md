# Student record management

## Description

As a backoffice campus worker, I need to create, search, and maintain complete student records so that student administration work is handled in one place and duplicate or incomplete records are reduced.

## Acceptance criteria

- A backoffice campus worker, backoffice team lead, or campus administrator can create a student record manually.
- A new student record cannot be saved unless first name or preferred name, last name, campus, and at least one contact or institutional identifier are provided.
- The accepted identifiers for initial record creation are student ID, application ID, email address, or phone number. At least one of these values must be present.
- The system assigns one internal primary key to each student record and preserves that key for the life of the record.
- The student profile supports structured fields for personal details, contact details, campus, program, admission details, enrollment details, assigned owner, current journey stage, current sub-status, risk flag status, and key milestone dates.
- Users with permission to update the record can edit structured fields individually without overwriting unrelated data.
- The record shows a timeline containing status changes, notes, interactions, tasks, case updates, and document activity in reverse chronological order.
- Before saving a new student record, the system checks for possible duplicates using exact or normalized matches on student ID, application ID, email address, and phone number.
- If a possible duplicate is found, the user sees the matching record candidates before save and must either open an existing record or confirm that a new record should still be created.
- A backoffice campus worker can override a duplicate warning only if their role permits student creation and the override action is captured in the audit log with user and timestamp.
- Users can search for and open an existing student record by student ID, application ID, name, email address, or phone number.
- If a user does not have permission to view a matching record, the system must not expose restricted student details in search results.
