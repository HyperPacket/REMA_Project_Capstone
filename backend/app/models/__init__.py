"""
==============================================================================
REMA Backend - Models Package
==============================================================================

This package contains SQLAlchemy ORM models that map to database tables.

Models:
    - Property: Real estate property listings
    - User: User accounts for authentication
    - Watchlist: User's saved properties

Usage:
    from app.models import Property, User, Watchlist

==============================================================================
"""

from app.models.property import Property
from app.models.user import User
from app.models.watchlist import Watchlist

__all__ = ["Property", "User", "Watchlist"]
