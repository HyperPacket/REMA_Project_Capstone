/**
 * Opportunities Page
 * 
 * Displays undervalued properties with premium UI.
 * Features: filtering, search, pagination, creative stats display.
 */

import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { PropertyCard } from '../components/business/PropertyCard';
import { getOpportunities, getFilterOptions } from '../api/properties';
import { useWatchlist } from '../hooks/useWatchlist';
import type { Property } from '../types';
import {
    TrendingUp,
    Search,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Target,
    Zap,
    Filter,
    X,
    ChevronDown,
    Check
} from 'lucide-react';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

// Minimum discount thresholds for quick filters
const DISCOUNT_OPTIONS = [
    { value: 50, label: '50%+ Off', description: 'Great Deals' },
    { value: 60, label: '60%+ Off', description: 'Amazing Value' },
    { value: 70, label: '70%+ Off', description: 'Incredible Finds' },
    { value: 80, label: '80%+ Off', description: 'Rare Gems' },
];

const ITEMS_PER_PAGE = 24;

// Stats Card Component
const StatCard = ({ icon: Icon, value, label, gradient, delay }: {
    icon: React.ElementType,
    value: string | number,
    label: string,
    gradient: string,
    delay: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="relative group overflow-hidden rounded-2xl p-6 shadow-2xl border border-white/10"
    >
        {/* Vibrant Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-100 transition-all duration-500`} />

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

        <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 opacity-20 group-hover:opacity-30 transition-opacity">
            <Icon size={96} strokeWidth={1} />
        </div>

        <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Icon size={20} className="text-white" />
                </div>
                <p className="text-sm opacity-90 font-medium tracking-wide">{label}</p>
            </div>
            <p className="text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                {value}
            </p>
        </div>
    </motion.div>
);

// Filter Dropdown Component
const SelectDropdown = ({ label, value, onChange, options, placeholder = "Select" }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}) => {
    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer bg-white py-2.5 pl-4 pr-10 text-left rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm">
                        <span className="block truncate text-gray-700 font-medium">{selectedLabel}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-50 text-sm">
                            {options.map((option, idx) => (
                                <Listbox.Option
                                    key={idx}
                                    value={option.value}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-900'
                                        }`
                                    }
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                                                {option.label}
                                            </span>
                                            {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                                                    <Check className="h-4 w-4" />
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

export const OpportunitiesPage = () => {
    // Data state
    const [opportunities, setOpportunities] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [minDiscount, setMinDiscount] = useState(50);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [listingFilter, setListingFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Filter options from database
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    // Mobile filter sidebar
    const [showFilters, setShowFilters] = useState(false);

    // Watchlist
    const { watchlist, toggleWatchlist } = useWatchlist();

    // Stats for the top section
    const [topDeal, setTopDeal] = useState<Property | null>(null);

    // Mouse Spotlight State
    const [mousePosition] = useState({ x: 0, y: 0 });

    //const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    /*     const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const { left, top } = e.currentTarget.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - left,
                y: e.clientY - top,
            });
        }; */

    // Mouse Spotlight State
    /*     const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const { left, top } = e.currentTarget.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - left,
                y: e.clientY - top,
            });
        }; */

    // Fetch filter options
    useEffect(() => {
        getFilterOptions().then(opts => setAvailableCities(opts.cities));
    }, []);

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Fetch opportunities
    const fetchOpportunities = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {
                limit: ITEMS_PER_PAGE,
                page: currentPage,
                min_discount: minDiscount,
            };

            if (debouncedSearch) params.search = debouncedSearch;
            if (listingFilter) params.listing = listingFilter === 'buy' ? 'sale' : listingFilter;
            if (cityFilter) params.city = cityFilter;
            if (typeFilter) params.type = typeFilter;

            const response = await getOpportunities(params);

            setOpportunities(response.items);
            setTotalPages(response.pages);
            setTotalCount(response.total);

            // Set top deal from first item
            if (response.items.length > 0) {
                setTopDeal(response.items[0]);
            }
        } catch (error) {
            console.error('Failed to fetch opportunities', error);
            setOpportunities([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, minDiscount, debouncedSearch, listingFilter, cityFilter, typeFilter]);

    useEffect(() => {
        fetchOpportunities();
    }, [fetchOpportunities]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [minDiscount, debouncedSearch, listingFilter, cityFilter, typeFilter]);

    // Clear all filters
    const clearFilters = () => {
        setListingFilter('');
        setCityFilter('');
        setTypeFilter('');
        setSearchQuery('');
    };

    // Check if any filter is active
    const hasActiveFilters = listingFilter || cityFilter || typeFilter || searchQuery;

    // Page number generation
    const getPageNumbers = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    // Property type options
    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'town house', label: 'Town House' },
        { value: 'villas and palaces', label: 'Villa / Palace' },
        { value: 'whole building', label: 'Whole Building' },
        { value: 'farms and chalets', label: 'Farm / Chalet' },
    ];

    const listingOptions = [
        { value: '', label: 'All Listings' },
        { value: 'buy', label: 'Buy' },
        { value: 'rent', label: 'Rent' },
    ];

    return (
        <Layout>
            {/* Hero Section */}
            <div
                className="relative bg-[#0F172A] min-h-[500px] flex items-center overflow-hidden transition-colors duration-500"
            //onMouseMove={handleMouseMove}
            >
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Spotlight Effect */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`
                        }}
                    />




                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 w-full py-12">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">

                        {/* Left Side: Content */}
                        <div className="flex-1 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                                    <Sparkles size={14} />
                                    <span>AI-Powered Insights</span>
                                </div>

                                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                                    Discover <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                                        Hidden Value
                                    </span>
                                </h1>

                                <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                                    Our AI algorithms analyze thousands of properties to find listings priced significantly below market value.
                                </p>
                            </motion.div>

                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <StatCard
                                    icon={TrendingUp}
                                    value={totalCount.toLocaleString()}
                                    label={`Opportunities`}
                                    gradient="from-emerald-500 to-teal-500"
                                    delay={0.2}
                                />
                                <StatCard
                                    icon={Target}
                                    value={topDeal ? `${Math.abs(topDeal.valuation_percentage || 0).toFixed(0)}%` : '-'}
                                    label="Top Discount"
                                    gradient="from-amber-500 to-orange-500"
                                    delay={0.3}
                                />
                                <StatCard
                                    icon={Zap}
                                    value={topDeal ? `${topDeal.price?.toLocaleString()} JOD` : '-'}
                                    label="Starting Price"
                                    gradient="from-violet-500 to-purple-500"
                                    delay={0.4}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Discount Quick Filters */}
                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500 mb-3">Minimum Discount</p>
                    <div className="flex flex-wrap gap-3">
                        {DISCOUNT_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setMinDiscount(option.value)}
                                className={`group relative overflow-hidden px-5 py-3 rounded-xl font-medium transition-all duration-300 border ${minDiscount === option.value
                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                                    }`}
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">{option.label}</span>
                                        {minDiscount === option.value && <motion.div layoutId="active-check"><Check size={14} /></motion.div>}
                                    </div>
                                    <span className={`block text-xs mt-0.5 ${minDiscount === option.value ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-600/70'}`}>
                                        {option.description}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search city, neighborhood..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="w-40">
                            <SelectDropdown
                                label=""
                                value={listingFilter}
                                onChange={setListingFilter}
                                options={listingOptions}
                                placeholder="Listing"
                            />
                        </div>
                        <div className="w-40">
                            <SelectDropdown
                                label=""
                                value={cityFilter}
                                onChange={setCityFilter}
                                options={[{ value: '', label: 'All Cities' }, ...availableCities.map(c => ({ value: c, label: c }))]}
                                placeholder="City"
                            />
                        </div>
                        <div className="w-40">
                            <SelectDropdown
                                label=""
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={typeOptions}
                                placeholder="Type"
                            />
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <X size={16} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setShowFilters(true)}
                        className="md:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        <Filter size={18} />
                        Filters
                        {hasActiveFilters && (
                            <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">!</span>
                        )}
                    </button>
                </div>

                {/* Mobile Filter Modal */}
                {showFilters && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />
                        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                                <button onClick={() => setShowFilters(false)}>
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <SelectDropdown
                                    label="Listing Type"
                                    value={listingFilter}
                                    onChange={setListingFilter}
                                    options={listingOptions}
                                />
                                <SelectDropdown
                                    label="City"
                                    value={cityFilter}
                                    onChange={setCityFilter}
                                    options={[{ value: '', label: 'All Cities' }, ...availableCities.map(c => ({ value: c, label: c }))]}
                                />
                                <SelectDropdown
                                    label="Property Type"
                                    value={typeFilter}
                                    onChange={setTypeFilter}
                                    options={typeOptions}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Results Count */}
                <p className="text-gray-500 mb-6">
                    <span className="font-bold text-emerald-600">{totalCount.toLocaleString()}</span> opportunities found
                    {debouncedSearch && <span className="text-emerald-600 ml-2">for "{debouncedSearch}"</span>}
                </p>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600" />
                            <Sparkles className="absolute inset-0 m-auto text-emerald-600" size={24} />
                        </div>
                        <p className="mt-4 text-gray-500 font-medium animate-pulse">Discovering hidden gems...</p>
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-4">
                            <Target size={32} className="text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">No opportunities match your criteria</h3>
                        <p className="text-gray-500 mt-2 mb-6">Try adjusting your filters or discount threshold.</p>
                        <button
                            onClick={() => { clearFilters(); setMinDiscount(50); }}
                            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Property Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {opportunities.map((property, idx) => (
                                <div key={property.id} className="relative">
                                    {/* Ranking Badge for top 3 */}
                                    {idx < 3 && currentPage === 1 && (
                                        <div className={`absolute -top-3 -left-3 z-20 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                                'bg-gradient-to-br from-amber-600 to-amber-700'
                                            }`}>
                                            #{idx + 1}
                                        </div>
                                    )}
                                    <PropertyCard
                                        property={property}
                                        isWatchlisted={watchlist.includes(property.id)}
                                        onToggleWatchlist={toggleWatchlist}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    <ChevronLeft size={18} />
                                    <span className="hidden sm:inline">Previous</span>
                                </button>

                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((page, idx) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-xl font-medium transition-all ${currentPage === page
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <p className="text-center text-sm text-gray-500 mt-4">
                                Page {currentPage} of {totalPages}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </Layout>
    );
};
