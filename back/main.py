from fastapi import Depends, FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from contextlib import asynccontextmanager
from src.config.database import engine, get_db, Base
from src.test.routers import router as test_touter

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Application startup... 🚀")
    Base.metadata.create_all(bind=engine)
    yield
    print("🛑 Application shutdownnnnnnnnn 🛑")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(test_touter, prefix="/test")
