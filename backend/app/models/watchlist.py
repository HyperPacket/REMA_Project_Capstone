"""
==============================================================================
REMA Backend - Watchlist Model
==============================================================================

WHAT IT DOES:
    SQLAlchemy ORM model for user watchlists.
    Links users to their saved/favorite properties.

HOW IT WORKS:
    - Many-to-many relationship between users and properties
    - Unique constraint prevents duplicate entries
    - Tracks when property was added to watchlist

KEY FIELDS:
    - id: Auto-increment primary key
    - user_id: Foreign key to users table
    - property_id: Foreign key to property_listing table
    - created_at: When added to watchlist

==============================================================================
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Watchlist(Base):
    """
    SQLAlchemy model for user watchlists.
    Links users to their saved properties.
    """
    
    __tablename__ = "watchlist"
    
                 
    id = Column(Integer, primary_key=True, autoincrement=True)
    
                  
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(Integer, ForeignKey("property_listing.id", ondelete="CASCADE"), nullable=False)
    
               
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
                                       
    __table_args__ = (
        UniqueConstraint("user_id", "property_id", name="unique_user_property"),
    )
    
    def __repr__(self):
        return f"<Watchlist(user_id={self.user_id}, property_id={self.property_id})>"
