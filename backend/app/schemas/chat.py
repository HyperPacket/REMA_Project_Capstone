"""
==============================================================================
REMA Backend - Chat Schemas
==============================================================================

WHAT IT DOES:
    Pydantic schemas for chat API requests and responses.

SCHEMAS:
    - ChatRequest: User message input
    - ChatResponse: LLM response with suggestions
    - ChatMessage: Individual message in history

==============================================================================
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum


class ChatContext(str, Enum):
    """Chat context type."""
    GLOBAL = "global"
    PROPERTY = "property"


class ChatMessage(BaseModel):
    """Individual chat message."""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request schema for chat."""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    context: ChatContext = Field(ChatContext.GLOBAL, description="Chat context type")
    property_id: Optional[int] = Field(None, description="Property ID for property-specific chat")
    history: Optional[List[ChatMessage]] = Field(None, description="Previous messages")


class ToolResult(BaseModel):
    """Result from an LLM tool execution."""
    tool_name: str
    success: bool
    data: Any
    display_type: str = "text"


class ChatResponse(BaseModel):
    """Response schema for chat."""
    response: str = Field(..., description="LLM response text")
    suggested_followups: List[str] = Field(default_factory=list, description="Suggested follow-up questions")
    tool_results: List[ToolResult] = Field(default_factory=list, description="Results from tool calls")
    property_cards: Optional[List[dict]] = Field(None, description="Property cards to display")
    
    class Config:
        from_attributes = True
