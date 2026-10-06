import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/listings/${id}`);
                setListing(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching listing details", err);
                setError("Property not found or failed to load details.");
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        setDeleting(true);
        try {
            await api.delete(`/listings/${id}`);
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete listing.");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-12 flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
                    <h2 className="text-3xl font-bold text-red-400">Oops!</h2>
                    <p className="text-gray-300">{error}</p>
                    <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition">
                        Back to Listings
                    </Link>
                </div>
            </div>
        );
    }

    const images = (listing.images && listing.images.length > 0)
        ? listing.images
        : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

    const formattedRent = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(listing.rent);

    const isOwner = user && listing.ownerName === user.name;

    // Trust Score Badge colors and icon
    const badge = listing.trustBadge || 'VERIFIED';
    const score = listing.trustScore !== undefined ? listing.trustScore : 95;
    const flags = listing.trustFlags || [];

    const getTrustBadgeStyle = (b) => {
        switch (b) {
            case 'VERIFIED':
                return {
                    bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    icon: '🛡️',
                    label: 'Verified Listing'
                };
            case 'CAUTION':
                return {
                    bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    icon: '⚠️',
                    label: 'Caution Recommended'
                };
            case 'UNVERIFIED':
            default:
                return {
                    bg: 'bg-red-500/20 text-red-300 border-red-500/40',
                    icon: '❌',
                    label: 'Unverified / Flagged'
                };
        }
    };

    const trustStyle = getTrustBadgeStyle(badge);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-semibold text-gray-400 hover:text-white transition group"
                >
                    <svg className="w-5 h-5 mr-1.5 transform group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to browse
                </button>

                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                                listing.listingType === 'PG' ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}>
                                {listing.listingType}
                            </span>
                            <span className="text-gray-400 text-sm">{listing.city}</span>

                            {/* Trust Badge Header Pill */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${trustStyle.bg}`}>
                                <span>{trustStyle.icon}</span>
                                <span>{trustStyle.label}</span>
                                <span className="font-mono">({score}/100)</span>
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{listing.title}</h1>
                        <p className="text-gray-400 mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {listing.location}, {listing.city}
                        </p>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between">
                        <div className="text-3xl font-extrabold text-blue-400">
                            {formattedRent} <span className="text-sm font-normal text-gray-400">/month</span>
                        </div>
                        {isOwner && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="mt-3 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl border border-red-500/50 shadow-md transition"
                            >
                                {deleting ? 'Deleting...' : 'Delete Listing'}
                            </button>
                        )}
                    </div>
                </div>

                {/* IMAGE CAROUSEL SECTION */}
                <div className="space-y-4">
                    <div className="relative h-96 sm:h-[450px] w-full rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 shadow-2xl">
                        <img
                            src={images[currentImageIndex]}
                            alt={`Listing view ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover transition-all duration-300"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/70 hover:bg-gray-900 text-white p-3 rounded-full backdrop-blur-md border border-gray-700 transition"
                                >
                                    ❮
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/70 hover:bg-gray-900 text-white p-3 rounded-full backdrop-blur-md border border-gray-700 transition"
                                >
                                    ❯
                                </button>
                                <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-300 border border-gray-700">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Selector */}
                    {images.length > 1 && (
                        <div className="flex space-x-3 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                                        currentImageIndex === idx ? 'border-blue-500 scale-105 shadow-md' : 'border-gray-800 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    {/* Left 2 Cols: Overview & Amenities */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/60 space-y-3">
                            <h3 className="text-xl font-bold text-white">About Property</h3>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {listing.description || "No description provided for this property."}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/60 space-y-4">
                            <h3 className="text-xl font-bold text-white">Amenities Offered</h3>
                            {listing.amenities && listing.amenities.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {listing.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 bg-gray-900/70 px-4 py-2.5 rounded-xl border border-gray-700/50 text-sm font-medium text-gray-200">
                                            <span className="text-blue-400">✓</span>
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No amenities listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Trust Breakdown Card & Owner Contact Card */}
                    <div className="space-y-6">
                        {/* TRUST SCORE breakdown CARD */}
                        <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-2xl shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{trustStyle.icon}</span>
                                    <div>
                                        <h3 className="font-extrabold text-white text-base">Listing Trust Analysis</h3>
                                        <span className="text-xs text-gray-400">Heuristic verification breakdown</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                        {score}
                                    </span>
                                    <span className="text-xs text-gray-400">/100</span>
                                </div>
                            </div>

                            {/* Trust score progress bar */}
                            <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden border border-gray-700">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                                        score >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                                        'bg-gradient-to-r from-red-600 to-rose-500'
                                    }`}
                                    style={{ width: `${score}%` }}
                                ></div>
                            </div>

                            {/* Heuristics Flags */}
                            <div className="space-y-2 pt-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Audit Flags</h4>
                                {flags.length > 0 ? (
                                    <div className="space-y-2">
                                        {flags.map((flag, idx) => (
                                            <div key={idx} className="bg-gray-900/80 border border-gray-700/60 rounded-xl p-3 text-xs text-gray-200 leading-relaxed">
                                                {flag}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300">
                                        ✅ All heuristic checks passed. No outlier or duplicate flags detected.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* OWNER CONTACT CARD */}
                        <div className="bg-gradient-to-b from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700/80 shadow-xl space-y-5">
                            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-3">Listed By Owner</h3>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                                    {listing.ownerName?.charAt(0) || 'O'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{listing.ownerName}</h4>
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Verified Property Owner</span>
                                </div>
                            </div>

                            <button
                                onClick={() => alert(`Contacting ${listing.ownerName} for property query.`)}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition"
                            >
                                Contact Owner
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ListingDetail;
