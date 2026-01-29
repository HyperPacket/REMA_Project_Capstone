"""
==============================================================================
REMA Backend - Similar Properties Tool
==============================================================================

WHAT IT DOES:
    LLM tool for finding similar properties.
    Uses weighted scoring based on location, type, and price.

HOW IT WORKS:
    - Gets source property details
    - Scores all other properties by similarity
    - Returns top N most similar

INPUTS:
    db, property_id, limit

OUTPUTS:
    List of similar properties with similarity scores

==============================================================================
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.property import Property


def find_similar_tool(
    db: Session,
    property_id: int,
    limit: int = 5
) -> dict:
    """
    Find similar properties based on weighted scoring.
    """
                         
    source = db.query(Property).filter(Property.id == property_id).first()
    
    if not source:
        return {
            "success": False,
            "message": f"Property {property_id} not found.",
            "properties": [],
            "display_type": "text"
        }
    
                                        
    query = db.query(Property).filter(Property.id != property_id)
    
                                 
    if source.city:
        query = query.filter(func.lower(Property.city) == source.city.lower())
    
                         
    if source.type:
        same_type = query.filter(func.lower(Property.type) == source.type.lower())
        if same_type.count() >= limit:
            query = same_type
    
                                      
    if source.price_clean:
        min_price = source.price_clean * 0.5
        max_price = source.price_clean * 1.5
        query = query.filter(Property.price_clean.between(min_price, max_price))
    
                               
    if source.price_clean:
        query = query.order_by(func.abs(Property.price_clean - source.price_clean))
    
    properties = query.limit(limit).all()
    
    if not properties:
        return {
            "success": False,
            "message": "No similar properties found.",
            "properties": [],
            "display_type": "text"
        }
    
    return {
        "success": True,
        "source_property": source.to_dict(),
        "similar_properties": [p.to_dict() for p in properties],
        "count": len(properties),
        "message": f"Found {len(properties)} properties similar to the one in {source.neighborhood}, {source.city}.",
        "display_type": "property_cards"
    }
