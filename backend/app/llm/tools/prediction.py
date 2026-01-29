"""
==============================================================================
REMA Backend - Price Prediction Tool
==============================================================================

WHAT IT DOES:
    LLM tool wrapper for ML price prediction.
    Provides predicted price and valuation analysis.

HOW IT WORKS:
    - Calls the ML pipeline with property features
    - Compares to listed price if provided
    - Returns prediction with confidence

INPUTS:
    city, property_type, surface_area, bedroom, bathroom, 
    furnishing, floor, neighborhood, listing, listed_price

OUTPUTS:
    Predicted price and valuation

==============================================================================
"""

from app.ml.pipeline import predict_price, calculate_valuation


def predict_price_tool(
    city: str,
    property_type: str,
    surface_area: float,
    bedroom: str,
    bathroom: int,
    furnishing: str,
    floor: str,
    neighborhood: str,
    listing: str,
    listed_price: int = None
) -> dict:
    """
    Predict property price using ML model.
    
    Returns predicted price and valuation if listed_price provided.
    """
    try:
        predicted = predict_price(
            city=city,
            property_type=property_type,
            surface_area=surface_area,
            bedroom=bedroom,
            bathroom=bathroom,
            furnishing=furnishing,
            floor=floor,
            neighborhood=neighborhood,
            listing=listing
        )
        
        result = {
            "success": True,
            "predicted_price": predicted,
            "input_summary": f"{surface_area}m² {property_type} in {neighborhood}, {city}",
            "display_type": "prediction"
        }
        
                                                
        if listed_price:
            valuation, percentage = calculate_valuation(listed_price, predicted)
            result["listed_price"] = listed_price
            result["valuation"] = valuation
            result["valuation_percentage"] = percentage
            
            if valuation == "undervalued":
                result["message"] = (
                    f"This property is **undervalued**! The listed price of {listed_price:,} JOD "
                    f"is {abs(percentage):.1f}% below the predicted market value of {predicted:,} JOD."
                )
            elif valuation == "overvalued":
                result["message"] = (
                    f"This property appears **overvalued**. The listed price of {listed_price:,} JOD "
                    f"is {abs(percentage):.1f}% above the predicted market value of {predicted:,} JOD."
                )
            else:
                result["message"] = (
                    f"This property is **fairly priced**. The listed price of {listed_price:,} JOD "
                    f"is close to the predicted market value of {predicted:,} JOD."
                )
        else:
            result["message"] = f"Based on the property features, the predicted price is **{predicted:,} JOD**."
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "I couldn't predict the price for this property configuration.",
            "display_type": "text"
        }
