import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreateTiffinModal from '../components/CreateTiffinModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TiffinServices = () => {
    const { user } = useAuth();
    const [providers, setProviders] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' or 'all'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [filterArea, setFilterArea] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterMaxPrice, setFilterMaxPrice] = useState('');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'recommended') {
                const response = await api.get('/tiffin-providers/recommendations');
                setRecommendations(response.data || []);
            } else {
                let url = '/tiffin-providers?';
                if (filterArea) url += `area=${encodeURIComponent(filterArea)}&`;
                if (filterCity) url += `city=${encodeURIComponent(filterCity)}&`;
                if (filterMaxPrice) url += `maxPrice=${filterMaxPrice}&`;
                const response = await api.get(url);
                setProviders(response.data || []);
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch tiffin providers", err);
            setError("Failed to load tiffin providers. Please try again.");
            setLoading(false);
        }
    };

    const handleApplyFilter = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleOpenDetailModal = async (providerId) => {
        try {
            const response = await api.get(`/tiffin-providers/${providerId}`);
            setSelectedProvider(response.data);
        } catch (err) {
            console.error("Failed to fetch provider detail", err);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!selectedProvider || submittingReview) return;
        setSubmittingReview(true);

        try {
            await api.post(`/tiffin-providers/${selectedProvider.id}/reviews`, {
                rating: parseInt(reviewRating),
                comment: reviewComment
            });

            // Refresh details
            const updated = await api.get(`/tiffin-providers/${selectedProvider.id}`);
            setSelectedProvider(updated.data);
            setReviewComment('');
            setReviewRating(5);
            fetchData(); // refresh list
        } catch (err) {
            console.error("Failed to post review", err);
            alert("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Simple live sentiment estimation preview helper for review form
    const getLiveSentimentPreview = (text, rating) => {
        if (!text && !rating) return null;
        const lower = (text || '').toLowerCase();
        const posWords = ['delicious', 'tasty', 'fresh', 'great', 'good', 'loved', 'awesome', 'clean', 'best', 'homely'];
        const negWords = ['terrible', 'bad', 'stale', 'late', 'cold', 'salty', 'worst', 'horrible', 'dirty', 'poor'];
        
        let p = 0, n = 0;
        posWords.forEach(w => { if (lower.includes(w)) p++; });
        negWords.forEach(w => { if (lower.includes(w)) n++; });

        const score = (p - n) + (rating >= 4 ? 2 : (rating <= 2 ? -2 : 0));
        if (score > 0) return { label: 'Positive', emoji: '😊', style: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' };
        if (score < 0) return { label: 'Negative', emoji: '☹️', style: 'text-red-400 border-red-500/40 bg-red-950/40' };
        return { label: 'Neutral', emoji: '😐', style: 'text-gray-300 border-gray-600 bg-gray-800' };
    };

    const liveSentiment = getLiveSentimentPreview(reviewComment, reviewRating);
    const isOwnerOrProvider = user?.role === 'OWNER' || user?.role === 'PROVIDER';
    const displayList = activeTab === 'recommended' ? recommendations : providers;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
                {/* Header */}
                <div className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider mb-1">
                            <span>🍱 Meal & Food Marketplace</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                            Tiffin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">Providers & Thalis</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Discover daily thalis & cooks ranked by dietary match, ratings, and customer sentiment analysis.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {isOwnerOrProvider && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg transition flex items-center space-x-1.5"
                            >
                                <span>+</span>
                                <span>Add Tiffin Service</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800/80 p-3 rounded-2xl border border-gray-700">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab('recommended')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${
                                activeTab === 'recommended'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
                            }`}
                        >
                            <span>🎯</span>
                            <span>Recommended For You</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${
                                activeTab === 'all'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
                            }`}
                        >
                            <span>📋</span>
                            <span>All Providers</span>
                        </button>
                    </div>

                    {activeTab === 'all' && (
                        <form onSubmit={handleApplyFilter} className="flex flex-wrap items-center gap-2 text-xs">
                            <input
                                type="text"
                                placeholder="Filter Area (e.g. Sector 62)"
                                value={filterArea}
                                onChange={(e) => setFilterArea(e.target.value)}
                                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-white focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-white focus:outline-none w-28"
                            />
                            <input
                                type="number"
                                placeholder="Max Price ₹"
                                value={filterMaxPrice}
                                onChange={(e) => setFilterMaxPrice(e.target.value)}
                                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-xl text-white focus:outline-none w-28"
                            />
                            <button
                                type="submit"
                                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-xl font-bold transition"
                            >
                                Apply
                            </button>
                        </form>
                    )}
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-gray-800 rounded-3xl h-64 animate-pulse border border-gray-700"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-center text-red-400">
                        {error}
                    </div>
                ) : displayList.length === 0 ? (
                    <div className="bg-gray-800/60 border border-gray-700/60 rounded-3xl p-12 text-center text-gray-300 space-y-4 max-w-lg mx-auto shadow-2xl">
                        <div className="text-5xl">🍱</div>
                        <h3 className="text-2xl font-bold text-white">No Tiffin Providers Found</h3>
                        <p className="text-gray-400 text-sm">
                            Try adjusting your filters or add a new tiffin provider to SettleIn!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayList.map((provider) => {
                            const mainImg = provider.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                            return (
                                <div
                                    key={provider.id}
                                    className={`bg-gray-800/90 border rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 flex flex-col justify-between relative ${
                                        provider.bestMatch ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-gray-700/70 hover:border-amber-500/50'
                                    }`}
                                >
                                    <div>
                                        {/* Image Header */}
                                        <div className="relative h-44 w-full overflow-hidden bg-gray-950">
                                            <img
                                                src={mainImg}
                                                alt={provider.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                                                }}
                                            />

                                            {/* Best Match Badge */}
                                            {provider.bestMatch && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center space-x-1 animate-pulse">
                                                    <span>🏆 Best Match for You</span>
                                                </div>
                                            )}

                                            {!provider.bestMatch && (
                                                <div className="absolute top-3 left-3 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-black uppercase shadow-md">
                                                    {provider.cuisineType}
                                                </div>
                                            )}

                                            {provider.recommendationScore && (
                                                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-extrabold shadow-lg">
                                                    🎯 {provider.recommendationScore}% Match
                                                </div>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="p-5 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white line-clamp-1">{provider.name}</h3>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        📍 {provider.area}, <strong className="text-gray-300">{provider.city}</strong>
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-amber-400 font-extrabold text-sm flex items-center justify-end space-x-1">
                                                        <span>★</span>
                                                        <span>{provider.averageRating > 0 ? provider.averageRating : 'New'}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium">({provider.reviewCount} reviews)</span>
                                                </div>
                                            </div>

                                            {/* AI Recommendation Reason */}
                                            {provider.recommendationReason && (
                                                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200">
                                                    🤖 <span className="font-semibold">AI Match:</span> {provider.recommendationReason}
                                                </div>
                                            )}

                                            {/* Dietary & Sentiment Badges */}
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {provider.dietaryOptions && provider.dietaryOptions.map((diet, idx) => (
                                                    <span key={idx} className="bg-gray-900 text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-700 font-medium">
                                                        🥗 {diet}
                                                    </span>
                                                ))}

                                                {provider.positiveSentimentPercentage > 0 && (
                                                    <span className="bg-emerald-950/60 text-emerald-300 text-xs px-2.5 py-1 rounded-lg border border-emerald-700/60 font-semibold flex items-center space-x-1">
                                                        <span>😊</span>
                                                        <span>{provider.positiveSentimentPercentage}% Positive</span>
                                                    </span>
                                                )}
                                            </div>

                                            {provider.description && (
                                                <p className="text-xs text-gray-400 line-clamp-2 italic">
                                                    "{provider.description}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 pb-5 pt-3 border-t border-gray-700/60 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-gray-400 block font-medium">Monthly Plan</span>
                                            <span className="text-lg font-extrabold text-amber-400">
                                                ₹{provider.pricePerMonth?.toLocaleString('en-IN')}<span className="text-xs text-gray-400 font-normal">/mo</span>
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleOpenDetailModal(provider.id)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                                        >
                                            View Reviews & Menu ➔
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Provider Detail & Reviews Modal */}
            {selectedProvider && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-gray-800 border border-gray-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
                        <div className="flex justify-between items-start border-b border-gray-700 pb-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-bold uppercase text-amber-400">{selectedProvider.cuisineType} Cuisine</span>
                                    {selectedProvider.positiveSentimentPercentage > 0 && (
                                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                            😊 {selectedProvider.positiveSentimentPercentage}% Positive Sentiment
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl font-extrabold text-white">{selectedProvider.name}</h2>
                                <p className="text-xs text-gray-400">📍 {selectedProvider.area}, {selectedProvider.city}</p>
                            </div>
                            <button onClick={() => setSelectedProvider(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>

                        {/* Price & Contact */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-900/80 p-4 rounded-2xl border border-gray-700">
                            <div>
                                <span className="text-xs text-gray-400 block font-medium">Monthly Plan</span>
                                <span className="text-xl font-extrabold text-amber-400">
                                    ₹{selectedProvider.pricePerMonth?.toLocaleString('en-IN')}/mo
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block font-medium">Contact Phone</span>
                                <span className="text-sm font-bold text-white font-mono select-all">
                                    📞 {selectedProvider.contactPhone || 'Contact owner'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {selectedProvider.description && (
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase text-gray-400">Service Description</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">{selectedProvider.description}</p>
                            </div>
                        )}

                        {/* Add Review Section */}
                        <div className="border-t border-gray-700 pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                                    <span>⭐</span>
                                    <span>Write a Review</span>
                                </h4>
                                {liveSentiment && (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${liveSentiment.style}`}>
                                        {liveSentiment.emoji} Live Sentiment: {liveSentiment.label}
                                    </span>
                                )}
                            </div>

                            <form onSubmit={handleAddReview} className="space-y-3 text-xs">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-300 font-semibold">Rating:</span>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setReviewRating(star)}
                                                className={`text-lg transition ${star <= reviewRating ? 'text-amber-400 scale-110' : 'text-gray-600'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    required
                                    rows="2"
                                    placeholder="Share your experience with thali quality, taste, and delivery time..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none"
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>

                        {/* Existing Reviews List with Sentiment Badges */}
                        <div className="border-t border-gray-700 pt-4 space-y-3 max-h-60 overflow-y-auto">
                            <h4 className="text-sm font-bold text-white">
                                Customer Reviews ({selectedProvider.reviewCount || 0})
                            </h4>
                            {selectedProvider.reviews && selectedProvider.reviews.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedProvider.reviews.map((rev) => {
                                        const isPos = rev.sentiment === 'POSITIVE';
                                        const isNeg = rev.sentiment === 'NEGATIVE';
                                        return (
                                            <div key={rev.id} className="bg-gray-900/60 border border-gray-700/60 p-3 rounded-2xl space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-white text-xs">{rev.userName}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                                            isPos ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40' :
                                                            isNeg ? 'bg-red-950/60 text-red-300 border-red-600/40' :
                                                            'bg-gray-800 text-gray-300 border-gray-600'
                                                        }`}>
                                                            {isPos ? '😊 Positive' : isNeg ? '☹️ Negative' : '😐 Neutral'}
                                                        </span>
                                                    </div>
                                                    <span className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</span>
                                                </div>
                                                <p className="text-xs text-gray-300 leading-relaxed">{rev.comment}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No reviews written yet. Be the first to leave a review!</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Provider Modal */}
            <CreateTiffinModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProviderCreated={() => fetchData()}
            />
        </div>
    );
};

export default TiffinServices;
