"""
==============================================================================
REMA Backend - User Schemas
==============================================================================

WHAT IT DOES:
    Pydantic schemas for user-related API requests and responses.
    Handles registration, login, and profile data.

HOW IT WORKS:
    - UserCreate: Registration data with password
    - UserLogin: Login credentials
    - UserResponse: Safe user data for responses (no password)
    - UserUpdate: Profile update fields

KEY SCHEMAS:
    - UserCreate: POST /auth/register
    - UserLogin: POST /auth/login
    - UserResponse: GET /auth/me response

==============================================================================
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=6, max_length=100, description="Password (min 6 chars)")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    """Schema for user data in responses (no password)."""
    id: str = Field(..., description="User UUID")
    name: str = Field(..., description="User's name")
    email: str = Field(..., description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    is_admin: bool = Field(False, description="Admin role flag")
    created_at: Optional[datetime] = Field(None, description="Registration date")
    watchlist: List[int] = Field(default_factory=list, description="User's watchlist property IDs")
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class LoginResponse(BaseModel):
    """Response after successful login."""
    message: str = "Login successful"
    user: UserResponse


class UserListResponse(BaseModel):
    """Schema for paginated user list."""
    items: List[UserResponse]
    total: int
    page: int
    pages: int
    has_next: bool
    has_prev: bool
