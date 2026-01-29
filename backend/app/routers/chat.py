"""
==============================================================================
REMA Backend - Chat Router
==============================================================================

WHAT IT DOES:
    Handles chat endpoints for Ask REMA feature.
    Supports both global and property-specific contexts.

HOW IT WORKS:
    1. Receives user message via POST
    2. Calls LLM with appropriate system prompt
    3. Returns response with suggested followups

KEY ENDPOINTS:
    - POST /chat: Main chat endpoint
    - GET /chat/health: Check LLM availability

CONTEXT TYPES:
    - global: General real estate questions
    - property: Questions about a specific property

==============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.models.property import Property
from app.schemas.chat import ChatRequest, ChatResponse, ChatContext
from app.llm.client import chat_with_rema, get_ollama_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/health")
async def check_llm_health():
    """Check if the LLM service is available."""
    client = get_ollama_client()
    is_healthy = await client.check_health()
    
    if is_healthy:
        return {"status": "healthy", "model": client.model}
    else:
        return {"status": "unavailable", "message": "Ollama service is not responding"}


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message to REMA AI assistant.
    
    For property-specific context, include property_id.
    For general questions, use global context.
    """
    try:
                                                        
        property_data = None
        if request.context == ChatContext.PROPERTY and request.property_id:
            property = db.query(Property).filter(Property.id == request.property_id).first()
            if not property:
                raise HTTPException(status_code=404, detail="Property not found")
            property_data = property.to_dict()
        
                                          
        history = None
        if request.history:
            history = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
                        
        result = await chat_with_rema(
            message=request.message,
            db=db,
            context=request.context.value,
            property_data=property_data,
            conversation_history=history
        )
        
                                       
        property_cards = None
        for tool_result in result.get("tool_results", []):
            if tool_result.get("display_type") == "property_cards":
                property_cards = tool_result.get("data", {}).get("properties", [])
                break
        
        return ChatResponse(
            response=result["response"],
            suggested_followups=result.get("suggested_followups", []),
            tool_results=[],                      
            property_cards=property_cards
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return ChatResponse(
            response="I'm sorry, I encountered an error processing your request. Please try again.",
            suggested_followups=["Find me properties in Amman", "What's the average price for apartments?"],
            tool_results=[]
        )
