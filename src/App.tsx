import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AuditLogEntry,
  RecordVisibility,
  StudentRecord,
  StudentRecordInput,
  StudentRecordSummary,
  TimelineItem,
  UserRole,
  canViewAuditLog,
  defaultStudentRecordInput,
  displayNameForRecord,
  fieldLabels,
  rolePermissions,
  studentRecordFieldGroups,
} from './studentRecords';
import {
  createStudentRecord,
  getAuditLog,
  getStudentRecord,
  searchStudentRecords,
  updateStudentRecord,
} from './studentRecordsApi';

type ApiValidationErrors = Partial<Record<keyof StudentRecordInput, string>>;
type DuplicateState = {
  candidates: StudentRecordSummary[];
  hasHiddenMatches: boolean;
} | null;

const emptyMessage = 'No matching visible records.';
const hiddenMatchMessage = 'No visible results for the current role. Restricted matches may exist.';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100';

const lightPanelClassName =
  'rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]';

export default function App() {
  const [role, setRole] = useState<UserRole>('worker');
  const [records, setRecords] = useState<StudentRecordSummary[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<StudentRecord | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [createDraft, setCreateDraft] = useState<StudentRecordInput>(defaultStudentRecordInput());
  const [editDraft, setEditDraft] = useState<StudentRecordInput>(defaultStudentRecordInput());
  const [createVisibility, setCreateVisibility] = useState<RecordVisibility>('standard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHasHiddenMatches, setSearchHasHiddenMatches] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to create, search, and maintain student records.');
  const [errors, setErrors] = useState<ApiValidationErrors>({});
  const [duplicateState, setDuplicateState] = useState<DuplicateState>(null);

  const permissions = rolePermissions[role];

  const refreshSearch = async (query: string, currentRole: UserRole) => {
    const response = await searchStudentRecords(query, currentRole);
    setRecords(response.records);
    setSearchHasHiddenMatches(response.hasHiddenMatches);
  };

  const loadRecord = async (id: string, currentRole: UserRole) => {
    const recordResponse = await getStudentRecord(id, currentRole);
    setSelectedRecord(recordResponse.record);
    setEditDraft(recordResponse.record);
    setTimeline(recordResponse.timeline);

    if (canViewAuditLog(currentRole)) {
      const auditResponse = await getAuditLog(id, currentRole);
      setAuditLog(auditResponse.auditLog);
      return;
    }

    setAuditLog([]);
  };

  useEffect(() => {
    refreshSearch(searchQuery, role).catch(() => {
      setRecords([]);
      setSearchHasHiddenMatches(false);
    });
  }, [searchQuery, role]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedRecord(null);
      setTimeline([]);
      setAuditLog([]);
      return;
    }

    loadRecord(selectedId, role).catch(() => {
      setSelectedId(null);
      setSelectedRecord(null);
      setTimeline([]);
      setAuditLog([]);
      setStatusMessage('Selected record is not visible for the current role.');
    });
  }, [selectedId, role]);

  const onCreateChange = (field: keyof StudentRecordInput, value: string) => {
    setCreateDraft((current) => ({ ...current, [field]: value }));
  };

  const onEditChange = (field: keyof StudentRecordInput, value: string) => {
    setEditDraft((current) => ({ ...current, [field]: value }));
  };

  const resetCreate = () => {
    setCreateDraft(defaultStudentRecordInput());
    setCreateVisibility('standard');
    setErrors({});
    setDuplicateState(null);
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('');
    setErrors({});
    setDuplicateState(null);

    try {
      const response = await createStudentRecord(createDraft, createVisibility, role, false);
      await refreshSearch(createDraft.lastName || createDraft.email || '', role);
      setSelectedId(response.record.id);
      setStatusMessage(`Record created: ${displayNameForRecord(response.record)}`);
      resetCreate();
    } catch (error) {
      const apiError = error as {
        status?: number;
        errors?: ApiValidationErrors;
        candidates?: StudentRecordSummary[];
        hasHiddenMatches?: boolean;
        message?: string;
      };

      if (apiError.status === 400 && apiError.errors) {
        setErrors(apiError.errors);
        setStatusMessage('Student record validation failed.');
        return;
      }

      if (apiError.status === 409) {
        setDuplicateState({
          candidates: apiError.candidates ?? [],
          hasHiddenMatches: Boolean(apiError.hasHiddenMatches),
        });
        setStatusMessage(apiError.message ?? 'Possible duplicate records found.');
        return;
      }

      setStatusMessage(apiError.message ?? 'Student record creation failed.');
    }
  };

  const confirmDuplicateOverride = async () => {
    try {
      const response = await createStudentRecord(createDraft, createVisibility, role, true);
      await refreshSearch(createDraft.lastName || createDraft.email || '', role);
      setSelectedId(response.record.id);
      setStatusMessage('Duplicate override recorded and new record created.');
      resetCreate();
    } catch (error) {
      const apiError = error as { message?: string };
      setStatusMessage(apiError.message ?? 'Duplicate override failed.');
    }
  };

  const submitUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRecord) {
      return;
    }

    setErrors({});
    try {
      const response = await updateStudentRecord(selectedRecord.id, editDraft, role);
      setSelectedRecord(response.record);
      setTimeline(response.timeline);
      setAuditLog(response.auditLog);
      await refreshSearch(searchQuery, role);
      setStatusMessage(`Record updated: ${displayNameForRecord(response.record)}`);
    } catch (error) {
      const apiError = error as { status?: number; errors?: ApiValidationErrors; message?: string };
      if (apiError.status === 400 && apiError.errors) {
        setErrors(apiError.errors);
        setStatusMessage('Selected student record is invalid.');
        return;
      }
      setStatusMessage(apiError.message ?? 'Student record update failed.');
    }
  };

  const selectedSummary = useMemo(
    () =>
      selectedRecord
        ? `${selectedRecord.firstName || selectedRecord.preferredName} ${selectedRecord.lastName}`.trim()
        : '',
    [selectedRecord],
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.10),transparent_26rem),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative mx-auto max-w-[1560px] px-4 py-6 md:px-8 lg:px-10">
        <header className="mb-6">
          <div className={`${lightPanelClassName} grid gap-4 p-4 md:p-5 xl:grid-cols-[1.15fr_0.85fr_0.8fr] xl:items-start`}>
            <section className="rounded-[1.6rem] bg-slate-950 px-5 py-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.20)]">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.26em] text-sky-300">
                Student records
              </p>
              <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-slate-300">
                Create records, search existing students, and review timeline and audit history.
              </p>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Current policy</p>
                <p className="mt-2 font-sans text-2xl font-semibold capitalize text-slate-950">{role}</p>
                <p className="mt-2 font-sans text-sm text-slate-600">
                  Create: {permissions.canCreate ? 'enabled' : 'blocked'} | Update:{' '}
                  {permissions.canUpdate ? 'enabled' : 'blocked'}
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-slate-700">Visible search results</span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    {records.length}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-slate-700">Duplicate override</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      permissions.canOverrideDuplicate
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {permissions.canOverrideDuplicate ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
              </div>
            </section>

            <aside className="grid gap-3 rounded-[1.6rem] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5">
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">Viewer role</p>
                <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-slate-950">Permission profile</h2>
              </div>

              <label className="grid gap-2">
                <span className="font-sans text-sm font-semibold text-slate-700">Switch active role</span>
                <select
                  data-testid="role-select"
                  className={inputClassName}
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                >
                  <option value="worker">Backoffice Campus Worker</option>
                  <option value="teamLead">Backoffice Team Lead</option>
                  <option value="administrator">Campus Administrator</option>
                </select>
              </label>

              <div className="grid gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-slate-600">Restricted records</span>
                  <span className="font-sans text-sm font-semibold text-slate-900">
                    {permissions.canViewRestricted ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-slate-600">Audit trail access</span>
                  <span className="font-sans text-sm font-semibold text-slate-900">
                    {canViewAuditLog(role) ? 'Allowed' : 'Restricted'}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <div
          className="mb-6 flex items-center gap-3 rounded-[1.5rem] border border-sky-200 bg-white px-5 py-4 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
          data-testid="status-message"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.26em] text-sky-700">System status</p>
            <p className="mt-1 text-sm md:text-base">{statusMessage}</p>
          </div>
        </div>

        <main className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr_1.1fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_22rem),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_20rem)]" />
            <div className="relative">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Create</p>
                  <h2 className="mt-2 text-2xl">New student record</h2>
                  <p className="mt-2 max-w-xl text-sm text-slate-300">
                    Capture a complete operational profile with structured identity, journey, and milestone data.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Required gate</p>
                  <p className="mt-1 text-sm font-semibold text-white">Name + campus + one identifier</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={submitCreate}>
                {studentRecordFieldGroups.map((group) => (
                  <fieldset key={group.title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                    <legend className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
                      {group.title}
                    </legend>
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.fields.map((field) => (
                        <label key={field} className="grid gap-2">
                          <span className="text-sm font-medium text-slate-100">{fieldLabels[field]}</span>
                          <input
                            data-testid={`create-${field}`}
                            className={inputClassName}
                            value={createDraft[field]}
                            onChange={(event) => onCreateChange(field, event.target.value)}
                          />
                          {errors[field] ? <strong className="text-sm font-medium text-rose-300">{errors[field]}</strong> : null}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}

                <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 md:grid-cols-[1fr_auto] md:items-end">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-100">Visibility</span>
                    <select
                      data-testid="create-visibility"
                      className={inputClassName}
                      value={createVisibility}
                      onChange={(event) => setCreateVisibility(event.target.value as RecordVisibility)}
                    >
                      <option value="standard">Standard</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </label>

                  <button
                    className="rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-900/20 transition hover:translate-y-[-1px] hover:shadow-xl"
                    type="submit"
                  >
                    Create record
                  </button>
                </div>
              </form>

              {duplicateState ? (
                <div
                  className="mt-5 rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-slate-900"
                  data-testid="duplicate-panel"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Duplicate review</p>
                      <h3 className="mt-2 text-xl">Possible duplicates found</h3>
                      <p className="mt-2 max-w-xl text-sm text-slate-700">
                        Open an existing record or confirm a new record if the current role is allowed to override duplicate warnings.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">
                      {duplicateState.candidates.length} visible match{duplicateState.candidates.length === 1 ? '' : 'es'}
                    </span>
                  </div>

                  {duplicateState.hasHiddenMatches ? (
                    <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-amber-900" data-testid="duplicate-hidden-warning">
                      A possible duplicate exists in restricted data that is not visible for the current role.
                    </p>
                  ) : null}

                  <ul className="mt-4 space-y-3">
                    {duplicateState.candidates.map((candidate) => (
                      <li
                        key={candidate.id}
                        className="flex flex-col gap-3 rounded-[1.35rem] bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <strong className="text-slate-950">{candidate.displayName}</strong>
                          <p className="mt-1 text-sm text-slate-600">
                            {candidate.primaryIdentifier} | {candidate.campus} | {candidate.currentJourneyStage}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          onClick={() => setSelectedId(candidate.id)}
                        >
                          Open existing
                        </button>
                      </li>
                    ))}
                  </ul>

                  {permissions.canOverrideDuplicate ? (
                    <button
                      type="button"
                      className="mt-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:translate-y-[-1px]"
                      onClick={confirmDuplicateOverride}
                    >
                      Confirm create anyway
                    </button>
                  ) : (
                    <p className="mt-4 text-sm font-medium text-amber-900">Duplicate override is not available for the current role.</p>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <section className={`${lightPanelClassName} p-5 md:p-6`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">Search</p>
              <h2 className="mt-2 text-2xl text-slate-950">Open existing records</h2>
              <p className="mt-2 text-sm text-slate-600">
                Search by student ID, application ID, name, email address, or phone number.
              </p>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Search query</span>
              <input
                data-testid="search-input"
                className={inputClassName}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search student records"
              />
            </label>

            <div className="mt-4 rounded-[1.5rem] border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-3">
              <div className="mb-3 flex items-center justify-between px-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Result set</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  {records.length}
                </span>
              </div>

              <ul className="space-y-3" data-testid="search-results">
                {records.length === 0 ? (
                    <li className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                      {searchHasHiddenMatches ? hiddenMatchMessage : emptyMessage}
                    </li>
                ) : (
                  records.map((record) => (
                    <li
                      key={record.id}
                      className="group rounded-[1.35rem] border border-slate-200/80 bg-white px-4 py-4 transition hover:border-sky-300 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <strong className="text-slate-950">{record.displayName}</strong>
                          <p className="mt-1 text-sm text-slate-600">
                            {record.primaryIdentifier} | {record.campus} | {record.currentJourneyStage}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900 transition group-hover:bg-sky-500 group-hover:text-white"
                          onClick={() => setSelectedId(record.id)}
                        >
                          Open record
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          <section className={`${lightPanelClassName} p-5 md:p-6`}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-700">Record detail</p>
                <h2 className="mt-2 text-2xl text-slate-950">Selected student profile</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Review and update the full record, then inspect reverse-chronological activity and audit evidence.
                </p>
              </div>
              {selectedRecord ? (
                <div className="rounded-2xl bg-violet-50 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-700">Open record</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedSummary}</p>
                </div>
              ) : null}
            </div>

            {!selectedRecord ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-500">
                Select a student record to review the full profile, timeline, and audit log.
              </div>
            ) : (
              <>
                <div
                  className="rounded-[1.6rem] bg-gradient-to-r from-slate-950 via-slate-900 to-violet-900 p-5 text-white shadow-xl shadow-violet-950/20"
                  data-testid="record-summary"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="text-2xl">{selectedSummary}</h3>
                      <p className="mt-2 text-sm text-slate-300">
                        Internal key:{' '}
                        <code className="rounded-lg bg-white/10 px-2 py-1 text-slate-100">{selectedRecord.id}</code>
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Primary identifier</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {selectedRecord.studentId ||
                          selectedRecord.applicationId ||
                          selectedRecord.email ||
                          selectedRecord.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <form className="mt-5 space-y-6" onSubmit={submitUpdate}>
                  {studentRecordFieldGroups.map((group) => (
                    <fieldset key={group.title} className="rounded-[1.5rem] border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4">
                      <legend className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                        {group.title}
                      </legend>
                      <div className="grid gap-3 md:grid-cols-2">
                        {group.fields.map((field) => (
                          <label key={field} className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">{fieldLabels[field]}</span>
                            <input
                              data-testid={`edit-${field}`}
                              className={inputClassName}
                              value={editDraft[field]}
                              onChange={(event) => onEditChange(field, event.target.value)}
                            />
                            {errors[field] ? <strong className="text-sm font-medium text-rose-700">{errors[field]}</strong> : null}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}

                  <button
                    className="rounded-full bg-gradient-to-r from-violet-600 via-slate-900 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:translate-y-[-1px]"
                    type="submit"
                  >
                    Save updates
                  </button>
                </form>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Timeline</p>
                        <h3 className="mt-1 text-lg">Operational history</h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {timeline.length}
                      </span>
                    </div>
                    <ul className="space-y-3" data-testid="timeline-list">
                      {timeline.map((item) => (
                        <li key={item.id} className="rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <strong className="block capitalize text-slate-950">{item.type}</strong>
                              <span className="mt-1 block text-sm text-slate-700">{item.summary}</span>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Event
                            </span>
                          </div>
                          <time className="mt-3 block text-xs text-slate-500">
                            {new Date(item.occurredAt).toLocaleString()}
                          </time>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[1.6rem] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Audit</p>
                        <h3 className="mt-1 text-lg">Recorded actions</h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {auditLog.length}
                      </span>
                    </div>
                    {canViewAuditLog(role) ? (
                      <ul className="space-y-3" data-testid="audit-log-list">
                        {auditLog.map((item) => (
                          <li key={item.id} className="rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <strong className="block capitalize text-slate-950">{item.actionType}</strong>
                                <span className="mt-1 block text-sm text-slate-700">{item.summary}</span>
                              </div>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Audit
                              </span>
                            </div>
                            <time className="mt-3 block text-xs text-slate-500">
                              {item.actorName} ({item.actorRole}) | {new Date(item.occurredAt).toLocaleString()}
                            </time>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div
                        className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500"
                        data-testid="audit-log-blocked"
                      >
                        Audit log access is limited to team leads and administrators.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
