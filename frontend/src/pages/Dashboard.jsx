import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import api from '../services/api';
import SubscribeTiffinModal from '../components/SubscribeTiffinModal';
import CreateListingModal from '../components/CreateListingModal';
import { DashboardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const DEFAULT_CITY_ANALYTICS = [
    { city: 'Bangalore', totalListings: 48, averageRent: 19500, pgCount: 28, flatCount: 20 },
    { city: 'Mumbai', totalListings: 62, averageRent: 29000, pgCount: 32, flatCount: 30 },
    { city: 'Pune', totalListings: 35, averageRent: 14800, pgCount: 22, flatCount: 13 },
    { city: 'Delhi NCR', totalListings: 54, averageRent: 21500, pgCount: 31, flatCount: 23 },
    { city: 'Hyderabad', totalListings: 41, averageRent: 16200, pgCount: 25, flatCount: 16 },
    { city: 'Chennai', totalListings: 29, averageRent: 13900, pgCount: 18, flatCount: 11 }
];

const RENT_TRENDS_DATA = [
    { month: 'May', Bangalore: 17800, Mumbai: 27000, Pune: 13500, Delhi: 20000 },
    { month: 'Jun', Bangalore: 18200, Mumbai: 27400, Pune: 13800, Delhi: 20400 },
    { month: 'Jul', Bangalore: 18700, Mumbai: 28100, Pune: 14100, Delhi: 20900 },
    { month: 'Aug', Bangalore: 19100, Mumbai: 28600, Pune: 14400, Delhi: 21200 },
    { month: 'Sep', Bangalore: 19300, Mumbai: 28900, Pune: 14600, Delhi: 21400 },
    { month: 'Oct', Bangalore: 19500, Mumbai: 29000, Pune: 14800, Delhi: 21500 }
];

const SAMPLE_FLATMATE_MATCHES = [
    {
        id: 1,
        matchUserId: 105,
        name: "Aarav Sharma",
        matchScore: 94,
        city: "Bangalore",
        preferredLocation: "Koramangala / HSR",
        budgetMax: 18000,
        occupation: "Software Engineer @ Zeta",
        sleepHabit: "Night Owl",
        cleanliness: "Very Neat",
        foodPreference: "Eggetarian",
        workFromHome: "Hybrid",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        bio: "Looking for an easygoing flatmate who values cleanliness and quiet work hours."
    },
    {
        id: 2,
        matchUserId: 108,
        name: "Pooja Hegde",
        matchScore: 89,
        city: "Bangalore",
        preferredLocation: "Indiranagar",
        budgetMax: 22000,
        occupation: "Product Designer @ Swiggy",
        sleepHabit: "Early Bird",
        cleanliness: "Moderate",
        foodPreference: "Pure Veg",
        workFromHome: "Full Remote",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        bio: "Design nerd, coffee lover, loves weekend cooking and keeping common spaces tidy."
    },
    {
        id: 3,
        matchUserId: 112,
        name: "Rohan Varma",
        matchScore: 84,
        city: "Bangalore",
        preferredLocation: "Bellandur / Sarjapur",
        budgetMax: 16000,
        occupation: "Data Analyst @ Flipkart",
        sleepHabit: "Flexible",
        cleanliness: "Neat",
        foodPreference: "Non-Veg Friendly",
        workFromHome: "Onsite",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        bio: "Chill person who loves football on weekends and quiet evenings on weekdays."
    }
];

const SAMPLE_OWNER_LISTINGS = [
    {
        id: 501,
        title: "Spacious Sunlit 2BHK with Balcony",
        rent: 28000,
        city: "Bangalore",
        location: "HSR Layout, Sector 2",
        listingType: "FLAT",
        viewCount: 384,
        trustScore: 96,
        trustBadge: "VERIFIED",
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
        amenities: ["Covered Parking", "Lift", "Power Backup", "Modular Kitchen"]
    },
    {
        id: 502,
        title: "Premium Single PG Room with Food & WiFi",
        rent: 13500,
        city: "Bangalore",
        location: "Koramangala, 4th Block",
        listingType: "PG",
        viewCount: 521,
        trustScore: 91,
        trustBadge: "VERIFIED",
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
        amenities: ["3 Meals Daily", "Hi-Speed WiFi", "Washing Machine", "Housekeeping"]
    },
    {
        id: 503,
        title: "Furnished 1BHK Near Metro Station",
        rent: 18000,
        city: "Bangalore",
        location: "Indiranagar",
        listingType: "FLAT",
        viewCount: 219,
        trustScore: 88,
        trustBadge: "VERIFIED",
        images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"],
        amenities: ["AC", "Geyser", "RO Water", "Gated Security"]
    }
];

const PIE_COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        bookmarkedListings,
        bookmarkedProviders,
        subscriptions,
        toggleBookmarkListing,
        toggleBookmarkProvider,
        toggleSubscriptionStatus,
        cancelSubscription
    } = useBookmarks();

    // Active Dashboard Tab: 'overview', 'bookmarks', 'matches', 'subscriptions', 'owner_listings'
    const isOwner = user?.role === 'OWNER';
    const [activeTab, setActiveTab] = useState('overview');
    const [bookmarkSubTab, setBookmarkSubTab] = useState('listings'); // 'listings' | 'providers'
    
    // Remote state
    const [ownerListings, setOwnerListings] = useState([]);
    const [cityAnalytics, setCityAnalytics] = useState(DEFAULT_CITY_ANALYTICS);
    const [flatmateMatches, setFlatmateMatches] = useState(SAMPLE_FLATMATE_MATCHES);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [selectedProviderForSubscribe, setSelectedProviderForSubscribe] = useState(null);
    const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch owner listings if owner
            if (isOwner) {
                try {
                    const res = await api.get('/listings/my-listings');
                    if (res.data && res.data.length > 0) {
                        setOwnerListings(res.data);
                    } else {
                        setOwnerListings(SAMPLE_OWNER_LISTINGS);
                    }
                } catch {
                    setOwnerListings(SAMPLE_OWNER_LISTINGS);
                }
            }

            // Fetch analytics
            try {
                const analyticsRes = await api.get('/listings/analytics');
                if (analyticsRes.data && analyticsRes.data.length > 0) {
                    setCityAnalytics(analyticsRes.data);
                }
            } catch {
                // Keep default
            }

            // Fetch flatmate matches
            try {
                const matchRes = await api.get('/preferences/matches?top=6');
                if (matchRes.data && matchRes.data.length > 0) {
                    setFlatmateMatches(matchRes.data);
                }
            } catch {
                // Keep default sample matches
            }
        } finally {
            setLoading(false);
        }
    };

    // Total view counts for owner
    const displayedOwnerListings = ownerListings.length > 0 ? ownerListings : SAMPLE_OWNER_LISTINGS;
    const totalOwnerViews = displayedOwnerListings.reduce((sum, item) => sum + (item.viewCount || 0), 0);
    const averageOwnerTrust = Math.round(
        displayedOwnerListings.reduce((sum, item) => sum + (item.trustScore || 90), 0) /
        (displayedOwnerListings.length || 1)
    );

    // Format currency helper
    const formatINR = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
            <Navbar onOpenCreateModal={() => setIsCreateListingModalOpen(true)} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* User Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-800 via-gray-800/90 to-gray-800 border border-gray-700/80 p-6 sm:p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-purple-900/30">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                        Welcome, {user?.name || 'Explorer'}!
                                    </h1>
                                    <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-full uppercase font-bold border border-purple-500/30">
                                        {user?.role || 'SEEKER'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                    Manage your saved accommodations, roommate pairings, tiffin plans, and market trends in one place.
                                </p>
                            </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/"
                                className="bg-gray-700/70 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-600/50 transition flex items-center space-x-1.5"
                            >
                                <span>🔍</span>
                                <span>Browse Homes</span>
                            </Link>

                            <Link
                                to="/tiffin-services"
                                className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-amber-500/40 transition flex items-center space-x-1.5"
                            >
                                <span>🍱</span>
                                <span>Explore Tiffins</span>
                            </Link>

                            {isOwner && (
                                <button
                                    onClick={() => setIsCreateListingModalOpen(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 flex items-center space-x-1.5"
                                >
                                    <span>➕</span>
                                    <span>Post Property</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-gray-700/60">
                        <div 
                            onClick={() => { setActiveTab('bookmarks'); setBookmarkSubTab('listings'); }}
                            className="bg-gray-900/60 hover:bg-gray-900/90 p-3.5 rounded-2xl border border-gray-700/50 cursor-pointer transition transform hover:-translate-y-0.5"
                        >
                            <div className="text-xs text-gray-400 font-medium">Saved Listings</div>
                            <div className="text-xl sm:text-2xl font-black text-pink-400 mt-1">
                                {bookmarkedListings.length}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Properties bookmarked</div>
                        </div>

                        <div 
                            onClick={() => { setActiveTab('bookmarks'); setBookmarkSubTab('providers'); }}
                            className="bg-gray-900/60 hover:bg-gray-900/90 p-3.5 rounded-2xl border border-gray-700/50 cursor-pointer transition transform hover:-translate-y-0.5"
                        >
                            <div className="text-xs text-gray-400 font-medium">Saved Tiffins</div>
                            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                                {bookmarkedProviders.length}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Kitchen providers</div>
                        </div>

                        <div 
                            onClick={() => setActiveTab('subscriptions')}
                            className="bg-gray-900/60 hover:bg-gray-900/90 p-3.5 rounded-2xl border border-gray-700/50 cursor-pointer transition transform hover:-translate-y-0.5"
                        >
                            <div className="text-xs text-gray-400 font-medium">Meal Plans</div>
                            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                                {subscriptions.filter(s => s.status === 'ACTIVE').length}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Active subscriptions</div>
                        </div>

                        <div 
                            onClick={() => setActiveTab('matches')}
                            className="bg-gray-900/60 hover:bg-gray-900/90 p-3.5 rounded-2xl border border-gray-700/50 cursor-pointer transition transform hover:-translate-y-0.5"
                        >
                            <div className="text-xs text-gray-400 font-medium">Flatmate Leads</div>
                            <div className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
                                {flatmateMatches.length}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">High compatibility</div>
                        </div>

                        {/* Owner specific KPIs */}
                        <div 
                            onClick={() => setActiveTab('owner_listings')}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition transform hover:-translate-y-0.5 ${
                                isOwner ? 'bg-indigo-900/20 border-indigo-500/40' : 'bg-gray-900/60 border-gray-700/50 opacity-70'
                            }`}
                        >
                            <div className="text-xs text-gray-400 font-medium">
                                {isOwner ? 'My Properties' : 'Owner Portal'}
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">
                                {displayedOwnerListings.length}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                                {isOwner ? 'Posted listings' : 'View posted homes'}
                            </div>
                        </div>

                        <div 
                            onClick={() => setActiveTab('owner_listings')}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition transform hover:-translate-y-0.5 ${
                                isOwner ? 'bg-purple-900/20 border-purple-500/40' : 'bg-gray-900/60 border-gray-700/50 opacity-70'
                            }`}
                        >
                            <div className="text-xs text-gray-400 font-medium">Property Views</div>
                            <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
                                {totalOwnerViews}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Total listing views</div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Navigation Tabs */}
                <div className="flex border-b border-gray-800 space-x-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center space-x-2 ${
                            activeTab === 'overview'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>📊</span>
                        <span>Market Trends & Charts</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center space-x-2 ${
                            activeTab === 'bookmarks'
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>🔖</span>
                        <span>Saved Bookmarks ({bookmarkedListings.length + bookmarkedProviders.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center space-x-2 ${
                            activeTab === 'subscriptions'
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>🍱</span>
                        <span>Tiffin Subscriptions ({subscriptions.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center space-x-2 ${
                            activeTab === 'matches'
                                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>👥</span>
                        <span>Flatmate Matches ({flatmateMatches.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('owner_listings')}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center space-x-2 ${
                            activeTab === 'owner_listings'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>🏠</span>
                        <span>Owner Listings & View Counts ({displayedOwnerListings.length})</span>
                    </button>
                </div>

                {loading ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* TAB 1: OVERVIEW & RECHARTS VISUALIZATIONS */}
                        {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                                    <span>📈</span>
                                    <span>Real-Time Market Analytics & Trends</span>
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Aggregated property volumes, average rent trends, and city distributions across India.
                                </p>
                            </div>
                            <span className="text-[11px] bg-gray-800 text-gray-400 border border-gray-700 px-3 py-1 rounded-full">
                                Updated Today • SettleIn Intelligence
                            </span>
                        </div>

                        {/* Top Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart 1: Listings by City */}
                            <div className="bg-gray-800 border border-gray-700/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center space-x-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                            <span>Listings by City</span>
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Available flats and PG inventory</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        Active Units
                                    </span>
                                </div>

                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={cityAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="cityBarGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis 
                                                dataKey="city" 
                                                stroke="#9ca3af" 
                                                fontSize={11} 
                                                tickLine={false} 
                                                axisLine={{ stroke: '#4b5563' }}
                                                angle={-15}
                                                textAnchor="end"
                                            />
                                            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={{ stroke: '#4b5563' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    borderColor: '#374151',
                                                    borderRadius: '12px',
                                                    color: '#f3f4f6',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                                                }}
                                                formatter={(val) => [`${val} Properties`, 'Inventory']}
                                            />
                                            <Bar dataKey="totalListings" fill="url(#cityBarGradient)" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2: Average Rent Trends */}
                            <div className="bg-gray-800 border border-gray-700/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center space-x-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                            <span>Average Rent Trends (6-Month Trajectory)</span>
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Monthly benchmark in key urban hubs</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        ₹ INR
                                    </span>
                                </div>

                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={RENT_TRENDS_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="bangaloreGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="mumbaiGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.7} />
                                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={{ stroke: '#4b5563' }} />
                                            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={{ stroke: '#4b5563' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    borderColor: '#374151',
                                                    borderRadius: '12px',
                                                    color: '#f3f4f6'
                                                }}
                                                formatter={(val) => [formatINR(val), 'Avg Rent']}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                            <Area type="monotone" dataKey="Bangalore" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#bangaloreGrad)" />
                                            <Area type="monotone" dataKey="Mumbai" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#mumbaiGrad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Chart 3: City Rent Comparison */}
                            <div className="bg-gray-800 border border-gray-700/80 rounded-3xl p-5 sm:p-6 shadow-xl lg:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center space-x-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            <span>Current Average Rent Benchmarks</span>
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Average monthly rent per city</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Per Month
                                    </span>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={cityAnalytics} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                            <XAxis type="number" stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                                            <YAxis type="category" dataKey="city" stroke="#9ca3af" fontSize={11} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    borderColor: '#374151',
                                                    borderRadius: '12px'
                                                }}
                                                formatter={(val) => [formatINR(val), 'Avg Rent']}
                                            />
                                            <Bar dataKey="averageRent" fill="#10b981" radius={[0, 8, 8, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 4: Market Composition / Inventory Share */}
                            <div className="bg-gray-800 border border-gray-700/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                        <span>City Inventory Share</span>
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Proportion of listings per city</p>
                                </div>

                                <div className="h-56 w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={cityAnalytics}
                                                dataKey="totalListings"
                                                nameKey="city"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={75}
                                                innerRadius={42}
                                                paddingAngle={3}
                                            >
                                                {cityAnalytics.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    borderColor: '#374151',
                                                    borderRadius: '12px'
                                                }}
                                                formatter={(val, name) => [`${val} Units`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-700/50 text-[10px]">
                                    {cityAnalytics.slice(0, 6).map((c, idx) => (
                                        <div key={idx} className="flex items-center space-x-1">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                                            <span className="text-gray-300 truncate">{c.city}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: SAVED BOOKMARKS */}
                {activeTab === 'bookmarks' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                                    <span>🔖</span>
                                    <span>Your Saved Bookmarks</span>
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Quick access to shortlisted flats, private rooms, and home-cooked tiffin services.
                                </p>
                            </div>

                            {/* Sub-tabs: Listings vs Providers */}
                            <div className="flex bg-gray-800 p-1 rounded-2xl border border-gray-700">
                                <button
                                    onClick={() => setBookmarkSubTab('listings')}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
                                        bookmarkSubTab === 'listings'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <span>🏠 Homes & PGs</span>
                                    <span className="bg-gray-900/60 px-2 py-0.5 rounded-full text-[10px]">
                                        {bookmarkedListings.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setBookmarkSubTab('providers')}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
                                        bookmarkSubTab === 'providers'
                                            ? 'bg-amber-600 text-white shadow-md'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <span>🍱 Tiffin Kitchens</span>
                                    <span className="bg-gray-900/60 px-2 py-0.5 rounded-full text-[10px]">
                                        {bookmarkedProviders.length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* SubTab Content: Listings */}
                        {bookmarkSubTab === 'listings' && (
                            <div>
                                {bookmarkedListings.length === 0 ? (
                                    <EmptyState
                                        icon="🏷️"
                                        title="No Saved Listings Yet"
                                        description="As you explore verified properties, tap the heart bookmark icon to keep them saved here for quick comparison."
                                        actionText="Explore Verified Listings"
                                        actionLink="/"
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {bookmarkedListings.map((listing) => (
                                            <div
                                                key={listing.id}
                                                className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500/50 shadow-xl transition flex flex-col group relative"
                                            >
                                                {/* Image and Badges */}
                                                <div className="relative h-48 bg-gray-900 overflow-hidden">
                                                    <img
                                                        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 shadow-md">
                                                            {listing.listingType}
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white shadow-md">
                                                            🛡️ {listing.trustScore || 95}
                                                        </span>
                                                    </div>

                                                    {/* Bookmark remove button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBookmarkListing(listing);
                                                        }}
                                                        title="Remove from bookmarks"
                                                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-900/80 backdrop-blur-md text-pink-400 hover:text-red-400 border border-gray-700 flex items-center justify-center transition hover:scale-110 shadow-lg"
                                                    >
                                                        ❤️
                                                    </button>

                                                    <div className="absolute bottom-3 right-3 bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-extrabold text-blue-400 border border-gray-700">
                                                        {formatINR(listing.rent)} <span className="text-xs font-normal text-gray-400">/mo</span>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                                                            {listing.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                            <span className="mr-1 text-red-400">📍</span>
                                                            <span className="line-clamp-1">{listing.location}, <strong className="text-gray-300">{listing.city}</strong></span>
                                                        </p>
                                                    </div>

                                                    {listing.amenities && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {listing.amenities.slice(0, 3).map((amenity, idx) => (
                                                                <span key={idx} className="bg-gray-700/60 text-gray-300 text-[11px] px-2 py-0.5 rounded-lg border border-gray-600/40">
                                                                    {amenity}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between">
                                                        <button
                                                            onClick={() => toggleBookmarkListing(listing)}
                                                            className="text-xs text-red-400 hover:text-red-300 font-medium transition"
                                                        >
                                                            Remove
                                                        </button>
                                                        <Link
                                                            to={`/listings/${listing.id}`}
                                                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow transition"
                                                        >
                                                            View Details →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SubTab Content: Providers */}
                        {bookmarkSubTab === 'providers' && (
                            <div>
                                {bookmarkedProviders.length === 0 ? (
                                    <EmptyState
                                        icon="🍱"
                                        title="No Saved Tiffin Providers"
                                        description="Browse homestyle kitchens in your area and bookmark your favorites for easy meal plan subscriptions."
                                        actionText="Explore Tiffin Services"
                                        actionLink="/tiffin-services"
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {bookmarkedProviders.map((provider) => (
                                            <div
                                                key={provider.id}
                                                className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-amber-500/50 shadow-xl transition flex flex-col group relative"
                                            >
                                                <div className="relative h-44 bg-gray-900 overflow-hidden">
                                                    <img
                                                        src={provider.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
                                                        alt={provider.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                                                        ⭐ {provider.averageRating || '4.8'}
                                                    </div>

                                                    <button
                                                        onClick={() => toggleBookmarkProvider(provider)}
                                                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-900/80 backdrop-blur-md text-pink-400 hover:text-red-400 border border-gray-700 flex items-center justify-center transition hover:scale-110 shadow-lg"
                                                    >
                                                        ❤️
                                                    </button>

                                                    <div className="absolute bottom-3 right-3 bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-extrabold text-amber-400 border border-gray-700">
                                                        {formatINR(provider.pricePerMonth)} <span className="text-xs font-normal text-gray-400">/mo</span>
                                                    </div>
                                                </div>

                                                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                                                            {provider.name}
                                                        </h3>
                                                        <p className="text-xs text-amber-300 font-medium mt-0.5">{provider.cuisineType}</p>
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                            <span className="mr-1">📍</span> {provider.area}, {provider.city}
                                                        </p>
                                                    </div>

                                                    <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between">
                                                        <button
                                                            onClick={() => toggleBookmarkProvider(provider)}
                                                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedProviderForSubscribe(provider)}
                                                            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
                                                        >
                                                            Subscribe Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: TIFFIN SUBSCRIPTIONS */}
                {activeTab === 'subscriptions' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                                    <span>🍱</span>
                                    <span>Active Tiffin Subscriptions</span>
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Manage recurring meal deliveries, pauses for trips, and renewal dates.
                                </p>
                            </div>
                            <Link
                                to="/tiffin-services"
                                className="bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
                            >
                                + Add Another Meal Plan
                            </Link>
                        </div>

                        {subscriptions.length === 0 ? (
                            <EmptyState
                                icon="🍲"
                                title="No Active Meal Subscriptions"
                                description="Subscribe to high-rated home cooks and mess services for daily wholesome meals delivered right to your door."
                                actionText="Browse Meal Providers"
                                actionLink="/tiffin-services"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {subscriptions.map((sub) => {
                                    const isActive = sub.status === 'ACTIVE';
                                    return (
                                        <div
                                            key={sub.id}
                                            className="bg-gray-800 border border-gray-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-5"
                                        >
                                            {/* Top Status */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl shrink-0">
                                                        🍱
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-extrabold text-white">{sub.providerName}</h3>
                                                        <p className="text-xs text-amber-300 font-medium">{sub.cuisineType}</p>
                                                    </div>
                                                </div>

                                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
                                                    isActive 
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                                                    <span>{sub.status}</span>
                                                </span>
                                            </div>

                                            {/* Details Matrix */}
                                            <div className="bg-gray-900/60 rounded-2xl p-4 border border-gray-700/40 grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <span className="text-gray-400">Plan Cadence:</span>
                                                    <p className="font-bold text-gray-200 mt-0.5">{sub.planType}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Monthly Cost:</span>
                                                    <p className="font-bold text-amber-400 mt-0.5">{formatINR(sub.pricePerMonth)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Delivery Timeslot:</span>
                                                    <p className="font-bold text-gray-200 mt-0.5">{sub.mealTiming || '12:30 PM & 8:00 PM'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Next Renewal:</span>
                                                    <p className="font-bold text-indigo-300 mt-0.5">{sub.nextRenewal || '30 days from start'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-400">Delivery Address:</span>
                                                    <p className="font-medium text-gray-300 mt-0.5 truncate">{sub.deliveryAddress || 'Standard Profile Address'}</p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-700/60">
                                                <button
                                                    onClick={() => cancelSubscription(sub.id)}
                                                    className="text-xs text-red-400 hover:text-red-300 font-semibold transition"
                                                >
                                                    Cancel Subscription
                                                </button>

                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleSubscriptionStatus(sub.id)}
                                                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition ${
                                                            isActive
                                                                ? 'border-amber-500/50 text-amber-300 hover:bg-amber-500/10'
                                                                : 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10'
                                                        }`}
                                                    >
                                                        {isActive ? '⏸️ Pause Deliveries' : '▶️ Resume Plan'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: FLATMATE MATCHES */}
                {activeTab === 'matches' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                                    <span>👥</span>
                                    <span>Your Roommate Compatibility Leads</span>
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Calculated through compatibility heuristics: habits, cleanliness, budgets, and work styles.
                                </p>
                            </div>
                            <Link
                                to="/find-flatmates"
                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
                            >
                                🎴 Swipe Roommates Mode
                            </Link>
                        </div>

                        {flatmateMatches.length === 0 ? (
                            <EmptyState
                                icon="👥"
                                title="No Flatmate Leads Found"
                                description="Adjust your lifestyle preferences or explore roommate candidates to discover compatible flatmates."
                                actionText="Update Preferences"
                                actionLink="/preferences"
                                secondaryText="Swipe Flatmates"
                                secondaryLink="/find-flatmates"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {flatmateMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="bg-gray-800 border border-gray-700/80 rounded-3xl p-5 shadow-xl hover:border-purple-500/50 transition flex flex-col justify-between space-y-4"
                                    >
                                        {/* Top Profile Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={match.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                                                    alt={match.name}
                                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md"
                                                />
                                                <div>
                                                    <h3 className="font-extrabold text-white text-base">{match.name}</h3>
                                                    <p className="text-xs text-purple-300 font-medium">{match.occupation}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">📍 {match.preferredLocation}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-lg">
                                                {match.matchScore || 90}% Match
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        {match.bio && (
                                            <p className="text-xs text-gray-300 italic bg-gray-900/40 p-3 rounded-xl border border-gray-700/30 line-clamp-2">
                                                "{match.bio}"
                                            </p>
                                        )}

                                        {/* Lifestyle & Budget Pills */}
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-700/40">
                                                <span className="text-gray-400 block text-[10px]">Max Budget</span>
                                                <span className="font-bold text-amber-400">{formatINR(match.budgetMax)}/mo</span>
                                            </div>
                                            <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-700/40">
                                                <span className="text-gray-400 block text-[10px]">Sleep Cycle</span>
                                                <span className="font-bold text-gray-200">{match.sleepHabit || 'Flexible'}</span>
                                            </div>
                                            <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-700/40">
                                                <span className="text-gray-400 block text-[10px]">Cleanliness</span>
                                                <span className="font-bold text-gray-200">{match.cleanliness || 'Neat'}</span>
                                            </div>
                                            <div className="bg-gray-900/60 p-2 rounded-xl border border-gray-700/40">
                                                <span className="text-gray-400 block text-[10px]">Work Style</span>
                                                <span className="font-bold text-gray-200">{match.workFromHome || 'Hybrid'}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-2 border-t border-gray-700/60 flex items-center justify-between">
                                            <Link
                                                to="/my-matches"
                                                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                                            >
                                                View Match Profile
                                            </Link>
                                            <button
                                                onClick={() => navigate('/my-matches')}
                                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow transition"
                                            >
                                                Send Interest 💌
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: OWNER POSTED LISTINGS & VIEW COUNTS */}
                {activeTab === 'owner_listings' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                                    <span>🏠</span>
                                    <span>Your Posted Listings & Engagement</span>
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    Monitor live property view counts, verified trust scores, and tenant inquiries.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsCreateListingModalOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-1.5"
                            >
                                <span>➕</span>
                                <span>Post New Property</span>
                            </button>
                        </div>

                        {/* Owner Analytics Summary Card */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl p-4 flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl">
                                    🏢
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Total Properties</div>
                                    <div className="text-xl font-black text-white">{displayedOwnerListings.length}</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl p-4 flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl">
                                    👁️
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Accumulated Views</div>
                                    <div className="text-xl font-black text-cyan-400">{totalOwnerViews} Views</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl p-4 flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl">
                                    🛡️
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Avg Trust Score</div>
                                    <div className="text-xl font-black text-emerald-400">{averageOwnerTrust}/100</div>
                                </div>
                            </div>
                        </div>

                        {/* Owner Views Visualization with Recharts */}
                        {displayedOwnerListings.length > 0 && (
                            <div className="bg-gray-800 border border-gray-700/80 rounded-3xl p-6 shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center space-x-2">
                                            <span>📊</span>
                                            <span>Property View Count Distribution</span>
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Direct seeker engagement on your properties</p>
                                    </div>
                                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 font-bold">
                                        Live Views
                                    </span>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={displayedOwnerListings} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis 
                                                dataKey="title" 
                                                stroke="#9ca3af" 
                                                fontSize={11} 
                                                tickLine={false}
                                                tickFormatter={(t) => t.length > 18 ? `${t.slice(0, 18)}...` : t}
                                            />
                                            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    borderColor: '#374151',
                                                    borderRadius: '12px'
                                                }}
                                                formatter={(val) => [`${val} Page Views`, 'Traffic']}
                                            />
                                            <Bar dataKey="viewCount" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Listings Cards */}
                        {displayedOwnerListings.length === 0 ? (
                            <EmptyState
                                icon="🏠"
                                title="No Properties Posted Yet"
                                description="List your room, apartment, or PG with AI trust scoring to receive direct tenant inquiries."
                                actionText="Post Property"
                                onActionClick={() => setIsCreateListingModalOpen(true)}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedOwnerListings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl hover:border-blue-500/50 transition flex flex-col justify-between"
                                    >
                                        <div className="relative h-44 bg-gray-900 overflow-hidden">
                                            <img
                                                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'}
                                                alt={listing.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 left-3 flex items-center space-x-2">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow">
                                                    {listing.listingType}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow">
                                                    🛡️ {listing.trustScore || 90}
                                                </span>
                                            </div>

                                            {/* View Count Badge on Top Right */}
                                            <div className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-cyan-400 border border-cyan-500/40 shadow-lg flex items-center space-x-1.5">
                                                <span>👁️</span>
                                                <span>{listing.viewCount || 0} Views</span>
                                            </div>

                                            <div className="absolute bottom-3 right-3 bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-extrabold text-blue-400 border border-gray-700">
                                                {formatINR(listing.rent)} <span className="text-xs font-normal text-gray-400">/mo</span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                            <div>
                                                <h3 className="text-base font-bold text-white line-clamp-1">{listing.title}</h3>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                    <span className="mr-1 text-red-400">📍</span>
                                                    {listing.location}, {listing.city}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between">
                                                <div className="text-[11px] text-gray-400">
                                                    <strong className="text-cyan-400">{listing.viewCount || 0}</strong> views recorded
                                                </div>
                                                <Link
                                                    to={`/listings/${listing.id}`}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow transition"
                                                >
                                                    View Listing →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                    </>
                )}
            </main>

            {/* Subscribe Tiffin Modal */}
            <SubscribeTiffinModal
                isOpen={!!selectedProviderForSubscribe}
                provider={selectedProviderForSubscribe}
                onClose={() => setSelectedProviderForSubscribe(null)}
            />

            {/* Post Listing Modal */}
            <CreateListingModal
                isOpen={isCreateListingModalOpen}
                onClose={() => setIsCreateListingModalOpen(false)}
                onListingCreated={() => fetchDashboardData()}
            />
        </div>
    );
};

export default Dashboard;
