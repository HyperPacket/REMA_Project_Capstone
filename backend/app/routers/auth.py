"""
==============================================================================
REMA Backend - Authentication Router
==============================================================================

WHAT IT DOES:
    Handles user authentication endpoints.
    Manages registration, login, logout, and session-based auth.

HOW IT WORKS:
    1. Registration: Creates user with hashed password
    2. Login: Verifies credentials, sets session cookie
    3. Logout: Clears session cookie
    4. Me: Returns current user from session

KEY ENDPOINTS:
    - POST /auth/register: Create new user account
    - POST /auth/login: Login and get session
    - POST /auth/logout: Clear session
    - GET /auth/me: Get current user profile

SESSION MANAGEMENT:
    Uses itsdangerous for signed cookies. Session ID stored in cookie,
    validated on each request to /auth/me.

==============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
import uuid
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.watchlist import Watchlist
from app.schemas.user import UserCreate, UserLogin, UserResponse, LoginResponse, UserUpdate
from app.config import settings
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

router = APIRouter(prefix="/auth", tags=["Authentication"])

                                       
serializer = URLSafeTimedSerializer(settings.SESSION_SECRET_KEY)

                         
SESSION_COOKIE_NAME = "rema_session"
SESSION_MAX_AGE = settings.SESSION_EXPIRE_SECONDS


def create_session_token(user_id: str) -> str:
    """Create a signed session token for a user."""
    return serializer.dumps({"user_id": user_id, "created": datetime.utcnow().isoformat()})


def verify_session_token(token: str) -> Optional[str]:
    """Verify a session token and return user_id if valid."""
    try:
        data = serializer.loads(token, max_age=SESSION_MAX_AGE)
        return data.get("user_id")
    except (BadSignature, SignatureExpired):
        return None


def get_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """
    Dependency to get the current authenticated user from session.
    Returns None if not authenticated.
    """
    session_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_token:
        return None
    
    user_id = verify_session_token(session_token)
    if not user_id:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user


def require_auth(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Dependency that requires authentication.
    Raises 401 if not authenticated.
    """
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def require_admin(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Dependency that requires admin authentication.
    Raises 403 if not admin.
    """
    user = require_auth(request, db)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.post("/register", response_model=UserResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a user with hashed password and returns user data.
    """
                                   
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
                 
    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=User.hash_password(data.password),
        phone=data.phone
    )
    
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        is_admin=user.is_admin,
        created_at=user.created_at,
        watchlist=[]
    )


@router.post("/login", response_model=LoginResponse)
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Login and create session.
    
    Verifies credentials and sets session cookie.
    """
               
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
                     
    if not user.verify_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
                          
    watchlist_items = db.query(Watchlist.property_id).filter(
        Watchlist.user_id == user.id
    ).all()
    watchlist_ids = [item[0] for item in watchlist_items]
    
                          
    session_token = create_session_token(str(user.id))
    
                        
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False                                        
    )
    
    return LoginResponse(
        message="Login successful",
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            phone=user.phone,
            is_admin=user.is_admin,
            created_at=user.created_at,
            watchlist=watchlist_ids
        )
    )


@router.post("/logout")
def logout(response: Response):
    """
    Logout and clear session.
    
    Removes the session cookie.
    """
    response.delete_cookie(SESSION_COOKIE_NAME)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(request: Request, db: Session = Depends(get_db)):
    """
    Get current authenticated user.
    
    Returns user profile including watchlist.
    """
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
                          
    watchlist_items = db.query(Watchlist.property_id).filter(
        Watchlist.user_id == user.id
    ).all()
    watchlist_ids = [item[0] for item in watchlist_items]
    
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        is_admin=user.is_admin,
        created_at=user.created_at,
        watchlist=watchlist_ids
    )


@router.put("/me", response_model=UserResponse)
def update_me(data: UserUpdate, request: Request, db: Session = Depends(get_db)):
    """
    Update current user's profile.
    
    Allows updating name and phone.
    """
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
                               
    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    
    db.commit()
    db.refresh(user)
    
                   
    watchlist_items = db.query(Watchlist.property_id).filter(
        Watchlist.user_id == user.id
    ).all()
    watchlist_ids = [item[0] for item in watchlist_items]
    
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        is_admin=user.is_admin,
        created_at=user.created_at,
        watchlist=watchlist_ids
    )
