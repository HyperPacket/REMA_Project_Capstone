"""
==============================================================================
REMA Backend - LLM Package
==============================================================================

This package contains the LLM integration layer for the Ask REMA feature.

Components:
    - client: Ollama API client wrapper
    - prompts: System prompts for different contexts
    - tools/: Tool definitions that LLM can invoke

Usage:
    from app.llm import chat_with_rema
    response = await chat_with_rema(message, context="global")

==============================================================================
"""

from app.llm.client import chat_with_rema, OllamaClient

__all__ = ["chat_with_rema", "OllamaClient"]
