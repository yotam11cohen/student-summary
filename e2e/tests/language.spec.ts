import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('toggle to Hebrew - UI switches to Hebrew and dir becomes rtl', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Teacher Observation Journal')).toBeVisible();

  await page.getByTitle('Toggle language').click();

  await expect(page.getByText('יומן תצפיות מורה')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
});

test('toggle back to English - UI switches back to English and dir becomes ltr', async ({ page }) => {
  await page.goto('/');

  await page.getByTitle('Toggle language').click();
  await expect(page.getByText('יומן תצפיות מורה')).toBeVisible();

  await page.getByTitle('Toggle language').click();
  await expect(page.getByText('Teacher Observation Journal')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
