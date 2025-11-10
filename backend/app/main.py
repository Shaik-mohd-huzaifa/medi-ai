from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import openai_router
from app.routes.transcription import router as transcription_router
from app.routes.voice import router as voice_router
from app.routes.websocket import router as websocket_router
from app.routes.auth import router as auth_router
from app.routes.caregivers import router as caregivers_router
from app.database import engine, Base
from app.models.user import User, PatientProfile, CaregiverProfile

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(caregivers_router)
app.include_router(openai_router)
app.include_router(transcription_router)
app.include_router(voice_router)
app.include_router(websocket_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Medi-AI FastAPI Backend",
        "version": settings.api_version,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.api_version}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
