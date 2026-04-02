import {
  canViewAuditLog,
  canViewRecord,
  changedStudentRecordFields,
  defaultStudentRecordInput,
  displayNameForRecord,
  matchesQuery,
  mergeStudentRecord,
  primaryIdentifierForRecord,
  summarizeRecord,
  trimRecordInput,
  validateStudentRecordInput,
} from './studentRecords';

describe('student record domain', () => {
  const baseRecord = {
    ...defaultStudentRecordInput(),
    id: 'student_1',
    firstName: 'Alice',
    lastName: 'Walker',
    campus: 'North Campus',
    email: 'alice.walker@example.edu',
    visibility: 'standard' as const,
    currentJourneyStage: 'Applicant',
    createdAt: '2026-04-01T09:00:00.000Z',
    updatedAt: '2026-04-01T09:00:00.000Z',
  };

  it('validates required fields and identifier presence', () => {
    expect(validateStudentRecordInput(defaultStudentRecordInput())).toEqual({
      campus: 'Campus is required.',
      firstName: 'First name or preferred name is required.',
      lastName: 'Last name is required.',
      studentId: 'Provide at least one student, application, email, or phone identifier.',
    });
  });

  it('matches search input by normalized phone and name fragments', () => {
    expect(matchesQuery('alice', baseRecord)).toBe(true);
    expect(matchesQuery('+1 555 100', { ...baseRecord, phone: '+1 (555) 100-2001' })).toBe(true);
  });

  it('enforces restricted visibility on summaries', () => {
    expect(canViewRecord('worker', { visibility: 'restricted' })).toBe(false);
    expect(canViewRecord('administrator', { visibility: 'restricted' })).toBe(true);
    expect(canViewAuditLog('worker')).toBe(false);
    expect(canViewAuditLog('teamLead')).toBe(true);
  });

  it('merges updates without overwriting unrelated fields', () => {
    const updated = mergeStudentRecord(baseRecord, { program: 'MBA' }, '2026-04-02T00:00:00.000Z');

    expect(updated.program).toBe('MBA');
    expect(updated.email).toBe(baseRecord.email);
    expect(updated.updatedAt).toBe('2026-04-02T00:00:00.000Z');
  });

  it('builds record summary labels correctly', () => {
    const summary = summarizeRecord(baseRecord);

    expect(displayNameForRecord(baseRecord)).toBe('Alice Walker');
    expect(primaryIdentifierForRecord(baseRecord)).toBe('alice.walker@example.edu');
    expect(summary.displayName).toBe('Alice Walker');
  });

  it('trims saved input and reports changed fields precisely', () => {
    const trimmed = trimRecordInput({
      ...defaultStudentRecordInput(),
      firstName: '  Alice  ',
      lastName: '  Walker ',
      campus: ' North Campus ',
      email: ' alice.walker@example.edu ',
    });
    const updated = mergeStudentRecord(baseRecord, { program: 'MBA' }, '2026-04-02T00:00:00.000Z');

    expect(trimmed.firstName).toBe('Alice');
    expect(trimmed.email).toBe('alice.walker@example.edu');
    expect(changedStudentRecordFields(baseRecord, updated)).toEqual(['program']);
  });
});
