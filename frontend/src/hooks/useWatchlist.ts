/**
 * Watchlist Hook
 * 
 * Provides watchlist state and toggle functionality.
 * Centralizes watchlist logic that was duplicated across multiple components.
 */

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface WatchlistHook {
    watchlist: number[];
    toggleWatchlist: (id: number) => Promise<void>;
    isWatchlisted: (id: number) => boolean;
}

/**
 * Custom hook for managing watchlist state.
 * Uses AuthContext to sync with backend database.
 */
export const useWatchlist = (): WatchlistHook => {
    const { user, updateWatchlist: authUpdateWatchlist, isAuthenticated } = useAuth();

    // Use empty array if user is not logged in or has no watchlist
    const watchlist = user?.watchlist || [];

    /**
     * Toggle property in watchlist.
     * Requires user to be logged in.
     */
    const toggleWatchlist = useCallback(async (id: number) => {
        if (!isAuthenticated) {
            alert("Please login to use watchlist!");
            return;
        }

        const isAdded = watchlist.includes(id);
        const action = isAdded ? 'remove' : 'add';

        await authUpdateWatchlist(id, action);
    }, [isAuthenticated, watchlist, authUpdateWatchlist]);

    /**
     * Check if property is in watchlist.
     */
    const isWatchlisted = useCallback((id: number): boolean => {
        return watchlist.includes(id);
    }, [watchlist]);

    return { watchlist, toggleWatchlist, isWatchlisted };
};
