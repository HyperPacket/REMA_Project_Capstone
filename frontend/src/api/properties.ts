/**
 * Properties API Service
 * 
 * Connects to the REMA backend API for property data.
 * Replaces mock data with real API calls.
 */

import type { Property } from '../types';
import { apiGet, apiPost } from './config';

// Response shape from backend
interface PropertyListResponse {
    items: Property[];
    total: number;
    page: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
}

// Paginated response returned to components
export interface PaginatedPropertyResponse {
    items: Property[];
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface PredictionResponse {
    predicted_price: number;
    valuation: 'undervalued' | 'fair' | 'overvalued' | null;
    valuation_percentage: number | null;
    confidence: string;
}

interface FilterOptionsResponse {
    cities: string[];
}

/**
 * Get available filter options from the database.
 * Returns distinct values for filter dropdowns.
 */
export const getFilterOptions = async (): Promise<{ cities: string[] }> => {
    try {
        const response = await apiGet<FilterOptionsResponse>('/properties/filters');
        return { cities: response.cities };
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return { cities: [] };
    }
};

/**
 * Get all properties with optional filters.
 * Backend handles filtering, searching, and pagination.
 */
export const getProperties = async (filters?: {
    city?: string;
    type?: string;
    min_price?: number;
    max_price?: number;
    bedrooms?: string;
    bathrooms?: string;
    listing?: string;
    sort?: string;
    limit?: number;
    page?: number;
    search?: string;
}): Promise<PaginatedPropertyResponse> => {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters) {
        if (filters.search) params.append('search', filters.search);
        if (filters.city) params.append('city', filters.city);
        if (filters.type) params.append('type', filters.type);
        if (filters.min_price) params.append('min_price', filters.min_price.toString());
        if (filters.max_price) params.append('max_price', filters.max_price.toString());
        if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
        if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
        if (filters.listing) params.append('listing', filters.listing);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.page) params.append('page', filters.page.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiGet<PropertyListResponse>(`/properties${query}`);

    // Transform backend response to frontend shape
    return {
        items: response.items.map(transformProperty),
        total: response.total,
        page: response.page,
        pages: response.pages,
        hasNext: response.has_next,
        hasPrev: response.has_prev,
    };
};

/**
 * Get a single property by ID.
 */
export const getPropertyById = async (id: number): Promise<Property | undefined> => {
    try {
        const data = await apiGet<Property>(`/properties/${id}`);
        return transformProperty(data);
    } catch (error) {
        console.error('Error fetching property:', error);
        return undefined;
    }
};

/**
 * Get undervalued properties (opportunities).
 * Supports filtering, searching, and pagination like getProperties.
 */
export const getOpportunities = async (filters?: {
    city?: string;
    type?: string;
    listing?: string;
    min_discount?: number;
    max_price?: number;
    bedrooms?: string;
    search?: string;
    limit?: number;
    page?: number;
}): Promise<PaginatedPropertyResponse> => {
    const params = new URLSearchParams();

    if (filters) {
        if (filters.search) params.append('search', filters.search);
        if (filters.city) params.append('city', filters.city);
        if (filters.type) params.append('type', filters.type);
        if (filters.listing) params.append('listing', filters.listing);
        if (filters.min_discount) params.append('min_discount', filters.min_discount.toString());
        if (filters.max_price) params.append('max_price', filters.max_price.toString());
        if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.page) params.append('page', filters.page.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiGet<PropertyListResponse>(`/properties/opportunities${query}`);

    return {
        items: response.items.map(transformProperty),
        total: response.total,
        page: response.page,
        pages: response.pages,
        hasNext: response.has_next,
        hasPrev: response.has_prev,
    };
};

/**
 * Get similar properties for a given property.
 */
export const getSimilarProperties = async (propertyId: number, limit = 5): Promise<Property[]> => {
    try {
        const response = await apiGet<Property[]>(`/properties/${propertyId}/similar?limit=${limit}`);
        return response.map(transformProperty);
    } catch (error) {
        console.error('Error fetching similar properties:', error);
        return [];
    }
};

/**
 * Calculate predicted price for property configuration.
 */
export const calculatePrice = async (data: {
    city?: string;
    type?: string;
    surface_area?: number;
    bedroom?: string | number;
    bathroom?: number;
    furnishing?: string;
    floor?: string;
    neighborhood?: string;
    listing?: string;
    price?: number;
}): Promise<{ predicted: number; valuation: string }> => {
    try {
        const response = await apiPost<PredictionResponse>('/predict', {
            city: data.city || 'Amman',
            type: data.type || 'apartment',
            surface_area: data.surface_area || 100,
            bedroom: String(data.bedroom || '2'),
            bathroom: data.bathroom || 1,
            furnishing: data.furnishing || 'unfurnished',
            floor: data.floor || 'first floor',
            neighborhood: data.neighborhood || 'Unknown',
            listing: data.listing === 'buy' ? 'sale' : (data.listing || 'sale'),
            user_price: data.price,
        });

        return {
            predicted: response.predicted_price,
            valuation: response.valuation || 'fair',
        };
    } catch (error) {
        console.error('Error calculating price:', error);
        // Return fallback
        return {
            predicted: 0,
            valuation: 'fair',
        };
    }
};

/**
 * Transform backend property shape to frontend Property interface.
 * Handles field naming differences and adds defaults.
 */
function transformProperty(data: any): Property {
    return {
        id: data.id,
        city: data.city || 'Unknown',
        type: normalizeType(data.type),
        surface_area: data.surface_area || 0,
        bedroom: data.bedroom || '0',
        bathroom: data.bathroom || 0,
        furnishing: normalizeFurnishing(data.furnishing),
        floor: data.floor,
        neighborhood: data.neighborhood || 'Unknown',
        listing: data.listing === 'sale' ? 'buy' : (data.listing || 'buy'),
        price: data.price || 0,
        currency: 'JOD',
        description: data.description || `${data.type} in ${data.neighborhood}, ${data.city}`,
        images: data.images || [],
        predicted_price: data.predicted_price,
        valuation: data.valuation,
        valuation_percentage: data.valuation_percentage,
        added_at: data.added_at || new Date().toISOString(),
    };
}

/**
 * Normalize property type to match frontend enum.
 */
function normalizeType(type: string): Property['type'] {
    const typeMap: Record<string, Property['type']> = {
        'apartment': 'apartment',
        'villa': 'villa',
        'studio': 'studio',
        'land': 'land',
        'commercial': 'commerecial', // Note: frontend has typo
        'commerecial': 'commerecial',
        'whole building': 'whole building',
        'farm': 'land',
        'chalet': 'villa',
    };
    return typeMap[type?.toLowerCase()] || 'apartment';
}

/**
 * Normalize furnishing to match frontend enum.
 */
function normalizeFurnishing(furnishing: string): Property['furnishing'] {
    const furnishingMap: Record<string, Property['furnishing']> = {
        'furnished': 'furnished',
        'unfurnished': 'unfurnished',
        'semi-furnished': 'semi-furnished',
        'semi furnished': 'semi-furnished',
    };
    return furnishingMap[furnishing?.toLowerCase()] || 'unfurnished';
}
