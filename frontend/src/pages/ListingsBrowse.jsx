import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import FilterSidebar from '../components/FilterSidebar';
import CreateListingModal from '../components/CreateListingModal';
import AiSearchBar from '../components/AiSearchBar';
import LandingHero from '../components/LandingHero';
import EmptyState from '../components/EmptyState';
import { ListingCardSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const ListingsBrowse = () => {
    const toast = useToast();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // AI Search state
    const [aiSummary, setAiSummary] = useState(null);
    const [aiActive, setAiActive] = useState(false);

    const [filters, setFilters] = useState({
        city: '',
        listingType: '',
        minRent: '',
        maxRent: ''
    });

    const activeFilterCount = (filters.city ? 1 : 0) + (filters.listingType ? 1 : 0) + (filters.minRent || filters.maxRent ? 1 : 0);

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
            setError("Unable to load properties. Check your connection or try again.");
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
            toast.info(`AI processed your query: "${userPrompt.slice(0, 30)}..."`, 'Smart Search');
            setAiLoading(false);
        } catch (err) {
            console.error("AI Search failed", err);
            setError("AI Search failed. Please try a different query.");
            toast.error("Failed to run AI search. Please try regular filters.", 'Search Error');
            setAiLoading(false);
        }
    };

    const handleClearAiSearch = () => {
        setAiSummary(null);
        setAiActive(false);
        fetchListings();
        toast.info("AI filter cleared. Showing default verified listings.", "Search Cleared");
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
        toast.info("All property filters reset.", "Filters Reset");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
            <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
                {/* 1. STRONG LANDING PAGE HERO VALUE PROPOSITION */}
                <LandingHero />

                {/* 2. SEARCH & DISCOVERY ANCHOR */}
                <div id="listings-grid" className="space-y-6 pt-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center space-x-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                                <span>🏙️ Real-Time Verified Inventory</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Explore Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Homes & PGs</span>
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                                Browse transparent rentals verified against price gouging and duplicate images.
                            </p>
                        </div>

                        {/* Mobile Filter Toggle Button */}
                        <div className="lg:hidden w-full sm:w-auto">
                            <button
                                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md"
                            >
                                <span>⚙️</span>
                                <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filter Properties'}</span>
                                {activeFilterCount > 0 && (
                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* AI NATURAL LANGUAGE SEARCH BAR */}
                    <AiSearchBar
                        onSearch={handleAiSearch}
                        onClear={handleClearAiSearch}
                        loading={aiLoading}
                    />
                </div>

                {/* 3. GRID LAYOUT: SIDEBAR + LISTINGS */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Filter Sidebar (Desktop Always, Mobile Toggleable) */}
                    <div className={`lg:col-span-1 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'} transition-all`}>
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                        />
                    </div>

                    {/* Listings Display Grid */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* AI UNDERSTOOD QUERY SUMMARY BANNER */}
                        {aiActive && aiSummary && (
                            <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border border-blue-500/40 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5 shadow-xl animate-fadeIn">
                                <div className="text-2xl shrink-0">🤖</div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                                            AI Search Active
                                        </span>
                                        <button
                                            onClick={handleClearAiSearch}
                                            className="text-xs text-blue-300 hover:text-white underline font-semibold transition"
                                        >
                                            Reset AI Search
                                        </button>
                                    </div>
                                    <p className="text-sm sm:text-base font-semibold text-blue-100 leading-relaxed pt-1">
                                        {aiSummary}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* LOADING SKELETONS INSTEAD OF SPINNERS */}
                        {loading || aiLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <ListingCardSkeleton key={n} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-950/50 border border-red-800/60 rounded-3xl p-8 text-center space-y-3 text-red-300 shadow-xl">
                                <div className="text-3xl">⚠️</div>
                                <h3 className="text-lg font-bold text-white">Failed to Load Properties</h3>
                                <p className="text-xs text-red-300 max-w-md mx-auto">{error}</p>
                                <button
                                    onClick={fetchListings}
                                    className="bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        ) : listings.length === 0 ? (
                            /* EMPTY STATE FOR NO-RESULTS */
                            <EmptyState
                                icon="🏠"
                                title="No Properties Found"
                                description={
                                    filters.city || filters.listingType || filters.minRent || filters.maxRent
                                        ? "No verified homes matched your current search filters. Try widening your rent range or clearing city filters."
                                        : "There are currently no listings matching this search prompt. Try an alternate prompt or reset filters."
                                }
                                actionText="Reset All Filters"
                                onActionClick={handleResetFilters}
                                secondaryText="Explore Tiffin Services"
                                secondaryLink="/tiffin-services"
                            />
                        ) : (
                            <>
                                <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                                    <span>
                                        Showing <strong className="text-white">{listings.length}</strong> of{' '}
                                        <strong className="text-white">{totalElements}</strong> verified properties
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={handleResetFilters}
                                            className="text-blue-400 hover:text-blue-300 font-semibold"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                                    {listings.map((listing) => (
                                        <ListingCard key={listing.id} listing={listing} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center space-x-4 pt-8">
                                        <button
                                            onClick={() => setPage((p) => Math.max(p - 1, 0))}
                                            disabled={page === 0}
                                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300 hover:text-white transition"
                                        >
                                            ← Previous
                                        </button>
                                        <span className="text-xs sm:text-sm text-gray-400">
                                            Page <strong className="text-white">{page + 1}</strong> of{' '}
                                            <strong className="text-white">{totalPages}</strong>
                                        </span>
                                        <button
                                            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                                            disabled={page >= totalPages - 1}
                                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300 hover:text-white transition"
                                        >
                                            Next →
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
                onSuccess={() => {
                    fetchListings();
                    toast.success('Your property listing was submitted successfully!', 'Property Posted');
                }}
            />
        </div>
    );
};

export default ListingsBrowse;
