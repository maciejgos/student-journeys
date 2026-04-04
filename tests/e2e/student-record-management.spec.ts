import { test, expect } from '@playwright/test';

test('creates a student record and exposes the full profile through search', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('create-firstName').fill('Mina');
  await page.getByTestId('create-lastName').fill('Lopez');
  await page.getByTestId('create-campus').fill('South Campus');
  await page.getByTestId('create-program').fill('Biology');
  await page.getByTestId('create-email').fill('mina.lopez@example.edu');
  await page.getByTestId('create-assignedOwner').fill('Nadia Frost');
  await page.getByTestId('create-admissionStatus').fill('Prospect');
  await page.getByTestId('create-enrollmentStatus').fill('Not enrolled');
  await page.getByTestId('create-inquiryDate').fill('2026-04-01');
  await page.getByRole('button', { name: 'Create record' }).click();

  await expect(page.getByTestId('status-message')).toContainText('Record created: Mina Lopez');
  await expect(page.getByTestId('record-summary')).toContainText('Mina Lopez');
  await expect(page.getByTestId('timeline-list')).toContainText('status-change');

  await page.getByTestId('search-input').fill('mina.lopez@example.edu');
  await expect(page.getByTestId('search-results')).toContainText('Mina Lopez');
});

test('blocks duplicate override for workers and allows it for team leads with audit logging', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('create-firstName').fill('Alice');
  await page.getByTestId('create-lastName').fill('Walker');
  await page.getByTestId('create-campus').fill('North Campus');
  await page.getByTestId('create-email').fill('alice.walker@example.edu');
  await page.getByRole('button', { name: 'Create record' }).click();

  await expect(page.getByTestId('duplicate-panel')).toContainText('Alice Walker');
  await expect(page.getByText('Duplicate override is not available for the current role.')).toBeVisible();

  await page.getByTestId('role-select').selectOption('teamLead');
  await page.getByRole('button', { name: 'Confirm create anyway' }).click();

  await expect(page.getByTestId('status-message')).toContainText('Duplicate override recorded');
  await expect(page.getByTestId('audit-log-list')).toContainText('duplicate-override');
});

test('hides restricted search results from workers but not administrators', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('search-input').fill('Priya');
  await expect(page.getByTestId('search-results')).toContainText(
    'No visible results for the current role. Restricted matches may exist.',
  );

  await page.getByTestId('role-select').selectOption('administrator');
  await expect(page.getByTestId('search-results')).toContainText('Priya Singh');
});

test('updates selected fields without overwriting unrelated data', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('search-input').fill('Alice');
  await page.getByRole('button', { name: 'Open record' }).click();

  await expect(page.getByTestId('record-summary')).toContainText('Alice Walker');
  await expect(page.getByTestId('edit-email')).toHaveValue('alice.walker@example.edu');
  await expect(page.getByTestId('audit-log-blocked')).toContainText(
    'Audit log access is limited to team leads and administrators.',
  );

  await page.getByTestId('edit-program').fill('MBA');
  await page.getByRole('button', { name: 'Save updates' }).click();

  await expect(page.getByTestId('status-message')).toContainText('Record updated: Alice Walker');
  await expect(page.getByTestId('edit-program')).toHaveValue('MBA');
  await expect(page.getByTestId('edit-email')).toHaveValue('alice.walker@example.edu');
  await page.getByTestId('role-select').selectOption('teamLead');
  await expect(page.getByTestId('audit-log-list')).toContainText('Updated fields: program.');
  await expect(page.getByTestId('audit-log-list')).toContainText('update');
});
