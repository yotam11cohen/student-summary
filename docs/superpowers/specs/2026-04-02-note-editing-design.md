# Note Editing Design — Student Summary App

**Date:** 2026-04-02

## Overview

Add inline edit capability to notes. A pencil icon appears on hover alongside the existing delete button. Clicking it transforms the note card into an edit form (textarea + Save/Cancel). Saving calls a new `PUT /api/notes/:id` endpoint and updates the note in place.

## Trigger

Pencil icon button, hidden by default (`opacity-0`), revealed on hover via `group-hover:opacity-100` — same pattern as the existing delete button. Both icons sit side by side in the bottom-right of the note card.

## UI States in NoteItem

`NoteItem` manages three mutually exclusive states via a `mode` state: `'view' | 'editing' | 'confirming'`.

- **view**: shows note text + date + hover icons (pencil + delete)
- **editing**: replaces text with a `<textarea>` pre-filled with current content; shows Save and Cancel buttons; hides icons
- **confirming**: existing delete-confirmation UI (unchanged)

Entering `editing` exits `confirming` and vice versa.

## Save Behavior

- Save button is disabled when the textarea is empty or whitespace-only.
- On save: calls `onEdit(newContent)`, shows a saving state (disabled button), then returns to `view` on success.
- On error: stays in editing mode, shows an inline error message.
- Cancel: reverts textarea to original content, returns to `view`.

## Backend

Add `PUT /api/notes/:id`:
- Request body: `{ content: string }`
- Validates: content must be a non-empty string (after trim)
- Returns: updated note row (`id`, `student_id`, `content`, `created_at`)
- 404 if note not found

## API Client

Add to `api/client.ts`:
```typescript
updateNote(id: number, content: string): Promise<Note> {
  return fetch(`${BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  }).then(handleResponse<Note>);
}
```

## useNotes Hook

Add `updateNote(id: number, content: string)`:
- Calls `api.updateNote(id, content)`
- Replaces the matching note in state (preserves array order, updates `content`)

## Translations

New keys added to both EN and HE in `translations.ts`:

| Key | EN | HE |
|-----|----|----|
| `editNote` | `Edit note` | `ערוך הערה` |
| `saveNote` | `Save` | `שמור` |
| `cancelEdit` | `Cancel` | `ביטול` |
| `errorEditNote` | `Failed to save note.` | `שגיאה בשמירת ההערה.` |

## Components Changed

| File | Change |
|------|--------|
| `backend/src/routes/notes.ts` | Add `PUT /:id` handler |
| `frontend/src/api/client.ts` | Add `updateNote` |
| `frontend/src/hooks/useNotes.ts` | Add `updateNote` |
| `frontend/src/components/notes/NoteItem.tsx` | Add editing mode, pencil icon |
| `frontend/src/i18n/translations.ts` | Add 4 new keys (EN + HE) |
| `frontend/src/types/index.ts` | No change needed |

## E2E Tests

New file: `e2e/tests/notes-edit.spec.ts` — 3 tests:

1. **Edit a note and save** — content updates in the list
2. **Edit a note and cancel** — original content unchanged
3. **Save button disabled when empty** — clearing the textarea disables Save

## Out of Scope

- Edit history / timestamps (`updated_at` column)
- Editing from the summary view
- Multi-line expand/auto-resize of the textarea
