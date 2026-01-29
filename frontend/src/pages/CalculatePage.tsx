import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { calculatePrice } from '../api/properties';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const CalculatePage = () => {
    const [formData, setFormData] = useState({
        city: 'Amman',
        neighborhood: '',
        type: 'apartment',
        surface_area: 100,
        bedroom: '2',
        bathroom: 1,
        furnishing: 'unfurnished',
        floor: 'first floor',
        listing: 'sale',
        userPrice: 0 // Optional, to check against valuation
    });

    // All cities in the database
    const cities = [
        'Amman', 'Irbid', 'Zarqa', 'Aqaba', 'Salt', 'Madaba',
        'Mafraq', 'Jerash', 'Ajloun', 'Al Karak', 'Tafila',
        "Ma'an", 'Ramtha', 'Jordan Valley'
    ];

    // Property types matching database
    const propertyTypes = [
        { value: 'apartment', label: 'Apartment' },
        { value: 'town house', label: 'Town House' },
        { value: 'villas and palaces', label: 'Villa / Palace' },
        { value: 'whole building', label: 'Whole Building' },
        { value: 'farms and chalets', label: 'Farm / Chalet' },
    ];
    const [result, setResult] = useState<{ predicted: number, valuation: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await calculatePrice({
                city: formData.city,
                type: formData.type,
                surface_area: formData.surface_area,
                bedroom: formData.bedroom,
                bathroom: formData.bathroom,
                furnishing: formData.furnishing,
                floor: formData.floor,
                neighborhood: formData.neighborhood,
                listing: formData.listing,
                price: formData.userPrice
            });
            setResult(data);
        } catch (error) {
            console.error("Calculation failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-primary text-white py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Price Calculator</h1>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Get an instant AI-powered validation for any property in Jordan. Enter the details below to see our predicted market value.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    {/* Form Section */}
                    <div className="p-8 md:w-1/2 border-r border-gray-100 flex flex-col justify-center">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        >
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.listing}
                                            onChange={e => setFormData({ ...formData, listing: e.target.value })}
                                        >
                                            <option value="sale">For Sale</option>
                                            <option value="rent">For Rent</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Neighborhood</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder-gray-400"
                                    placeholder="e.g. Abdoun, Khalda"
                                    value={formData.neighborhood}
                                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            {propertyTypes.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Size (m²)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        value={formData.surface_area}
                                        onChange={e => setFormData({ ...formData, surface_area: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.bedroom}
                                            onChange={e => setFormData({ ...formData, bedroom: e.target.value })}
                                        >
                                            <option value="studio">Studio</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.bathroom}
                                            onChange={e => setFormData({ ...formData, bathroom: Number(e.target.value) })}
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6+</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.furnishing}
                                            onChange={e => setFormData({ ...formData, furnishing: e.target.value })}
                                        >
                                            <option value="unfurnished">Unfurnished</option>
                                            <option value="semi furnished">Semi Furnished</option>
                                            <option value="furnished">Furnished</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Asking Price <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">JOD</span>
                                    <input
                                        type="number"
                                        className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="0.00"
                                        value={formData.userPrice || ''}
                                        onChange={e => setFormData({ ...formData, userPrice: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-blue-900 to-blue-800 hover:to-blue-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                            >
                                {loading ? 'Analyzing Market Data...' : <><Calculator size={20} /> Calculate Value</>}
                            </button>
                        </form>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-50/50 p-8 md:w-1/2 flex flex-col justify-center items-center text-center relative">
                        {/* Background Decor */}
                        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
                        </div>

                        {!result ? (
                            <div className="text-gray-400 space-y-6 max-w-sm relative z-10 opacity-70">
                                {/* Skeleton State */}
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                </div>
                                <p className="font-medium text-sm pt-4">Enter property details to estimate market value</p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in w-full relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                        <CheckCircle size={12} /> High Confidence
                                    </div>
                                    <p className="text-gray-500 font-medium uppercase tracking-wide text-sm">Estimated Market Value</p>
                                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 mt-2 tracking-tight">
                                        {result.predicted.toLocaleString()} <span className="text-2xl text-gray-400 font-bold">JOD</span>
                                    </h2>
                                </div>

                                {formData.userPrice > 0 && (
                                    <div className={`p-6 rounded-2xl border ${result.valuation === 'undervalued' ? 'bg-white border-emerald-100 shadow-emerald-100/50 shadow-lg' :
                                        result.valuation === 'overvalued' ? 'bg-white border-red-100 shadow-red-100/50 shadow-lg' : 'bg-white border-gray-200 shadow-lg'
                                        } transform transition-all hover:scale-[1.02]`}>
                                        <div className={`inline-flex p-3 rounded-full mb-3 ${result.valuation === 'undervalued' ? 'bg-emerald-100 text-emerald-600' :
                                            result.valuation === 'overvalued' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {result.valuation === 'undervalued' ? <TrendingUp size={24} /> : <AlertTriangle size={24} />}
                                        </div>
                                        <h3 className="font-bold text-xl capitalize mb-2 text-slate-900">{result.valuation} Deal</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            The asking price is <span className="font-bold">{Math.abs(Math.round((formData.userPrice - result.predicted) / result.predicted * 100))}%</span>
                                            {result.valuation === 'undervalued' ? ' lower ' : ' higher '}
                                            than market value.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-8 w-full flex justify-center">
                                    <button
                                        onClick={() => { setResult(null); setFormData({ ...formData, userPrice: 0 }); }}
                                        className="text-primary font-semibold hover:text-primary-dark transition-colors border-b border-primary/20 hover:border-primary pb-0.5"
                                    >
                                        Calculate Another Property
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
