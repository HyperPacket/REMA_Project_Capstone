"""
==============================================================================
REMA Backend - Routers Package
==============================================================================

This package contains FastAPI route handlers organized by domain.

Routers:
    - properties: Property listing and detail endpoints
    - prediction: ML price prediction endpoint
    - auth: User authentication endpoints (to be added)
    - chat: LLM chat endpoints (to be added)
    - watchlist: User watchlist endpoints (to be added)
    - admin: Admin panel endpoints (to be added)

Usage:
    from app.routers import properties, prediction
    app.include_router(properties.router)

==============================================================================
"""

from app.routers import properties, prediction

__all__ = ["properties", "prediction"]
