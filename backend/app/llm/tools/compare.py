"""
==============================================================================
REMA Backend - Property Comparison Tool
==============================================================================

WHAT IT DOES:
    LLM tool for comparing 2-3 properties side-by-side.
    Provides comparison table and best value recommendation.

HOW IT WORKS:
    - Fetches properties by IDs
    - Builds comparison table
    - Calculates price per sqm
    - Recommends best value

INPUTS:
    db, property_ids (list of 2-3 IDs)

OUTPUTS:
    Comparison table with recommendation

==============================================================================
"""

from sqlalchemy.orm import Session
from app.models.property import Property


def compare_properties_tool(
    db: Session,
    property_ids: list
) -> dict:
    """
    Compare 2-3 properties side-by-side.
    """
    if len(property_ids) < 2:
        return {
            "success": False,
            "message": "Need at least 2 properties to compare.",
            "display_type": "text"
        }
    
    if len(property_ids) > 3:
        property_ids = property_ids[:3]              
    
                      
    properties = []
    for pid in property_ids:
        prop = db.query(Property).filter(Property.id == pid).first()
        if prop:
            properties.append(prop)
    
    if len(properties) < 2:
        return {
            "success": False,
            "message": "Could not find enough properties for comparison.",
            "display_type": "text"
        }
    
                           
    comparison = []
    for p in properties:
        price_per_sqm = (p.price_clean / p.surface_area) if p.surface_area else 0
        comparison.append({
            "id": p.id,
            "location": f"{p.neighborhood}, {p.city}",
            "type": p.type,
            "price": int(p.price_clean) if p.price_clean else 0,
            "size": p.surface_area,
            "price_per_sqm": round(price_per_sqm),
            "bedrooms": p.bedroom,
            "bathrooms": int(p.bathroom) if p.bathroom else 0,
            "furnishing": p.furnishing,
            "listing": p.listing
        })
    
                                            
    best = min(comparison, key=lambda x: x["price_per_sqm"] if x["price_per_sqm"] > 0 else float('inf'))
    
    return {
        "success": True,
        "properties": comparison,
        "recommendation": {
            "best_value_id": best["id"],
            "best_value_location": best["location"],
            "reason": f"Best value at {best['price_per_sqm']:,} JOD/m²"
        },
        "message": f"Compared {len(properties)} properties. **{best['location']}** offers the best value "
                   f"at {best['price_per_sqm']:,} JOD per square meter.",
        "display_type": "comparison_table"
    }
