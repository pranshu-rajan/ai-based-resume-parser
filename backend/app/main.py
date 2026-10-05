from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.config import settings
from app.api.v1.endpoints import parser, jobs, match, ats_optimizer

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI Talent Intelligence, Multi-Format Resume Evaluation, and ATS Optimization Engine (2026 Edition)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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
