# Student Summary App — Implementation Plan

## Context
Build a bilingual (Hebrew + English) teacher observation web app from scratch. Teachers log notes about students throughout the year and generate AI-powered end-of-year summaries via Claude API. Stack: React + Vite + TypeScript (frontend), Node.js + Express + TypeScript (backend), PostgreSQL (database).

---

## Project Structure

```
student-summary-app/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts              # Express entry point
│       ├── db.ts                 # pg Pool singleton
│       ├── routes/
│       │   ├── students.ts       # CRUD /api/students
│       │   ├── notes.ts          # CRUD /api/notes
│       │   └── summary.ts        # AI proxy /api/summary
│       └── middleware/
│           └── errorHandler.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── i18n/translations.ts       # All UI strings EN + HE
        ├── types/index.ts
        ├── api/client.ts              # Typed fetch wrappers
        ├── context/LanguageContext.tsx # lang state + useLanguage hook
        ├── components/
        │   ├── layout/AppShell.tsx + LanguageToggle.tsx
        │   ├── students/StudentSidebar.tsx + StudentListItem.tsx + AddStudentForm.tsx
        │   ├── notes/NotesPanel.tsx + NoteItem.tsx + AddNoteForm.tsx
        │   └── summary/SummaryPanel.tsx + CopyButton.tsx
        └── hooks/
            ├── useStudents.ts
            ├── useNotes.ts
            └── useSummary.ts
```

---

## Database Schema (PostgreSQL)

```sql
CREATE DATABASE student_summary;

CREATE TABLE students (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_student_id ON notes(student_id);
```

Notes: `ON DELETE CASCADE` removes orphan notes automatically. Summaries are ephemeral (React state only) — no summaries table.

---

## Backend REST API (`http://localhost:3001/api`)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/students | List all students (ordered by created_at ASC) |
| POST | /api/students | Create student `{ name }` → 201 |
| DELETE | /api/students/:id | Delete student + cascade notes → 204 |
| GET | /api/notes?studentId=:id | Notes for student, newest first |
| POST | /api/notes | Add note `{ studentId, content }` → 201 |
| DELETE | /api/notes/:id | Delete note → 204 |
| POST | /api/summary | AI summary `{ studentId, studentName, notes[], language }` → `{ summary }` |

Errors return `{ "error": "message" }` with appropriate HTTP status.

---

## AI Summary

**Backend** holds `ANTHROPIC_API_KEY` in env. The frontend never sees it.

```typescript
// backend/src/routes/summary.ts
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY!,
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,   // language-specific (see below)
    messages: [{ role: "user", content: notesText }]
  })
})
```

**Hebrew system prompt:**
```
אתה עוזר למחנכים לכתוב סיכומי שנה לתלמידים. קיבלת אוסף הערות שנכתבו לאורך השנה.
כתוב סיכום מקצועי בעברית בגוף שלישי, עם 5 כותרות ברורות ולכל אחת פסקה קצרה:
1. התנהגות כללית
2. השתתפות בשיעורים
3. יחסים חברתיים
4. אחריות ומשימות
5. התפתחות אישית לאורך השנה
הסיכום יהיה חם, מקצועי, מאוזן — יציין חוזקות ותחומים לצמיחה.
```

**English system prompt:**
```
You help teachers write end-of-year student summaries. You receive a collection of notes
written throughout the year. Write a professional third-person summary in English with
5 clear section headings, each followed by a short paragraph:
1. General Behavior
2. Class Participation
3. Social Relationships
4. Responsibility & Tasks
5. Personal Growth Throughout the Year
The tone should be warm, professional, and balanced — noting strengths and growth areas.
```

---

## i18n System

**No external library.** Fully-typed translation object in `frontend/src/i18n/translations.ts`:

```typescript
export type Lang = "en" | "he";
export interface Translations { appTitle, addStudentButton, generateButton, ... }
export const translations: Record<Lang, Translations> = { en: {...}, he: {...} }
```

`LanguageContext` sets `document.documentElement.dir` and `.lang` when language changes — this single mutation drives all Tailwind `rtl:` variants throughout the component tree.

---

## RTL/LTR Pattern

- Use Tailwind logical properties (`text-start`, `ps-4`, `pe-2`, `ms-2`, `border-s-4`)
- Use `rtl:flex-row-reverse` for row reversals
- Font: **Heebo** (Google Fonts) — designed for Hebrew + Latin, loaded via `index.html`

---

## Docker Setup

The entire stack runs with `docker compose up`. Three services: `db`, `backend`, `frontend`.

**`docker-compose.yml`** (root):
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: student_summary
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/student_summary
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: http://localhost:3001/api
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**`backend/Dockerfile`**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

**`frontend/Dockerfile`**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

The schema SQL file (`backend/db/schema.sql`) is mounted into the Postgres container's `docker-entrypoint-initdb.d/` so the DB is auto-initialized on first start.

**`.env`** at project root (never committed, holds secrets):
```
ANTHROPIC_API_KEY=sk-ant-...
```

**`.env.example`** at project root (committed):
```
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

Docker Compose passes `ANTHROPIC_API_KEY` from the host env into the backend container via the `${ANTHROPIC_API_KEY}` interpolation.

---

## Implementation Steps

### Phase 1 — Project Scaffolding
1. Create `backend/` — init npm, install `express pg cors dotenv`, configure `tsconfig.json`
2. Create `frontend/` — `npm create vite@latest` React+TS, install Tailwind CSS, configure Heebo font in `index.html`
3. Create root `.gitignore`, `.env.example`, and `docker-compose.yml`
4. Create `backend/Dockerfile` and `frontend/Dockerfile`

### Phase 2 — Database
5. Write `backend/db/schema.sql` (create tables + index — auto-loaded by Postgres container)
6. Write `backend/src/db.ts` (pg Pool singleton with `DATABASE_URL`)

### Phase 3 — Backend
6. Write `backend/src/middleware/errorHandler.ts`
7. Write `backend/src/routes/students.ts` (GET list, POST create, DELETE)
8. Write `backend/src/routes/notes.ts` (GET by studentId, POST create, DELETE)
9. Write `backend/src/routes/summary.ts` (proxy to Anthropic, bilingual prompts)
10. Write `backend/src/index.ts` (Express app, CORS, mount routes)

### Phase 4 — Frontend Foundation
11. Write `frontend/src/types/index.ts` (Student, Note interfaces)
12. Write `frontend/src/i18n/translations.ts` (all EN + HE strings)
13. Write `frontend/src/context/LanguageContext.tsx` (lang state, `useLanguage` hook, dir/lang DOM mutation)
14. Write `frontend/src/api/client.ts` (typed fetch wrappers for all 7 endpoints)

### Phase 5 — Frontend Components
15. Write `AppShell.tsx` (two-column grid layout)
16. Write `LanguageToggle.tsx` (fixed position button, switches EN↔HE)
17. Write `useStudents.ts` hook + `StudentSidebar`, `StudentListItem`, `AddStudentForm` components
18. Write `useNotes.ts` hook + `NotesPanel`, `NoteItem`, `AddNoteForm` components
19. Write `useSummary.ts` hook + `SummaryPanel`, `CopyButton` components
20. Wire everything together in `App.tsx`

### Phase 6 — Polish
21. Add loading spinners and error states to all async operations
22. Test RTL layout end-to-end with Hebrew language toggle
23. Test mobile responsiveness (stacked layout at <768px)

---

## Running the App

```bash
# 1. Copy env and fill in your API key
cp .env.example .env
# Edit .env → set ANTHROPIC_API_KEY=sk-ant-...

# 2. Start everything
docker compose up --build

# App available at http://localhost:5173
# Backend API at http://localhost:3001/api
```

---

## Verification

### Backend (once containers are up)
```bash
# Create student
curl -s -X POST http://localhost:3001/api/students -H "Content-Type: application/json" -d '{"name":"Test"}' | jq

# Add note (replace 1 with returned id)
curl -s -X POST http://localhost:3001/api/notes -H "Content-Type: application/json" -d '{"studentId":1,"content":"Great focus today."}' | jq

# Generate summary
curl -s -X POST http://localhost:3001/api/summary -H "Content-Type: application/json" \
  -d '{"studentId":1,"studentName":"Test","notes":["Great focus today."],"language":"en"}' | jq
```

### Frontend Functional Checklist
1. Toggle EN → עב: layout flips RTL, all labels in Hebrew
2. Toggle back: layout returns LTR, all labels in English
3. Add student → appears in sidebar → persists after page refresh
4. Select student, add 3 notes → newest-first order, timestamps localized
5. Generate Summary (EN) → English 5-section summary appears
6. Switch to Hebrew, generate → Hebrew 5-section summary appears
7. Edit summary textarea → free editing works
8. Copy to Clipboard → "Copied!" feedback, correct text pastes
9. Delete note → immediate removal
10. Delete student (with confirmation) → student + notes removed
11. Reload page → students and notes still present (DB persistence confirmed)
12. Mobile width (~375px) → panels stack vertically, no overflow
