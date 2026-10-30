from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.tutor import router as tutor_router
import datetime

app = FastAPI(
    title="InvestLab AI Finance Tutor Service",
    description="Intelligent financial literacy and education assistance for simulated investing.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tutor_router)

@app.get("/")
def read_root():
    return {
        "service": "InvestLab AI Finance Tutor",
        "status": "online",
        "documentation": "/docs",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-tutor",
        "version": "1.0.0"
    }
