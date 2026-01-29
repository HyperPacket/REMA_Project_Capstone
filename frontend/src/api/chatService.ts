/**
 * Chat Service
 * 
 * Connects to the REMA backend LLM chat API.
 * Supports both global and property-specific contexts.
 */

import type { Property } from '../types';
import { apiPost, apiGet } from './config';

export interface ChatRequest {
    message: string;
    context: 'global' | 'property';
    propertyId?: number;
    propertyContext?: Property;
    history?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
    message: string;
    intent?: string;
    suggested_followups?: string[];
    property_cards?: Property[];
}

interface BackendChatResponse {
    response: string;
    suggested_followups: string[];
    tool_results: any[];
    property_cards: Property[] | null;
}

interface ChatHealthResponse {
    status: string;
    model: string;
}

/**
 * Check if the LLM service is available.
 */
export const checkChatHealth = async (): Promise<boolean> => {
    try {
        const response = await apiGet<ChatHealthResponse>('/chat/health');
        return response.status === 'healthy';
    } catch {
        return false;
    }
};

/**
 * Send a message to the REMA AI assistant.
 */
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
    try {
        const response = await apiPost<BackendChatResponse>('/chat', {
            message: request.message,
            context: request.context,
            property_id: request.propertyId,
            history: request.history,
        });

        return {
            message: response.response,
            suggested_followups: response.suggested_followups,
            property_cards: response.property_cards || undefined,
        };
    } catch (error) {
        console.error('Chat error:', error);

        // Fallback response if backend is unavailable
        return getFallbackResponse(request);
    }
};

/**
 * Fallback response when backend is unavailable.
 * Provides basic responses without LLM.
 */
function getFallbackResponse(request: ChatRequest): ChatResponse {
    const msg = request.message.toLowerCase();

    // Property context fallback
    if (request.context === 'property' && request.propertyContext) {
        const p = request.propertyContext;

        if (msg.includes('price') || msg.includes('cost') || msg.includes('value')) {
            return {
                message: `This property is listed for JOD ${p.price.toLocaleString()}. ${p.valuation ? `Our AI valuation suggests it is ${p.valuation}.` : ''}`,
            };
        }

        if (msg.includes('location') || msg.includes('where') || msg.includes('neighborhood')) {
            return {
                message: `It is located in ${p.neighborhood}, ${p.city}.`,
            };
        }

        if (msg.includes('bed') || msg.includes('bath') || msg.includes('size')) {
            return {
                message: `This property has ${p.bedroom} bedrooms, ${p.bathroom} bathrooms, and ${p.surface_area} m² of space.`,
            };
        }

        return {
            message: "I'm currently focused on this property. I can answer questions about its price, location, or features.",
        };
    }

    // Global context fallback
    if (msg.includes('hello') || msg.includes('hi')) {
        return {
            message: "Hello! I'm REMA, your real estate AI assistant. The full AI service is temporarily unavailable, but I can still help with basic questions.",
        };
    }

    return {
        message: "I'm sorry, the AI service is temporarily unavailable. Please try again in a moment, or browse our property listings directly.",
        suggested_followups: [
            "Show me properties in Amman",
            "What are the current opportunities?",
            "Help me calculate a price",
        ],
    };
}
