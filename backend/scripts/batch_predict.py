                      
"""
==============================================================================
REMA Backend - Batch Price Prediction Script (UM AB)
==============================================================================

WHAT IT DOES:
    Runs ML price prediction on all properties in the database and saves
    the predicted_price, valuation, and valuation_percentage fields.

HOW TO RUN:
    cd backend
    source venv/bin/activate
    python -m scripts.batch_predict

NOTES:
    - If database is big it will take time
    - Progress is shown every 100 properties
    - Safe to run multiple times (overwrites existing predictions)

==============================================================================
"""

import sys
import os

                                          
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.property import Property
from app.ml.pipeline import get_pipeline
import pandas as pd
import numpy as np
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def calculate_valuation(actual_price: float, predicted_price: float) -> tuple:
    """
    Calculate valuation status and percentage.
    
    Returns:
        tuple: (valuation_status, percentage_diff)
        - valuation_status: 'undervalued', 'fair', or 'overvalued'
        - percentage_diff: positive = overvalued, negative = undervalued
    """
    if not actual_price or not predicted_price:
        return None, None
    
                                                                   
    percentage_diff = ((actual_price - predicted_price) / predicted_price) * 100
    
                                  
    if percentage_diff <= -15:
        return "undervalued", percentage_diff
    elif percentage_diff >= 15:
        return "overvalued", percentage_diff
    else:
        return "fair", percentage_diff


def batch_predict():
    """Run predictions on all properties."""
    
    logger.info("Loading ML pipeline...")
    pipeline = get_pipeline()
    
    logger.info("Connecting to database...")
    db = SessionLocal()
    
    try:
                            
        properties = db.query(Property).all()
        total = len(properties)
        logger.info(f"Found {total} properties to process")
        
                                           
        batch_size = 100
        updated = 0
        errors = 0
        start_time = time.time()
        
        for i, prop in enumerate(properties):
            try:
                                                 
                if not prop.surface_area or not prop.city or not prop.type:
                    continue
                
                                                                                  
                input_data = pd.DataFrame([{
                    "City": (prop.city or "Amman").strip().title(),
                    "type": (prop.type or "apartment").lower(),
                    "surface_area": prop.surface_area or 100,
                    "bedroom": prop.bedroom or "1",
                    "bathroom": prop.bathroom or 1,
                    "furnishing": (prop.furnishing or "unfurnished").lower(),
                    "floor": prop.floor or "first floor",
                    "Neighborhood": (prop.neighborhood or "Unknown").strip().title(),
                    "listing": (prop.listing or "sale").lower(),
                }])
                
                                                  
                pred_log = pipeline.predict(input_data)[0]
                
                                                     
                predicted = float(np.expm1(pred_log))
                
                                     
                valuation, percentage = calculate_valuation(prop.price_clean, predicted)
                
                                                                               
                prop.predicted_price = float(predicted)
                prop.valuation = valuation
                prop.valuation_percentage = float(percentage) if percentage is not None else None
                
                updated += 1
                
            except Exception as e:
                errors += 1
                if errors <= 5:
                    logger.warning(f"Error predicting property {prop.id}: {e}")
            
                              
            if (i + 1) % batch_size == 0:
                elapsed = time.time() - start_time
                rate = (i + 1) / elapsed
                remaining = (total - i - 1) / rate if rate > 0 else 0
                logger.info(f"Progress: {i + 1}/{total} ({updated} updated, {errors} errors) - ETA: {remaining:.0f}s")
                                   
                db.commit()
        
                      
        db.commit()
        
        elapsed = time.time() - start_time
        logger.info(f"✅ Complete! Processed {total} properties in {elapsed:.1f}s")
        logger.info(f"   Updated: {updated}, Errors: {errors}")
        
                             
        sample = db.query(Property).filter(Property.valuation.isnot(None)).limit(5).all()
        logger.info("\nSample predictions:")
        for p in sample:
            logger.info(f"  {p.neighborhood}, {p.city}: {p.price_clean:,.0f} JOD → {p.predicted_price:,.0f} JOD predicted ({p.valuation}, {p.valuation_percentage:.1f}%)")
        
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    batch_predict()
