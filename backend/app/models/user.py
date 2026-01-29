"""
==============================================================================
REMA Backend - User Model
==============================================================================

WHAT IT DOES:
    SQLAlchemy ORM model for user accounts.
    Manages user authentication, profiles, and admin roles.

HOW IT WORKS:
    - Stores user credentials with bcrypt-hashed passwords
    - Supports admin role via is_admin flag
    - Provides methods for password verification

KEY FIELDS:
    - id: UUID primary key
    - email: Unique email address
    - name: User's display name
    - password_hash: Bcrypt hashed password
    - phone: Optional phone number
    - is_admin: Admin role flag
    - created_at: Registration timestamp

METHODS:
    - verify_password(): Check password against hash
    - to_dict(): Convert to JSON-safe dictionary

==============================================================================
"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
from passlib.context import CryptContext
import uuid

                          
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    """
    SQLAlchemy model for user accounts.
    """
    
    __tablename__ = "users"
    
                        
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
               
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    
                    
    password_hash = Column(String(255), nullable=False)
    
          
    is_admin = Column(Boolean, default=False)
    
                
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plain text password."""
        return pwd_context.hash(password)
    
    def verify_password(self, password: str) -> bool:
        """Verify a password against the hash."""
        return pwd_context.verify(password, self.password_hash)
    
    def to_dict(self) -> dict:
        """Convert user to dictionary (without password)."""
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
    
    def __repr__(self):
        return f"<User(email={self.email})>"
