"""
==============================================================================
REMA Backend - Properties Router
==============================================================================

WHAT IT DOES:
    Handles all property-related API endpoints.
    Provides listing, filtering, sorting, and detail views.

HOW IT WORKS:
    - GET /properties: List properties with filters, sorting, pagination
    - GET /properties/{id}: Get single property details
    - GET /properties/opportunities: Get undervalued properties

KEY ENDPOINTS:
    - GET /properties
    - GET /properties/{id}
    - GET /properties/opportunities
    - GET /properties/{id}/similar

QUERY PARAMETERS:
    city, type, listing, min_price, max_price, bedrooms, furnishing,
    sort (price_asc, price_desc, date_desc, valuation), page, limit

RETURNS:
    PropertyListResponse for lists, PropertyResponse for single property

==============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, Integer
from typing import Optional, List
import math

from app.database import get_db
from app.models.property import Property
from app.schemas.property import (
    PropertyResponse,
    PropertyFilter,
    PropertyListResponse,
    SortOption,
)


router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db)):
    """
    Get available filter options from the database.
    
    Returns distinct cities for filter dropdowns.
    """
                         
    cities = db.query(Property.city).distinct().order_by(Property.city).all()
    cities_list = [c[0] for c in cities if c[0]]
    
    return {"cities": cities_list}


@router.get("", response_model=PropertyListResponse)
def get_properties(
             
    city: Optional[str] = Query(None, description="Filter by city"),
    type: Optional[str] = Query(None, description="Filter by property type"),
    listing: Optional[str] = Query(None, description="Filter by listing type (rent/sale)"),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    bedrooms: Optional[str] = Query(None, description="Filter by bedrooms"),
    bathrooms: Optional[str] = Query(None, description="Filter by bathrooms"),
    furnishing: Optional[str] = Query(None, description="Filter by furnishing"),
    search: Optional[str] = Query(None, description="Search in city, neighborhood, description"),
             
    sort: SortOption = Query(SortOption.DATE_DESC, description="Sort order"),
                
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
              
    db: Session = Depends(get_db)
):
    """
    List properties with filtering, sorting, and pagination.
    
    Returns paginated list of properties matching the specified criteria.
    """
                 
    query = db.query(Property)
    
                                                             
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(Property.city).like(search_term)) |
            (func.lower(Property.neighborhood).like(search_term)) |
            (func.lower(Property.type).like(search_term))
        )
    
                   
    if city:
        query = query.filter(func.lower(Property.city) == city.lower())
    
    if type:
        query = query.filter(func.lower(Property.type) == type.lower())
    
    if listing:
        query = query.filter(func.lower(Property.listing) == listing.lower())
    
    if min_price is not None:
        query = query.filter(Property.price_clean >= min_price)
    
    if max_price is not None:
        query = query.filter(Property.price_clean <= max_price)
    
    if bedrooms:
        if bedrooms.lower() == "studio":
            query = query.filter(func.lower(Property.bedroom) == "studio")
        elif bedrooms == "4+":
                                
            query = query.filter(
                (Property.bedroom.cast(Integer) >= 4) |
                (func.lower(Property.bedroom).like("%4%")) |
                (func.lower(Property.bedroom).like("%5%")) |
                (func.lower(Property.bedroom).like("%6%"))
            )
        else:
            query = query.filter(Property.bedroom == bedrooms)
    
    if bathrooms:
        if bathrooms == "6+":
            query = query.filter(Property.bathroom >= 6)
        else:
            try:
                                                      
                val = float(bathrooms)
                query = query.filter(Property.bathroom == val)
            except ValueError:
                pass
    
    if furnishing:
        query = query.filter(func.lower(Property.furnishing) == furnishing.lower())
    
                                       
    total = query.count()
    
                   
    if sort == SortOption.PRICE_ASC:
        query = query.order_by(asc(Property.price_clean))
    elif sort == SortOption.PRICE_DESC:
        query = query.order_by(desc(Property.price_clean))
    elif sort == SortOption.DATE_DESC:
                                                                                      
        query = query.order_by(desc(Property.id))
    elif sort == SortOption.VALUATION:
                                                                          
        query = query.order_by(desc(Property.id))
    
                      
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


@router.get("/opportunities", response_model=PropertyListResponse)
def get_opportunities(
             
    city: Optional[str] = Query(None, description="Filter by city"),
    type: Optional[str] = Query(None, description="Filter by property type"),
    listing: Optional[str] = Query(None, description="Filter by listing type (rent/sale)"),
    min_discount: Optional[float] = Query(None, description="Minimum discount percentage (e.g., 50 for 50% undervalued)"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    bedrooms: Optional[str] = Query(None, description="Filter by bedrooms"),
    search: Optional[str] = Query(None, description="Search city, neighborhood, type"),
                
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get undervalued properties (opportunities).
    
    Returns properties where valuation_percentage is negative (undervalued).
    Properties are sorted by best deals first (most undervalued).
    
    Args:
        min_discount: Minimum discount percentage. E.g., 50 means at least 50% below market.
    """
                                            
    query = db.query(Property).filter(
        Property.valuation == 'undervalued',
        Property.valuation_percentage.isnot(None)
    )
    
                                   
                                                                                  
    if min_discount is not None:
        query = query.filter(Property.valuation_percentage <= -min_discount)
    
                         
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (func.lower(Property.city).like(search_term)) |
            (func.lower(Property.neighborhood).like(search_term)) |
            (func.lower(Property.type).like(search_term))
        )
    
                   
    if city:
        query = query.filter(func.lower(Property.city) == city.lower())
    
    if type:
        query = query.filter(func.lower(Property.type) == type.lower())
    
    if listing:
        query = query.filter(func.lower(Property.listing) == listing.lower())
    
    if max_price is not None:
        query = query.filter(Property.price_clean <= max_price)
    
    if bedrooms:
        if bedrooms.lower() == "studio":
            query = query.filter(func.lower(Property.bedroom) == "studio")
        else:
            query = query.filter(Property.bedroom == bedrooms)
    
                     
    total = query.count()
    
                                                                   
    query = query.order_by(asc(Property.valuation_percentage))
    
                      
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


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """
    Get a single property by ID.
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return PropertyResponse(**property.to_dict())


@router.get("/{property_id}/similar", response_model=List[PropertyResponse])
def get_similar_properties(
    property_id: int,
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """
    Get similar properties based on type, city, and price range.
    
    Uses a simple similarity algorithm based on:
    - Same city (highest weight)
    - Same type
    - Similar price range (within 30%)
    """
                             
    source = db.query(Property).filter(Property.id == property_id).first()
    
    if not source:
        raise HTTPException(status_code=404, detail="Property not found")
    
                             
    query = db.query(Property).filter(Property.id != property_id)
    
               
    if source.city:
        query = query.filter(func.lower(Property.city) == source.city.lower())
    
                                         
    if source.type:
        similar_type = query.filter(func.lower(Property.type) == source.type.lower())
        similar_count = similar_type.count()
        if similar_count >= limit:
            query = similar_type
    
                                              
    if source.price_clean:
        min_price = source.price_clean * 0.5
        max_price = source.price_clean * 1.5
        query = query.filter(
            Property.price_clean.between(min_price, max_price)
        )
    
                               
    if source.price_clean:
        query = query.order_by(
            func.abs(Property.price_clean - source.price_clean)
        )
    
    properties = query.limit(limit).all()
    
    return [PropertyResponse(**p.to_dict()) for p in properties]
