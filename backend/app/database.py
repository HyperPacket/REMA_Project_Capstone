"""
==============================================================================
REMA Backend - Database Module
==============================================================================

WHAT IT DOES:
    Manages PostgreSQL database connection using SQLAlchemy.
    Provides session management for database operations.

HOW IT WORKS:
    - Creates SQLAlchemy engine from DATABASE_URL
    - Provides SessionLocal factory for creating DB sessions
    - Offers get_db dependency for FastAPI route injection

KEY COMPONENTS:
    - engine: SQLAlchemy engine instance
    - SessionLocal: Session factory
    - Base: Declarative base for ORM models
    - get_db: FastAPI dependency for database sessions

USAGE:
    from app.database import get_db, Base
    
    # In FastAPI route:
    @app.get("/items")
    def get_items(db: Session = Depends(get_db)):
        return db.query(Item).all()

INPUTS:
    DATABASE_URL from config.py

OUTPUTS:
    Database session for CRUD operations

==============================================================================
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config import settings


                          
                                                                            
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,                                       
    pool_size=10,                              
    max_overflow=20                                               
)

                 
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

                           
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.
    
    Yields:
        Session: SQLAlchemy database session
        
    Usage:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
