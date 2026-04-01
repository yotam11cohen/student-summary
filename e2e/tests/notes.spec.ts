import { test, expect } from '@playwright/test';
import { deleteAllStudents, createStudent } from '../helpers/api';

test.beforeEach(async () => {
  await deleteAllStudents();
});

test('shows empty state when student has no notes', async ({ page }) => {
  await createStudent('Alice');
  await page.goto('/');
  await page.getByText('Alice', { exact: true }).click();
  await expect(
    page.getByText('No notes yet. Add your first observation above.')
  ).toBeVisible();
});

test('add a note - appears in notes list', async ({ page }) => {
  await createStudent('Alice');
  await page.goto('/');
  await page.getByText('Alice', { exact: true }).click();
  await page.getByPlaceholder('Write an observation...').fill('Very attentive in class');
  await page.getByRole('button', { name: 'Add Note' }).click();
  await expect(page.getByText('Very attentive in class')).toBeVisible();
});

test('add multiple notes - all appear in list', async ({ page }) => {
  await createStudent('Alice');
  await page.goto('/');
  await page.getByText('Alice', { exact: true }).click();

  await page.getByPlaceholder('Write an observation...').fill('First observation');
  await page.getByRole('button', { name: 'Add Note' }).click();
  // Wait for form to reset (textarea cleared) before asserting — avoids strict-mode
  // violation where the textarea value and the note item both match the text
  await expect(page.getByPlaceholder('Write an observation...')).toHaveValue('');
  await expect(page.getByText('First observation', { exact: true })).toBeVisible();

  await page.getByPlaceholder('Write an observation...').fill('Second observation');
  await page.getByRole('button', { name: 'Add Note' }).click();
  await expect(page.getByText('Second observation')).toBeVisible();
  await expect(page.getByText('First observation')).toBeVisible();
});

test('delete a note - confirm - removed from list', async ({ page }) => {
  await createStudent('Alice');
  await page.goto('/');
  await page.getByText('Alice', { exact: true }).click();

  await page.getByPlaceholder('Write an observation...').fill('Note to delete');
  await page.getByRole('button', { name: 'Add Note' }).click();
  await expect(page.getByText('Note to delete')).toBeVisible();

  await page.getByText('Note to delete').hover();
  await page.getByTitle('Delete note').click({ force: true });
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.getByText('Note to delete')).not.toBeVisible();
});

test('delete a note - cancel - note stays in list', async ({ page }) => {
  await createStudent('Alice');
  await page.goto('/');
  await page.getByText('Alice', { exact: true }).click();

  await page.getByPlaceholder('Write an observation...').fill('Note to keep');
  await page.getByRole('button', { name: 'Add Note' }).click();
  await expect(page.getByText('Note to keep')).toBeVisible();

  await page.getByText('Note to keep').hover();
  await page.getByTitle('Delete note').click({ force: true });
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Note to keep')).toBeVisible();
});
