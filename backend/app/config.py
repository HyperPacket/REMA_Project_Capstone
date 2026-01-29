"""
==============================================================================
REMA Backend - Configuration Module
==============================================================================

WHAT IT DOES:
    Loads and validates environment variables from .env file.
    Provides a centralized Settings object for the entire application.

HOW IT WORKS:
    Uses Pydantic Settings to automatically read from environment variables
    and .env file. All configuration is accessed via the global `settings` object.

KEY CLASSES:
    - Settings: Pydantic BaseSettings class containing all configuration.

USAGE:
    from app.config import settings
    print(settings.DATABASE_URL)

INPUTS:
    Reads from environment variables or .env file.

OUTPUTS:
    Exposes `settings` object with typed configuration values.

==============================================================================
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        DATABASE_URL: PostgreSQL connection string
        SESSION_SECRET_KEY: Secret key for session signing
        OLLAMA_HOST: Ollama API host URL
        OLLAMA_MODEL: LLM model name
        CORS_ORIGINS: Allowed CORS origins (comma-separated string)
        DEBUG: Debug mode flag
    """
    
              
    DATABASE_URL: str = "postgresql://postgres:306262@localhost:5432/rema"
    
                      
    SESSION_SECRET_KEY: str = "rema-dev-secret-key-change-in-production"
    SESSION_EXPIRE_SECONDS: int = 60 * 60 * 24 * 7          
    
                       
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "nemotron-3-nano:30b-cloud"
    
          
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
           
    DEBUG: bool = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


                          
settings = Settings()
