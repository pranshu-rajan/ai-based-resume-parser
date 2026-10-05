import os
import time
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import init_db, get_db
from app.db.repository import DataRepository
from app.api.v1.endpoints import parser, jobs, match, ats_optimizer

# Initialize database tables on startup
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI Talent Intelligence, Multi-Format Resume Evaluation, and ATS Optimization Engine (2026 Edition)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration supporting Local, Vercel deployments, and custom domains
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any Vercel preview branch or production domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Performance profiling middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Register API routers
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(parser.router, prefix=settings.API_V1_STR)
app.include_router(match.router, prefix=settings.API_V1_STR)
app.include_router(ats_optimizer.router, prefix=settings.API_V1_STR)

@app.get(f"{settings.API_V1_STR}/evaluations/history", tags=["History & Analytics"])
def get_evaluation_history(db: Session = Depends(get_db)):
    """Retrieve historical candidate evaluations stored in database."""
    records = DataRepository.get_recent_evaluations(db)
    return [
        {
            "id": r.id,
            "candidate_name": r.candidate_name,
            "file_name": r.file_name,
            "overall_score": r.overall_score,
            "match_tier": r.match_tier,
            "skills_score": r.skills_score,
            "experience_score": r.experience_score,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "verdict": r.verdict
        }
        for r in records
    ]

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "timestamp": time.time()
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
