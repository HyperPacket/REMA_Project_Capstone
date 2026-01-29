import { apiGet, apiDelete } from './config';
import type { Property, User } from '../types';

export interface DashboardStats {
    total_properties: number;
    total_users: number;
    properties_for_sale: number;
    properties_for_rent: number;
    total_watchlist_items: number;
}

export interface PropertyListResponse {
    items: Property[];
    total: number;
    page: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface UserListResponse {
    items: User[];
    total: number;
    page: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export const adminApi = {
    getStats: () => {
        return apiGet<DashboardStats>('/admin/stats');
    },

    getProperties: (page: number = 1, limit: number = 50, search?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        return apiGet<PropertyListResponse>(`/admin/properties?${params.toString()}`);
    },

    deleteProperty: (id: number) => {
        return apiDelete<{ message: string }>(`/admin/properties/${id}`);
    },

    getUsers: (page: number = 1, limit: number = 50, search?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        return apiGet<UserListResponse>(`/admin/users?${params.toString()}`);
    },

    deleteUser: (id: string) => {
        return apiDelete<{ message: string }>(`/admin/users/${id}`);
    }
};
