"""
==============================================================================
REMA Backend - ML Package
==============================================================================

This package contains the Machine Learning components for price prediction.

Components:
    - pipeline: Loads and runs the REMA_pipeline.pkl model
    - RealEstateFeatureEngineer: Custom transformer for feature engineering

Usage:
    from app.ml import predict_price
    result = predict_price(property_data)

==============================================================================
"""

from app.ml.pipeline import predict_price, get_pipeline

__all__ = ["predict_price", "get_pipeline"]
