"""
==============================================================================
REMA Backend - Prediction Router
==============================================================================

WHAT IT DOES:
    Handles ML price prediction API endpoint.
    Uses the pre-trained REMA pipeline to predict property prices.

HOW IT WORKS:
    1. Receives property details via POST request
    2. Validates input using PredictionRequest schema
    3. Calls ML pipeline for prediction
    4. Calculates valuation if user_price provided
    5. Returns predicted price and valuation

KEY ENDPOINTS:
    - POST /predict: Get price prediction for a property

INPUTS:
    PredictionRequest with city, type, surface_area, bedroom, bathroom,
    furnishing, floor, neighborhood, listing, and optional user_price

OUTPUTS:
    PredictionResponse with predicted_price, valuation, valuation_percentage

==============================================================================
"""

from fastapi import APIRouter, HTTPException
import logging

from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.ml.pipeline import predict_price, calculate_valuation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Get ML price prediction for a property.
    
    Provide property details and get a predicted market price.
    Optionally include your asking price for valuation comparison.
    """
    try:
                                         
        predicted_price = predict_price(
            city=request.city,
            property_type=request.type,
            surface_area=request.surface_area,
            bedroom=request.bedroom,
            bathroom=request.bathroom,
            furnishing=request.furnishing,
            floor=request.floor,
            neighborhood=request.neighborhood,
            listing=request.listing
        )
        
                                                          
        valuation = None
        valuation_percentage = None
        
        if request.user_price:
            valuation, valuation_percentage = calculate_valuation(
                listed_price=request.user_price,
                predicted_price=predicted_price
            )
        
                                                         
                                                             
        confidence = "medium"
        if request.surface_area > 50 and request.surface_area < 500:
            confidence = "high"
        
        return PredictionResponse(
            predicted_price=predicted_price,
            valuation=valuation,
            valuation_percentage=valuation_percentage,
            confidence=confidence
        )
        
    except FileNotFoundError as e:
        logger.error(f"ML pipeline not found: {e}")
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Please ensure REMA_pipeline.pkl is in place."
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
