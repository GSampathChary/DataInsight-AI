import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import init_db
from app.config.config import UPLOADS_DIR, MODELS_DIR, REPORTS_DIR

from app.api.upload import router as upload_router
from app.api.analysis import router as analysis_router
from app.api.visualization import router as visualization_router
from app.api.insights import router as insights_router
from app.api.ml_studio import router as ml_studio_router
from app.api.reports import router as reports_router
from app.api.health import router as health_router

app = FastAPI(
    title="DataInsight AI Engine",
    description="Backend API for AI-powered Data Analytics, Business Intelligence & AutoML Platform",
    version="1.0.0"
)

# Enable CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to initialize SQLite database
@app.on_event("startup")
def startup_event():
    init_db()

# Mount static file directories for model downloads and reports
app.mount("/static/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/static/models", StaticFiles(directory=str(MODELS_DIR)), name="models")
app.mount("/static/reports", StaticFiles(directory=str(REPORTS_DIR)), name="reports")

# Include API Routers
app.include_router(upload_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(visualization_router, prefix="/api")
app.include_router(insights_router, prefix="/api")
app.include_router(ml_studio_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(health_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to DataInsight AI Backend Engine API",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
