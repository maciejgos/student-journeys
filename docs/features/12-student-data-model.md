# Student data model

## Description

As a product and engineering team, we need a clear minimum student data model so that all required operational information is consistently stored and available across workflows.

## Acceptance criteria

- Each student record has one internal primary key and supports external identifiers including student ID and application ID where available.
- The baseline personal and contact fields are name, date of birth if required by campus policy, email address, phone number, and postal or residency information where used by operations.
- The baseline academic and administrative fields are campus, program, intake or term, admission status, enrollment status, assigned owner, current journey stage, current sub-status, and key milestone dates.
- Key milestone dates support at least inquiry date, application date, admission decision date, enrollment date, withdrawal date, graduation date, and alumni handoff date where applicable.
- The model supports one-to-many relationships from student record to tasks, cases, interactions, documents, alerts, and audit history.
- The model supports current state fields for operational use and historical records for stage changes, assignments, alerts, and case updates.
- Required fields, optional fields, and reference data values must be defined centrally enough that dependent features use the same field meanings and status values.
- Search, duplicate detection, reporting, alerts, and notifications use the canonical student identifiers and current-state fields defined in this model.
