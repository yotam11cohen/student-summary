import { test, expect } from '@playwright/test';
import { deleteAllStudents, createStudent, createNote } from '../helpers/api';

test.beforeEach(async ({ page }) => {
  await deleteAllStudents();
  await page.addInitScript(() => localStorage.clear());
});

test('edit a note and save - content updates in the list', async ({ page }) => {
  const student = await createStudent('Alice');
  await createNote(student.id, 'Original content');
  await page.goto('/');
  await page.getByText('Alice', { exact: true }).click();
  await page.getByText('Original content', { exact: true }).hover();
  await page.getByTitle('Edit note').click({ force: true });
  await page.locator('textarea:not([placeholder])').fill('Updated content');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Updated content', { exact: true })).toBeVisible();
  await expect(page.getByText('Original content', { exact: true })).not.toBeVisible();
});

test('edit a note and cancel - original content unchanged', async ({ page }) => {
  const student = await createStudent('Bob');
  await createNote(student.id, 'Stable content');
  await page.goto('/');
  await page.getByText('Bob', { exact: true }).click();
  await page.getByText('Stable content', { exact: true }).hover();
  await page.getByTitle('Edit note').click({ force: true });
  await page.locator('textarea:not([placeholder])').fill('Changed content');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Stable content', { exact: true })).toBeVisible();
  await expect(page.getByText('Changed content', { exact: true })).not.toBeVisible();
});

test('save button is disabled when content is empty', async ({ page }) => {
  const student = await createStudent('Carol');
  await createNote(student.id, 'Some note');
  await page.goto('/');
  await page.getByText('Carol', { exact: true }).click();
  await page.getByText('Some note', { exact: true }).hover();
  await page.getByTitle('Edit note').click({ force: true });
  await page.locator('textarea:not([placeholder])').clear();
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
});
