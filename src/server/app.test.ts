import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { StudentRecordsRepository } from './db';
import { defaultStudentRecordInput } from '../studentRecords';

describe('student records api', () => {
  let tempDir: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'student-journeys-'));
    app = createApp(new StudentRecordsRepository(join(tempDir, 'test.db')));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns duplicate candidates and hidden-match signal before save', async () => {
    const response = await app.request('/api/student-records', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-role': 'worker',
      },
      body: JSON.stringify({
        record: {
          ...defaultStudentRecordInput(),
          firstName: 'Priya',
          lastName: 'Singh',
          campus: 'City Campus',
          email: 'priya.singh@example.edu',
        },
        visibility: 'standard',
        confirmDuplicateOverride: false,
      }),
    });

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      message: 'Possible duplicate records found.',
      candidates: [],
      hasHiddenMatches: true,
    });
  });

  it('distinguishes hidden matches from no search results without leaking record details', async () => {
    const response = await app.request('/api/student-records?query=Priya', {
      headers: { 'x-user-role': 'worker' },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      records: [],
      hasHiddenMatches: true,
    });
  });

  it('blocks audit log access for workers', async () => {
    const response = await app.request('/api/student-records/student_alice_walker/audit-log', {
      headers: { 'x-user-role': 'worker' },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      message: 'Audit log access is not permitted for this role.',
    });
  });

  it('creates a record through duplicate override for a permitted role and writes audit entries', async () => {
    const response = await app.request('/api/student-records', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-role': 'teamLead',
        'x-user-name': 'Team Lead Tester',
      },
      body: JSON.stringify({
        record: {
          ...defaultStudentRecordInput(),
          firstName: 'Alice',
          lastName: 'Walker',
          campus: 'North Campus',
          email: 'alice.walker@example.edu',
        },
        visibility: 'standard',
        confirmDuplicateOverride: true,
      }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.auditLog.some((entry: { actionType: string }) => entry.actionType === 'duplicate-override')).toBe(true);
  });

  it('updates a record without overwriting unrelated fields', async () => {
    const loadResponse = await app.request('/api/student-records/student_alice_walker', {
      headers: { 'x-user-role': 'worker' },
    });
    const before = await loadResponse.json();

    const response = await app.request('/api/student-records/student_alice_walker', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'x-user-role': 'worker',
      },
      body: JSON.stringify({
        patch: {
          program: 'MBA',
        },
      }),
    });

    expect(response.status).toBe(200);
    const after = await response.json();
    expect(after.record.program).toBe('MBA');
    expect(after.record.email).toBe(before.record.email);
    expect(after.auditLog[0]).toMatchObject({
      actionType: 'update',
      recordType: 'student-record',
      recordId: 'student_alice_walker',
      summary: 'Updated fields: program.',
    });
  });

  it('rejects unsupported current journey stages through the api', async () => {
    const response = await app.request('/api/student-records/student_alice_walker', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'x-user-role': 'worker',
      },
      body: JSON.stringify({
        patch: {
          currentJourneyStage: 'At-risk student',
        },
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      errors: {
        currentJourneyStage: 'Select a supported journey stage.',
      },
    });
  });
});
