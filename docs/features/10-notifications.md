# Notifications

## Description

As a backoffice campus worker or team lead, I need timely notifications about work changes so that I can respond to assignments, deadlines, escalations, and status updates without manual checking.

## Acceptance criteria

- The system provides in-app notifications for new task or case assignments, upcoming due dates, overdue tasks, escalated cases, and status changes on records the user owns or follows.
- A notification stores notification type, recipient, linked record, trigger event, created date and time, and read status.
- New assignment notifications are sent to the assigned user after the assignment is saved.
- Upcoming due date notifications are sent based on the configured reminder timing for the task or rule.
- Overdue notifications are sent when a task moves into overdue status and are not repeated more than once per configured notification interval.
- Status change notifications are sent only to users who currently own or follow the record at the time of the change.
- Users can mark notifications as read without altering the underlying record or task status.
- Email delivery is out of scope for the first release and may be added later without changing in-app notification rules.
