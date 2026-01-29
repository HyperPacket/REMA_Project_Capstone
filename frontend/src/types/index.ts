export interface Property {
    id: number;
    city: string;
    type: 'apartment' | 'villa' | 'studio' | 'land' | 'commerecial' | 'whole building';
    surface_area: number;
    bedroom: string | number;
    bathroom: number;
    furnishing: 'furnished' | 'unfurnished' | 'semi-furnished';
    floor?: string;
    neighborhood: string;
    listing: 'rent' | 'buy' | 'sale';
    price: number;
    currency: 'JOD';
    description: string;
    images: string[];
    predicted_price?: number;
    valuation?: 'undervalued' | 'fair' | 'overvalued';
    valuation_percentage?: number; // E.g., 10 for 10% undervalued
    latitude?: number;
    longitude?: number;
    added_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    preferences?: {
        cities: string[];
    };
    watchlist: number[]; // Array of Property IDs
    is_admin?: boolean;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'rema';
    content: string;
    timestamp: string;
    relatedPropertyId?: number; // If context-specific
}

export type SortOption = 'price_asc' | 'price_desc' | 'date_desc' | 'valuation';
