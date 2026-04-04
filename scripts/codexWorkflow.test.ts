import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  branchNameForFeature,
  cleanupGeneratedArtifacts,
  collectChangedFiles,
  currentBranchName,
  extractIssueNumberFromBranchName,
  nextSequenceNumber,
  parseSuites,
  renderPrSummary,
  readTextFile,
  slugify,
  startFeature,
  validatePullRequestMetadata,
} from './codexWorkflow';

describe('codex workflow automation', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'codex-workflow-'));
    mkdirSync(join(tempDir, 'docs/features'), { recursive: true });
    mkdirSync(join(tempDir, 'docs/adr'), { recursive: true });
    writeFileSync(join(tempDir, 'docs/features/README.md'), 'placeholder', 'utf8');
    writeFileSync(join(tempDir, 'docs/features/01-existing.md'), '# Existing feature', 'utf8');
    writeFileSync(join(tempDir, 'docs/adr/0001-existing.md'), '# Existing adr', 'utf8');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('slugifies free-form titles', () => {
    expect(slugify('  SDLC / PDLC Automation  ')).toBe('sdlc-pdlc-automation');
  });

  it('builds issue-linked branch names and extracts issue ids from them', () => {
    expect(branchNameForFeature('sdlc-pdlc-automation', 42)).toBe('codex/issue-42-sdlc-pdlc-automation');
    expect(branchNameForFeature('sdlc-pdlc-automation', 42, '')).toBe('issue-42-sdlc-pdlc-automation');
    expect(extractIssueNumberFromBranchName('codex/issue-42-sdlc-pdlc-automation')).toBe(42);
  });

  it('finds the next sequence number from existing files', () => {
    expect(nextSequenceNumber(join(tempDir, 'docs/features'), /^(\d+)-.*\.md$/)).toBe(2);
    expect(nextSequenceNumber(join(tempDir, 'docs/adr'), /^(\d+)-.*\.md$/)).toBe(2);
  });

  it('creates feature, adr, execplan, and updates the features readme', () => {
    const artifacts = startFeature({
      rootDir: tempDir,
      title: 'Codex lifecycle automation',
      slug: 'codex-lifecycle-automation',
      owner: 'Codex',
      issueNumber: 42,
      branchName: 'codex/issue-42-codex-lifecycle-automation',
      includeAdr: true,
      includeExecPlan: true,
    });

    expect(artifacts).toEqual({
      featurePath: 'docs/features/02-codex-lifecycle-automation.md',
      adrPath: 'docs/adr/0002-codex-lifecycle-automation.md',
      execPlanPath: 'docs/execplans/codex-lifecycle-automation.md',
      issueNumber: 42,
      branchName: 'codex/issue-42-codex-lifecycle-automation',
    });

    expect(readTextFile(join(tempDir, artifacts.featurePath))).toContain('GitHub Issue: #42');
    expect(readTextFile(join(tempDir, artifacts.featurePath))).toContain('Related ADR: `docs/adr/0002-codex-lifecycle-automation.md`');
    expect(readTextFile(join(tempDir, artifacts.featurePath))).toContain('`delivery-orchestrator`');
    expect(readTextFile(join(tempDir, artifacts.featurePath))).toContain('`ux-concept-designer` for user-facing work');
    expect(readTextFile(join(tempDir, artifacts.execPlanPath!))).toContain('This document must be maintained in accordance with `.codex/PLANS.md`.');
    expect(readTextFile(join(tempDir, artifacts.execPlanPath!))).toContain('`implementation-orchestrator` for code and documentation execution');
    expect(readTextFile(join(tempDir, artifacts.execPlanPath!))).toContain('`ux-reviewer` before handoff for user-facing changes');
    expect(readTextFile(join(tempDir, 'docs/features/README.md'))).toContain('02-codex-lifecycle-automation.md');
  });

  it('parses validation suite lists and rejects unknown suites', () => {
    expect(parseSuites('unit,build,unit', ['unit'])).toEqual(['unit', 'build']);
    expect(() => parseSuites('unit,smoke', ['unit'])).toThrow('Unsupported validation suite(s): smoke');
  });

  it('cleans generated artifacts without touching missing paths', () => {
    mkdirSync(join(tempDir, 'dist'), { recursive: true });
    mkdirSync(join(tempDir, 'playwright-report'), { recursive: true });
    writeFileSync(join(tempDir, 'tsconfig.node.tsbuildinfo'), 'artifact', 'utf8');

    const removed = cleanupGeneratedArtifacts(tempDir);

    expect(removed).toEqual(['dist', 'playwright-report', 'tsconfig.node.tsbuildinfo']);
    expect(existsSync(join(tempDir, 'dist'))).toBe(false);
    expect(existsSync(join(tempDir, 'playwright-report'))).toBe(false);
    expect(existsSync(join(tempDir, 'tsconfig.node.tsbuildinfo'))).toBe(false);
  });

  it('collects changed files and renders a pr summary', () => {
    writeFileSync(join(tempDir, 'README.md'), '# Temp repo', 'utf8');
    writeFileSync(join(tempDir, 'package.json'), '{"name":"temp","private":true}', 'utf8');
    writeFileSync(join(tempDir, '.gitignore'), '', 'utf8');
    writeFileSync(join(tempDir, 'docs/features/02-extra.md'), '# Extra', 'utf8');

    execSync('git init', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.email "codex@example.com"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.name "Codex"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git add .', { cwd: tempDir, stdio: 'ignore' });
    execSync('git commit -m "init"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git checkout -b codex/issue-42-sample', { cwd: tempDir, stdio: 'ignore' });
    mkdirSync(join(tempDir, 'scripts'), { recursive: true });
    writeFileSync(join(tempDir, 'scripts/new-script.ts'), 'export {};\n', 'utf8');

    const changedFiles = collectChangedFiles(tempDir, 'main');
    const summary = renderPrSummary({
      title: 'Automated workflow update',
      branchName: 'codex/issue-42-sample',
      baseRef: 'main',
      issueNumber: 42,
      changedFiles,
      validationSuites: ['unit', 'build'],
    });

    expect(changedFiles).toContain('scripts/new-script.ts');
    expect(summary).toContain('Closes #42');
    expect(summary).toContain('Workflow automation');
    expect(summary).toContain('npm run build');
  });

  it('reports the current branch name from git', () => {
    writeFileSync(join(tempDir, 'README.md'), '# Temp repo', 'utf8');
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.email "codex@example.com"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.name "Codex"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git add .', { cwd: tempDir, stdio: 'ignore' });
    execSync('git commit -m "init"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git checkout -b codex/issue-42-sample', { cwd: tempDir, stdio: 'ignore' });

    expect(currentBranchName(tempDir)).toBe('codex/issue-42-sample');
  });

  it('validates pull request metadata', () => {
    expect(
      validatePullRequestMetadata({
        branchName: 'codex/issue-42-sample',
        prBody: `## Summary

Sample

## Linked issue

Closes #42

## What changed

- Added automation

## Validation

- [x] npm run test:unit
`,
      }),
    ).toEqual({
      valid: true,
      errors: [],
    });

    expect(
      validatePullRequestMetadata({
        branchName: 'codex/sample',
        prBody: '## Summary\n\nMissing metadata\n',
      }),
    ).toEqual({
      valid: false,
      errors: [
        'Missing PR section: ## Linked issue',
        'Missing PR section: ## What changed',
        'Missing PR section: ## Validation',
        'PR metadata must include a linked issue in the branch name or PR body.',
      ],
    });
  });
});
