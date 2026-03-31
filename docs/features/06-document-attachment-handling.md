# Document and attachment handling

## Description

As an authorized user, I need to upload and review documents on student records and cases so that supporting evidence and administrative files are stored with the related work.

## Acceptance criteria

- A user can upload a document only if they have permission to view the linked student or case and permission to add documents.
- A document must be linked to either a student record or a case. It may be linked to both when the case belongs to that student.
- Each uploaded document stores file name, document category, document type, upload date and time, uploader, linked record, and sensitivity classification.
- Baseline document categories include identification, transcripts, offer letters, enrollment forms, and support evidence. Campus administrators can configure additional categories.
- The system prevents a user from viewing or downloading a document if their role or permission scope does not allow access to that sensitivity classification.
- Sensitive document restrictions apply consistently in the student record view, case view, search results, and export paths.
- Users can view document metadata without opening the file when they have metadata access but not file content access.
- If a new file replaces an existing document, the system records the replacement as a new document version or new document entry and preserves the earlier upload in audit history.
- Document upload and access events for sensitive documents are captured in the audit log.
