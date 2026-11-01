from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app import models
from app.database import engine
from app.routers.engagement import router as engagement_router
from app.routers.events import router as events_router
from app.routers.students import router as students_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(
    title="Campus Connect API",
    description="Backend API for Campus Connect",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events_router)
app.include_router(engagement_router)
app.include_router(students_router)


@app.get("/")
def root():
    return {
        "message": "Campus Connect API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }