/**
 * Properties Page
 * 
 * Displays filterable, searchable, paginated list of properties.
 * All filtering and searching is done server-side.
 */

import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { PropertyCard } from '../components/business/PropertyCard';
import { FilterSidebar } from '../components/business/FilterSidebar';
import { getProperties, getFilterOptions } from '../api/properties';
import { useWatchlist } from '../hooks/useWatchlist';
import type { Property } from '../types';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

// Filter interface for type safety
interface Filters {
    city: string;
    type: string;
    listing: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
}

const ITEMS_PER_PAGE = 24;

export const PropertiesPage = () => {
    // Property data state
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filter and search state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filters, setFilters] = useState<Filters>({
        city: '',
        type: '',
        listing: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
    });

    // Available filter options from database
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Watchlist from custom hook
    const { watchlist, toggleWatchlist } = useWatchlist();

    // Fetch available filter options on mount
    useEffect(() => {
        getFilterOptions().then(opts => {
            setAvailableCities(opts.cities);
        });
    }, []);

    // Debounce search input
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Fetch properties when filters, search, sort, or page changes
    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                limit: ITEMS_PER_PAGE,
                page: currentPage,
            };

            // Add search query (server-side)
            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            // Add filters
            if (filters.city) params.city = filters.city;
            if (filters.type) params.type = filters.type;
            if (filters.listing) params.listing = filters.listing;
            if (filters.minPrice) params.min_price = Number(filters.minPrice);
            if (filters.maxPrice) params.max_price = Number(filters.maxPrice);
            if (filters.bedrooms) params.bedrooms = filters.bedrooms;
            if (filters.bathrooms) params.bathrooms = filters.bathrooms;

            // Add sorting
            if (sortBy !== 'newest') params.sort = sortBy;

            const response = await getProperties(params);

            setProperties(response.items);
            setTotalPages(response.pages);
            setTotalCount(response.total);
        } catch (error) {
            console.error("Failed to fetch properties", error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, filters, sortBy]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // Reset to page 1 when filters or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filters, sortBy]);

    // Handle filter changes from sidebar
    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    // Generate page numbers for pagination
    const getPageNumbers = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            // Show all pages if small enough
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row min-h-screen">
                <FilterSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    onFilterChange={handleFilterChange}
                    cities={availableCities}
                />

                <div className="flex-1 p-6 md:p-8">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search city, neighborhood..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <SlidersHorizontal size={18} /> Filters
                            </button>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="newest">Newest Added</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="valuation">Best Value (AI)</option>
                            </select>
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-500 animate-pulse">REMA is analyzing market prices...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 mb-4">
                                {totalCount.toLocaleString()} Properties Found
                                {debouncedSearch && <span className="text-primary ml-2">for "{debouncedSearch}"</span>}
                            </p>

                            {properties.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-300">
                                    <h3 className="text-xl font-medium text-gray-600">No properties found</h3>
                                    <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {properties.map(property => (
                                            <PropertyCard
                                                key={property.id}
                                                property={property}
                                                isWatchlisted={watchlist.includes(property.id)}
                                                onToggleWatchlist={toggleWatchlist}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8">
                                            {/* Previous Button */}
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft size={18} />
                                                <span className="hidden sm:inline">Previous</span>
                                            </button>

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {getPageNumbers().map((page, idx) => (
                                                    page === '...' ? (
                                                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">...</span>
                                                    ) : (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                                                                ? 'bg-primary text-white'
                                                                : 'hover:bg-gray-100 text-gray-700'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                                ))}
                                            </div>

                                            {/* Next Button */}
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Page Info */}
                                    {totalPages > 1 && (
                                        <p className="text-center text-sm text-gray-500 mt-4">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};
