import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import FilterSidebar from '../components/FilterSidebar';
import CreateListingModal from '../components/CreateListingModal';
import AiSearchBar from '../components/AiSearchBar';
import api from '../services/api';

const ListingsBrowse = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // AI Search state
    const [aiSummary, setAiSummary] = useState(null);
    const [aiActive, setAiActive] = useState(false);

    const [filters, setFilters] = useState({
        city: '',
        listingType: '',
        minRent: '',
        maxRent: ''
    });

    const fetchListings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                size: 9,
                ...(filters.city && { city: filters.city }),
                ...(filters.listingType && { listingType: filters.listingType }),
                ...(filters.minRent && { minRent: filters.minRent }),
                ...(filters.maxRent && { maxRent: filters.maxRent })
            };

            const response = await api.get('/listings', { params });
            setListings(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load listings", err);
            setError("Unable to load properties. Check your connection.");
            setLoading(false);
        }
    }, [page, filters]);

    const handleAiSearch = async (userPrompt) => {
        setAiLoading(true);
        setError('');
        try {
            const response = await api.post('/listings/ai-search', { query: userPrompt }, { params: { page: 0, size: 9 } });
            const data = response.data;

            setAiSummary(data.summary);
            setAiActive(true);

            if (data.listings) {
                setListings(data.listings.content || []);
                setTotalPages(data.listings.totalPages || 0);
                setTotalElements(data.listings.totalElements || 0);
            }
            setAiLoading(false);
        } catch (err) {
            console.error("AI Search failed", err);
            setError("AI Search failed. Please try a different query.");
            setAiLoading(false);
        }
    };

    const handleClearAiSearch = () => {
        setAiSummary(null);
        setAiActive(false);
        fetchListings();
    };

    useEffect(() => {
        if (!aiActive) {
            fetchListings();
        }
    }, [fetchListings, aiActive]);

    const handleFilterChange = (key, value) => {
        setAiActive(false);
        setAiSummary(null);
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setAiActive(false);
        setAiSummary(null);
        setFilters({
            city: '',
            listingType: '',
            minRent: '',
            maxRent: ''
        });
        setPage(0);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
                {/* Hero Header */}
                <div className="text-center sm:text-left space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Space</span>
                    </h1>
                    <p className="text-lg text-gray-400">
                        Search naturally with AI or filter verified PGs and flats across India.
                    </p>
                </div>

                {/* AI SEARCH BAR */}
                <AiSearchBar
                    onSearch={handleAiSearch}
                    onClear={handleClearAiSearch}
                    loading={aiLoading}
                />

                {/* Grid Layout: Sidebar + Listings */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                        />
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* AI UNDERSTOOD SUMMARY BADGE */}
                        {aiActive && aiSummary && (
                            <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border border-blue-500/40 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5 shadow-xl">
                                <div className="text-2xl shrink-0">🤖</div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                                            AI Search Active
                                        </span>
                                        <button
                                            onClick={handleClearAiSearch}
                                            className="text-xs text-gray-400 hover:text-white underline"
                                        >
                                            Reset AI Search
                                        </button>
                                    </div>
                                    <p className="text-sm sm:text-base font-semibold text-blue-200 leading-relaxed">
                                        {aiSummary}
                                    </p>
                                </div>
                            </div>
                        )}

                        {loading || aiLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-gray-800 rounded-2xl h-80 animate-pulse border border-gray-700"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-center text-red-400">
                                {error}
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-12 text-center space-y-3">
                                <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="text-xl font-bold text-gray-300">No properties found</h3>
                                <p className="text-sm text-gray-400">Try refining your AI prompt or reset filters to explore all properties.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <span>Showing <strong className="text-white">{listings.length}</strong> of <strong className="text-white">{totalElements}</strong> properties</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {listings.map((listing) => (
                                        <ListingCard key={listing.id} listing={listing} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center space-x-4 pt-6">
                                        <button
                                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                                            disabled={page === 0}
                                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-400">
                                            Page <strong className="text-white">{page + 1}</strong> of <strong className="text-white">{totalPages}</strong>
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                                            disabled={page >= totalPages - 1}
                                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <CreateListingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => fetchListings()}
            />
        </div>
    );
};

export default ListingsBrowse;
