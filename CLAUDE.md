# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Teacher Observation Journal" — a bilingual (Hebrew + English) web app for teachers to log student observations and generate AI-powered end-of-year summaries via Claude. Three services: React frontend, Express backend, PostgreSQL database.

## Development Commands

### Docker (recommended)
```bash
# Start all services
docker compose up

# Rebuild after dependency changes
docker compose up --build
```

### Local Development
```bash
# Backend (port 3001)
cd backend && npm install && npm run dev

# Frontend (port 5173)
cd frontend && npm install && npm run dev

# E2E tests (requires both services running)
cd e2e && npm install && npm test
cd e2e && npm run test:ui   # interactive UI mode
```

### Backend Build
```bash
cd backend && npm run build   # tsc → dist/
cd backend && npm start       # run compiled output
```

### Frontend Lint
```bash
cd frontend && npm run lint
```

## Environment Setup

Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. The backend reads this for AI summary generation — the frontend never touches API keys.

## Architecture

### Data Flow
```
Browser → React (port 5173) → Express API (port 3001) → PostgreSQL
                                        ↓
                              Anthropic Claude API (summaries only)
```

### Backend (`backend/src/`)
- **`index.ts`** — Express app, CORS, route mounting, Swagger UI at `/api/docs`
- **`db.ts`** — pg connection pool via `DATABASE_URL` env var
- **`routes/students.ts`** — GET/POST/DELETE `/api/students`
- **`routes/notes.ts`** — GET/POST/DELETE `/api/notes` (GET requires `?studentId=`)
- **`routes/summary.ts`** — POST `/api/summary` — calls Claude with bilingual system prompt, returns 5-section structured summary
- **`db/schema.sql`** — Students and Notes tables; notes have FK cascade delete on student removal

### Frontend (`frontend/src/`)
- **`api/client.ts`** — All fetch calls to `http://localhost:3001/api`; typed wrappers for all 7 endpoints
- **`types/index.ts`** — Shared `Student`, `Note`, `Lang` types
- **`context/LanguageContext.tsx`** — Custom i18n: no external library; persists to localStorage; mutates `document.documentElement.dir` and `.lang` for RTL/LTR
- **`i18n/translations.ts`** — Fully-typed `Translations` interface with EN and HE strings (32 keys)
- **`hooks/`** — `useStudents`, `useNotes`, `useSummary` — all data fetching logic lives here
- **`components/`** — Organized by feature: `layout/`, `students/`, `notes/`, `summary/`

### Bilingual / RTL Pattern
Use Tailwind CSS logical properties (`text-start`, `ps-*`, `ms-*`, `rtl:flex-row-reverse`) instead of directional properties (`text-left`, `pl-*`, `ml-*`). The `LanguageContext` sets `dir="rtl"` on `<html>` for Hebrew. Font: "Heebo" (supports both Hebrew and Latin scripts).

### E2E Tests (`e2e/`)
Playwright targeting Chromium, base URL `http://localhost:5173`. Tests go in `e2e/tests/`. No tests exist yet — implementation plan is in `docs/plan.md`.

## AI Summary

The summary prompt is defined in `backend/src/routes/summary.ts`. It produces 5 bilingual sections: General Behavior, Class Participation, Social Relationships, Responsibility & Tasks, Personal Growth. The model used is `claude-sonnet-4-20250514`.

## Database Schema

Notes cascade-delete when a student is deleted (FK constraint). Students are ordered by `created_at ASC`, notes by `created_at DESC`. Constraints: student name 1–200 chars, note content ≥ 1 char.
