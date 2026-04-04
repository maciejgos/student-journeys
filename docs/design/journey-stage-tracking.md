# Journey stage tracking

## Feature link

- Related feature spec: `docs/features/20-requirement-journey-stage-tracking.md`
- Related ExecPlan: `docs/execplans/requirement-journey-stage-tracking.md`
- Related PR or issue: `#4`

## Design goal

Replace free-text journey-stage entry with a controlled choice so stage values stay consistent without adding extra friction to the record form.

## Primary user and context

- Primary user: backoffice campus worker or team lead
- Entry point: create and edit student-record forms
- Main task: assign or update the student's current primary journey stage
- Constraints: the current form is already dense, so the stage control should stay compact and familiar

## User flow

The user opens the create or edit form, moves to the operational profile section, and chooses the current journey stage from a select control that contains only the supported primary stages. If an invalid value somehow reaches the API, the form should show a clear validation message and leave the existing stage unchanged.

## Screen and component inventory

- Screen or view: new student record form
- Key sections: operational profile
- Key controls: journey-stage select, current sub-status input, risk flag input
- Reused patterns: standard form labels, validation messages, existing select styling
- New patterns: none for this first slice

## Interaction states

- Empty state: not applicable because the form starts with a default stage
- Loading state: existing record load behavior remains unchanged
- Success state: record saves with the chosen supported stage
- Validation state: unsupported stage value returns an inline error for `currentJourneyStage`
- Error state: API failure leaves the current form values visible and shows the status message

## Responsive behavior

- Desktop expectations: select appears inline with other operational profile fields
- Tablet expectations: field stacks within the existing responsive form grid
- Narrow-screen or mobile expectations: select uses the full available width like other fields

## Accessibility expectations

- Keyboard and focus behavior: the select must be reachable and operable with the keyboard like the existing role and visibility selects
- Labels and instructions: the field keeps the current "Current journey stage" label
- Error and status messaging: validation errors render inline beneath the field
- Motion or contrast considerations: no new motion; existing visual contrast patterns stay in use

## Content and tone

- Primary labels: use the supported stage names exactly as defined in the shared stage catalog
- Helper text: not required for this first slice
- Error tone: direct and operational, for example "Select a supported journey stage."
- Any terminology constraints: keep "At-risk" out of the primary stage list because it remains a risk flag

## Implementation notes

- UI files likely to change: `src/App.tsx`, `src/studentRecords.ts`
- Data dependencies: shared stage catalog exported from the student-record domain and enforced by the API path
- Testing implications: unit coverage for validation and API coverage for rejected invalid stages
- Open design questions: later slices may need a dedicated stage-transition panel rather than editing the current stage inline
