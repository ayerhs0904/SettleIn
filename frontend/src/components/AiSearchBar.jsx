import React, { useState } from 'react';

const AiSearchBar = ({ onSearch, onClear, loading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSearch(prompt.trim());
        }
    };

    const handleSuggestionClick = (text) => {
        setPrompt(text);
        onSearch(text);
    };

    const suggestions = [
        "PG near Sector 62, veg food, under 12k",
        "1BHK flat in Bangalore under 20k with WiFi",
        "PG in Noida with AC, Laundry and Food"
    ];

    return (
        <div className="bg-gradient-to-r from-gray-850 via-gray-800 to-gray-850 p-6 rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400 font-extrabold text-lg">
                <span className="text-2xl animate-bounce">✨</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Smart AI Property Search
                </span>
            </div>

            <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Ask AI e.g. 'PG near Sector 62, veg food, under 12k'..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-gray-950/80 border-2 border-blue-500/40 rounded-2xl py-4 pl-5 pr-32 text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner"
                />

                <div className="absolute right-2 flex items-center space-x-2">
                    {prompt && (
                        <button
                            type="button"
                            onClick={() => { setPrompt(''); onClear(); }}
                            className="text-xs text-gray-400 hover:text-white px-2 py-1"
                        >
                            Clear
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/30 transition flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Parsing...</span>
                            </>
                        ) : (
                            <>
                                <span>Search</span>
                                <span>➔</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-gray-400 font-semibold mr-1">Try prompts:</span>
                {suggestions.map((text, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(text)}
                        className="text-xs bg-gray-900/90 hover:bg-blue-600/30 hover:border-blue-500/50 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl border border-gray-700/80 transition-all cursor-pointer"
                    >
                        "{text}"
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AiSearchBar;
