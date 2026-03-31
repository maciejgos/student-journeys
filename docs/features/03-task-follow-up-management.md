# Task and follow-up management

## Description

As a backoffice campus worker, I need to manage student-related tasks and reminders so that follow-ups are visible, assigned, and completed on time.

## Acceptance criteria

- A backoffice campus worker, backoffice team lead, or campus administrator can create a task linked to a student record.
- A task cannot be saved unless title, linked student record, assignee, status, and due date are provided.
- Task fields include title, description, linked student, assignee, created by, due date, priority, category, reminder date and time, status, completion date, and cancellation reason.
- Allowed task statuses are open, in progress, completed, and cancelled.
- Overdue is system-derived, not user-entered, and applies when a task is not completed or cancelled and the due date has passed.
- Users can assign a task to themselves or another worker within an authorized team or queue.
- Team leads can reassign work across their permitted team scope.
- Personal task queues show tasks assigned to the current user. Team task queues show tasks for the teams the user is permitted to manage or view.
- Overdue tasks are visually distinguished in queue and record views.
- When a task is marked completed, the system records completion date and completing user.
- When a task is cancelled, the system requires a cancellation reason.
- The system flags a student record as having no next action when there is no open or in-progress task with a future or current due date for longer than the configured threshold.
- The no-next-action threshold is configurable by campus administrator.
