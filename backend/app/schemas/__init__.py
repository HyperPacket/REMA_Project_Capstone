"""
==============================================================================
REMA Backend - Schemas Package
==============================================================================

This package contains Pydantic schemas for request/response validation.

Schemas:
    - PropertyBase, PropertyResponse, PropertyFilter: Property-related schemas
    - UserCreate, UserResponse: User authentication schemas
    - PredictionRequest, PredictionResponse: ML prediction schemas
    - ChatRequest, ChatResponse: LLM chat schemas

Usage:
    from app.schemas import PropertyResponse, PropertyFilter

==============================================================================
"""

from app.schemas.property import (
    PropertyBase,
    PropertyResponse,
    PropertyFilter,
    PropertyListResponse,
)
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
)

__all__ = [
    "PropertyBase",
    "PropertyResponse", 
    "PropertyFilter",
    "PropertyListResponse",
    "PredictionRequest",
    "PredictionResponse",
]
