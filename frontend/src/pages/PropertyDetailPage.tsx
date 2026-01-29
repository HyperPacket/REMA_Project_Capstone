import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ChatWidget } from '../components/business/ChatWidget';
import { PropertyCard } from '../components/business/PropertyCard';
import { PropertyMap } from '../components/business/PropertyMap';
import { getPropertyById, getSimilarProperties } from '../api/properties';
import type { Property } from '../types';
import { MapPin, Bed, Bath, Maximize, ArrowLeft, Heart, Share2, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatPropertyType, formatListingType } from '../utils/formatters';
import { useWatchlist } from '../hooks/useWatchlist';

export const PropertyDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const { watchlist, toggleWatchlist } = useWatchlist();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (id) {
                const prop = await getPropertyById(Number(id));
                setProperty(prop || null);

                // Fetch similar properties using the API
                const similar = await getSimilarProperties(Number(id), 3);
                setRelatedProperties(similar);
            }
            setLoading(false);
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return <Layout><div className="min-h-screen flex items-center justify-center">Loading...</div></Layout>;
    if (!property) return <Layout><div className="min-h-screen flex items-center justify-center">Property not found</div></Layout>;

    const isWatchlisted = watchlist.includes(property.id);

    return (
        <Layout>
            <div className="bg-white min-h-screen pb-12">
                {/* Navigation Breadcrumb */}
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link to="/properties" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors mb-4">
                        <ArrowLeft size={20} className="mr-2" /> Back to Properties
                    </Link>
                </div>

                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bento Grid Gallery */}
                        <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-2 relative group">
                            {/* Main Image (Left, larger) */}
                            <div className="md:col-span-3 h-full relative overflow-hidden">
                                <img
                                    src={property.images[0]}
                                    alt={property.description}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>

                            {/* Side Grid (Right, 2 stacked) */}
                            <div className="hidden md:flex flex-col gap-2 md:col-span-1 h-full">
                                <div className="flex-1 relative overflow-hidden">
                                    <img
                                        src={property.images[1] || property.images[0]}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                        alt="Gallery detail"
                                    />
                                </div>
                                <div className="flex-1 relative overflow-hidden">
                                    <img
                                        src={property.images[2] || property.images[0]}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                        alt="Gallery detail"
                                    />
                                    {property.images.length > 3 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px] transition-opacity hover:bg-black/60">
                                            +{property.images.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Valuation Badge Overlay */}
                            {property.valuation && (
                                <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg flex items-center gap-2 backdrop-blur-md z-10
                            ${property.valuation === 'undervalued' ? 'bg-white/90 text-emerald-700' :
                                        property.valuation === 'overvalued' ? 'bg-white/90 text-red-600' : 'bg-white/90 text-yellow-700'}`}>
                                    {property.valuation === 'undervalued' && <TrendingUp size={18} />}
                                    {property.valuation === 'overvalued' && <AlertTriangle size={18} />}
                                    <span>{property.valuation} Check</span>
                                </div>
                            )}

                            {/* View All Button */}
                            <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all backdrop-blur-sm z-10 flex items-center gap-2">
                                <Maximize size={16} /> View All Photos
                            </button>
                        </div>

                        {/* Main Info */}
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 text-primary font-semibold uppercase tracking-wide text-sm mb-1">
                                        <span>{formatPropertyType(property.type)}</span>
                                        <span>•</span>
                                        <span>{formatListingType(property.listing)}</span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight">{property.currency} {property.price.toLocaleString()}</h1>
                                    <div className="flex items-center text-gray-500 text-lg">
                                        <MapPin size={20} className="mr-1" />
                                        {property.neighborhood}, {property.city}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                                        <Share2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => toggleWatchlist(property.id)}
                                        className={`p-3 rounded-full border shadow-sm transition-all duration-300 ${isWatchlisted
                                            ? 'bg-red-50 border-red-200 text-red-500'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-red-500'
                                            }`}
                                    >
                                        <Heart size={20} fill={isWatchlisted ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100">
                                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50">
                                    <Bed className="text-slate-900 mb-2" size={28} strokeWidth={1.5} />
                                    <span className="block font-bold text-2xl text-slate-900">{property.bedroom}</span>
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bedrooms</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50">
                                    <Bath className="text-slate-900 mb-2" size={28} strokeWidth={1.5} />
                                    <span className="block font-bold text-2xl text-slate-900">{property.bathroom}</span>
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Bathrooms</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50">
                                    <Maximize className="text-slate-900 mb-2" size={28} strokeWidth={1.5} />
                                    <span className="block font-bold text-2xl text-slate-900">{property.surface_area}</span>
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Size (m²)</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {property.description}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Furnishing: {property.furnishing}</span>
                                    {property.floor && <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Floor: {property.floor}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI & Contact */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* AI Insight Card - Shows for all valuations */}
                        {property.valuation && property.predicted_price && (
                            <div className={`bg-white border-l-4 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow
                                ${property.valuation === 'undervalued' ? 'border-l-emerald-500' :
                                    property.valuation === 'overvalued' ? 'border-l-red-500' : 'border-l-amber-500'}
                                border border-t-gray-100 border-r-gray-100 border-b-gray-100`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`p-2 rounded-lg
                                        ${property.valuation === 'undervalued' ? 'bg-emerald-100 text-emerald-600' :
                                            property.valuation === 'overvalued' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {property.valuation === 'undervalued' ? <TrendingUp size={20} /> :
                                            property.valuation === 'overvalued' ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg">REMA AI Valuation</h3>
                                </div>

                                {/* Predicted vs Listed Price */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">Listed Price</span>
                                        <span className="font-bold text-slate-900">{property.currency} {property.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm">AI Predicted</span>
                                        <span className="font-bold text-slate-900">{property.currency} {property.predicted_price.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Valuation Badge */}
                                <div className={`flex items-center justify-center gap-2 py-3 rounded-lg mb-3
                                    ${property.valuation === 'undervalued' ? 'bg-emerald-50 text-emerald-700' :
                                        property.valuation === 'overvalued' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                    <span className="text-2xl font-bold">
                                        {Math.abs(property.valuation_percentage || 0).toFixed(1)}%
                                    </span>
                                    <span className="font-medium capitalize">
                                        {property.valuation === 'undervalued' ? 'Below Market' :
                                            property.valuation === 'overvalued' ? 'Above Market' : 'Fair Value'}
                                    </span>
                                </div>

                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {property.valuation === 'undervalued'
                                        ? `Great deal! This ${formatPropertyType(property.type)} is priced below similar properties in ${property.neighborhood}.`
                                        : property.valuation === 'overvalued'
                                            ? `This ${formatPropertyType(property.type)} is priced higher than similar properties in ${property.neighborhood}. Consider negotiating.`
                                            : `This ${formatPropertyType(property.type)} is fairly priced for ${property.neighborhood}.`}
                                </p>
                            </div>
                        )}

                        {/* Chat Widget sticky-ish */}
                        <div className="sticky top-24 space-y-6">
                            <div>
                                <ChatWidget
                                    context="property"
                                    propertyContext={property}
                                />
                            </div>

                            {/* Interactive Map */}
                            <PropertyMap
                                latitude={property.latitude}
                                longitude={property.longitude}
                                neighborhood={property.neighborhood}
                                city={property.city}
                            />
                        </div>
                    </div>
                </div>

                {/* Related Properties */}
                <div className="max-w-7xl mx-auto px-4 mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedProperties.map(p => (
                            <PropertyCard
                                key={p.id}
                                property={p}
                                isWatchlisted={watchlist.includes(p.id)}
                                onToggleWatchlist={toggleWatchlist}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
