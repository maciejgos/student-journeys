import { test, expect } from '@playwright/test';

const screenshotDir = 'docs/pr-assets/journey-stage-tracking';

test('captures desktop journey-stage create flow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1600 });
  await page.goto('/');

  await expect(page.getByTestId('create-currentJourneyStage')).toHaveValue('Prospect or inquiry');
  await expect(page.getByLabel('Current journey stage').first()).toBeVisible();

  await page.locator('main > section').nth(0).screenshot({
    path: `${screenshotDir}/desktop-create-journey-stage.png`,
  });
});

test('captures mobile journey-stage edit flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1400 });
  await page.goto('/');

  await page.getByTestId('search-input').fill('Alice');
  const aliceResult = page
    .getByTestId('search-results')
    .getByRole('listitem')
    .filter({ hasText: 'Alice Walker' })
    .first();
  await aliceResult.getByRole('button', { name: 'Open record' }).click();

  await expect(page.getByTestId('edit-currentJourneyStage')).toHaveValue('Applicant');
  await expect(page.getByTestId('record-summary')).toContainText('Alice Walker');

  await page.locator('main > section').nth(2).screenshot({
    path: `${screenshotDir}/mobile-edit-journey-stage.png`,
  });
});
