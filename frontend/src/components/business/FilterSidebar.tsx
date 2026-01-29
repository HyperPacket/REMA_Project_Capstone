import { useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';

// Matches the Filters interface used in PropertiesPage
interface Filters {
    city: string;
    type: string;
    listing: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
}

interface FilterSidebarProps {
    onFilterChange: (filters: Filters) => void;
    isOpen: boolean;
    onClose: () => void;
    cities: string[];
}

const SelectDropdown = ({ label, value, onChange, options, placeholder = "Select option" }: any) => {
    // Find selected label
    const selectedLabel = options.find((o: any) => o.value === value)?.label || options.find((o: any) => o.value === "")?.label || placeholder;

    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
            <Listbox value={value} onChange={onChange}>
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer bg-white py-2.5 pl-4 pr-10 text-left rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm">
                        <span className="block truncate text-gray-700 font-medium">{selectedLabel}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                            {options.map((option: any, personIdx: number) => (
                                <Listbox.Option
                                    key={personIdx}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-50 text-primary' : 'text-gray-900'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-semibold' : 'font-normal'
                                                    }`}
                                            >
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                            ) : null}
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
}

export const FilterSidebar = ({ onFilterChange, isOpen, onClose, cities }: FilterSidebarProps) => {
    const [filters, setFilters] = useState<any>({
        city: '',
        type: '',
        listing: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
    });

    const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            city: '',
            type: '',
            listing: '',
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            bathrooms: '',
        }
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    // Options for dropdowns - matching actual database values
    const cityOptions = [
        { value: '', label: 'All Cities' },
        ...cities.map(c => ({ value: c, label: c }))
    ];

    // Property types matching database exactly
    const typeOptions = [
        { value: '', label: 'Any Property Type' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'town house', label: 'Town House' },
        { value: 'villas and palaces', label: 'Villa / Palace' },
        { value: 'whole building', label: 'Whole Building' },
        { value: 'farms and chalets', label: 'Farm / Chalet' },
    ];

    // Listing type filter
    const listingOptions = [
        { value: '', label: 'Buy or Rent' },
        { value: 'sale', label: 'For Sale' },
        { value: 'rent', label: 'For Rent' },
    ];

    // Bedroom options
    const bedroomOptions = [
        { value: '', label: 'Any' },
        { value: 'studio', label: 'Studio' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' }
    ];

    // Bathroom options
    const bathroomOptions = [
        { value: '', label: 'Any' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6+', label: '6+' },
    ];

    // Extract content to avoid duplication
    const SidebarContent = () => (
        <div className="h-full flex flex-col">
            {/* Header (Mobile Only for Close) */}
            <div className="p-6 md:p-0 md:mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Filter size={20} className="text-primary" /> Filters
                </h2>
                <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 md:p-0 space-y-6 flex-1 overflow-y-auto md:overflow-visible custom-scrollbar">
                {/* Listing Type (Rent/Sale) */}
                <div>
                    <SelectDropdown
                        label="Listing Type"
                        value={filters.listing}
                        onChange={(val: string) => handleChange('listing', val)}
                        options={listingOptions}
                    />
                </div>

                {/* Location Section */}
                <div>
                    <SelectDropdown
                        label="Location"
                        value={filters.city}
                        onChange={(val: string) => handleChange('city', val)}
                        options={cityOptions}
                    />
                </div>

                {/* Property Type */}
                <div>
                    <SelectDropdown
                        label="Property Type"
                        value={filters.type}
                        onChange={(val: string) => handleChange('type', val)}
                        options={typeOptions}
                    />
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price Range (JOD)</label>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handleChange('minPrice', e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="relative w-full">
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handleChange('maxPrice', e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Range: 1 - 11,000,000 JOD</p>
                </div>

                {/* Bedrooms & Bathrooms Side-by-Side */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <SelectDropdown
                            label="Bedrooms"
                            value={filters.bedrooms}
                            onChange={(val: string) => handleChange('bedrooms', val)}
                            options={bedroomOptions}
                        />
                    </div>
                    <div className="flex-1">
                        <SelectDropdown
                            label="Bathrooms"
                            value={filters.bathrooms}
                            onChange={(val: string) => handleChange('bathrooms', val)}
                            options={bathroomOptions}
                        />
                    </div>
                </div>


                <button
                    onClick={handleReset}
                    className="block w-full mt-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 text-sm font-semibold transition"
                >
                    Reset All Filters
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar (Fixed Overlay) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}
            <aside className={`
                fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 
                transform transition-transform duration-300 ease-in-out md:hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar (Sticky Column) */}
            <div className="hidden md:block w-72 flex-shrink-0 ml-6">
                <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-2">
                    <SidebarContent />
                </div>
            </div>
        </>
    );
};
