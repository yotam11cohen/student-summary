# E2E Tests Design — Student Summary App

**Date:** 2026-04-02

## Overview

Add Playwright end-to-end tests that run against the live Docker stack (real DB + backend + frontend). Tests cover student management, note management, and language switching. Summary generation is excluded (requires a real Anthropic API key).

## Structure

Top-level `e2e/` directory — a standalone Playwright project separate from the frontend build.

```
e2e/
  package.json
  playwright.config.ts
  tests/
    students.spec.ts
    notes.spec.ts
    language.spec.ts
```

## Configuration

- **`playwright.config.ts`**: `baseURL` = `http://localhost:5173`, Chromium only, no retries in CI
- **Prerequisites**: Docker stack must be running before tests execute (`docker compose up -d`)
- **Cleanup**: Each test file uses `beforeEach` to reset state via the REST API (`DELETE` students, which cascades to notes)

## Test Coverage

### `students.spec.ts`
1. Add a student → appears in sidebar
2. Select a student → workspace opens showing the student's name
3. Delete a student and confirm → removed from sidebar
4. Delete a student and cancel → still present in sidebar
5. Empty state message shown when no students exist

### `notes.spec.ts`
1. Add a note → appears in notes list
2. Add multiple notes → all appear in the list
3. Delete a note and confirm → removed from list
4. Delete a note and cancel → still present in list
5. Empty state message shown when student has no notes

### `language.spec.ts`
1. Toggle to Hebrew → UI text switches to Hebrew, direction becomes RTL
2. Toggle back to English → UI text switches back to English, direction becomes LTR

## Out of Scope

- Summary generation (skipped — requires real `ANTHROPIC_API_KEY`)
- Mobile responsive layout tests
- Multi-browser testing (Chromium only)
