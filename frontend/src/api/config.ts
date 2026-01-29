/**
 * API Configuration Module
 * 
 * Centralizes API base URL and common fetch options.
 * Uses environment variable VITE_API_BASE_URL.
 */

// Get API base URL from environment or default to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Default fetch options for API calls.
 * Includes credentials for session cookies.
 */
export const defaultFetchOptions: RequestInit = {
    credentials: 'include', // Include cookies for session auth
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

/**
 * Helper function for making API requests.
 * Handles common error scenarios.
 */
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...defaultFetchOptions,
        ...options,
        headers: {
            ...defaultFetchOptions.headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        let errorMessage = error.detail;

        // Handle Pydantic validation errors (array)
        if (Array.isArray(error.detail)) {
            errorMessage = error.detail
                .map((e: any) => {
                    const field = e.loc ? e.loc[e.loc.length - 1] : 'Field';
                    return `${field}: ${e.msg}`;
                })
                .join(', ');
        } else if (typeof error.detail === 'object' && error.detail !== null) {
            // If detail is an object but not an array, stringify it
            errorMessage = JSON.stringify(error.detail);
        } else if (typeof error.detail === 'string') {
            errorMessage = error.detail;
        } else {
            // Fallback if detail is missing or unknown type
            errorMessage = JSON.stringify(error);
        }

        throw new Error(errorMessage || `API Error: ${response.status}`);
    }

    return response.json();
}

/**
 * Helper for GET requests
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
    return apiFetch<T>(endpoint, { method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
    return apiFetch<T>(endpoint, { method: 'DELETE' });
}

/**
 * Helper for PUT requests
 */
export async function apiPut<T>(endpoint: string, data: unknown): Promise<T> {
    return apiFetch<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}
