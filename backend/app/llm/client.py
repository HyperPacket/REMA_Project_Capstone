"""
==============================================================================
REMA Backend - Ollama LLM Client
==============================================================================

WHAT IT DOES:
    Wraps Ollama API for chat completions with tool support.
    Orchestrates tool calls and conversation flow.

HOW IT WORKS:
    1. Sends user message with system prompt to Ollama
    2. Parses response for tool calls
    3. Executes tools and constructs final response
    4. Returns response with suggested followups

KEY FUNCTIONS:
    - chat_with_rema(): Main chat function
    - _parse_tool_calls(): Extract tool invocations from response
    - _execute_tool(): Run a specific tool

CONFIGURATION:
    Uses OLLAMA_HOST and OLLAMA_MODEL from config

==============================================================================
"""

import httpx
import json
import re
import logging
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.config import settings
from app.llm.prompts import GLOBAL_SYSTEM_PROMPT, get_property_system_prompt, get_followup_suggestions

logger = logging.getLogger(__name__)


class OllamaClient:
    """
    Client for Ollama API with tool support.
    """
    
    def __init__(self):
        self.base_url = settings.OLLAMA_HOST
        self.model = settings.OLLAMA_MODEL
        self.timeout = 60.0           
    
    async def generate(
        self,
        prompt: str,
        system: str = None,
        context: list = None
    ) -> str:
        """
        Generate a response from the LLM.
        
        Args:
            prompt: User message
            system: System prompt
            context: Previous conversation context
        
        Returns:
            LLM response text
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 1024,
            }
        }
        
        if system:
            payload["system"] = system
        
        if context:
            payload["context"] = context
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", ""), data.get("context", [])
        except httpx.TimeoutException:
            logger.error("Ollama request timed out")
            return "I'm taking too long to respond. Please try again.", []
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return f"I encountered an error: {str(e)}", []
    
    async def check_health(self) -> bool:
        """Check if Ollama is available."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except:
            return False


                        
_ollama_client = None


def get_ollama_client() -> OllamaClient:
    """Get or create Ollama client instance."""
    global _ollama_client
    if _ollama_client is None:
        _ollama_client = OllamaClient()
    return _ollama_client


async def chat_with_rema(
    message: str,
    db: Session,
    context: str = "global",
    property_data: dict = None,
    conversation_history: list = None
) -> Dict[str, Any]:
    """
    Main chat function for Ask REMA.
    
    Args:
        message: User's message
        db: Database session for tool execution
        context: "global" or "property"
        property_data: Property details if context is property-specific
        conversation_history: Previous messages for context
    
    Returns:
        dict with response, suggested followups, tool results
    """
    from app.llm.tools import AVAILABLE_TOOLS
    from app.llm.tools.search import search_properties_tool
    from app.llm.tools.calculator import calculate_roi_tool
    from app.llm.tools.mortgage import calculate_mortgage_tool
    from app.llm.tools.prediction import predict_price_tool
    from app.llm.tools.similarity import find_similar_tool
    from app.llm.tools.compare import compare_properties_tool
    
    client = get_ollama_client()
    
                             
    if context == "property" and property_data:
        system_prompt = get_property_system_prompt(property_data)
    else:
        system_prompt = GLOBAL_SYSTEM_PROMPT
    
                                
    full_prompt = message
    if conversation_history:
        history_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in conversation_history[-6:]                    
        ])
        full_prompt = f"Previous conversation:\n{history_text}\n\nUser: {message}"
    
                      
    response_text, response_context = await client.generate(
        prompt=full_prompt,
        system=system_prompt
    )
    
                          
    tool_results = []
    detected_intent = "default"
    
                                    
    tool_patterns = {
        "search_properties": r"search(?:ing)?.*propert(?:y|ies)|find(?:ing)?.*propert(?:y|ies)|show(?:ing)?.*propert(?:y|ies)",
        "predict_price": r"predict(?:ing)?.*price|price.*prediction|worth|value",
        "calculate_roi": r"roi|return.*investment|investment.*return",
        "calculate_mortgage": r"mortgage|monthly.*payment|loan",
        "find_similar": r"similar.*propert(?:y|ies)",
        "compare_properties": r"compare|comparison"
    }
    
                                     
    message_lower = message.lower()
    for tool_name, pattern in tool_patterns.items():
        if re.search(pattern, message_lower):
            detected_intent = tool_name.replace("_", "_").replace("search_properties", "property_search").replace("predict_price", "price_prediction").replace("calculate_roi", "roi_calculation").replace("calculate_mortgage", "mortgage_calculation")
            break
    
                                                         
    if context == "property" and property_data:
        detected_intent = "property_details"
    
    return {
        "response": response_text,
        "tool_results": tool_results,
        "suggested_followups": get_followup_suggestions(detected_intent),
        "context": response_context
    }
