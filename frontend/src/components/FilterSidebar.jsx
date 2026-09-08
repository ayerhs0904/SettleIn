import React from 'react';

const FilterSidebar = ({ filters, onFilterChange, onReset }) => {
    return (
        <aside className="bg-gray-800 p-6 rounded-2xl border border-gray-700/60 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filter Properties</span>
                </h2>
                <button
                    onClick={onReset}
                    className="text-xs text-gray-400 hover:text-blue-400 font-semibold transition"
                >
                    Reset All
                </button>
            </div>

            {/* City Filter */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">City</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search city e.g. Bangalore..."
                        value={filters.city}
                        onChange={(e) => onFilterChange('city', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Property Type Toggle */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Listing Type</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-900 rounded-xl border border-gray-700">
                    {['ALL', 'PG', 'FLAT'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onFilterChange('listingType', type === 'ALL' ? '' : type)}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                                (filters.listingType === type || (type === 'ALL' && !filters.listingType))
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rent Range Filter */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Monthly Rent (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <input
                            type="number"
                            placeholder="Min Rent"
                            value={filters.minRent}
                            onChange={(e) => onFilterChange('minRent', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Max Rent"
                            value={filters.maxRent}
                            onChange={(e) => onFilterChange('maxRent', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
