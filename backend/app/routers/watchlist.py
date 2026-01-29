"""
==============================================================================
REMA Backend - Watchlist Router
==============================================================================

WHAT IT DOES:
    Manages user watchlists - saved/favorite properties.
    Authenticated users can add/remove properties from their watchlist.

HOW IT WORKS:
    - GET /watchlist: Returns user's saved properties
    - POST /watchlist/{id}: Adds property to watchlist
    - DELETE /watchlist/{id}: Removes property from watchlist

KEY ENDPOINTS:
    All endpoints require authentication via session cookie.

RETURNS:
    List of Property objects in the user's watchlist.

==============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.database import get_db
from app.models.property import Property
from app.models.watchlist import Watchlist
from app.models.user import User
from app.schemas.property import PropertyResponse
from app.routers.auth import require_auth

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", response_model=List[PropertyResponse])
def get_watchlist(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """
    Get user's watchlist.
    
    Returns all properties in the authenticated user's watchlist.
    """
                                   
    watchlist_items = db.query(Watchlist.property_id).filter(
        Watchlist.user_id == user.id
    ).all()
    
    property_ids = [item[0] for item in watchlist_items]
    
    if not property_ids:
        return []
    
                          
    properties = db.query(Property).filter(Property.id.in_(property_ids)).all()
    
    return [PropertyResponse(**p.to_dict()) for p in properties]


@router.post("/{property_id}", response_model=dict)
def add_to_watchlist(
    property_id: int,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    Add property to watchlist.
    
    Adds the specified property to the authenticated user's watchlist.
    """
                              
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
                                   
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == user.id,
        Watchlist.property_id == property_id
    ).first()
    
    if existing:
        return {"message": "Property already in watchlist", "property_id": property_id}
    
                      
    watchlist_item = Watchlist(user_id=user.id, property_id=property_id)
    
    try:
        db.add(watchlist_item)
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"message": "Property already in watchlist", "property_id": property_id}
    
    return {"message": "Property added to watchlist", "property_id": property_id}


@router.delete("/{property_id}", response_model=dict)
def remove_from_watchlist(
    property_id: int,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    Remove property from watchlist.
    
    Removes the specified property from the authenticated user's watchlist.
    """
                         
    watchlist_item = db.query(Watchlist).filter(
        Watchlist.user_id == user.id,
        Watchlist.property_id == property_id
    ).first()
    
    if not watchlist_item:
        raise HTTPException(status_code=404, detail="Property not in watchlist")
    
    db.delete(watchlist_item)
    db.commit()
    
    return {"message": "Property removed from watchlist", "property_id": property_id}
