import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const FindFlatmates = () => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [mutualMatchModal, setMutualMatchModal] = useState(null);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/preferences/matches?top=15');
            setCandidates(response.data || []);
            setCurrentIndex(0);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch candidate matches", err);
            if (err.response?.status === 400 || err.response?.data?.message?.includes("profile")) {
                setError("profile_missing");
            } else {
                setError("Failed to load potential roommate matches. Please try again later.");
            }
            setLoading(false);
        }
    };

    const handleInteraction = async (action) => {
        if (currentIndex >= candidates.length || actionLoading) return;
        
        const candidate = candidates[currentIndex];
        setActionLoading(true);

        try {
            const response = await api.post('/preferences/interact', {
                targetUserId: candidate.matchUserId,
                action: action
            });

            if (response.data?.mutualMatch) {
                setMutualMatchModal(candidate);
            }

            setCurrentIndex(prev => prev + 1);
        } catch (err) {
            console.error("Failed to record interaction", err);
        } finally {
            setActionLoading(false);
        }
    };

    const currentCandidate = candidates[currentIndex];
    const pref = currentCandidate?.preference || {};

    const avatarGradients = [
        "from-pink-500 to-purple-600",
        "from-blue-500 to-teal-400",
        "from-amber-500 to-red-500",
        "from-emerald-400 to-indigo-600",
        "from-violet-600 to-fuchsia-500"
    ];
    const gradient = avatarGradients[currentIndex % avatarGradients.length];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            {/* Header section with tabs */}
            <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                    <div>
                        <div className="flex items-center space-x-2 text-pink-400 font-extrabold text-sm uppercase tracking-wider mb-1">
                            <span>✨ Roommate Matchmaker</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Flatmates</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Discover compatible roommates matched by AI cosine similarity & lifestyle embeddings.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            to="/my-matches"
                            className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5"
                        >
                            <span>💘</span>
                            <span>My Matches & Interests</span>
                        </Link>
                        <Link
                            to="/preferences"
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3.5 py-2 rounded-xl text-sm font-semibold transition"
                            title="Edit Preferences"
                        >
                            ⚙️
                        </Link>
                    </div>
                </div>

                {/* Main Card Swiper / Match Discovery View */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[450px]">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-400 text-sm animate-pulse">Finding compatible flatmate recommendations...</p>
                        </div>
                    </div>
                ) : error === "profile_missing" ? (
                    <div className="bg-gray-800/80 border border-purple-500/40 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-2xl my-auto">
                        <div className="text-5xl">🧬</div>
                        <h3 className="text-2xl font-bold text-white">Setup Your Preference Profile</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            To find your top compatible flatmates, please complete your lifestyle preference profile first. Our AI will generate vector embeddings to calculate compatibility.
                        </p>
                        <Link
                            to="/preferences"
                            className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition"
                        >
                            Set Up Preferences Now ➔
                        </Link>
                    </div>
                ) : error ? (
                    <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-center text-red-400 my-auto">
                        {error}
                    </div>
                ) : !currentCandidate ? (
                    <div className="bg-gray-800/60 border border-gray-700/60 rounded-3xl p-12 text-center text-gray-300 space-y-5 my-auto max-w-lg mx-auto shadow-2xl">
                        <div className="text-6xl">🎉</div>
                        <h3 className="text-2xl font-bold text-white">All Caught Up!</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            You've swiped through all available roommate recommendations for now. Check back later as new users join, or view your existing matches & interests.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <button
                                onClick={fetchCandidates}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Refresh Feed 🔄
                            </button>
                            <Link
                                to="/my-matches"
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
                            >
                                View My Matches 💘
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full space-y-6">
                        {/* Main Profile Card */}
                        <div className="bg-gray-800/95 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col transform transition duration-300">
                            {/* Card Header & Avatar */}
                            <div className={`bg-gradient-to-r ${gradient} p-6 sm:p-8 text-white relative`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-extrabold text-3xl text-white shadow-xl">
                                            {currentCandidate.matchUserName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                                                {currentCandidate.matchUserName}
                                            </h2>
                                            <p className="text-white/80 text-sm font-medium">
                                                {pref.preferredArea ? `📍 ${pref.preferredArea}` : 'Looking for room'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-emerald-300 flex items-center space-x-1.5 shadow-lg">
                                        <span>🎯</span>
                                        <span>{currentCandidate.compatibilityScore}% Match</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-6 sm:p-8 space-y-6 flex-1 bg-gray-800/90">
                                {/* AI Insight Box */}
                                <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-purple-950/70 border border-indigo-500/40 rounded-2xl p-4 flex items-start space-x-3.5 shadow-inner">
                                    <span className="text-2xl shrink-0">🤖</span>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                            AI Compatibility Insight
                                        </span>
                                        <p className="text-sm text-indigo-100 leading-relaxed font-normal">
                                            {currentCandidate.compatibilitySummary}
                                        </p>
                                    </div>
                                </div>

                                {/* Key Preference Tags */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Lifestyle Profile</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {pref.sleepSchedule && (
                                            <span className="bg-gray-900/90 text-gray-200 text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center space-x-1">
                                                <span>⏰</span>
                                                <span>{pref.sleepSchedule}</span>
                                            </span>
                                        )}
                                        {pref.dietaryPreference && (
                                            <span className="bg-gray-900/90 text-gray-200 text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center space-x-1">
                                                <span>🥗</span>
                                                <span>{pref.dietaryPreference}</span>
                                            </span>
                                        )}
                                        {pref.cleanliness && (
                                            <span className="bg-gray-900/90 text-gray-200 text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center space-x-1">
                                                <span>✨</span>
                                                <span>{pref.cleanliness}</span>
                                            </span>
                                        )}
                                        {pref.workSchedule && (
                                            <span className="bg-gray-900/90 text-gray-200 text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center space-x-1">
                                                <span>💼</span>
                                                <span>{pref.workSchedule}</span>
                                            </span>
                                        )}
                                        {pref.cookingHabit && (
                                            <span className="bg-gray-900/90 text-gray-200 text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center space-x-1">
                                                <span>🍳</span>
                                                <span>{pref.cookingHabit}</span>
                                            </span>
                                        )}
                                        {pref.smokingDrinking && (
                                            <span className="bg-gray-900/90 text-gray-200 text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center space-x-1">
                                                <span>🍷</span>
                                                <span>{pref.smokingDrinking}</span>
                                            </span>
                                        )}
                                        {pref.guestsFrequency && (
                                            <span className="bg-gray-900/90 text-gray-200 text-xs px-3 py-1.5 rounded-xl border border-gray-700 flex items-center space-x-1">
                                                <span>👥</span>
                                                <span>{pref.guestsFrequency}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Budget & About Me */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-700/60 pt-4">
                                    <div>
                                        <span className="text-xs text-gray-400 block font-medium">Monthly Budget</span>
                                        <span className="text-xl font-extrabold text-emerald-400">
                                            ₹{pref.budget ? pref.budget.toLocaleString('en-IN') : 'N/A'}<span className="text-xs text-gray-400 font-normal">/mo</span>
                                        </span>
                                    </div>
                                    {pref.aboutMe && (
                                        <div>
                                            <span className="text-xs text-gray-400 block font-medium">About</span>
                                            <p className="text-xs text-gray-300 italic line-clamp-2 mt-0.5">"{pref.aboutMe}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer Swiping Controls */}
                            <div className="bg-gray-900/80 px-8 py-5 border-t border-gray-700/80 flex items-center justify-between gap-6">
                                <button
                                    onClick={() => handleInteraction('SKIPPED')}
                                    disabled={actionLoading}
                                    className="flex-1 bg-gray-800 hover:bg-red-950/60 hover:border-red-600/50 border border-gray-700 text-gray-300 hover:text-red-400 font-bold py-3.5 rounded-2xl transition duration-200 shadow-lg flex items-center justify-center space-x-2 text-base group"
                                >
                                    <span className="text-xl transform group-hover:scale-125 transition">✖️</span>
                                    <span>Skip</span>
                                </button>

                                <button
                                    onClick={() => handleInteraction('INTERESTED')}
                                    disabled={actionLoading}
                                    className="flex-1 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold py-3.5 rounded-2xl transition duration-200 shadow-xl shadow-pink-500/20 flex items-center justify-center space-x-2 text-base transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span className="text-xl">❤️</span>
                                    <span>Interested</span>
                                </button>
                            </div>
                        </div>

                        {/* Deck Counter */}
                        <div className="text-center text-xs text-gray-500 font-medium">
                            Profile {currentIndex + 1} of {candidates.length} candidate matches
                        </div>
                    </div>
                )}
            </main>

            {/* Mutual Match Modal */}
            {mutualMatchModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gray-800 border border-pink-500/50 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl"></div>

                        <div className="text-6xl animate-bounce">🎉</div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-extrabold text-white">It's a Mutual Match!</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                You and <strong className="text-pink-400">{mutualMatchModal.matchUserName}</strong> both expressed interest in each other!
                            </p>
                        </div>

                        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 text-left space-y-1">
                            <span className="text-xs text-gray-400 font-medium">Contact Details Unlocked</span>
                            <div className="text-sm font-bold text-white">{mutualMatchModal.matchUserName}</div>
                            <div className="text-xs text-purple-300 font-mono select-all">{mutualMatchModal.matchUserEmail}</div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/my-matches')}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
                            >
                                View All Matches & Connect ➔
                            </button>
                            <button
                                onClick={() => setMutualMatchModal(null)}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2.5 rounded-xl text-sm transition"
                            >
                                Keep Browsing Profiles
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindFlatmates;
