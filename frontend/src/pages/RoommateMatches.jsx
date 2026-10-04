import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const RoommateMatches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get('/preferences/matches?top=5');
                setMatches(response.data || []);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch matches", err);
                if (err.response?.status === 400 || err.response?.data?.message?.includes("profile")) {
                    setError("profile_missing");
                } else {
                    setError("Failed to compute roommate matches. Please try again later.");
                }
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
                {/* Header */}
                <div className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-purple-400 font-extrabold text-sm uppercase tracking-wider mb-1">
                            <span>✨ AI Matchmaker</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                            Your Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Roommate Matches</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Calculated using cosine similarity on lifestyle vector embeddings with AI compatibility explanations.
                        </p>
                    </div>

                    <Link
                        to="/preferences"
                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition self-start sm:self-auto"
                    >
                        Edit My Preferences ⚙️
                    </Link>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-gray-800 rounded-3xl h-64 animate-pulse border border-gray-700"></div>
                        ))}
                    </div>
                ) : error === "profile_missing" ? (
                    <div className="bg-gray-800/80 border border-blue-500/40 rounded-3xl p-10 text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
                        <div className="text-4xl">🧬</div>
                        <h3 className="text-2xl font-bold text-white">Roommate Preferences Profile Needed</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            To find your top compatible flatmates, please complete your lifestyle preference profile first. Our AI will compute your vector embedding to find matching roommates.
                        </p>
                        <Link
                            to="/preferences"
                            className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition"
                        >
                            Set Up Preferences Now ➔
                        </Link>
                    </div>
                ) : error ? (
                    <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-center text-red-400">
                        {error}
                    </div>
                ) : matches.length === 0 ? (
                    <div className="bg-gray-800/50 border border-gray-700/60 rounded-3xl p-12 text-center text-gray-400 space-y-2">
                        <h3 className="text-xl font-bold text-gray-300">No other roommate profiles found yet</h3>
                        <p className="text-sm">As more users create their preference profiles, your top vector matches will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {matches.map((match, idx) => {
                            const pref = match.preference || {};
                            return (
                                <div
                                    key={idx}
                                    className="bg-gray-800/90 rounded-3xl border border-gray-700/70 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/40 transition duration-300 flex flex-col lg:flex-row gap-6 justify-between items-start"
                                >
                                    <div className="space-y-4 flex-1">
                                        {/* User Name & Score Badge */}
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-extrabold text-xl text-white shadow-md">
                                                    {match.matchUserName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white">{match.matchUserName}</h3>
                                                    <span className="text-xs text-gray-400">{match.matchUserEmail}</span>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-1.5 rounded-full text-sm font-extrabold shadow-inner flex items-center space-x-1.5">
                                                <span>🎯</span>
                                                <span>{match.compatibilityScore}% Match</span>
                                            </div>
                                        </div>

                                        {/* AI Compatibility Explanation */}
                                        <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/30 rounded-2xl p-4 flex items-start space-x-3">
                                            <span className="text-xl shrink-0">🤖</span>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                                    AI Compatibility Insight
                                                </span>
                                                <p className="text-sm text-blue-100 leading-relaxed">
                                                    {match.compatibilitySummary}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Preference Pill Badges */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {pref.sleepSchedule && (
                                                <span className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700">
                                                    ⏰ {pref.sleepSchedule}
                                                </span>
                                            )}
                                            {pref.dietaryPreference && (
                                                <span className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700">
                                                    🥗 {pref.dietaryPreference}
                                                </span>
                                            )}
                                            {pref.cleanliness && (
                                                <span className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700">
                                                    ✨ {pref.cleanliness}
                                                </span>
                                            )}
                                            {pref.workSchedule && (
                                                <span className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700">
                                                    💼 {pref.workSchedule}
                                                </span>
                                            )}
                                            {pref.cookingHabit && (
                                                <span className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-gray-700">
                                                    🍳 {pref.cookingHabit}
                                                </span>
                                            )}
                                        </div>

                                        {/* About me */}
                                        {pref.aboutMe && (
                                            <p className="text-xs text-gray-400 italic line-clamp-2">
                                                "{pref.aboutMe}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Column */}
                                    <div className="w-full lg:w-48 flex flex-col justify-between space-y-3 self-stretch border-t lg:border-t-0 lg:border-l border-gray-700/60 pt-4 lg:pt-0 lg:pl-6">
                                        <div className="space-y-1">
                                            <span className="text-xs text-gray-400 block font-medium">Budget Target</span>
                                            <span className="text-xl font-extrabold text-blue-400">
                                                ₹{pref.budget ? pref.budget.toLocaleString('en-IN') : 'N/A'}<span className="text-xs text-gray-400 font-normal">/mo</span>
                                            </span>
                                        </div>

                                        {pref.preferredArea && (
                                            <div className="space-y-0.5">
                                                <span className="text-xs text-gray-400 block font-medium">Preferred Area</span>
                                                <span className="text-xs text-gray-200 font-semibold line-clamp-1">{pref.preferredArea}</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => alert(`Connecting with ${match.matchUserName} at ${match.matchUserEmail}`)}
                                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default RoommateMatches;
