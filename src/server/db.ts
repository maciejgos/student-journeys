import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  AuditLogEntry,
  RecordVisibility,
  StudentRecord,
  StudentRecordInput,
  StudentRecordSummary,
  TimelineItem,
  UserRole,
  canViewRecord,
  changedStudentRecordFields,
  defaultStudentRecordInput,
  displayNameForRecord,
  matchesQuery,
  mergeStudentRecord,
  normalizePhone,
  normalizeValue,
  primaryIdentifierForRecord,
  rolePermissions,
  sortTimeline,
  summarizeRecord,
  trimRecordInput,
  trimRecordPatch,
  validateStudentRecordInput,
} from '../studentRecords';

export type ActorContext = {
  role: UserRole;
  name: string;
};

export type DuplicateCheckResult = {
  visibleCandidates: StudentRecordSummary[];
  hasHiddenMatches: boolean;
};

export type SearchResult = {
  records: StudentRecordSummary[];
  hasHiddenMatches: boolean;
};

type StudentRow = StudentRecord;
type TimelineRow = TimelineItem;

const defaultDatabasePath = resolve(process.cwd(), process.env.STUDENT_JOURNEYS_DB_PATH ?? '.data/student-journeys.db');

export class StudentRecordsRepository {
  private db: DatabaseSync;

  constructor(dbPath = defaultDatabasePath) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.initialize();
    this.seed();
  }

  private initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        preferredName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        dateOfBirth TEXT NOT NULL,
        residencyInfo TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        campus TEXT NOT NULL,
        program TEXT NOT NULL,
        studentId TEXT NOT NULL,
        applicationId TEXT NOT NULL,
        admissionStatus TEXT NOT NULL,
        enrollmentStatus TEXT NOT NULL,
        assignedOwner TEXT NOT NULL,
        currentJourneyStage TEXT NOT NULL,
        currentSubStatus TEXT NOT NULL,
        riskFlagStatus TEXT NOT NULL,
        inquiryDate TEXT NOT NULL,
        applicationDate TEXT NOT NULL,
        admissionDecisionDate TEXT NOT NULL,
        enrollmentDate TEXT NOT NULL,
        withdrawalDate TEXT NOT NULL,
        graduationDate TEXT NOT NULL,
        alumniHandoffDate TEXT NOT NULL,
        visibility TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS timeline_events (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        type TEXT NOT NULL,
        summary TEXT NOT NULL,
        occurredAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recordType TEXT NOT NULL DEFAULT 'student-record',
        recordId TEXT NOT NULL DEFAULT '',
        studentId TEXT NOT NULL,
        actionType TEXT NOT NULL,
        actorRole TEXT NOT NULL,
        actorName TEXT NOT NULL,
        occurredAt TEXT NOT NULL,
        summary TEXT NOT NULL
      );
    `);

    this.ensureAuditLogColumns();
  }

  private ensureAuditLogColumns() {
    const columns = this.db.prepare(`PRAGMA table_info(audit_log)`).all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((column) => column.name));

    if (!columnNames.has('recordType')) {
      this.db.exec(`ALTER TABLE audit_log ADD COLUMN recordType TEXT NOT NULL DEFAULT 'student-record'`);
    }

    if (!columnNames.has('recordId')) {
      this.db.exec(`ALTER TABLE audit_log ADD COLUMN recordId TEXT NOT NULL DEFAULT ''`);
      this.db.exec(`UPDATE audit_log SET recordId = studentId WHERE recordId = ''`);
    }
  }

  private seed() {
    const countRow = this.db.prepare('SELECT COUNT(*) as count FROM students').get() as {
      count: number;
    };
    const count = countRow.count;

    if (count > 0) {
      return;
    }

    const seededRecords: Array<StudentRecord & { timeline: TimelineItem[]; audit: AuditLogEntry[] }> = [
      {
        id: 'student_alice_walker',
        ...defaultStudentRecordInput(),
        firstName: 'Alice',
        lastName: 'Walker',
        dateOfBirth: '2002-03-14',
        residencyInfo: 'Domestic',
        email: 'alice.walker@example.edu',
        phone: '+1 (555) 100-2001',
        campus: 'North Campus',
        program: 'Business Administration',
        studentId: 'S-1001',
        applicationId: 'APP-2001',
        admissionStatus: 'Applicant',
        enrollmentStatus: 'Not enrolled',
        assignedOwner: 'Nadia Frost',
        currentJourneyStage: 'Applicant',
        currentSubStatus: 'Documents pending',
        riskFlagStatus: 'Clear',
        inquiryDate: '2026-03-12',
        applicationDate: '2026-03-18',
        visibility: 'standard',
        createdAt: '2026-03-12T10:00:00.000Z',
        updatedAt: '2026-04-01T10:15:00.000Z',
        timeline: sortTimeline([
          {
            id: 'alice_stage',
            studentId: 'student_alice_walker',
            type: 'status-change',
            summary: 'Journey stage updated to Applicant.',
            occurredAt: '2026-04-01T10:15:00.000Z',
          },
          {
            id: 'alice_note',
            studentId: 'student_alice_walker',
            type: 'note',
            summary: 'Initial inquiry converted to applicant record.',
            occurredAt: '2026-03-18T10:00:00.000Z',
          },
          {
            id: 'alice_interaction',
            studentId: 'student_alice_walker',
            type: 'interaction',
            summary: 'Phone call logged with admissions outcome summary.',
            occurredAt: '2026-03-19T08:30:00.000Z',
          },
          {
            id: 'alice_task',
            studentId: 'student_alice_walker',
            type: 'task',
            summary: 'Task created to collect missing transcript.',
            occurredAt: '2026-03-20T09:00:00.000Z',
          },
          {
            id: 'alice_case',
            studentId: 'student_alice_walker',
            type: 'case-update',
            summary: 'Case opened for missing document review.',
            occurredAt: '2026-03-21T11:00:00.000Z',
          },
          {
            id: 'alice_document',
            studentId: 'student_alice_walker',
            type: 'document',
            summary: 'Transcript document attached to the record.',
            occurredAt: '2026-03-22T12:15:00.000Z',
          },
        ]),
        audit: [
          {
            id: 1,
            recordType: 'student-record',
            recordId: 'student_alice_walker',
            studentId: 'student_alice_walker',
            actionType: 'create',
            actorRole: 'administrator',
            actorName: 'System Seeder',
            occurredAt: '2026-03-12T10:00:00.000Z',
            summary: 'Seeded student record for local development.',
          },
        ],
      },
      {
        id: 'student_priya_singh',
        ...defaultStudentRecordInput(),
        firstName: 'Priya',
        lastName: 'Singh',
        dateOfBirth: '2001-06-01',
        residencyInfo: 'International',
        email: 'priya.singh@example.edu',
        phone: '+1 (555) 100-2002',
        campus: 'City Campus',
        program: 'Computer Science',
        studentId: 'S-1002',
        applicationId: 'APP-2002',
        admissionStatus: 'Admitted',
        enrollmentStatus: 'Pending',
        assignedOwner: 'Ibrahim Cole',
        currentJourneyStage: 'Admitted',
        currentSubStatus: 'Financial review',
        riskFlagStatus: 'Flagged',
        inquiryDate: '2026-03-05',
        applicationDate: '2026-03-10',
        admissionDecisionDate: '2026-03-28',
        visibility: 'restricted',
        createdAt: '2026-03-05T09:00:00.000Z',
        updatedAt: '2026-04-01T11:45:00.000Z',
        timeline: sortTimeline([
          {
            id: 'priya_doc',
            studentId: 'student_priya_singh',
            type: 'document',
            summary: 'Sensitive financial evidence uploaded.',
            occurredAt: '2026-04-01T11:45:00.000Z',
          },
          {
            id: 'priya_case',
            studentId: 'student_priya_singh',
            type: 'case-update',
            summary: 'Manual review case opened.',
            occurredAt: '2026-04-01T11:00:00.000Z',
          },
        ]),
        audit: [
          {
            id: 2,
            recordType: 'student-record',
            recordId: 'student_priya_singh',
            studentId: 'student_priya_singh',
            actionType: 'create',
            actorRole: 'administrator',
            actorName: 'System Seeder',
            occurredAt: '2026-03-05T09:00:00.000Z',
            summary: 'Seeded restricted student record for local development.',
          },
        ],
      },
    ];

    for (const record of seededRecords) {
      this.insertStudent(record);
      for (const item of record.timeline) {
        this.insertTimeline(item);
      }
      for (const audit of record.audit) {
        this.insertAudit(audit);
      }
    }
  }

  private insertStudent(record: StudentRecord) {
    const {
      id,
      firstName,
      preferredName,
      lastName,
      dateOfBirth,
      residencyInfo,
      email,
      phone,
      campus,
      program,
      studentId,
      applicationId,
      admissionStatus,
      enrollmentStatus,
      assignedOwner,
      currentJourneyStage,
      currentSubStatus,
      riskFlagStatus,
      inquiryDate,
      applicationDate,
      admissionDecisionDate,
      enrollmentDate,
      withdrawalDate,
      graduationDate,
      alumniHandoffDate,
      visibility,
      createdAt,
      updatedAt,
    } = record;

    this.db
      .prepare(`
        INSERT INTO students (
          id, firstName, preferredName, lastName, dateOfBirth, residencyInfo, email, phone, campus, program,
          studentId, applicationId, admissionStatus, enrollmentStatus, assignedOwner, currentJourneyStage,
          currentSubStatus, riskFlagStatus, inquiryDate, applicationDate, admissionDecisionDate, enrollmentDate,
          withdrawalDate, graduationDate, alumniHandoffDate, visibility, createdAt, updatedAt
        ) VALUES (
          @id, @firstName, @preferredName, @lastName, @dateOfBirth, @residencyInfo, @email, @phone, @campus, @program,
          @studentId, @applicationId, @admissionStatus, @enrollmentStatus, @assignedOwner, @currentJourneyStage,
          @currentSubStatus, @riskFlagStatus, @inquiryDate, @applicationDate, @admissionDecisionDate, @enrollmentDate,
          @withdrawalDate, @graduationDate, @alumniHandoffDate, @visibility, @createdAt, @updatedAt
        )
      `)
      .run({
        id,
        firstName,
        preferredName,
        lastName,
        dateOfBirth,
        residencyInfo,
        email,
        phone,
        campus,
        program,
        studentId,
        applicationId,
        admissionStatus,
        enrollmentStatus,
        assignedOwner,
        currentJourneyStage,
        currentSubStatus,
        riskFlagStatus,
        inquiryDate,
        applicationDate,
        admissionDecisionDate,
        enrollmentDate,
        withdrawalDate,
        graduationDate,
        alumniHandoffDate,
        visibility,
        createdAt,
        updatedAt,
      });
  }

  private insertTimeline(item: TimelineItem) {
    this.db
      .prepare(
        `INSERT INTO timeline_events (id, studentId, type, summary, occurredAt) VALUES (@id, @studentId, @type, @summary, @occurredAt)`,
      )
      .run(item);
  }

  private insertAudit(item: Omit<AuditLogEntry, 'id'> | AuditLogEntry) {
    const { recordType, recordId, studentId, actionType, actorRole, actorName, occurredAt, summary } = item;
    this.db
      .prepare(
        `INSERT INTO audit_log (recordType, recordId, studentId, actionType, actorRole, actorName, occurredAt, summary) VALUES (@recordType, @recordId, @studentId, @actionType, @actorRole, @actorName, @occurredAt, @summary)`,
      )
      .run({
        recordType,
        recordId,
        studentId,
        actionType,
        actorRole,
        actorName,
        occurredAt,
        summary,
      });
  }

  private getAllStudents(): StudentRecord[] {
    return this.db.prepare(`SELECT * FROM students`).all() as StudentRow[];
  }

  private getStudentById(id: string): StudentRecord | null {
    const record = this.db.prepare(`SELECT * FROM students WHERE id = ?`).get(id) as StudentRow | undefined;
    return record ?? null;
  }

  private getTimelineByStudentId(studentId: string): TimelineItem[] {
    const rows = this.db
      .prepare(`SELECT * FROM timeline_events WHERE studentId = ? ORDER BY occurredAt DESC`)
      .all(studentId) as TimelineRow[];
    return sortTimeline(rows);
  }

  getAuditLog(studentId: string): AuditLogEntry[] {
    return this.db
      .prepare(`SELECT * FROM audit_log WHERE studentId = ? ORDER BY occurredAt DESC, id DESC`)
      .all(studentId) as AuditLogEntry[];
  }

  search(query: string, role: UserRole): SearchResult {
    const matches = this.getAllStudents().filter((record) => matchesQuery(query, record));

    return {
      records: matches
        .filter((record) => canViewRecord(role, record))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .map(summarizeRecord),
      hasHiddenMatches: matches.some((record) => !canViewRecord(role, record)),
    };
  }

  findById(id: string, role: UserRole): { record: StudentRecord; timeline: TimelineItem[] } | null {
    const record = this.getStudentById(id);
    if (!record || !canViewRecord(role, record)) {
      return null;
    }

    return {
      record,
      timeline: this.getTimelineByStudentId(id),
    };
  }

  findDuplicateCandidates(input: StudentRecordInput, role: UserRole): DuplicateCheckResult {
    const studentId = normalizeValue(input.studentId);
    const applicationId = normalizeValue(input.applicationId);
    const email = normalizeValue(input.email);
    const phone = normalizePhone(input.phone);

    const matches = this.getAllStudents().filter((record) => {
      const studentIdMatch = studentId && normalizeValue(record.studentId) === studentId;
      const applicationIdMatch =
        applicationId && normalizeValue(record.applicationId) === applicationId;
      const emailMatch = email && normalizeValue(record.email) === email;
      const phoneMatch = phone && normalizePhone(record.phone) === phone;
      return Boolean(studentIdMatch || applicationIdMatch || emailMatch || phoneMatch);
    });

    return {
      visibleCandidates: matches.filter((record) => canViewRecord(role, record)).map(summarizeRecord),
      hasHiddenMatches: matches.some((record) => !canViewRecord(role, record)),
    };
  }

  create(
    input: StudentRecordInput,
    visibility: RecordVisibility,
    actor: ActorContext,
    confirmDuplicateOverride: boolean,
  ) {
    if (!rolePermissions[actor.role].canCreate) {
      throw new Error('not-authorized');
    }

    const normalizedInput = trimRecordInput(input);
    const errors = validateStudentRecordInput(normalizedInput);
    if (Object.keys(errors).length > 0) {
      return { type: 'validation-error' as const, errors };
    }

    const duplicates = this.findDuplicateCandidates(normalizedInput, actor.role);
    if ((duplicates.visibleCandidates.length > 0 || duplicates.hasHiddenMatches) && !confirmDuplicateOverride) {
      return { type: 'duplicate-detected' as const, duplicates };
    }

    if ((duplicates.visibleCandidates.length > 0 || duplicates.hasHiddenMatches) && confirmDuplicateOverride) {
      if (!rolePermissions[actor.role].canOverrideDuplicate) {
        throw new Error('duplicate-override-not-authorized');
      }
    }

    const now = new Date().toISOString();
    const record: StudentRecord = {
      ...defaultStudentRecordInput(),
      ...normalizedInput,
      id: `student_${crypto.randomUUID()}`,
      visibility,
      createdAt: now,
      updatedAt: now,
    };

    this.insertStudent(record);

    this.insertTimeline({
      id: `timeline_${crypto.randomUUID()}`,
      studentId: record.id,
      type: 'status-change',
      summary: `Journey stage initialized as ${record.currentJourneyStage}.`,
      occurredAt: now,
    });
    this.insertTimeline({
      id: `timeline_${crypto.randomUUID()}`,
      studentId: record.id,
      type: 'note',
      summary: `Student record created for ${displayNameForRecord(record)}.`,
      occurredAt: now,
    });

    this.insertAudit({
      recordType: 'student-record',
      recordId: record.id,
      studentId: record.id,
      actionType: 'create',
      actorRole: actor.role,
      actorName: actor.name,
      occurredAt: now,
      summary: `Student record created with primary identifier ${primaryIdentifierForRecord(record)}.`,
    });

    if ((duplicates.visibleCandidates.length > 0 || duplicates.hasHiddenMatches) && confirmDuplicateOverride) {
      this.insertAudit({
        recordType: 'student-record',
        recordId: record.id,
        studentId: record.id,
        actionType: 'duplicate-override',
        actorRole: actor.role,
        actorName: actor.name,
        occurredAt: now,
        summary: 'Duplicate warning overridden during record creation.',
      });
    }

    return {
      type: 'created' as const,
      record,
      timeline: this.getTimelineByStudentId(record.id),
      auditLog: this.getAuditLog(record.id),
    };
  }

  update(id: string, patch: Partial<StudentRecordInput>, actor: ActorContext) {
    const current = this.getStudentById(id);
    if (!current || !canViewRecord(actor.role, current)) {
      throw new Error('not-found');
    }

    if (!rolePermissions[actor.role].canUpdate) {
      throw new Error('not-authorized');
    }

    const now = new Date().toISOString();
    const normalizedPatch = trimRecordPatch(patch);
    const updated = mergeStudentRecord(current, normalizedPatch, now);
    const errors = validateStudentRecordInput(updated);
    if (Object.keys(errors).length > 0) {
      return { type: 'validation-error' as const, errors };
    }

    const changedFields = changedStudentRecordFields(current, updated);

    const {
      id: updatedId,
      firstName,
      preferredName,
      lastName,
      dateOfBirth,
      residencyInfo,
      email,
      phone,
      campus,
      program,
      studentId,
      applicationId,
      admissionStatus,
      enrollmentStatus,
      assignedOwner,
      currentJourneyStage,
      currentSubStatus,
      riskFlagStatus,
      inquiryDate,
      applicationDate,
      admissionDecisionDate,
      enrollmentDate,
      withdrawalDate,
      graduationDate,
      alumniHandoffDate,
      updatedAt,
    } = updated;

    this.db
      .prepare(`
        UPDATE students SET
          firstName=@firstName,
          preferredName=@preferredName,
          lastName=@lastName,
          dateOfBirth=@dateOfBirth,
          residencyInfo=@residencyInfo,
          email=@email,
          phone=@phone,
          campus=@campus,
          program=@program,
          studentId=@studentId,
          applicationId=@applicationId,
          admissionStatus=@admissionStatus,
          enrollmentStatus=@enrollmentStatus,
          assignedOwner=@assignedOwner,
          currentJourneyStage=@currentJourneyStage,
          currentSubStatus=@currentSubStatus,
          riskFlagStatus=@riskFlagStatus,
          inquiryDate=@inquiryDate,
          applicationDate=@applicationDate,
          admissionDecisionDate=@admissionDecisionDate,
          enrollmentDate=@enrollmentDate,
          withdrawalDate=@withdrawalDate,
          graduationDate=@graduationDate,
          alumniHandoffDate=@alumniHandoffDate,
          updatedAt=@updatedAt
        WHERE id=@id
      `)
      .run({
        id: updatedId,
        firstName,
        preferredName,
        lastName,
        dateOfBirth,
        residencyInfo,
        email,
        phone,
        campus,
        program,
        studentId,
        applicationId,
        admissionStatus,
        enrollmentStatus,
        assignedOwner,
        currentJourneyStage,
        currentSubStatus,
        riskFlagStatus,
        inquiryDate,
        applicationDate,
        admissionDecisionDate,
        enrollmentDate,
        withdrawalDate,
        graduationDate,
        alumniHandoffDate,
        updatedAt,
      });

    const stageChanged =
      normalizedPatch.currentJourneyStage &&
      normalizedPatch.currentJourneyStage !== current.currentJourneyStage;
    this.insertTimeline({
      id: `timeline_${crypto.randomUUID()}`,
      studentId: id,
      type: stageChanged ? 'status-change' : 'note',
      summary: stageChanged
        ? `Journey stage changed from ${current.currentJourneyStage} to ${updated.currentJourneyStage}.`
        : 'Student profile fields updated.',
      occurredAt: now,
    });
    if (changedFields.length > 0) {
      this.insertAudit({
        recordType: 'student-record',
        recordId: id,
        studentId: id,
        actionType: 'update',
        actorRole: actor.role,
        actorName: actor.name,
        occurredAt: now,
        summary: `Updated fields: ${changedFields.join(', ')}.`,
      });
    }

    return {
      type: 'updated' as const,
      record: this.getStudentById(id)!,
      timeline: this.getTimelineByStudentId(id),
      auditLog: this.getAuditLog(id),
    };
  }
}
