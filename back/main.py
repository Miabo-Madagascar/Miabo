"""
Point d'entrée FastAPI — MIABO v2.
Démarre : uvicorn main:app --reload
Docs    : http://localhost:8000/docs
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.database import engine, Base
from src.routers import (
    auth, profiles, tutors, sessions,
    payments, wallet, matching, messages,
    assessments, self_assessments, resources, admin, reports, notifications,
)
from src.routers import ai as ai_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crée les tables manquantes au démarrage (dev uniquement)
    # En prod : utiliser Alembic exclusivement
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MIABO API",
    description="API REST de la plateforme de tutorat MIABO Madagascar",
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS — à restreindre en production ────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth.router,        prefix=API_PREFIX)
app.include_router(profiles.router,    prefix=API_PREFIX)
app.include_router(tutors.router,      prefix=API_PREFIX)
app.include_router(sessions.router,    prefix=API_PREFIX)
app.include_router(payments.router,    prefix=API_PREFIX)
app.include_router(wallet.router,      prefix=API_PREFIX)
app.include_router(matching.router,    prefix=API_PREFIX)
app.include_router(messages.router,    prefix=API_PREFIX)
app.include_router(assessments.router, prefix=API_PREFIX)
app.include_router(self_assessments.router, prefix=API_PREFIX)
app.include_router(resources.router,   prefix=API_PREFIX)
app.include_router(admin.router,       prefix=API_PREFIX)
app.include_router(reports.router,     prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(ai_router.router,    prefix=API_PREFIX)


@app.get("/health", tags=["Santé"])
@app.get(f"{API_PREFIX}/health", tags=["Santé"])
async def health_check():
    """Endpoint de santé — utilisé par le load balancer et le proxy."""
    return {"status": "ok", "version": "2.0.0"}


