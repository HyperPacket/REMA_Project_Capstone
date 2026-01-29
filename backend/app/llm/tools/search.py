"""
==============================================================================
REMA Backend - Property Search Tool
==============================================================================

WHAT IT DOES:
    LLM tool for searching properties based on user criteria.
    Queries the database with filters and returns matching properties.

HOW IT WORKS:
    - Accepts search criteria (city, type, price range, bedrooms, etc.)
    - Queries property_listing table with filters
    - Returns top matching properties

INPUTS:
    city, property_type, min_price, max_price, bedrooms, listing_type, limit

OUTPUTS:
    List of property dictionaries matching criteria

==============================================================================
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from app.models.property import Property


def search_properties_tool(
    db: Session,
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    bedrooms: Optional[str] = None,
    listing_type: Optional[str] = None,
    limit: int = 5
) -> dict:
    """
    Search properties based on criteria.
    
    Returns structured data for LLM to interpret.
    """
    query = db.query(Property)
    
                   
    if city:
        query = query.filter(func.lower(Property.city) == city.lower())
    
    if property_type:
        query = query.filter(func.lower(Property.type) == property_type.lower())
    
    if listing_type:
        query = query.filter(func.lower(Property.listing) == listing_type.lower())
    
    if min_price is not None:
        query = query.filter(Property.price_clean >= min_price)
    
    if max_price is not None:
        query = query.filter(Property.price_clean <= max_price)
    
    if bedrooms:
        if bedrooms.lower() == "studio":
            query = query.filter(func.lower(Property.bedroom) == "studio")
        else:
            query = query.filter(Property.bedroom == bedrooms)
    
                                  
    query = query.order_by(desc(Property.id))
    
                 
    properties = query.limit(limit).all()
    
    if not properties:
        return {
            "success": False,
            "message": "No properties found matching your criteria.",
            "count": 0,
            "properties": [],
            "display_type": "text"
        }
    
    return {
        "success": True,
        "message": f"Found {len(properties)} properties matching your criteria.",
        "count": len(properties),
        "properties": [p.to_dict() for p in properties],
        "display_type": "property_cards"
    }
