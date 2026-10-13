import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
    icon = '🔍',
    title = 'No Results Found',
    description = 'We couldn\'t find anything matching your current filters or criteria.',
    actionText,
    actionLink,
    onActionClick,
    secondaryText,
    secondaryLink,
    onSecondaryClick
}) => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-800/80 via-gray-800/40 to-gray-900/80 border border-gray-700/60 rounded-3xl p-8 sm:p-12 text-center shadow-2xl max-w-xl mx-auto my-6 animate-fadeIn">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
                {/* Icon Capsule */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-gray-800 to-gray-700/80 border border-gray-600/40 flex items-center justify-center text-4xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                    {icon}
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                {(actionText || secondaryText) && (
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                        {actionText && (
                            actionLink ? (
                                <Link
                                    to={actionLink}
                                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {actionText}
                                </Link>
                            ) : (
                                <button
                                    onClick={onActionClick}
                                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {actionText}
                                </button>
                            )
                        )}

                        {secondaryText && (
                            secondaryLink ? (
                                <Link
                                    to={secondaryLink}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-sm px-5 py-2.5 rounded-xl border border-gray-700 transition"
                                >
                                    {secondaryText}
                                </Link>
                            ) : (
                                <button
                                    onClick={onSecondaryClick}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-sm px-5 py-2.5 rounded-xl border border-gray-700 transition"
                                >
                                    {secondaryText}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
