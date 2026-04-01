# Teacher Observation Journal

A bilingual (Hebrew + English) web app for teachers to log student observations throughout the year and generate AI-powered end-of-year summaries.

## Stack

- **Frontend** — React + TypeScript + Vite + Tailwind CSS
- **Backend** — Node.js + Express + TypeScript
- **Database** — PostgreSQL
- **AI** — Anthropic Claude (`claude-sonnet-4-20250514`)

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- An [Anthropic API key](https://console.anthropic.com/)

---

## Running the App

### 1. Clone / open the project

```bash
cd student-summary-app
```

### 2. Set your API key

```bash
cp .env.example .env
```

Open `.env` and set your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Start everything

```bash
docker compose up --build
```

This starts three containers:
| Container | URL |
|-----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| API Docs (Swagger UI) | http://localhost:3001/api/docs |

> On first run the database schema is created automatically.

### 4. Stop

```bash
docker compose down
```

To also delete the database volume:

```bash
docker compose down -v
```

---

## Features

- **Bilingual** — toggle between English (LTR) and Hebrew (RTL) at any time with the 🌐 button
- **Student management** — add, select, and delete students from the sidebar
- **Observation notes** — log timestamped notes per student; displayed newest-first
- **AI summaries** — generate a structured 5-section end-of-year summary via Claude; editable before copying
- **Persistent storage** — all students and notes are saved in PostgreSQL

---

## Development (without Docker)

### Requirements

- Node.js 18+
- PostgreSQL 14+ running locally

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and ANTHROPIC_API_KEY
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database

Connect to your local PostgreSQL instance and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE student_summary;"
psql -U postgres -d student_summary -f backend/db/schema.sql
```

---

## API Reference

Full interactive docs available at **http://localhost:3001/api/docs** when the backend is running.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| POST | `/api/students` | Create a student |
| DELETE | `/api/students/:id` | Delete a student (cascades notes) |
| GET | `/api/notes?studentId=:id` | List notes for a student |
| POST | `/api/notes` | Add a note |
| DELETE | `/api/notes/:id` | Delete a note |
| POST | `/api/summary` | Generate an AI summary |
