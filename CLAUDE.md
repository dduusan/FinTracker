# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinTracker — personal finance tracker (income, expenses, budgets, statistics). Monorepo with `frontend/` and `backend/` folders.

## Tech Stack

**Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic
**Database:** PostgreSQL + Redis
**Testing:** pytest + httpx
**Infrastructure:** Docker, Docker Compose, GitHub Actions
**Frontend (future):** React + Next.js

## Backend Architecture

Modular structure under `backend/src/modules/`, each module has:
- `router.py` — FastAPI endpoints
- `service.py` — business logic and DB queries
- `schemas.py` — Pydantic request/response models

Modules: auth, transactions, categories, budgets, dashboard

Shared code:
- `src/config/` — settings (pydantic-settings), database engine/session, SQLAlchemy models
- `src/middleware/` — error handlers, auth, validation, rate limiting
- `src/utils/` — custom error classes, logger

## Commands

```bash
# Backend (run from backend/ directory)
python -m venv venv && venv\Scripts\activate   # Create & activate venv (Windows)
pip install -r requirements.txt                 # Install dependencies
python src/app.py                               # Run dev server (uvicorn with reload)
alembic upgrade head                            # Run DB migrations
alembic revision --autogenerate -m "desc"       # Generate new migration
pytest                                          # Run all tests
pytest tests/unit -k "test_name"                # Run single test
```

## Conventions

- Async everywhere — async SQLAlchemy sessions, async FastAPI endpoints
- All API routes prefixed with `/api/`
- Validation via Pydantic schemas (integrated with FastAPI)
- Custom error classes (AppError, NotFoundError, ValidationError, AuthError) with centralized handler
- Environment config via `.env` loaded through pydantic-settings
- Code in English, user-facing strings in Serbian (Latin)
