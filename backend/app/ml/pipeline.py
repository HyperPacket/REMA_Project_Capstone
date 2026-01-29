"""
==============================================================================
REMA Backend - ML Pipeline
==============================================================================

WHAT IT DOES:
    Loads and runs the pre-trained REMA price prediction model.
    Provides price prediction for properties based on their features.

HOW IT WORKS:
    1. Loads REMA_pipeline.pkl on startup
    2. RealEstateFeatureEngineer transforms raw input data
    3. XGBoost model predicts log-transformed price
    4. Result is inverse-transformed to get actual price in JOD

KEY COMPONENTS:
    - RealEstateFeatureEngineer: Custom sklearn transformer (required for pickle)
    - predict_price(): Main prediction function
    - get_pipeline(): Returns the loaded pipeline instance

INPUTS:
    Dictionary with: city, type, surface_area, bedroom, bathroom,
    furnishing, floor, neighborhood, listing

OUTPUTS:
    Predicted price in JOD (integer)

IMPORTANT NOTES:
    - The RealEstateFeatureEngineer class MUST be identical to the one
      used during training for pickle to load correctly
    - Model returns log1p transformed values, use expm1 to reverse

==============================================================================
"""

import pandas as pd
import numpy as np
import joblib
import re
import os
from sklearn.base import BaseEstimator, TransformerMixin
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


                                                                                
                                                                            
                                                                                

class RealEstateFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom feature engineering transformer for real estate data.
    MUST be identical to the one used during model training.
    """
    
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()

                                                                      
        if 'City' not in X.columns and 'location' in X.columns:
            split_loc = X['location'].str.split(',', n=1, expand=True)
            X['City'] = split_loc[0].str.strip()
            if split_loc.shape[1] > 1:
                X['Neighborhood'] = split_loc[1].str.strip()
            else:
                X['Neighborhood'] = "Unknown"

                                 
        if 'listing' not in X.columns:
            X['listing'] = 'unknown'

                       
        if 'City' in X.columns:
            X['City'] = X['City'].astype(str).str.strip().str.title()
            X['City'] = X['City'].replace("Ma'An", "Ma'an")

        if 'Neighborhood' in X.columns:
            X['Neighborhood'] = X['Neighborhood'].astype(str).str.strip().str.title()
        
        if 'listing' in X.columns:
            X['listing'] = X['listing'].astype(str).str.strip().str.lower()

                            
        def clean_bedroom(val):
            s = str(val).lower()
            if 'studio' in s:
                return 0.5
            try:
                return float(s)
            except:
                return np.nan

        def clean_floor(val):
            val = str(val).lower()
            if "basement" in val:
                return -1
            if "ground" in val and "semi" in val:
                return 0.5
            if "ground" in val:
                return 0
            match = re.search(r"(\d+)", val)
            if match:
                return float(match.group(1))
            return 0

                        
        if 'bedroom' in X.columns:
            X["bedroom"] = X["bedroom"].apply(clean_bedroom)

        if 'floor' in X.columns:
            X["floor_numeric"] = X["floor"].apply(clean_floor)
        else:
            X["floor_numeric"] = 0

                        
        furnish_map = {"unfurnished": 0, "semi furnished": 0.5, "furnished": 1}
        if 'furnishing' in X.columns:
            X["furnishing"] = X["furnishing"].astype(str).str.lower().map(furnish_map).fillna(0)

                  
        type_map = {
            "apartment": 0,
            "town house": 1,
            "villas and palaces": 2,
            "whole building": 3,
            "farms and chalets": 4
        }
        if 'type' in X.columns:
            X["type_numeric"] = X["type"].astype(str).str.lower().map(type_map).fillna(0)

                              
        cols_to_keep = ["surface_area", "bedroom", "bathroom", "floor_numeric",
                        "furnishing", "type_numeric", "City", "Neighborhood", "listing"]

        final_cols = [c for c in cols_to_keep if c in X.columns]
        return X[final_cols]


                                                           
import __main__
setattr(__main__, "RealEstateFeatureEngineer", RealEstateFeatureEngineer)


                                                                                
                                 
                                                                                

_pipeline = None


def get_pipeline():
    """
    Get the loaded ML pipeline instance.
    Loads lazily on first call.
    """
    global _pipeline
    
    if _pipeline is None:
                                         
        current_dir = os.path.dirname(os.path.abspath(__file__))
        pipeline_path = os.path.join(current_dir, "REMA_pipeline.pkl")
        
        if not os.path.exists(pipeline_path):
            raise FileNotFoundError(
                f"REMA_pipeline.pkl not found at {pipeline_path}. "
                "Please copy it from test/ directory."
            )
        
        logger.info(f"Loading ML pipeline from {pipeline_path}")
        _pipeline = joblib.load(pipeline_path)
        logger.info("ML pipeline loaded successfully")
    
    return _pipeline


def predict_price(
    city: str,
    property_type: str,
    surface_area: float,
    bedroom: str,
    bathroom: int,
    furnishing: str,
    floor: str,
    neighborhood: str,
    listing: str
) -> int:
    """
    Predict property price using the ML pipeline.
    
    Args:
        city: City name (e.g., "Amman")
        property_type: Property type (apartment, villa, etc.)
        surface_area: Size in square meters
        bedroom: Number of bedrooms or "studio"
        bathroom: Number of bathrooms
        furnishing: Furnishing status
        floor: Floor description
        neighborhood: Neighborhood name
        listing: "rent" or "sale"
    
    Returns:
        Predicted price in JOD (integer)
    """
    pipeline = get_pipeline()
    
                      
    city_norm = city.strip().title().replace("Ma'An", "Ma'an")
    neighborhood_norm = neighborhood.strip().title()
    listing_norm = listing.strip().lower()
    
                                     
    data = pd.DataFrame({
        "City": [city_norm],
        "type": [property_type.lower()],
        "surface_area": [surface_area],
        "bedroom": [bedroom],
        "bathroom": [bathroom],
        "furnishing": [furnishing.lower()],
        "floor": [floor],
        "Neighborhood": [neighborhood_norm],
        "listing": [listing_norm]
    })
    
                                    
    pred_log = pipeline.predict(data)
    
                                         
    pred_real = np.expm1(pred_log)
    
    return int(round(pred_real[0]))


def calculate_valuation(listed_price: int, predicted_price: int) -> tuple:
    """
    Calculate valuation based on listed vs predicted price.
    
    Args:
        listed_price: The asking price
        predicted_price: ML predicted price
    
    Returns:
        Tuple of (valuation_label, percentage_difference)
        valuation_label: "undervalued", "fair", or "overvalued"
        percentage_difference: Float percentage (positive = undervalued)
    """
    if listed_price <= 0 or predicted_price <= 0:
        return None, None
    
    diff_percentage = ((predicted_price - listed_price) / listed_price) * 100
    
    if diff_percentage > 15:
        valuation = "undervalued"                             
    elif diff_percentage < -15:
        valuation = "overvalued"                             
    else:
        valuation = "fair"
    
    return valuation, round(diff_percentage, 2)
