# Student Journey Tracking Application

This repository contains the specification and early project structure for a Student Journey Tracking Application. The system is intended to help campus backoffice teams manage a student lifecycle from first inquiry through enrollment, active study, support interventions, graduation, and alumni handoff.

## Purpose

The application centralizes student journey data in one operational system. Its main goals are to reduce fragmented recordkeeping, improve follow-up discipline, give staff a clear view of student status and history, and support auditable administrative workflows.

## Primary Users

- Backoffice campus workers managing records, tasks, interactions, and cases
- Backoffice team leads overseeing workload, escalations, and reporting
- Campus administrators configuring roles, statuses, queues, and rules

## Core Scope

The application supports these journey stages:

1. Prospect or inquiry
2. Applicant
3. Admitted
4. Enrolled
5. Active student
6. At-risk student
7. Deferred, withdrawn, or inactive student
8. Graduated student
9. Alumni handoff

## Planned Functional Areas

- Student record management with identifiers, profile data, and history
- Journey stage tracking with audit history and controlled transitions
- Task and follow-up management
- Case and issue management
- Interaction logging across email, phone, meetings, notes, and messages
- Document and attachment handling
- Alerts, risk flags, dashboards, reporting, search, and notifications
- Role-based access control for workers, team leads, and administrators

## MVP Scope

The initial scope focuses on student records, stage tracking, tasks, cases, interaction logging, basic document uploads, and role-based permissions.

## Repository Documents

- `docs/requirements.md`: full product requirements
- `docs/PLAN.md`: delivery planning
- `docs/architecture.md`: architecture notes
- `docs/adr/`: architecture decision records
- `docs/features/`: feature specifications and templates
- `src/`: future application source code
