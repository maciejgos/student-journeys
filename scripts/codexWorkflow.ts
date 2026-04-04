import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type WorkflowCommand = 'start-feature' | 'checkpoint' | 'finish-feature' | 'pr-summary' | 'validate-pr-metadata';
type ValidationSuite = 'unit' | 'build' | 'e2e';

type ChangedFileGroup = {
  label: string;
  files: string[];
};

type ParsedArgs = {
  command: WorkflowCommand;
  options: Record<string, string | boolean>;
};

type StartFeatureOptions = {
  rootDir: string;
  title: string;
  slug: string;
  owner: string;
  issueNumber?: number;
  branchName?: string;
  includeAdr: boolean;
  includeExecPlan: boolean;
};

type GeneratedArtifacts = {
  featurePath: string;
  adrPath?: string;
  execPlanPath?: string;
  issueNumber?: number;
  branchName?: string;
};

const DEFAULT_OWNER = 'Codex';
const DEFAULT_CHECKPOINT_SUITES: ValidationSuite[] = ['unit'];
const DEFAULT_FINISH_SUITES: ValidationSuite[] = ['unit', 'build', 'e2e'];
const DEFAULT_BASE_REF = 'main';
const DEFAULT_PR_OUTPUT = '.codex/tmp/pr-summary.md';

const VALIDATION_COMMANDS: Record<ValidationSuite, string[]> = {
  unit: ['npm', 'run', 'test:unit'],
  build: ['npm', 'run', 'build'],
  e2e: ['npm', 'run', 'test:e2e'],
};

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function toTitleFromSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatSequenceNumber(value: number): string {
  return String(value).padStart(2, '0');
}

export function parseIssueNumber(value: string | boolean | undefined): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid issue number: ${value}`);
  }

  return parsed;
}

export function branchNameForFeature(slug: string, issueNumber?: number, branchPrefix = 'codex'): string {
  const sanitizedPrefix = branchPrefix.trim().replace(/^\/+|\/+$/g, '');
  const branchLeaf = issueNumber ? `issue-${issueNumber}-${slug}` : slug;
  return sanitizedPrefix ? `${sanitizedPrefix}/${branchLeaf}` : branchLeaf;
}

export function extractIssueNumberFromBranchName(branchName: string): number | undefined {
  const match = branchName.match(/(?:^|\/)issue-(\d+)-/);
  return match ? Number(match[1]) : undefined;
}

export function nextSequenceNumber(dirPath: string, pattern: RegExp): number {
  if (!existsSync(dirPath)) {
    return 1;
  }

  let maxValue = 0;
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const match = entry.name.match(pattern);
    if (!match) {
      continue;
    }

    maxValue = Math.max(maxValue, Number(match[1]));
  }

  return maxValue + 1;
}

export function renderFeatureSpec(params: {
  title: string;
  featureNumber: number;
  slug: string;
  owner: string;
  issueNumber?: number;
  branchName?: string;
  adrPath?: string;
  execPlanPath?: string;
}): string {
  const relatedAdr = params.adrPath ? `- Related ADR: \`${params.adrPath}\`` : '- Related ADR: not required yet';
  const relatedExecPlan = params.execPlanPath
    ? `- Related ExecPlan: \`${params.execPlanPath}\``
    : '- Related ExecPlan: create one if implementation becomes significant';
  const relatedIssue = params.issueNumber ? `- GitHub Issue: #${params.issueNumber}` : '- GitHub Issue: create or link one before opening the PR';
  const relatedBranch = params.branchName ? `- Suggested branch: \`${params.branchName}\`` : '- Suggested branch: generate one from the feature title';
  const recommendedFlow = [
    '- Recommended Codex skill flow:',
    '  - `delivery-orchestrator`',
    '  - `intake-orchestrator`',
    '  - `business-reviewer` when the scope or acceptance criteria need refinement',
    '  - `ux-concept-designer` for user-facing work',
    '  - `architecture-reviewer` when long-lived technical choices are involved',
    '  - `execplan-runner`',
    '  - `implementation-orchestrator`',
    '  - `ux-reviewer` for user-facing work',
    '  - `verification-operator`',
    '  - `pr-preparer`',
  ].join('\n');

  return `# ${formatSequenceNumber(params.featureNumber)} ${params.title}

## Description

Describe the user or business problem this feature solves, why it matters now, and how the change should improve the student journey workflow or delivery process.

## Problem statement

- Current pain point:
- Desired outcome:
- Non-goals:

## User stories

- As a
- I want
- So that

## Acceptance criteria

- The feature has a clear user-visible outcome.
- The implementation references the required documentation and validation artifacts.
- Relevant automated tests are executed after each implementation checkpoint.

## Delivery notes

- Feature slug: \`${params.slug}\`
- Owner: ${params.owner}
${relatedIssue}
${relatedBranch}
${relatedAdr}
${relatedExecPlan}
${recommendedFlow}
`;
}

export function renderAdr(params: { title: string; featureTitle: string; featurePath: string }): string {
  return `# ${params.title}

## Status

Proposed

## Context

The repository is implementing ${params.featureTitle}. The team needs to decide whether this work introduces or changes an architectural, integration, security, persistence, or operational practice that should be preserved for future contributors.

Related feature specification: \`${params.featurePath}\`

## Decision

Document the chosen approach, the scope of the decision, and the boundaries that future work should preserve.

## Consequences

### Positive

- Clarifies the decision for future contributors.

### Negative

- Adds documentation work that must be maintained as the implementation evolves.

### Follow-up implications

- Note any follow-up tasks, migrations, guardrails, or validation steps required by this decision.
`;
}

export function renderExecPlan(params: { title: string; featurePath: string; adrPath?: string }): string {
  const adrReference = params.adrPath
    ? `The related architecture decision record is \`${params.adrPath}\`. Update it whenever the plan changes the long-lived technical approach.\n`
    : '';
  const stageReferences = [
    'Use the repository AI-native delivery flow as the default orchestration model:',
    '',
    '- `delivery-orchestrator` for stage selection and artifact order',
    '- `intake-orchestrator` for initial scaffolding and issue linkage',
    '- `business-reviewer` and `architecture-reviewer` for specialist review gates when needed',
    '- `ux-concept-designer` before implementing user-facing changes',
    '- `implementation-orchestrator` for code and documentation execution',
    '- `ux-reviewer` before handoff for user-facing changes',
    '- `verification-operator` for checkpoint and finish validation',
    '- `pr-preparer` for review handoff',
  ].join('\n');

  return `# ${params.title}

This ExecPlan is a living document. The sections \`Progress\`, \`Surprises & Discoveries\`, \`Decision Log\`, and \`Outcomes & Retrospective\` must be kept up to date as work proceeds.

This document must be maintained in accordance with \`.codex/PLANS.md\`.
${adrReference}
${stageReferences}

## Purpose / Big Picture

Explain what someone can do after this change that they could not do before, and how to observe it working in this repository.

## Progress

- [ ] Replace this placeholder with timestamped steps as implementation begins.

## Surprises & Discoveries

- Observation: none yet.
  Evidence: planning has not started.

## Decision Log

- Decision: ExecPlan created automatically during feature intake.
  Rationale: keeps implementation planning attached to the feature from the start.
  Date/Author: 2026-04-04 / Codex automation

## Outcomes & Retrospective

Describe what shipped, what changed from the original intent, and what a future contributor should know before continuing.

## Context and Orientation

Start from the feature specification at \`${params.featurePath}\`. Summarize the relevant files, current behavior, and constraints for a first-time contributor.

## Plan of Work

Describe the implementation sequence in plain language, including the files that will change and the behavior that each edit should add or modify.

## Concrete Steps

List the exact commands to run from the repository root and the expected evidence of success.

## Validation and Acceptance

Describe the automated tests and manual checks that prove the feature works. Include which tests should fail before the change and pass after.

## Idempotence and Recovery

Explain how to re-run the workflow safely and how to clean up generated artifacts or partial state if implementation is interrupted.

## Artifacts and Notes

Capture the most important snippets, outputs, or examples needed to verify the work.

## Interfaces and Dependencies

Name the modules, commands, APIs, or documents that must exist or be updated by the end of the work.

Change note: created by Codex lifecycle automation to ensure feature work starts with a living execution plan.
`;
}

export function parseSuites(input: string | boolean | undefined, defaults: ValidationSuite[]): ValidationSuite[] {
  if (typeof input !== 'string' || input.trim() === '') {
    return defaults;
  }

  const suites = input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value as ValidationSuite);

  const invalidSuites = suites.filter((suite) => !(suite in VALIDATION_COMMANDS));
  if (invalidSuites.length > 0) {
    throw new Error(`Unsupported validation suite(s): ${invalidSuites.join(', ')}`);
  }

  return Array.from(new Set(suites));
}

export function cleanupGeneratedArtifacts(rootDir: string): string[] {
  const artifactPaths = [
    'dist',
    'playwright-report',
    'test-results',
    'tsconfig.app.tsbuildinfo',
    'tsconfig.node.tsbuildinfo',
  ].map((artifactPath) => join(rootDir, artifactPath));

  const removed: string[] = [];
  for (const artifactPath of artifactPaths) {
    if (!existsSync(artifactPath)) {
      continue;
    }

    rmSync(artifactPath, { recursive: true, force: true });
    removed.push(basename(artifactPath));
  }

  return removed;
}

function runCommand(
  rootDir: string,
  command: string[],
  options?: {
    allowFailure?: boolean;
    stdio?: 'inherit' | 'pipe';
  },
): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: options?.stdio ?? 'pipe',
    shell: process.platform === 'win32',
  });

  const status = result.status ?? 1;
  const stdout = typeof result.stdout === 'string' ? result.stdout : '';
  const stderr = typeof result.stderr === 'string' ? result.stderr : '';

  if (!options?.allowFailure && status !== 0) {
    throw new Error(stderr.trim() || stdout.trim() || `${command.join(' ')} failed with exit code ${status}`);
  }

  return { status, stdout, stderr };
}

function ensureBranchExists(rootDir: string, branchName: string): void {
  if (currentBranchName(rootDir) === branchName) {
    return;
  }

  const branchExists = runCommand(rootDir, ['git', 'rev-parse', '--verify', branchName], {
    allowFailure: true,
  }).status === 0;

  runCommand(rootDir, ['git', 'checkout', ...(branchExists ? [branchName] : ['-b', branchName])], {
    stdio: 'inherit',
  });
}

function gitOutput(rootDir: string, command: string[], fallback = ''): string {
  const result = runCommand(rootDir, command, { allowFailure: true });
  if (result.status !== 0) {
    return fallback;
  }

  return result.stdout.trim();
}

export function currentBranchName(rootDir: string): string {
  return gitOutput(rootDir, ['git', 'rev-parse', '--abbrev-ref', 'HEAD'], 'unknown');
}

function normalizeChangedFiles(fileLists: string[]): string[] {
  return Array.from(
    new Set(
      fileLists
        .flatMap((value) => value.split('\n'))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

export function collectChangedFiles(rootDir: string, baseRef = DEFAULT_BASE_REF): string[] {
  const comparisonDiff = gitOutput(rootDir, ['git', 'diff', '--name-only', `${baseRef}...HEAD`], '');
  const workingTreeDiff = gitOutput(rootDir, ['git', 'diff', '--name-only', 'HEAD'], '');
  const untrackedFiles = gitOutput(rootDir, ['git', 'ls-files', '--others', '--exclude-standard'], '');

  return normalizeChangedFiles([comparisonDiff, workingTreeDiff, untrackedFiles]);
}

export function groupChangedFiles(files: string[]): ChangedFileGroup[] {
  const groups: ChangedFileGroup[] = [
    { label: 'Workflow automation', files: files.filter((file) => file.startsWith('scripts/')) },
    { label: 'GitHub configuration', files: files.filter((file) => file.startsWith('.github/')) },
    { label: 'Documentation', files: files.filter((file) => file.startsWith('docs/')) },
    { label: 'Application code', files: files.filter((file) => file.startsWith('src/')) },
    { label: 'Tooling', files: files.filter((file) => !file.startsWith('scripts/') && !file.startsWith('.github/') && !file.startsWith('docs/') && !file.startsWith('src/')) },
  ];

  return groups.filter((group) => group.files.length > 0);
}

export function renderPrSummary(params: {
  title: string;
  branchName: string;
  baseRef: string;
  issueNumber?: number;
  changedFiles: string[];
  validationSuites: ValidationSuite[];
}): string {
  const groups = groupChangedFiles(params.changedFiles);
  const issueLine = params.issueNumber ? `Closes #${params.issueNumber}` : 'Add the linked GitHub issue before opening the PR.';
  const changeLines =
    groups.length > 0
      ? groups.map((group) => `- ${group.label}: ${group.files.join(', ')}`)
      : ['- Document the change set before opening the PR.'];
  const validationLines = params.validationSuites.map((suite) => `- [x] ${VALIDATION_COMMANDS[suite].join(' ')}`);

  return `## Summary

${params.title}

## Linked issue

${issueLine}

## Branch

\`${params.branchName}\` targeting \`${params.baseRef}\`

## What changed

${changeLines.join('\n')}

## Validation

${validationLines.join('\n')}

## Screenshots

- N/A
`;
}

function writeOutputFile(rootDir: string, relativePath: string, contents: string): void {
  const outputPath = join(rootDir, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, contents, 'utf8');
}

export function validatePullRequestMetadata(params: {
  branchName: string;
  prBody: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredSections = ['## Summary', '## Linked issue', '## What changed', '## Validation'];

  for (const section of requiredSections) {
    if (!params.prBody.includes(section)) {
      errors.push(`Missing PR section: ${section}`);
    }
  }

  const branchIssue = extractIssueNumberFromBranchName(params.branchName);
  const linkedIssueMatch = params.prBody.match(/(?:Closes|Refs)\s+#(\d+)/i);

  if (branchIssue !== undefined && linkedIssueMatch && Number(linkedIssueMatch[1]) !== branchIssue) {
    errors.push(`Branch issue #${branchIssue} does not match PR body issue #${linkedIssueMatch[1]}.`);
  }

  if (branchIssue === undefined && !linkedIssueMatch) {
    errors.push('PR metadata must include a linked issue in the branch name or PR body.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function startFeature(options: StartFeatureOptions): GeneratedArtifacts {
  const featureDir = join(options.rootDir, 'docs/features');
  const adrDir = join(options.rootDir, 'docs/adr');
  const execPlanDir = join(options.rootDir, 'docs/execplans');

  mkdirSync(featureDir, { recursive: true });
  mkdirSync(adrDir, { recursive: true });
  mkdirSync(execPlanDir, { recursive: true });

  const featureNumber = nextSequenceNumber(featureDir, /^(\d+)-.*\.md$/);
  const featureFileName = `${formatSequenceNumber(featureNumber)}-${options.slug}.md`;
  const featurePath = join(featureDir, featureFileName);

  let adrPath: string | undefined;
  if (options.includeAdr) {
    const adrNumber = nextSequenceNumber(adrDir, /^(\d+)-.*\.md$/);
    const adrFileName = `${String(adrNumber).padStart(4, '0')}-${options.slug}.md`;
    adrPath = join(adrDir, adrFileName);
  }

  let execPlanPath: string | undefined;
  if (options.includeExecPlan) {
    execPlanPath = join(execPlanDir, `${options.slug}.md`);
  }

  const featurePathRelative = relativeToRoot(options.rootDir, featurePath);
  const adrPathRelative = adrPath ? relativeToRoot(options.rootDir, adrPath) : undefined;
  const execPlanPathRelative = execPlanPath ? relativeToRoot(options.rootDir, execPlanPath) : undefined;

  writeIfMissing(
    featurePath,
    renderFeatureSpec({
      title: options.title,
      featureNumber,
      slug: options.slug,
      owner: options.owner,
      issueNumber: options.issueNumber,
      branchName: options.branchName,
      adrPath: adrPathRelative,
      execPlanPath: execPlanPathRelative,
    }),
  );

  if (adrPath) {
    writeIfMissing(
      adrPath,
      renderAdr({
        title: `${options.title} workflow decision`,
        featureTitle: options.title,
        featurePath: featurePathRelative,
      }),
    );
  }

  if (execPlanPath) {
    writeIfMissing(
      execPlanPath,
      renderExecPlan({
        title: `${options.title} implementation plan`,
        featurePath: featurePathRelative,
        adrPath: adrPathRelative,
      }),
    );
  }

  updateFeaturesReadme(featureDir);

  return {
    featurePath: featurePathRelative,
    adrPath: adrPathRelative,
    execPlanPath: execPlanPathRelative,
    issueNumber: options.issueNumber,
    branchName: options.branchName,
  };
}

function updateFeaturesReadme(featureDir: string): void {
  const readmePath = join(featureDir, 'README.md');
  const featureFiles = readdirSync(featureDir)
    .filter((entry) => /^\d+-.*\.md$/.test(entry))
    .sort((left, right) => left.localeCompare(right));

  const lines = [
    'Feature specifications in this directory expand the requirements into implementation-ready scopes.',
    '',
    'Use [TEMPLATE.md](./TEMPLATE.md) for new entries or run `npm run codex:feature:start -- --title "Feature title"` to generate the feature, ADR, and ExecPlan scaffolding automatically.',
    '',
    'Current feature documents:',
    '',
    ...featureFiles.map((featureFile) => `- \`${featureFile}\``),
    '',
  ];

  writeFileSync(readmePath, lines.join('\n'), 'utf8');
}

function writeIfMissing(filePath: string, contents: string): void {
  if (existsSync(filePath)) {
    throw new Error(`Refusing to overwrite existing file: ${relativeToRoot(process.cwd(), filePath)}`);
  }

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, 'utf8');
}

function relativeToRoot(rootDir: string, filePath: string): string {
  return filePath.startsWith(rootDir) ? filePath.slice(rootDir.length + 1) : filePath;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [rawCommand, ...rest] = argv;
  if (
    rawCommand !== 'start-feature' &&
    rawCommand !== 'checkpoint' &&
    rawCommand !== 'finish-feature' &&
    rawCommand !== 'pr-summary' &&
    rawCommand !== 'validate-pr-metadata'
  ) {
    throw new Error(`Unknown command: ${rawCommand ?? 'undefined'}`);
  }

  const options: Record<string, string | boolean> = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [rawKey, inlineValue] = token.slice(2).split('=');
    const key = rawKey.trim();

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const next = rest[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return {
    command: rawCommand,
    options,
  };
}

function runValidationSuites(rootDir: string, suites: ValidationSuite[]): void {
  for (const suite of suites) {
    const command = VALIDATION_COMMANDS[suite];
    console.log(`\n[workflow] Running ${suite} validation: ${command.join(' ')}`);
    const result = spawnSync(command[0], command.slice(1), {
      cwd: rootDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    if (result.status !== 0) {
      throw new Error(`${suite} validation failed with exit code ${result.status ?? 'unknown'}`);
    }
  }
}

function printStartSummary(artifacts: GeneratedArtifacts): void {
  console.log('[workflow] Feature scaffolding created:');
  console.log(`- Feature spec: ${artifacts.featurePath}`);
  if (artifacts.issueNumber) {
    console.log(`- GitHub issue: #${artifacts.issueNumber}`);
  }
  if (artifacts.branchName) {
    console.log(`- Suggested branch: ${artifacts.branchName}`);
  }
  if (artifacts.adrPath) {
    console.log(`- ADR: ${artifacts.adrPath}`);
  }
  if (artifacts.execPlanPath) {
    console.log(`- ExecPlan: ${artifacts.execPlanPath}`);
  }
  console.log('[workflow] Next step: fill in the generated documents before or alongside implementation.');
}

function runLifecycleCommand(command: WorkflowCommand, options: Record<string, string | boolean>): void {
  const rootDir = resolve(String(options['root-dir'] ?? process.cwd()));

  if (command === 'start-feature') {
    const requestedTitle = typeof options.title === 'string' ? options.title.trim() : '';
    const requestedSlug = typeof options.slug === 'string' ? slugify(options.slug) : '';
    const slug = requestedSlug || slugify(requestedTitle);
    const title = requestedTitle || toTitleFromSlug(slug);
    const issueNumber = parseIssueNumber(options.issue);
    const branchPrefix = typeof options['branch-prefix'] === 'string' ? options['branch-prefix'] : 'codex';
    const branchName = branchNameForFeature(slug, issueNumber, branchPrefix);

    if (!title || !slug) {
      throw new Error('start-feature requires --title or --slug');
    }

    if (options['create-branch'] === true) {
      ensureBranchExists(rootDir, branchName);
    }

    const artifacts = startFeature({
      rootDir,
      title,
      slug,
      owner: typeof options.owner === 'string' ? options.owner : DEFAULT_OWNER,
      issueNumber,
      branchName,
      includeAdr: options['skip-adr'] !== true,
      includeExecPlan: options['skip-execplan'] !== true,
    });
    printStartSummary(artifacts);
    return;
  }

  if (command === 'pr-summary') {
    const baseRef = typeof options.base === 'string' ? options.base : DEFAULT_BASE_REF;
    const branchName = currentBranchName(rootDir);
    const issueNumber = parseIssueNumber(options.issue) ?? extractIssueNumberFromBranchName(branchName);
    const changedFiles = collectChangedFiles(rootDir, baseRef);
    const summaryTitle =
      typeof options.title === 'string'
        ? options.title
        : `Automated PR summary for ${branchName}`;
    const outputPath = typeof options.output === 'string' ? options.output : DEFAULT_PR_OUTPUT;
    const validationSuites = parseSuites(options.suites, DEFAULT_FINISH_SUITES);
    const summary = renderPrSummary({
      title: summaryTitle,
      branchName,
      baseRef,
      issueNumber,
      changedFiles,
      validationSuites,
    });

    writeOutputFile(rootDir, outputPath, summary);
    console.log(`[workflow] PR summary written to ${outputPath}`);
    return;
  }

  if (command === 'validate-pr-metadata') {
    const branchName = typeof options['branch-name'] === 'string' ? options['branch-name'] : currentBranchName(rootDir);
    const prBodyFile = typeof options['pr-body-file'] === 'string' ? join(rootDir, options['pr-body-file']) : undefined;
    const prBody =
      typeof options['pr-body'] === 'string'
        ? options['pr-body']
        : prBodyFile
          ? readTextFile(prBodyFile)
          : '';

    const result = validatePullRequestMetadata({
      branchName,
      prBody,
    });

    if (!result.valid) {
      throw new Error(result.errors.join('\n'));
    }

    console.log('[workflow] Pull request metadata is valid.');
    return;
  }

  const suites = parseSuites(
    options.suites,
    command === 'finish-feature' ? DEFAULT_FINISH_SUITES : DEFAULT_CHECKPOINT_SUITES,
  );

  runValidationSuites(rootDir, suites);

  if (options.cleanup !== 'false') {
    const removed = cleanupGeneratedArtifacts(rootDir);
    console.log(
      removed.length > 0
        ? `[workflow] Cleanup complete. Removed artifacts: ${removed.join(', ')}`
        : '[workflow] Cleanup complete. No transient artifacts were present.',
    );
  }

  if (command === 'finish-feature') {
    const baseRef = typeof options.base === 'string' ? options.base : DEFAULT_BASE_REF;
    const branchName = currentBranchName(rootDir);
    const issueNumber = parseIssueNumber(options.issue) ?? extractIssueNumberFromBranchName(branchName);
    const outputPath = typeof options.output === 'string' ? options.output : DEFAULT_PR_OUTPUT;
    const summary = renderPrSummary({
      title: typeof options.title === 'string' ? options.title : `Automated PR summary for ${branchName}`,
      branchName,
      baseRef,
      issueNumber,
      changedFiles: collectChangedFiles(rootDir, baseRef),
      validationSuites: suites,
    });
    writeOutputFile(rootDir, outputPath, summary);
    console.log(`[workflow] PR summary written to ${outputPath}`);
    console.log('[workflow] Finish-feature validation completed. Review git status and open a PR when ready.');
  }
}

function printUsage(): void {
  console.log(`Codex workflow automation

Usage:
  npm run codex:feature:start -- --title "Feature title" [--issue 123] [--create-branch]
  npm run codex:checkpoint -- [--suites unit,build]
  npm run codex:finish -- [--suites unit,build,e2e]
  npm run codex:pr:summary -- [--base main] [--output .codex/tmp/pr-summary.md]
  npm run codex:pr:validate -- --branch-name issue-123-sample --pr-body-file .codex/tmp/pr-summary.md

Commands:
  start-feature  Create a feature spec, ADR, and ExecPlan scaffold.
  checkpoint     Run validation suites for the current implementation checkpoint and clean transient artifacts.
  finish-feature Run the release-ready validation suites and clean transient artifacts.
  pr-summary     Generate a PR summary markdown file from the current branch state.
  validate-pr-metadata Validate branch and PR body metadata for CI.
`);
}

export function main(argv: string[]): void {
  if (argv.length === 0 || argv.includes('--help')) {
    printUsage();
    return;
  }

  const { command, options } = parseArgs(argv);
  runLifecycleCommand(command, options);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[workflow] ${message}`);
    process.exitCode = 1;
  }
}

export function readTextFile(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}
