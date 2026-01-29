"""
==============================================================================
REMA Backend - FastAPI Application Entry Point
==============================================================================

WHAT IT DOES:
    Main FastAPI application that serves the REMA backend API.
    Sets up middleware, routers, and startup events.

HOW IT WORKS:
    1. Creates FastAPI app instance with metadata
    2. Configures CORS middleware for frontend access
    3. Registers all API routers (properties, prediction, auth, chat)
    4. Sets up startup event to preload ML model

KEY COMPONENTS:
    - FastAPI app instance
    - CORS middleware configuration
    - Router registration
    - Startup event handlers

ENDPOINTS:
    - GET /: Health check / welcome message
    - GET /health: API health status
    - /properties/*: Property listing endpoints
    - /predict: ML price prediction
    - /auth/*: Authentication (to be added)
    - /chat/*: LLM chat (to be added)

USAGE:
    Run with: uvicorn app.main:app --reload --port 8000

==============================================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.routers import properties, prediction
from app.routers import auth, watchlist
from app.routers import chat
from app.routers import admin


logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)




app = FastAPI(
    title="REMA API",
    description="""
    #### API Stuffy Stuffs
    **REMA** - Real Estate Market Assistant for Jordan
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)




app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.on_event("startup")
async def startup_event():
    """
    Runs on application startup.
    Preloads the ML model for faster first prediction.
    Creates database tables if they don't exist.
    """
    logger.info("Starting REMA Backend...")
    logger.info(f"CORS Origins: {settings.cors_origins_list}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    
    try:
        from app.database import engine, Base
        from app.models import User, Watchlist                             
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.warning(f"Could not create database tables: {e}")
    
    try:
        from app.ml.pipeline import get_pipeline
        get_pipeline()
        logger.info("ML pipeline loaded successfully")
    except Exception as e:
        logger.warning(f"Could not preload ML pipeline: {e}")




app.include_router(properties.router)
app.include_router(prediction.router)
app.include_router(auth.router)
app.include_router(watchlist.router)
app.include_router(chat.router)
app.include_router(admin.router)


                                 
                                  




@app.get("/", tags=["Root"])
def root():
    """
    Welcome endpoint and API info.
    """
    return {
        "message": "Welcome to REMA API",
        "description": "Real Estate Market Assistant for Jordan",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Root"])
def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {
        "status": "healthy",
        "service": "REMA API",
        "version": "1.0.0"
    }
