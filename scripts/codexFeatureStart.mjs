import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_OWNER = 'Codex';

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function toTitleFromSlug(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatSequenceNumber(value) {
  return String(value).padStart(2, '0');
}

function parseIssueNumber(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid issue number: ${value}`);
  }

  return parsed;
}

function branchNameForFeature(slug, issueNumber, branchPrefix = 'codex') {
  const sanitizedPrefix = branchPrefix.trim().replace(/^\/+|\/+$/g, '');
  const branchLeaf = issueNumber ? `issue-${issueNumber}-${slug}` : slug;
  return sanitizedPrefix ? `${sanitizedPrefix}/${branchLeaf}` : branchLeaf;
}

function nextSequenceNumber(dirPath, pattern) {
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

function renderFeatureSpec({
  title,
  featureNumber,
  slug,
  owner,
  issueNumber,
  branchName,
  adrPath,
  execPlanPath,
}) {
  const relatedAdr = adrPath ? `- Related ADR: \`${adrPath}\`` : '- Related ADR: not required yet';
  const relatedExecPlan = execPlanPath
    ? `- Related ExecPlan: \`${execPlanPath}\``
    : '- Related ExecPlan: create one if implementation becomes significant';
  const relatedIssue = issueNumber ? `- GitHub Issue: #${issueNumber}` : '- GitHub Issue: create or link one before opening the PR';
  const relatedBranch = branchName ? `- Suggested branch: \`${branchName}\`` : '- Suggested branch: generate one from the feature title';

  return `# ${formatSequenceNumber(featureNumber)} ${title}

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

- Feature slug: \`${slug}\`
- Owner: ${owner}
${relatedIssue}
${relatedBranch}
${relatedAdr}
${relatedExecPlan}
`;
}

function renderAdr({ title, featureTitle, featurePath }) {
  return `# ${title}

## Status

Proposed

## Context

The repository is implementing ${featureTitle}. The team needs to decide whether this work introduces or changes an architectural, integration, security, persistence, or operational practice that should be preserved for future contributors.

Related feature specification: \`${featurePath}\`

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

function renderExecPlan({ title, featurePath, adrPath }) {
  const adrReference = adrPath
    ? `The related architecture decision record is \`${adrPath}\`. Update it whenever the plan changes the long-lived technical approach.\n`
    : '';

  return `# ${title}

This ExecPlan is a living document. The sections \`Progress\`, \`Surprises & Discoveries\`, \`Decision Log\`, and \`Outcomes & Retrospective\` must be kept up to date as work proceeds.

This document must be maintained in accordance with \`.codex/PLANS.md\`.
${adrReference}
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

Start from the feature specification at \`${featurePath}\`. Summarize the relevant files, current behavior, and constraints for a first-time contributor.

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

function relativeToRoot(rootDir, filePath) {
  return filePath.startsWith(rootDir) ? filePath.slice(rootDir.length + 1) : filePath;
}

function writeIfMissing(filePath, contents) {
  if (existsSync(filePath)) {
    throw new Error(`Refusing to overwrite existing file: ${relativeToRoot(process.cwd(), filePath)}`);
  }

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, 'utf8');
}

function updateFeaturesReadme(featureDir) {
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

function runGit(rootDir, args, stdio = 'pipe') {
  return spawnSync('git', args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio,
    shell: process.platform === 'win32',
  });
}

function currentBranchName(rootDir) {
  const result = runGit(rootDir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (result.status !== 0) {
    return 'unknown';
  }

  return String(result.stdout ?? '').trim();
}

function branchExists(rootDir, branchName) {
  const result = runGit(rootDir, ['rev-parse', '--verify', branchName]);
  return result.status === 0;
}

function ensureBranchExists(rootDir, branchName) {
  if (currentBranchName(rootDir) === branchName) {
    return;
  }

  const args = branchExists(rootDir, branchName) ? ['checkout', branchName] : ['checkout', '-b', branchName];
  const result = runGit(rootDir, args, 'inherit');

  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed with exit code ${result.status ?? 'unknown'}`);
  }
}

function startFeature({
  rootDir,
  title,
  slug,
  owner,
  issueNumber,
  branchName,
  includeAdr,
  includeExecPlan,
}) {
  const featureDir = join(rootDir, 'docs/features');
  const adrDir = join(rootDir, 'docs/adr');
  const execPlanDir = join(rootDir, 'docs/execplans');

  mkdirSync(featureDir, { recursive: true });
  mkdirSync(adrDir, { recursive: true });
  mkdirSync(execPlanDir, { recursive: true });

  const featureNumber = nextSequenceNumber(featureDir, /^(\d+)-.*\.md$/);
  const featurePath = join(featureDir, `${formatSequenceNumber(featureNumber)}-${slug}.md`);
  const adrPath = includeAdr
    ? join(adrDir, `${String(nextSequenceNumber(adrDir, /^(\d+)-.*\.md$/)).padStart(4, '0')}-${slug}.md`)
    : undefined;
  const execPlanPath = includeExecPlan ? join(execPlanDir, `${slug}.md`) : undefined;

  const featurePathRelative = relativeToRoot(rootDir, featurePath);
  const adrPathRelative = adrPath ? relativeToRoot(rootDir, adrPath) : undefined;
  const execPlanPathRelative = execPlanPath ? relativeToRoot(rootDir, execPlanPath) : undefined;

  writeIfMissing(
    featurePath,
    renderFeatureSpec({
      title,
      featureNumber,
      slug,
      owner,
      issueNumber,
      branchName,
      adrPath: adrPathRelative,
      execPlanPath: execPlanPathRelative,
    }),
  );

  if (adrPath) {
    writeIfMissing(
      adrPath,
      renderAdr({
        title: `${title} workflow decision`,
        featureTitle: title,
        featurePath: featurePathRelative,
      }),
    );
  }

  if (execPlanPath) {
    writeIfMissing(
      execPlanPath,
      renderExecPlan({
        title: `${title} implementation plan`,
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
    issueNumber,
    branchName,
  };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [rawKey, inlineValue] = token.slice(2).split('=');
    const key = rawKey.trim();

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return options;
}

function printUsage() {
  console.log(`Codex feature scaffold

Usage:
  npm run codex:feature:start -- --title "Feature title" [--issue 123] [--create-branch]
`);
}

function printSummary(artifacts) {
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

function main(argv) {
  if (argv.length === 0 || argv.includes('--help')) {
    printUsage();
    return;
  }

  const options = parseArgs(argv);
  const rootDir = resolve(String(options['root-dir'] ?? process.cwd()));
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

  printSummary(artifacts);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[workflow] ${message}`);
  process.exitCode = 1;
}
