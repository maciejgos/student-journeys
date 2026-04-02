import {
  AuditLogEntry,
  RecordVisibility,
  StudentRecord,
  StudentRecordInput,
  StudentRecordSummary,
  TimelineItem,
  UserRole,
  userDisplayNameByRole,
} from './studentRecords';

type ApiHeaders = {
  'content-type'?: string;
  'x-user-role': UserRole;
  'x-user-name': string;
};

type ApiError = {
  message?: string;
  errors?: Partial<Record<keyof StudentRecordInput, string>>;
  candidates?: StudentRecordSummary[];
  hasHiddenMatches?: boolean;
};

const buildHeaders = (role: UserRole): ApiHeaders => ({
  'content-type': 'application/json',
  'x-user-role': role,
  'x-user-name': userDisplayNameByRole[role],
});

const request = async <T>(input: string, init: RequestInit, role: UserRole): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...buildHeaders(role),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw {
      status: response.status,
      ...body,
    };
  }

  return (await response.json()) as T;
};

export const searchStudentRecords = async (query: string, role: UserRole) =>
  request<{ records: StudentRecordSummary[]; hasHiddenMatches: boolean }>(
    '/api/student-records?query=' + encodeURIComponent(query),
    { method: 'GET' },
    role,
  );

export const getStudentRecord = async (id: string, role: UserRole) =>
  request<{ record: StudentRecord; timeline: TimelineItem[] }>(`/api/student-records/${id}`, { method: 'GET' }, role);

export const getAuditLog = async (id: string, role: UserRole) =>
  request<{ auditLog: AuditLogEntry[] }>(`/api/student-records/${id}/audit-log`, { method: 'GET' }, role);

export const createStudentRecord = async (
  record: StudentRecordInput,
  visibility: RecordVisibility,
  role: UserRole,
  confirmDuplicateOverride = false,
) =>
  request<{
    record: StudentRecord;
    timeline: TimelineItem[];
    auditLog: AuditLogEntry[];
  }>(
    '/api/student-records',
    {
      method: 'POST',
      body: JSON.stringify({
        record,
        visibility,
        confirmDuplicateOverride,
      }),
    },
    role,
  );

export const updateStudentRecord = async (
  id: string,
  patch: Partial<StudentRecordInput>,
  role: UserRole,
) =>
  request<{
    record: StudentRecord;
    timeline: TimelineItem[];
    auditLog: AuditLogEntry[];
  }>(
    `/api/student-records/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ patch }),
    },
    role,
  );
