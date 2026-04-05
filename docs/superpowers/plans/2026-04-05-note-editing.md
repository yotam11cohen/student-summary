# Note Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inline note editing — a pencil icon appears on hover; clicking it replaces the note text with an editable textarea; saving calls a new `PUT /api/notes/:id` endpoint.

**Architecture:** TDD from the E2E layer down. Write failing Playwright tests first, then implement backend → API client → hook → translations → NoteItem UI → wiring. All state transitions live inside `NoteItem` via a `mode` discriminant (`'view' | 'editing' | 'confirming'`), keeping the same pattern as the existing delete-confirmation UI.

**Tech Stack:** Express/PostgreSQL (backend), React + TypeScript + Tailwind (frontend), Playwright (e2e)

---

## File Map

| File | Change |
|------|--------|
| `e2e/tests/notes-edit.spec.ts` | **Create** — 3 Playwright tests for edit flow |
| `backend/src/routes/notes.ts` | **Modify** — add `PUT /:id` handler |
| `frontend/src/api/client.ts` | **Modify** — add `updateNote` |
| `frontend/src/hooks/useNotes.ts` | **Modify** — add `updateNote`, export it |
| `frontend/src/i18n/translations.ts` | **Modify** — add 4 keys (EN + HE) |
| `frontend/src/components/notes/NoteItem.tsx` | **Modify** — add `mode` state, pencil icon, edit UI |
| `frontend/src/components/notes/NotesPanel.tsx` | **Modify** — add `onEdit` prop, pass to `NoteItem` |
| `frontend/src/App.tsx` | **Modify** — destructure `updateNote`, pass to `NotesPanel` |

---

## Task 1: Write failing E2E tests

**Files:**
- Create: `e2e/tests/notes-edit.spec.ts`

- [ ] **Step 1: Create the test file**

```typescript
// e2e/tests/notes-edit.spec.ts
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
```

> Note: `textarea:not([placeholder])` targets the inline edit textarea. The AddNoteForm textarea always has `placeholder="Write an observation..."`, so this selector is unambiguous.

- [ ] **Step 2: Run tests — confirm they all fail**

```bash
cd e2e && npm test -- --grep "edit"
```

Expected: 3 tests FAIL (no `Edit note` button exists yet)

---

## Task 2: Backend — PUT /api/notes/:id

**Files:**
- Modify: `backend/src/routes/notes.ts`

- [ ] **Step 1: Add the PUT route after the existing DELETE route**

In `backend/src/routes/notes.ts`, add after the DELETE handler (after line 70):

```typescript
// PUT /api/notes/:id
notesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'content is required' });
      return;
    }
    const result = await pool.query(
      'UPDATE notes SET content = $1 WHERE id = $2 RETURNING id, student_id, content, created_at',
      [content.trim(), id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 2: Rebuild and verify with curl**

```bash
cd backend && npm run build
```

Expected: no TypeScript errors, `dist/` updated.

Then (with Docker stack running):

```bash
# First create a note via the app, then get its ID:
curl http://localhost:3001/api/notes?studentId=1

# Update a note (replace 1 with an actual note ID):
curl -X PUT http://localhost:3001/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"content": "edited content"}'
```

Expected: `200 OK` with JSON containing `id`, `student_id`, `content: "edited content"`, `created_at`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/notes.ts
git commit -m "feat: add PUT /api/notes/:id endpoint"
```

---

## Task 3: API client — updateNote

**Files:**
- Modify: `frontend/src/api/client.ts`

- [ ] **Step 1: Add `updateNote` to the `api` object**

In `frontend/src/api/client.ts`, add after `deleteNote`:

```typescript
  updateNote(id: number, content: string): Promise<Note> {
    return fetch(`${BASE}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }).then(handleResponse<Note>);
  },
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/client.ts
git commit -m "feat: add updateNote to API client"
```

---

## Task 4: Hook — updateNote

**Files:**
- Modify: `frontend/src/hooks/useNotes.ts`

- [ ] **Step 1: Add `updateNote` function and include it in the return value**

Replace the `return` statement at the bottom of `useNotes`:

Current:
```typescript
  return { notes, loading, error, addNote, deleteNote };
```

New — add `updateNote` above the return, then include it:
```typescript
  const updateNote = async (id: number, content: string) => {
    const updated = await api.updateNote(id, content);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  return { notes, loading, error, addNote, deleteNote, updateNote };
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useNotes.ts
git commit -m "feat: add updateNote to useNotes hook"
```

---

## Task 5: Translations — add edit-related keys

**Files:**
- Modify: `frontend/src/i18n/translations.ts`

- [ ] **Step 1: Add 4 keys to the `Translations` interface**

In `frontend/src/i18n/translations.ts`, add to the `Translations` interface after `errorDeleteNote`:

```typescript
  errorEditNote: string;
  editNote: string;
  saveNote: string;
  cancelEdit: string;
```

- [ ] **Step 2: Add English strings**

In the `en` object, add after `errorDeleteNote: 'Failed to delete note.',`:

```typescript
    errorEditNote: 'Failed to save note.',
    editNote: 'Edit note',
    saveNote: 'Save',
    cancelEdit: 'Cancel',
```

- [ ] **Step 3: Add Hebrew strings**

In the `he` object, add after `errorDeleteNote: 'שגיאה במחיקת ההערה.',`:

```typescript
    errorEditNote: 'שגיאה בשמירת ההערה.',
    editNote: 'ערוך הערה',
    saveNote: 'שמור',
    cancelEdit: 'ביטול',
```

- [ ] **Step 4: Check for TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/i18n/translations.ts
git commit -m "feat: add note editing i18n keys (EN + HE)"
```

---

## Task 6: NoteItem — inline edit UI

**Files:**
- Modify: `frontend/src/components/notes/NoteItem.tsx`

- [ ] **Step 1: Replace the entire file content**

```typescript
import { useState } from 'react';
import type { Note } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface NoteItemProps {
  note: Note;
  onDelete: () => Promise<void>;
  onEdit: (content: string) => Promise<void>;
}

export function NoteItem({ note, onDelete, onEdit }: NoteItemProps) {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<'view' | 'editing' | 'confirming'>('view');
  const [deleting, setDeleting] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const handleStartEdit = () => {
    setEditContent(note.content);
    setEditError(null);
    setMode('editing');
  };

  const handleCancelEdit = () => {
    setEditContent(note.content);
    setEditError(null);
    setMode('view');
  };

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    setSaving(true);
    setEditError(null);
    try {
      await onEdit(trimmed);
      setMode('view');
    } catch {
      setEditError(t('errorEditNote'));
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(note.created_at));

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition-shadow">
      {mode === 'editing' ? (
        <>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-sm text-gray-800 leading-relaxed border border-gray-300 rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {editError && <p className="mt-1 text-xs text-red-500">{editError}</p>}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="text-xs text-gray-500 hover:underline disabled:opacity-50"
            >
              {t('cancelEdit')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || editContent.trim().length === 0}
              className="text-xs text-blue-600 font-medium hover:underline disabled:opacity-50"
            >
              {t('saveNote')}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap text-start">
            {note.content}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{formattedDate}</span>
            {mode === 'confirming' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('confirmDelete')}</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-600 font-medium hover:underline disabled:opacity-50"
                >
                  {t('confirmYes')}
                </button>
                <button
                  onClick={() => setMode('view')}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {t('confirmNo')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleStartEdit}
                  title={t('editNote')}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setMode('confirming')}
                  title={t('deleteNote')}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: TypeScript will error on `onEdit` prop missing in `NotesPanel` — that's expected and resolved in the next task.

- [ ] **Step 3: Commit (even with lint error — it will be resolved next task)**

```bash
git add frontend/src/components/notes/NoteItem.tsx
git commit -m "feat: add inline edit mode to NoteItem"
```

---

## Task 7: Wire up NotesPanel and App

**Files:**
- Modify: `frontend/src/components/notes/NotesPanel.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Update NotesPanel to accept and pass `onEdit`**

Replace `frontend/src/components/notes/NotesPanel.tsx` entirely:

```typescript
import type { Note } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AddNoteForm } from './AddNoteForm';
import { NoteItem } from './NoteItem';

interface NotesPanelProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onAdd: (content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (id: number, content: string) => Promise<void>;
}

export function NotesPanel({ notes, loading, error, onAdd, onDelete, onEdit }: NotesPanelProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-700 mb-3 text-start">
        {t('notesTitle')}
      </h2>

      <AddNoteForm onAdd={onAdd} />

      {error && (
        <p className="mb-3 text-sm text-red-500 text-start">{t('errorLoadNotes')}</p>
      )}

      {loading && (
        <div className="flex justify-center p-6">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && notes.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-start">{t('noNotes')}</p>
      )}

      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onDelete={() => onDelete(note.id)}
            onEdit={(content) => onEdit(note.id, content)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update App.tsx to destructure updateNote and pass it to NotesPanel**

In `frontend/src/App.tsx`, change line 13 (the `useNotes` destructuring):

Current:
```typescript
  const { notes, loading, error, addNote, deleteNote } = useNotes(
    student?.id ?? null
  );
```

New:
```typescript
  const { notes, loading, error, addNote, deleteNote, updateNote } = useNotes(
    student?.id ?? null
  );
```

And change the `NotesPanel` usage (lines 30–36):

Current:
```typescript
      <NotesPanel
        notes={notes}
        loading={loading}
        error={error}
        onAdd={addNote}
        onDelete={deleteNote}
      />
```

New:
```typescript
      <NotesPanel
        notes={notes}
        loading={loading}
        error={error}
        onAdd={addNote}
        onDelete={deleteNote}
        onEdit={updateNote}
      />
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/notes/NotesPanel.tsx frontend/src/App.tsx
git commit -m "feat: wire note editing through NotesPanel and App"
```

---

## Task 8: Run E2E tests — confirm all pass

- [ ] **Step 1: Make sure Docker stack is running**

```bash
docker compose up -d
```

Expected: all containers healthy (db, backend, frontend).

- [ ] **Step 2: Run the full E2E suite**

```bash
cd e2e && npm test
```

Expected: all 15 tests pass (12 existing + 3 new edit tests). Runtime ~15s.

- [ ] **Step 3: If edit tests fail, check common causes**

- `getByTitle('Edit note')` not found → confirm `t('editNote')` returns `'Edit note'` in EN and localStorage is cleared in `beforeEach`
- `textarea:not([placeholder])` matches 0 elements → confirm `NoteItem` edit textarea has no `placeholder` attribute
- `getByRole('button', { name: 'Save' })` not found → confirm `t('saveNote')` returns `'Save'`

- [ ] **Step 4: Commit the E2E test file (already staged from Task 1)**

```bash
git add e2e/tests/notes-edit.spec.ts
git commit -m "test: add Playwright e2e tests for note editing"
```
