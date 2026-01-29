"""
==============================================================================
REMA Backend - Property Schemas
==============================================================================

WHAT IT DOES:
    Pydantic schemas for property-related API requests and responses.
    Validates input data and serializes output data.

HOW IT WORKS:
    FastAPI uses these schemas to:
    - Validate incoming request data
    - Generate OpenAPI documentation
    - Serialize response data to JSON

KEY SCHEMAS:
    - PropertyBase: Base schema with common property fields
    - PropertyResponse: Full property data for API responses
    - PropertyFilter: Query parameters for filtering properties
    - PropertyListResponse: Paginated list of properties

USAGE:
    @router.get("/properties", response_model=PropertyListResponse)
    def get_properties(filters: PropertyFilter = Depends()):
        ...

==============================================================================
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class ListingType(str, Enum):
    """Listing type enumeration."""
    RENT = "rent"
    SALE = "sale"


class SortOption(str, Enum):
    """Sort options for property listing."""
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    DATE_DESC = "date_desc"
    VALUATION = "valuation"


class PropertyBase(BaseModel):
    """
    Base property schema with common fields.
    Used for both input and as base for output schemas.
    """
    type: Optional[str] = Field(None, description="Property type (apartment, villa, etc.)")
    furnishing: Optional[str] = Field(None, description="Furnishing status")
    surface_area: Optional[float] = Field(None, description="Size in square meters")
    bedroom: Optional[str] = Field(None, description="Number of bedrooms or 'studio'")
    bathroom: Optional[int] = Field(None, description="Number of bathrooms")
    floor: Optional[str] = Field(None, description="Floor description")
    price: Optional[int] = Field(None, description="Listed price in JOD")
    city: Optional[str] = Field(None, description="City name")
    neighborhood: Optional[str] = Field(None, description="Neighborhood name")
    listing: Optional[str] = Field(None, description="Listing type: rent or sale")


class PropertyResponse(PropertyBase):
    """
    Full property response schema with all fields.
    Returned from GET /properties and GET /properties/{id}.
    """
    id: int = Field(..., description="Property ID")
    images: List[str] = Field(default_factory=list, description="Property image URLs")
    predicted_price: Optional[int] = Field(None, description="ML predicted price")
    valuation: Optional[str] = Field(None, description="Valuation: undervalued, fair, overvalued")
    valuation_percentage: Optional[float] = Field(None, description="Percentage difference from listed price")
    
    class Config:
        from_attributes = True


class PropertyFilter(BaseModel):
    """
    Query parameters for filtering and sorting properties.
    Used with Depends() in route handlers.
    """
             
    city: Optional[str] = Field(None, description="Filter by city")
    type: Optional[str] = Field(None, description="Filter by property type")
    listing: Optional[str] = Field(None, description="Filter by listing type (rent/sale)")
    min_price: Optional[int] = Field(None, description="Minimum price filter")
    max_price: Optional[int] = Field(None, description="Maximum price filter")
    bedrooms: Optional[str] = Field(None, description="Filter by bedrooms (1, 2, 3, 4+, studio)")
    furnishing: Optional[str] = Field(None, description="Filter by furnishing status")
    
             
    sort: Optional[SortOption] = Field(SortOption.DATE_DESC, description="Sort order")
    
                
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Items per page")


class PropertyListResponse(BaseModel):
    """
    Paginated response for property listings.
    """
    items: List[PropertyResponse] = Field(..., description="List of properties")
    total: int = Field(..., description="Total number of matching properties")
    page: int = Field(..., description="Current page number")
    pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there's a next page")
    has_prev: bool = Field(..., description="Whether there's a previous page")
