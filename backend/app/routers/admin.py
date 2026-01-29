from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models.property import Property
from app.models.user import User
from app.models.watchlist import Watchlist
from app.routers.auth import require_admin
from app.schemas.property import PropertyResponse, PropertyListResponse
from app.schemas.user import UserResponse, UserListResponse
from pydantic import BaseModel, Field
import math

router = APIRouter(prefix="/admin", tags=["Admin"])


class DashboardStats(BaseModel):
    """Statistics for admin dashboard."""
    total_properties: int
    total_users: int
    properties_for_sale: int
    properties_for_rent: int
    total_watchlist_items: int

class PropertyUpdate(BaseModel):
    """Schema for updating property fields."""
    type: Optional[str] = None
    furnishing: Optional[str] = None
    surface_area: Optional[float] = None
    bedroom: Optional[str] = None
    bathroom: Optional[float] = None
    floor: Optional[str] = None
    price_clean: Optional[float] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    listing: Optional[str] = None


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get simplified dashboard statistics for admin panel.
    """
    return DashboardStats(
        total_properties=db.query(Property).count(),
        total_users=db.query(User).count(),
        properties_for_sale=db.query(Property).filter(func.lower(Property.listing) == "sale").count(),
        properties_for_rent=db.query(Property).filter(func.lower(Property.listing) == "rent").count(),
        total_watchlist_items=db.query(Watchlist).count()
    )


@router.get("/properties", response_model=PropertyListResponse)
def list_all_properties(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    city: Optional[str] = None,
    type: Optional[str] = None,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all properties with search (ID/Location).
    """
    query = db.query(Property)
    
    if search:
        search_term = search.lower()
                                        
        if search_term.isdigit():
            query = query.filter(Property.id == int(search_term))
        else:
                                       
            query = query.filter(
                or_(
                    func.lower(Property.city).contains(search_term),
                    func.lower(Property.neighborhood).contains(search_term)
                )
            )

    if city:
        query = query.filter(func.lower(Property.city) == city.lower())
    
    if type:
        query = query.filter(func.lower(Property.type) == type.lower())
    
    total = query.count()
    offset = (page - 1) * limit
    properties = query.offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return PropertyListResponse(
        items=[PropertyResponse(**p.to_dict()) for p in properties],
        total=total,
        page=page,
        pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )


@router.put("/properties/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    updates: PropertyUpdate,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a property's details."""
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(property, field, value)
    
    db.commit()
    db.refresh(property)
    return PropertyResponse(**property.to_dict())


@router.delete("/properties/{property_id}")
def delete_property(
    property_id: int,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a property."""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.query(Watchlist).filter(Watchlist.property_id == property_id).delete()
    db.delete(property)
    db.commit()
    return {"message": f"Property {property_id} deleted successfully"}


@router.get("/users", response_model=UserListResponse)
def list_all_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users with search (Name/Email).
    """
    query = db.query(User)
    
    if search:
        search_term = search.lower()
        query = query.filter(
            or_(
                func.lower(User.email).contains(search_term),
                func.lower(User.name).contains(search_term)
            )
        )
    
    total = query.count()
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return UserListResponse(
        items=[
            UserResponse(
                id=str(u.id),
                name=u.name,
                email=u.email,
                phone=u.phone,
                is_admin=u.is_admin,
                created_at=u.created_at,
                watchlist=[]                                          
            ) for u in users
        ],
        total=total,
        page=page,
        pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a user."""
                           
    if str(admin.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    
                        
    db.query(Watchlist).filter(Watchlist.user_id == user_to_delete.id).delete()
    
    db.delete(user_to_delete)
    db.commit()
    return {"message": f"User {user_to_delete.email} deleted successfully"}
