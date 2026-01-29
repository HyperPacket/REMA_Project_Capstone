/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 * Connects to the REMA backend auth endpoints with session cookies.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { apiPost, apiGet, API_BASE_URL } from '../api/config';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    updateWatchlist: (propertyId: number, action: 'add' | 'remove') => Promise<void>;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

interface LoginResponse {
    message: string;
    user: BackendUser;
}

interface BackendUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    is_admin: boolean;
    created_at: string;
    watchlist: number[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is already logged in on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    /**
     * Check current authentication status via /auth/me
     */
    const checkAuthStatus = async () => {
        setIsLoading(true);
        try {
            const backendUser = await apiGet<BackendUser>('/auth/me');
            setUser(transformUser(backendUser));
        } catch {
            // Not logged in - that's fine
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login with email and password.
     * Backend sets session cookie automatically.
     */
    const login = async (email: string, password: string): Promise<boolean> => {
        setError(null);
        setIsLoading(true);

        try {
            const response = await apiPost<LoginResponse>('/auth/login', {
                email,
                password,
            });

            setUser(transformUser(response.user));
            return true;
        } catch (err: any) {
            setError(err.message || 'Login failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register a new user account.
     */
    const register = async (data: RegisterData): Promise<boolean> => {
        setError(null);
        setIsLoading(true);

        try {
            await apiPost<BackendUser>('/auth/register', data);

            // Auto-login after registration
            return await login(data.email, data.password);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout and clear session.
     */
    const logout = async () => {
        try {
            await apiPost('/auth/logout', {});
        } catch {
            // Ignore logout errors
        }
        setUser(null);
    };

    /**
     * Add or remove property from watchlist.
     */
    const updateWatchlist = async (propertyId: number, action: 'add' | 'remove') => {
        if (!user) return;

        try {
            if (action === 'add') {
                await apiPost(`/watchlist/${propertyId}`, {});
                setUser({
                    ...user,
                    watchlist: [...user.watchlist, propertyId],
                });
            } else {
                await fetch(`${API_BASE_URL}/watchlist/${propertyId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                setUser({
                    ...user,
                    watchlist: user.watchlist.filter(id => id !== propertyId),
                });
            }
        } catch (err) {
            console.error('Watchlist update failed:', err);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            isLoading,
            error,
            updateWatchlist,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Transform backend user to frontend User interface.
 */
function transformUser(backendUser: BackendUser): User {
    return {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.phone,
        watchlist: backendUser.watchlist || [],
        is_admin: backendUser.is_admin,
    };
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
