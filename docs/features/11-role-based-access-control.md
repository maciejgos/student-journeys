# Role-based access control

## Description

As a campus administrator, I need role-based access control so that workers, team leads, and administrators can access only the data and actions appropriate to their responsibilities.

## Acceptance criteria

- The system supports at least the roles Backoffice Campus Worker, Backoffice Team Lead, and Campus Administrator.
- Backoffice campus workers can view and update student records within their permitted scope, create and update tasks, interactions, and cases, upload permitted documents, and run standard operational reports.
- Backoffice team leads inherit worker capabilities within their permitted scope and can reassign work, manage escalations, view team dashboards, and use configured workflow overrides.
- Campus administrators can manage users, roles, permission assignments, statuses, queues, categories, templates, audit access, and system settings.
- Permission rules apply consistently across UI actions, API behavior, search results, notification content, document access, reporting, and exports.
- A user cannot grant themselves broader permissions unless they already hold administrator-level permission to manage access.
- Where campus or program scope restrictions exist, those scope rules limit record visibility and action permissions in addition to role membership.
- Permission-denied responses must block the action and provide a non-sensitive error message.
