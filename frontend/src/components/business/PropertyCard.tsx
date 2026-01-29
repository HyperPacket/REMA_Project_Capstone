import type { Property } from '../../types';
import { Bed, Bath, Maximize, Heart, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPropertyType, formatListingType } from '../../utils/formatters';

interface PropertyCardProps {
    property: Property;
    isWatchlisted?: boolean;
    onToggleWatchlist?: (id: number) => void;
}

export const PropertyCard = ({ property, isWatchlisted, onToggleWatchlist }: PropertyCardProps) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/properties/${property.id}`)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer hover:-translate-y-1"
        >
            <div className="relative h-40 md:h-64 overflow-hidden">
                <img
                    src={property.images[0]}
                    alt={property.description}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                {/* Watchlist Button */}
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWatchlist?.(property.id);
                        }}
                        className={`p-2 rounded-full shadow-sm transition-colors ${isWatchlisted ? 'bg-white text-red-500' : 'bg-white/80 text-gray-500 hover:text-red-500'
                            }`}
                    >
                        <Heart size={18} fill={isWatchlisted ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Valuation Badge - Top Left */}
                {property.valuation && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1
            ${property.valuation === 'undervalued' ? 'bg-emerald-100 text-emerald-700' :
                            property.valuation === 'overvalued' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {property.valuation === 'undervalued' && <TrendingUp size={14} />}
                        {property.valuation === 'overvalued' && <AlertTriangle size={14} />}
                        <span className="capitalize">{property.valuation}</span> {property.valuation_percentage ? `${property.valuation_percentage}%` : ''}
                    </div>
                )}

                {/* Gradient Overlay & Price */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4">
                    <p className="text-white font-bold text-xl">{property.currency} {property.price.toLocaleString()}</p>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{formatPropertyType(property.type)} • {formatListingType(property.listing)}</p>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{property.city}, {property.neighborhood}</h3>
                </div>

                <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                    {property.bedroom !== 0 && (
                        <div className="flex items-center gap-1">
                            <Bed size={16} />
                            <span>{property.bedroom} Beds</span>
                        </div>
                    )}
                    {property.bathroom !== 0 && (
                        <div className="flex items-center gap-1">
                            <Bath size={16} />
                            <span>{property.bathroom} Baths</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Maximize size={16} />
                        <span>{property.surface_area} m²</span>
                    </div>
                </div>

                <Link
                    to={`/properties/${property.id}`}
                    className="block w-full py-2.5 rounded-xl text-center font-medium transition-colors text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};
