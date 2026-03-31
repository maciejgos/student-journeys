# Student Journey Tracking Application Requirements

## 1. Purpose

The Student Journey Tracking Application supports backoffice campus workers in managing and monitoring a student's lifecycle from initial inquiry through enrollment, study progression, support interventions, completion, and alumni handoff.

The system is intended to reduce fragmented recordkeeping, improve follow-up discipline, provide operational visibility, and support auditable student administration workflows across campus teams.

## 2. Goals

- Centralize student journey data in one system.
- Give campus backoffice workers a clear operational view of each student's status, history, and pending actions.
- Improve service levels for admissions, onboarding, retention, and graduation-related processes.
- Reduce missed follow-ups, duplicate outreach, and incomplete records.
- Provide reliable reporting for workload, pipeline health, retention risks, and case resolution.

## 3. Primary Users

### 3.1 Backoffice Campus Worker

Handles day-to-day student administration, data updates, case handling, outreach logging, and task follow-up.

### 3.2 Backoffice Team Lead

Oversees team workload, service performance, queue management, escalations, and reporting.

### 3.3 Campus Administrator

Configures master data, permissions, workflow rules, status definitions, and reporting access.

## 4. Core Business Scope

The application must support the following student journey stages:

1. Prospect or inquiry
2. Applicant
3. Admitted
4. Enrolled
5. Active student
6. At-risk student
7. Deferred, withdrawn, or inactive student
8. Graduated student
9. Alumni handoff

## 5. Functional Requirements

### 5.1 Student Record Management

The system must allow users to:

- Create a student record manually.
- Search and open an existing student record quickly.
- Maintain a unique student profile with identifiers such as student ID, application ID, email, phone number, and program.
- Store personal, academic, administrative, and engagement information in structured fields.
- View a complete timeline of status changes, notes, interactions, tasks, and case updates.
- Prevent accidental duplicate student creation through duplicate detection warnings.

### 5.2 Journey Stage Tracking

The system must:

- Track the student's current journey stage and sub-status.
- Record the date and user responsible for each status update.
- Preserve a full audit history of previous stages and changes.
- Allow authorized users to move a student between stages using controlled workflow rules.
- Support campus-defined reason codes for key status changes such as deferment, withdrawal, or graduation.

### 5.3 Task and Follow-Up Management

The system must allow users to:

- Create tasks linked to a student record.
- Assign tasks to themselves or another backoffice worker.
- Set due dates, priorities, categories, and reminders.
- Mark tasks as open, in progress, completed, cancelled, or overdue.
- View personal and team task queues.

The system should:

- Highlight overdue follow-ups.
- Prompt users when a student record has no next action for a configurable period.

### 5.4 Case and Issue Management

The system must support operational cases such as missing documents, payment issues, registration blockers, attendance concerns, and student support requests.

The system must allow users to:

- Open a case against a student record.
- Categorize, prioritize, assign, and update the case.
- Record case notes and attachments.
- Track SLA target dates and resolution dates.
- Escalate a case to a team lead or specialized queue.

### 5.5 Interaction Logging

The system must allow users to log student interactions, including:

- Email
- Phone call
- In-person meeting
- Internal note
- SMS or message

Each interaction should include:

- Date and time
- User
- Channel
- Summary
- Outcome
- Optional follow-up action

### 5.6 Document and Attachment Handling

The system must:

- Allow authorized users to upload and view documents associated with a student or case.
- Support document categories such as identification, transcripts, offer letters, enrollment forms, and support evidence.
- Record upload date, uploader, and document type.
- Restrict access to sensitive documents based on role.

### 5.7 Alerts and Risk Flags

The system should support configurable alerts for:

- Missing required documents
- Upcoming deadlines
- No recent engagement
- Repeated failed contact attempts
- Tuition or payment-related issues
- Attendance or academic risk signals

The system must allow users to apply or remove manual risk flags with a reason.

### 5.8 Reporting and Dashboards

The system must provide dashboards and reports for:

- Students by journey stage
- Application and enrollment pipeline volumes
- Outstanding tasks by worker or team
- Open cases by category, age, and priority
- Students with risk flags
- Average case resolution time
- Status movement trends
- Withdrawals and deferments by reason

Reports should support filtering by campus, program, date range, and owner.

### 5.9 Search and Filtering

The system must provide:

- Global search by student ID, name, email, phone number, or application ID
- Saved filters for common operational views
- Sort and filter options on queues and lists

### 5.10 Notifications

The system should notify users about:

- New assignments
- Upcoming due dates
- Overdue tasks
- Escalated cases
- Status changes on records they own or follow

Notifications may be in-app first, with optional email support later.

## 6. Roles and Permissions

The system must support role-based access control.

### 6.1 Backoffice Campus Worker

- View and update assigned and permitted student records
- Create and update tasks, interactions, and cases
- Upload permitted documents
- Run standard operational reports

### 6.2 Backoffice Team Lead

- All backoffice worker capabilities
- Reassign work
- Manage escalations
- View team dashboards and performance reports
- Override selected workflow transitions

### 6.3 Campus Administrator

- Full configuration access
- Manage users, roles, statuses, queues, categories, and templates
- Access audit logs and system settings

## 7. Data Requirements

Each student record should support, at minimum, the following data groups:

- Personal details
- Contact details
- Campus and program information
- Admission and enrollment details
- Current journey stage and status
- Assigned owner
- Tasks and reminders
- Cases and issue history
- Communication history
- Uploaded documents
- Risk flags
- Key milestone dates

## 8. Audit and Compliance Requirements

The system must:

- Keep an audit log of create, update, assignment, status, and permission-sensitive actions.
- Record who changed what and when.
- Support data retention rules defined by campus policy.
- Protect personally identifiable information and sensitive student data.

## 9. Non-Functional Requirements

### 9.1 Usability

- The interface must be usable by non-technical backoffice staff with minimal training.
- Common tasks should be achievable within a small number of clicks.
- Student records should present the most relevant operational information first.

### 9.2 Performance

- Search results should return quickly for standard queries.
- Common record views and queues should load within acceptable operational limits.

### 9.3 Security

- Users must authenticate before accessing the system.
- Sensitive data must be protected in transit and at rest.
- Permissions must be enforced consistently across UI, API, and exports.

### 9.4 Reliability

- The system should support daily campus operations during business hours with minimal downtime.
- Errors should be logged and traceable for support investigation.

### 9.5 Scalability

- The design should support multiple campuses, programs, and growing student volumes.

## 10. Suggested MVP Scope

The minimum viable product should include:

- Student record creation and editing
- Journey stage tracking
- Task management
- Case management
- Interaction logging
- Basic document uploads
- Role-based permissions
- Search and filtering
- Core dashboards and operational reports
- Audit logging

## 11. Future Enhancements

Potential later-phase capabilities include:

- Automated workflow triggers
- Integration with student information systems
- Email and SMS integration
- Bulk updates and imports
- Student self-service touchpoints
- Advanced risk scoring
- SLA breach alerts
- Export scheduling

## 12. Success Metrics

The application should be considered successful if it leads to:

- Reduced missed follow-ups
- Faster case resolution
- Improved visibility into student pipeline and risk
- Better record completeness
- Higher operational consistency across campus teams
