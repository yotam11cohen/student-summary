import { test, expect } from '@playwright/test';
import { deleteAllStudents, createStudent } from '../helpers/api';

test.beforeEach(async () => {
  await deleteAllStudents();
});

test('shows empty state when no students exist', async ({ page }) => {
  await page.goto('/');
  const emptyMsg = page.locator('p', { hasText: 'Student name...' });
  await expect(emptyMsg).toBeVisible();
});

test('add a student - appears in sidebar', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Student name...').fill('Alice');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
});

test('select a student - workspace opens with their name', async ({ page }) => {
  await createStudent('Bob');
  await page.goto('/');
  await page.getByText('Bob', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bob' })).toBeVisible();
});

test('delete a student - confirm - removed from sidebar', async ({ page }) => {
  await createStudent('Charlie');
  await page.goto('/');
  await page.getByText('Charlie', { exact: true }).hover();
  await page.getByTitle('Delete student').click({ force: true });
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByText('Charlie', { exact: true })).not.toBeVisible();
});

test('delete a student - cancel - student stays in sidebar', async ({ page }) => {
  await createStudent('Diana');
  await page.goto('/');
  await page.getByText('Diana', { exact: true }).hover();
  await page.getByTitle('Delete student').click({ force: true });
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Diana', { exact: true })).toBeVisible();
});
