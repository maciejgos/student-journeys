import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { z } from 'zod';
import { StudentRecordsRepository } from './db';
import {
  RecordVisibility,
  StudentRecordInput,
  UserRole,
  canViewAuditLog,
  defaultStudentRecordInput,
  userDisplayNameByRole,
} from '../studentRecords';

const roleSchema = z.enum(['worker', 'teamLead', 'administrator']);

const studentRecordInputSchema = z.object({
  firstName: z.string(),
  preferredName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  residencyInfo: z.string(),
  email: z.string(),
  phone: z.string(),
  campus: z.string(),
  program: z.string(),
  studentId: z.string(),
  applicationId: z.string(),
  admissionStatus: z.string(),
  enrollmentStatus: z.string(),
  assignedOwner: z.string(),
  currentJourneyStage: z.string(),
  currentSubStatus: z.string(),
  riskFlagStatus: z.string(),
  inquiryDate: z.string(),
  applicationDate: z.string(),
  admissionDecisionDate: z.string(),
  enrollmentDate: z.string(),
  withdrawalDate: z.string(),
  graduationDate: z.string(),
  alumniHandoffDate: z.string(),
});

const createSchema = z.object({
  record: studentRecordInputSchema,
  visibility: z.enum(['standard', 'restricted']).default('standard'),
  confirmDuplicateOverride: z.boolean().default(false),
});

const patchSchema = z.object({
  patch: studentRecordInputSchema.partial(),
});

const actorFromHeaders = (request: Request): { role: UserRole; name: string } => {
  const roleResult = roleSchema.safeParse(request.headers.get('x-user-role') ?? 'worker');
  const role = roleResult.success ? roleResult.data : 'worker';
  return {
    role,
    name: request.headers.get('x-user-name') ?? userDisplayNameByRole[role],
  };
};

export const createApp = (repository = new StudentRecordsRepository()) => {
  const app = new Hono();

  app.get('/api/health', (context) => context.json({ ok: true }));

  app.get('/api/student-records', (context) => {
    const actor = actorFromHeaders(context.req.raw);
    const query = context.req.query('query') ?? '';
    const result = repository.search(query, actor.role);
    return context.json({
      records: result.records,
      hasHiddenMatches: result.hasHiddenMatches,
      defaultRecord: defaultStudentRecordInput(),
    });
  });

  app.get('/api/student-records/:id', (context) => {
    const actor = actorFromHeaders(context.req.raw);
    const result = repository.findById(context.req.param('id'), actor.role);
    if (!result) {
      return context.json({ message: 'Student record not found.' }, 404);
    }

    return context.json(result);
  });

  app.get('/api/student-records/:id/audit-log', (context) => {
    const actor = actorFromHeaders(context.req.raw);
    const result = repository.findById(context.req.param('id'), actor.role);
    if (!result) {
      return context.json({ message: 'Student record not found.' }, 404);
    }

    if (!canViewAuditLog(actor.role)) {
      return context.json({ message: 'Audit log access is not permitted for this role.' }, 403);
    }

    return context.json({ auditLog: repository.getAuditLog(context.req.param('id')) });
  });

  app.post('/api/student-records', async (context) => {
    const actor = actorFromHeaders(context.req.raw);
    const parsed = createSchema.safeParse(await context.req.json());
    if (!parsed.success) {
      return context.json({ message: 'Invalid payload.' }, 400);
    }

    try {
      const result = repository.create(
        parsed.data.record as StudentRecordInput,
        parsed.data.visibility as RecordVisibility,
        actor,
        parsed.data.confirmDuplicateOverride,
      );

      if (result.type === 'validation-error') {
        return context.json({ errors: result.errors }, 400);
      }

      if (result.type === 'duplicate-detected') {
        return context.json(
          {
            message: 'Possible duplicate records found.',
            candidates: result.duplicates.visibleCandidates,
            hasHiddenMatches: result.duplicates.hasHiddenMatches,
          },
          409,
        );
      }

      return context.json(result, 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'duplicate-override-not-authorized') {
        return context.json({ message: 'Duplicate override is not permitted for this role.' }, 403);
      }
      if (error instanceof Error && error.message === 'not-authorized') {
        return context.json({ message: 'Student record creation is not permitted for this role.' }, 403);
      }
      throw error;
    }
  });

  app.patch('/api/student-records/:id', async (context) => {
    const actor = actorFromHeaders(context.req.raw);
    const parsed = patchSchema.safeParse(await context.req.json());
    if (!parsed.success) {
      return context.json({ message: 'Invalid payload.' }, 400);
    }

    try {
      const result = repository.update(context.req.param('id'), parsed.data.patch, actor);
      if (result.type === 'validation-error') {
        return context.json({ errors: result.errors }, 400);
      }

      return context.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'not-found') {
        return context.json({ message: 'Student record not found.' }, 404);
      }
      if (error instanceof Error && error.message === 'not-authorized') {
        return context.json({ message: 'Student record update is not permitted for this role.' }, 403);
      }
      throw error;
    }
  });

  return app;
};

export const startLocalServer = (port = 8787) => {
  const app = createApp();
  return serve({
    fetch: app.fetch,
    port,
  });
};
