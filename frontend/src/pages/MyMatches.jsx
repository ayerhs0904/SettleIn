import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const MyMatches = () => {
    const [interestsGroup, setInterestsGroup] = useState({
        mutualMatches: [],
        sentInterests: [],
        receivedInterests: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        fetchInterests();
    }, []);

    const fetchInterests = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/preferences/interests');
            setInterestsGroup(response.data || { mutualMatches: [], sentInterests: [], receivedInterests: [] });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch interests", err);
            setError("Failed to load your matches & interests. Please try again later.");
            setLoading(false);
        }
    };

    const handleRespondToReceived = async (targetUserId, action) => {
        setActionLoadingId(targetUserId);
        try {
            await api.post('/preferences/interact', {
                targetUserId: targetUserId,
                action: action
            });
            fetchInterests();
        } catch (err) {
            console.error("Failed to respond to interest", err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const avatarGradients = [
        "from-pink-500 to-purple-600",
        "from-blue-500 to-teal-400",
        "from-amber-500 to-red-500",
        "from-emerald-400 to-indigo-600",
        "from-violet-600 to-fuchsia-500"
    ];

    const { mutualMatches, sentInterests, receivedInterests } = interestsGroup;
    const totalInterestsCount = mutualMatches.length + sentInterests.length + receivedInterests.length;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
                {/* Header */}
                <div className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-purple-400 font-extrabold text-sm uppercase tracking-wider mb-1">
                            <span>💘 Connection Hub</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                            My Roommate <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Matches & Interests</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Manage your mutual matches, received roommate requests, and sent interests.
                        </p>
                    </div>

                    <Link
                        to="/find-flatmates"
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg transition self-start sm:self-auto flex items-center space-x-2"
                    >
                        <span>🎴</span>
                        <span>Find More Flatmates</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-gray-800 rounded-3xl h-64 animate-pulse border border-gray-700"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-950/40 border border-red-800/40 rounded-2xl p-6 text-center text-red-400">
                        {error}
                    </div>
                ) : totalInterestsCount === 0 ? (
                    <div className="bg-gray-800/60 border border-gray-700/60 rounded-3xl p-12 text-center text-gray-300 space-y-4 max-w-lg mx-auto shadow-2xl">
                        <div className="text-5xl">💌</div>
                        <h3 className="text-2xl font-bold text-white">No Interests Yet</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            You haven't swiped on any roommate candidate profiles yet. Start browsing profiles to find compatible flatmates!
                        </p>
                        <Link
                            to="/find-flatmates"
                            className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-7 py-3 rounded-xl shadow-lg transition"
                        >
                            Discover Flatmates Now 🎴
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* 1. MUTUAL MATCHES SECTION */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">🎉</span>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white">
                                        Mutual Matches <span className="text-pink-400 text-lg">({mutualMatches.length})</span>
                                    </h2>
                                    <p className="text-xs text-gray-400">You and these roommates both expressed interest in each other!</p>
                                </div>
                            </div>

                            {mutualMatches.length === 0 ? (
                                <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 text-gray-400 text-sm text-center">
                                    No mutual matches yet. Keep expressing interest on profiles in the Discover deck!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {mutualMatches.map((match, idx) => {
                                        const pref = match.preference || {};
                                        const grad = avatarGradients[idx % avatarGradients.length];
                                        return (
                                            <div
                                                key={match.matchUserId}
                                                className="bg-gray-800/90 border border-pink-500/40 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-pink-500 transition duration-300"
                                            >
                                                <div className="space-y-4">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${grad} flex items-center justify-center font-extrabold text-xl text-white shadow-md`}>
                                                                {match.matchUserName?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white">{match.matchUserName}</h3>
                                                                <span className="text-xs text-pink-300 font-mono">{match.matchUserEmail}</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1">
                                                            <span>🎯</span>
                                                            <span>{match.compatibilityScore}%</span>
                                                        </div>
                                                    </div>

                                                    {/* AI Insight */}
                                                    <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-3.5 text-xs text-indigo-200 leading-relaxed">
                                                        🤖 <span className="font-semibold text-indigo-300">AI Insight:</span> {match.compatibilitySummary}
                                                    </div>

                                                    {/* Preference Pills */}
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {pref.sleepSchedule && (
                                                            <span className="bg-gray-900 text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-700">
                                                                ⏰ {pref.sleepSchedule}
                                                            </span>
                                                        )}
                                                        {pref.dietaryPreference && (
                                                            <span className="bg-gray-900 text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-700">
                                                                🥗 {pref.dietaryPreference}
                                                            </span>
                                                        )}
                                                        {pref.cleanliness && (
                                                            <span className="bg-gray-900 text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-700">
                                                                ✨ {pref.cleanliness}
                                                            </span>
                                                        )}
                                                        {pref.budget && (
                                                            <span className="bg-gray-900 text-emerald-400 text-xs px-2.5 py-1 rounded-lg border border-gray-700 font-semibold">
                                                                💰 ₹{pref.budget.toLocaleString('en-IN')}/mo
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <a
                                                    href={`mailto:${match.matchUserEmail}?subject=SettleIn Roommate Connect!`}
                                                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md text-center block transition"
                                                >
                                                    📧 Connect via Email
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. RECEIVED INTERESTS SECTION */}
                        <div className="space-y-4 border-t border-gray-800 pt-8">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">📥</span>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white">
                                        Received Interests <span className="text-purple-400 text-lg">({receivedInterests.length})</span>
                                    </h2>
                                    <p className="text-xs text-gray-400">These roommates expressed interest in your profile!</p>
                                </div>
                            </div>

                            {receivedInterests.length === 0 ? (
                                <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 text-gray-400 text-sm text-center">
                                    No pending incoming interest requests right now.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {receivedInterests.map((match, idx) => {
                                        const pref = match.preference || {};
                                        const grad = avatarGradients[(idx + 2) % avatarGradients.length];
                                        return (
                                            <div
                                                key={match.matchUserId}
                                                className="bg-gray-800/80 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${grad} flex items-center justify-center font-extrabold text-xl text-white shadow-md`}>
                                                                {match.matchUserName?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white">{match.matchUserName}</h3>
                                                                <span className="text-xs text-gray-400">{pref.preferredArea || 'Interested Roommate'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-extrabold">
                                                            🎯 {match.compatibilityScore}% Match
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-900/60 border border-gray-700/60 rounded-2xl p-3 text-xs text-gray-300 leading-relaxed">
                                                        🤖 {match.compatibilitySummary}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3 pt-2">
                                                    <button
                                                        onClick={() => handleRespondToReceived(match.matchUserId, 'SKIPPED')}
                                                        disabled={actionLoadingId === match.matchUserId}
                                                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-2.5 rounded-xl text-sm border border-gray-700 transition"
                                                    >
                                                        Skip
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespondToReceived(match.matchUserId, 'INTERESTED')}
                                                        disabled={actionLoadingId === match.matchUserId}
                                                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition"
                                                    >
                                                        Accept (❤️)
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 3. SENT INTERESTS SECTION */}
                        <div className="space-y-4 border-t border-gray-800 pt-8">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">📤</span>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white">
                                        Sent Interests <span className="text-gray-400 text-lg">({sentInterests.length})</span>
                                    </h2>
                                    <p className="text-xs text-gray-400">Profiles you swiped Interested on — waiting for their response.</p>
                                </div>
                            </div>

                            {sentInterests.length === 0 ? (
                                <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 text-gray-400 text-sm text-center">
                                    You haven't sent any interest requests yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {sentInterests.map((match) => (
                                        <div
                                            key={match.matchUserId}
                                            className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center font-bold text-white text-base">
                                                    {match.matchUserName?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">{match.matchUserName}</h4>
                                                    <span className="text-xs text-emerald-400 font-semibold">{match.compatibilityScore}% Match</span>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full font-medium">
                                                Pending ⏳
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyMatches;
