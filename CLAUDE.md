# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Miabo Madagascar — a full-stack web application with a **Next.js 16** frontend and a **FastAPI** backend backed by PostgreSQL.

---

## Development Commands

### Frontend (`/front`)

```bash
cd front
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
```

### Backend (`/back`)

```bash
cd back
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp env.sample .env   # Then fill in DATABASE_URL
uvicorn main:app --reload   # Start dev server at http://localhost:8000
```

API docs available at `http://localhost:8000/docs` (Swagger UI).

---

## Architecture

### Frontend — Next.js App Router

- Uses the **App Router** (`front/app/`)
- TypeScript with strict mode; path alias `@/*` maps to `front/`
- Tailwind CSS 4 for styling

### Backend — FastAPI + SQLAlchemy

Modules follow a 4-file pattern under `back/src/<module>/`:

| File | Role |
|------|------|
| `models.py` | SQLAlchemy ORM table definitions |
| `schemas.py` | Pydantic request/response schemas |
| `routers.py` | FastAPI route handlers, mounted in `main.py` |
| `services.py` | Business logic (called by routers) |

Database setup lives in `back/src/config/database.py`. Tables are auto-created on startup via `Base.metadata.create_all()`. Sessions are injected via the `get_db()` dependency.

New modules must be:
1. Created under `back/src/<module>/`
2. Registered in `back/main.py` with `app.include_router(...)`

### Environment

Backend requires a `.env` file (based on `env.sample`):
```
DATABASE_URL = "postgresql://username:password@host:port/database?sslmode=require"
```

### CORS

CORS is currently open to all origins in `main.py` — suitable for local development only.
