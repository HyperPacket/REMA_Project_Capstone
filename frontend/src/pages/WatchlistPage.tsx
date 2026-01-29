import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { PropertyCard } from '../components/business/PropertyCard';
import { getPropertyById } from '../api/properties';
import { useWatchlist } from '../hooks/useWatchlist';
import type { Property } from '../types';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WatchlistPage = () => {
    const [savedProperties, setSavedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Use centralized watchlist hook
    const { watchlist, toggleWatchlist } = useWatchlist();

    useEffect(() => {
        const fetchWatchlist = async () => {
            setLoading(true);
            if (watchlist.length > 0) {
                // Fetch details for all ids
                const props = await Promise.all(watchlist.map((id: number) => getPropertyById(id)));
                setSavedProperties(props.filter((p): p is Property => !!p));
            } else {
                setSavedProperties([]);
            }
            setLoading(false);
        };

        fetchWatchlist();
    }, [watchlist]);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Heart className="text-primary" fill="currentColor" /> My Watchlist
                </h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : savedProperties.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-300">
                        <h3 className="text-xl font-medium text-gray-600">Your watchlist is empty</h3>
                        <p className="text-gray-500 mt-2 mb-6">Start saving properties to keep track of them.</p>
                        <Link to="/properties" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors">
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedProperties.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isWatchlisted={true}
                                onToggleWatchlist={toggleWatchlist}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};
