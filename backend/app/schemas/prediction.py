"""
==============================================================================
REMA Backend - Prediction Schemas
==============================================================================

WHAT IT DOES:
    Pydantic schemas for ML price prediction requests and responses.

HOW IT WORKS:
    - PredictionRequest: Validates property details for prediction
    - PredictionResponse: Returns predicted price and valuation

KEY SCHEMAS:
    - PredictionRequest: Input data for ML model
    - PredictionResponse: Prediction results

USAGE:
    @router.post("/predict", response_model=PredictionResponse)
    def predict(request: PredictionRequest):
        ...

==============================================================================
"""

from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    """
    Request schema for price prediction.
    All fields required by the ML pipeline.
    """
    city: str = Field(..., description="City name (e.g., 'Amman')")
    type: str = Field(..., description="Property type (apartment, villa, etc.)")
    surface_area: float = Field(..., gt=0, description="Size in square meters")
    bedroom: str = Field(..., description="Number of bedrooms or 'studio'")
    bathroom: int = Field(..., ge=0, description="Number of bathrooms")
    furnishing: str = Field(..., description="Furnishing status")
    floor: str = Field(..., description="Floor description")
    neighborhood: str = Field(..., description="Neighborhood name")
    listing: str = Field(..., description="Listing type: 'rent' or 'sale'")
    user_price: Optional[int] = Field(None, description="Optional: user's asking price for comparison")


class PredictionResponse(BaseModel):
    """
    Response schema for price prediction.
    """
    predicted_price: int = Field(..., description="ML predicted price in JOD")
    valuation: Optional[str] = Field(None, description="If user_price provided: undervalued/fair/overvalued")
    valuation_percentage: Optional[float] = Field(None, description="Percentage difference from user_price")
    confidence: str = Field("medium", description="Prediction confidence: high, medium, low")
