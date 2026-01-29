"""
==============================================================================
REMA Backend - LLM Tools Package
==============================================================================

This package contains tool definitions that the LLM can invoke.

Tools:
    - search: Property search by criteria
    - calculator: Math and ROI calculations
    - mortgage: Mortgage payment calculations
    - prediction: ML price prediction wrapper
    - similarity: Find similar properties
    - compare: Compare properties side-by-side

Each tool is a function that returns structured data the LLM can interpret.

==============================================================================
"""

from app.llm.tools.search import search_properties_tool
from app.llm.tools.calculator import calculate_roi_tool
from app.llm.tools.mortgage import calculate_mortgage_tool
from app.llm.tools.prediction import predict_price_tool
from app.llm.tools.similarity import find_similar_tool
from app.llm.tools.compare import compare_properties_tool

                       
AVAILABLE_TOOLS = {
    "search_properties": search_properties_tool,
    "predict_price": predict_price_tool,
    "calculate_roi": calculate_roi_tool,
    "calculate_mortgage": calculate_mortgage_tool,
    "find_similar": find_similar_tool,
    "compare_properties": compare_properties_tool,
}

__all__ = [
    "search_properties_tool",
    "predict_price_tool",
    "calculate_roi_tool",
    "calculate_mortgage_tool",
    "find_similar_tool",
    "compare_properties_tool",
    "AVAILABLE_TOOLS",
]
