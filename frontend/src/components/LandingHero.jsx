import React from 'react';
import { Link } from 'react-router-dom';

const LandingHero = () => {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-gray-800 p-6 sm:p-10 lg:p-12 shadow-2xl animate-fadeIn">
            {/* Ambient Background Gradient Orbs */}
            <div className="absolute top-0 right-1/4 -mt-16 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-500/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto space-y-8 text-center sm:text-left">
                {/* Pill Badge */}
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border border-purple-400/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-purple-200 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                    <span>The All-In-One Urban Relocation Platform</span>
                    <span className="hidden sm:inline text-purple-400">•</span>
                    <span className="hidden sm:inline text-gray-300">Flats, Flatmates & Daily Tiffins</span>
                </div>

                {/* Main Headline & Value Proposition */}
                <div className="space-y-4">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                        Settle into your new city{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                            without the chaos.
                        </span>
                    </h1>
                    <p className="text-base sm:text-xl text-gray-300 max-w-3xl leading-relaxed font-normal">
                        Moving to a new city shouldn't mean dealing with deposit scams, awkward roommates, or surviving on junk food. SettleIn unites verified properties, lifestyle-matched flatmates, and homestyle tiffins under one roof.
                    </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-2">
                    <a
                        href="#listings-grid"
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-2xl shadow-xl shadow-indigo-900/40 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2"
                    >
                        <span>🔍 Explore Verified Homes</span>
                    </a>

                    <Link
                        to="/find-flatmates"
                        className="bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 font-bold text-sm sm:text-base px-6 py-3 rounded-2xl transition flex items-center space-x-2"
                    >
                        <span>🎴 Find A Roommate</span>
                    </Link>

                    <Link
                        to="/tiffin-services"
                        className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold text-sm sm:text-base px-6 py-3 rounded-2xl transition flex items-center space-x-2"
                    >
                        <span>🍱 Subscribe to Tiffins</span>
                    </Link>

                    <Link
                        to="/dashboard"
                        className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-bold text-sm sm:text-base px-5 py-3 rounded-2xl transition flex items-center space-x-1.5"
                    >
                        <span>📊 Market Trends</span>
                    </Link>
                </div>

                {/* 4 Core Value Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-800/80 text-left">
                    {/* Pillar 1 */}
                    <div className="bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/60 p-4.5 rounded-2xl transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                            🛡️
                        </div>
                        <h2 className="text-sm font-bold text-white mb-1">AI Trust Score</h2>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Every rental passes automated heuristic checks for outlier rents and duplicate photo fraud.
                        </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/60 p-4.5 rounded-2xl transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                            👥
                        </div>
                        <h2 className="text-sm font-bold text-white mb-1">Roommate Matching</h2>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Vector embeddings compare sleep cycles, cleanliness habits, and work-from-home styles.
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/60 p-4.5 rounded-2xl transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                            🍱
                        </div>
                        <h2 className="text-sm font-bold text-white mb-1">Homestyle Tiffins</h2>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Daily hygienic home-cooked meals delivered right to your door with pause/resume flex.
                        </p>
                    </div>

                    {/* Pillar 4 */}
                    <div className="bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/60 p-4.5 rounded-2xl transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                            💬
                        </div>
                        <h2 className="text-sm font-bold text-white mb-1">City Intelligence</h2>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Instant hyperlocal AI city guide answers questions on metro lines, safe hubs & daily hacks.
                        </p>
                    </div>
                </div>

                {/* Quick Trust Stats Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-800/50 text-center">
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400">98.4%</div>
                        <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mt-0.5">Heuristic Accuracy</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-purple-400">12,000+</div>
                        <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mt-0.5">Matched Roommates</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-amber-400">100%</div>
                        <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mt-0.5">Hygienic Home Cooks</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-blue-400">5 Major Cities</div>
                        <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mt-0.5">BLR • BOM • PNQ • DEL • HYD</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingHero;
