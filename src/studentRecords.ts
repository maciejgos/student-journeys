export type UserRole = 'worker' | 'teamLead' | 'administrator';
export type RecordVisibility = 'standard' | 'restricted';

export const supportedPrimaryJourneyStages = [
  'Prospect or inquiry',
  'Applicant',
  'Admitted',
  'Enrolled',
  'Active student',
  'Deferred',
  'Withdrawn',
  'Inactive student',
  'Graduated student',
  'Alumni handoff',
] as const;

export type JourneyStage = (typeof supportedPrimaryJourneyStages)[number];

export type StudentRecordInput = {
  firstName: string;
  preferredName: string;
  lastName: string;
  dateOfBirth: string;
  residencyInfo: string;
  email: string;
  phone: string;
  campus: string;
  program: string;
  studentId: string;
  applicationId: string;
  admissionStatus: string;
  enrollmentStatus: string;
  assignedOwner: string;
  currentJourneyStage: string;
  currentSubStatus: string;
  riskFlagStatus: string;
  inquiryDate: string;
  applicationDate: string;
  admissionDecisionDate: string;
  enrollmentDate: string;
  withdrawalDate: string;
  graduationDate: string;
  alumniHandoffDate: string;
};

export type StudentRecord = StudentRecordInput & {
  id: string;
  visibility: RecordVisibility;
  createdAt: string;
  updatedAt: string;
};

export type StudentRecordSummary = {
  id: string;
  displayName: string;
  primaryIdentifier: string;
  campus: string;
  currentJourneyStage: string;
  visibility: RecordVisibility;
};

export type TimelineEventType =
  | 'status-change'
  | 'note'
  | 'interaction'
  | 'task'
  | 'case-update'
  | 'document';

export type TimelineItem = {
  id: string;
  studentId: string;
  type: TimelineEventType;
  summary: string;
  occurredAt: string;
};

export type AuditLogEntry = {
  id: number;
  recordType: 'student-record';
  recordId: string;
  studentId: string;
  actionType: 'create' | 'update' | 'duplicate-override';
  actorRole: UserRole;
  actorName: string;
  occurredAt: string;
  summary: string;
};

export type ValidationErrors = Partial<Record<keyof StudentRecordInput, string>>;

export type RolePermissions = {
  canCreate: boolean;
  canUpdate: boolean;
  canOverrideDuplicate: boolean;
  canViewRestricted: boolean;
  canViewAuditLog: boolean;
};

export const rolePermissions: Record<UserRole, RolePermissions> = {
  worker: {
    canCreate: true,
    canUpdate: true,
    canOverrideDuplicate: false,
    canViewRestricted: false,
    canViewAuditLog: false,
  },
  teamLead: {
    canCreate: true,
    canUpdate: true,
    canOverrideDuplicate: true,
    canViewRestricted: true,
    canViewAuditLog: true,
  },
  administrator: {
    canCreate: true,
    canUpdate: true,
    canOverrideDuplicate: true,
    canViewRestricted: true,
    canViewAuditLog: true,
  },
};

export const userDisplayNameByRole: Record<UserRole, string> = {
  worker: 'Backoffice Worker',
  teamLead: 'Backoffice Team Lead',
  administrator: 'Campus Administrator',
};

export const defaultStudentRecordInput = (): StudentRecordInput => ({
  firstName: '',
  preferredName: '',
  lastName: '',
  dateOfBirth: '',
  residencyInfo: '',
  email: '',
  phone: '',
  campus: '',
  program: '',
  studentId: '',
  applicationId: '',
  admissionStatus: '',
  enrollmentStatus: '',
  assignedOwner: '',
  currentJourneyStage: 'Prospect or inquiry',
  currentSubStatus: 'New',
  riskFlagStatus: 'Clear',
  inquiryDate: '',
  applicationDate: '',
  admissionDecisionDate: '',
  enrollmentDate: '',
  withdrawalDate: '',
  graduationDate: '',
  alumniHandoffDate: '',
});

export const normalizeValue = (value: string): string => value.trim().toLowerCase();

export const normalizePhone = (value: string): string => value.replace(/\D/g, '');

export const trimRecordInput = (input: StudentRecordInput): StudentRecordInput => {
  const entries = Object.entries(input).map(([key, value]) => [key, value.trim()]);
  return Object.fromEntries(entries) as StudentRecordInput;
};

export const trimRecordPatch = (patch: Partial<StudentRecordInput>): Partial<StudentRecordInput> => {
  const entries = Object.entries(patch).map(([key, value]) => [key, value?.trim() ?? '']);
  return Object.fromEntries(entries) as Partial<StudentRecordInput>;
};

export const displayNameForRecord = (record: Pick<StudentRecordInput, 'firstName' | 'preferredName' | 'lastName'>): string =>
  [record.preferredName || record.firstName, record.lastName].filter(Boolean).join(' ');

export const primaryIdentifierForRecord = (
  record: Pick<StudentRecordInput, 'studentId' | 'applicationId' | 'email' | 'phone'> & { id?: string },
): string => record.studentId || record.applicationId || record.email || record.phone || record.id || '';

export const sortTimeline = (timeline: TimelineItem[]): TimelineItem[] =>
  [...timeline].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

export const validateStudentRecordInput = (input: StudentRecordInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!input.firstName.trim() && !input.preferredName.trim()) {
    errors.firstName = 'First name or preferred name is required.';
  }

  if (!input.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }

  if (!input.campus.trim()) {
    errors.campus = 'Campus is required.';
  }

  const hasIdentifier = [
    input.studentId,
    input.applicationId,
    input.email,
    input.phone,
  ].some((value) => value.trim().length > 0);

  if (!hasIdentifier) {
    errors.studentId = 'Provide at least one student, application, email, or phone identifier.';
  }

  if (!supportedPrimaryJourneyStages.includes(input.currentJourneyStage as JourneyStage)) {
    errors.currentJourneyStage = 'Select a supported journey stage.';
  }

  return errors;
};

export const summarizeRecord = (record: StudentRecord): StudentRecordSummary => ({
  id: record.id,
  displayName: displayNameForRecord(record),
  primaryIdentifier: primaryIdentifierForRecord(record),
  campus: record.campus,
  currentJourneyStage: record.currentJourneyStage,
  visibility: record.visibility,
});

export const canViewRecord = (role: UserRole, record: Pick<StudentRecord, 'visibility'>): boolean =>
  record.visibility === 'standard' || rolePermissions[role].canViewRestricted;

export const canViewAuditLog = (role: UserRole): boolean => rolePermissions[role].canViewAuditLog;

export const matchesQuery = (query: string, record: StudentRecord): boolean => {
  const normalizedQuery = normalizeValue(query);
  const normalizedPhoneQuery = normalizePhone(query);

  if (!normalizedQuery && !normalizedPhoneQuery) {
    return true;
  }

  const textMatch = [
    displayNameForRecord(record).toLowerCase(),
    record.firstName.toLowerCase(),
    record.preferredName.toLowerCase(),
    record.lastName.toLowerCase(),
    normalizeValue(record.studentId),
    normalizeValue(record.applicationId),
    normalizeValue(record.email),
  ].some((value) => value.includes(normalizedQuery));

  const phoneMatch =
    normalizedPhoneQuery.length > 0 && normalizePhone(record.phone).includes(normalizedPhoneQuery);

  return textMatch || phoneMatch;
};

export const mergeStudentRecord = (
  current: StudentRecord,
  patch: Partial<StudentRecordInput>,
  updatedAt: string,
): StudentRecord => ({
  ...current,
  ...patch,
  updatedAt,
});

export const changedStudentRecordFields = (
  before: StudentRecordInput,
  after: StudentRecordInput,
): Array<keyof StudentRecordInput> =>
  (Object.keys(fieldLabels) as Array<keyof StudentRecordInput>).filter((field) => before[field] !== after[field]);

export const studentRecordFieldGroups: Array<{
  title: string;
  fields: Array<keyof StudentRecordInput>;
}> = [
  {
    title: 'Personal details',
    fields: ['firstName', 'preferredName', 'lastName', 'dateOfBirth', 'residencyInfo'],
  },
  {
    title: 'Contact and identifiers',
    fields: ['email', 'phone', 'studentId', 'applicationId'],
  },
  {
    title: 'Operational profile',
    fields: [
      'campus',
      'program',
      'admissionStatus',
      'enrollmentStatus',
      'assignedOwner',
      'currentJourneyStage',
      'currentSubStatus',
      'riskFlagStatus',
    ],
  },
  {
    title: 'Key milestone dates',
    fields: [
      'inquiryDate',
      'applicationDate',
      'admissionDecisionDate',
      'enrollmentDate',
      'withdrawalDate',
      'graduationDate',
      'alumniHandoffDate',
    ],
  },
];

export const fieldLabels: Record<keyof StudentRecordInput, string> = {
  firstName: 'First name',
  preferredName: 'Preferred name',
  lastName: 'Last name',
  dateOfBirth: 'Date of birth',
  residencyInfo: 'Residency information',
  email: 'Email address',
  phone: 'Phone number',
  campus: 'Campus',
  program: 'Program',
  studentId: 'Student ID',
  applicationId: 'Application ID',
  admissionStatus: 'Admission status',
  enrollmentStatus: 'Enrollment status',
  assignedOwner: 'Assigned owner',
  currentJourneyStage: 'Current journey stage',
  currentSubStatus: 'Current sub-status',
  riskFlagStatus: 'Risk flag status',
  inquiryDate: 'Inquiry date',
  applicationDate: 'Application date',
  admissionDecisionDate: 'Admission decision date',
  enrollmentDate: 'Enrollment date',
  withdrawalDate: 'Withdrawal date',
  graduationDate: 'Graduation date',
  alumniHandoffDate: 'Alumni handoff date',
};

export const fieldOptions: Partial<Record<keyof StudentRecordInput, readonly string[]>> = {
  currentJourneyStage: supportedPrimaryJourneyStages,
};
