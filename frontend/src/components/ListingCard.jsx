import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListingCard = ({ listing }) => {
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);

    const mainImage = listing.images && listing.images.length > 0
        ? listing.images[0]
        : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'; // fallback modern room image

    const formattedRent = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(listing.rent);

    const isPg = listing.listingType === 'PG';

    // Trust Score Badge colors and icons
    const badge = listing.trustBadge || 'VERIFIED';
    const score = listing.trustScore !== undefined ? listing.trustScore : 95;
    const flags = listing.trustFlags || [];

    const getTrustBadgeStyle = (b) => {
        switch (b) {
            case 'VERIFIED':
                return {
                    bg: 'bg-emerald-500/90 border-emerald-400 text-white',
                    icon: '🛡️',
                    label: 'Verified'
                };
            case 'CAUTION':
                return {
                    bg: 'bg-amber-500/90 border-amber-400 text-white',
                    icon: '⚠️',
                    label: 'Caution'
                };
            case 'UNVERIFIED':
            default:
                return {
                    bg: 'bg-red-600/90 border-red-400 text-white',
                    icon: '❌',
                    label: 'Unverified'
                };
        }
    };

    const trustStyle = getTrustBadgeStyle(badge);

    return (
        <div
            onClick={() => navigate(`/listings/${listing.id}`)}
            className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/60 shadow-lg hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col relative"
        >
            <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                <img
                    src={mainImage}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';
                    }}
                />
                
                {/* Badges on top left */}
                <div className="absolute top-3 left-3 flex items-center space-x-2 z-10">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                        isPg ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}>
                        {listing.listingType}
                    </span>

                    {/* Trust Score Badge with Tooltip Trigger */}
                    <div 
                        className="relative"
                        onMouseEnter={(e) => { e.stopPropagation(); setShowTooltip(true); }}
                        onMouseLeave={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                        onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
                    >
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg flex items-center space-x-1 ${trustStyle.bg}`}>
                            <span>{trustStyle.icon}</span>
                            <span>{trustStyle.label}</span>
                            <span className="text-[10px] opacity-80 font-mono">({score})</span>
                        </span>

                        {/* Tooltip Overlay */}
                        {showTooltip && (
                            <div className="absolute top-8 left-0 w-64 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl z-50 text-xs space-y-2 pointer-events-none animate-fadeIn">
                                <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                                    <span className="font-extrabold text-white flex items-center space-x-1">
                                        <span>🛡️ Trust Score:</span>
                                        <span className={score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}>
                                            {score}/100
                                        </span>
                                    </span>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">{badge}</span>
                                </div>
                                <div className="space-y-1">
                                    {flags.length > 0 ? (
                                        flags.map((flag, idx) => (
                                            <p key={idx} className="text-gray-300 leading-tight text-[11px]">
                                                {flag}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic">Passed all heuristic verification checks.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-3 right-3 bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-extrabold text-blue-400 border border-gray-700 shadow-md">
                    {formattedRent} <span className="text-xs font-normal text-gray-400">/mo</span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {listing.title}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{listing.location}, <strong className="text-gray-300">{listing.city}</strong></span>
                    </p>
                </div>

                {listing.amenities && listing.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {listing.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="bg-gray-700/60 text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-600/40">
                                {amenity}
                            </span>
                        ))}
                        {listing.amenities.length > 3 && (
                            <span className="bg-gray-700/40 text-gray-400 text-xs px-2 py-1 rounded-lg">
                                +{listing.amenities.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListingCard;
