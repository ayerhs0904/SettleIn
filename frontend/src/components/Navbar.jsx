import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';

const Navbar = ({ onOpenCreateModal }) => {
    const { user, logout } = useAuth();
    const { bookmarkedListings, bookmarkedProviders, subscriptions } = useBookmarks();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.info('You have been logged out.', 'Signed Out');
        navigate('/login');
    };

    const isOwnerOrProvider = user?.role === 'OWNER' || user?.role === 'PROVIDER';
    const totalBadges = bookmarkedListings.length + bookmarkedProviders.length + subscriptions.length;

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', badge: totalBadges > 0 ? totalBadges : null },
        { path: '/', label: 'Listings', icon: '🏠' },
        { path: '/tiffin-services', label: 'Tiffin Services', icon: '🍱', activeClass: 'text-amber-300' },
        { path: '/find-flatmates', label: 'Find Flatmates', icon: '🎴' },
        { path: '/my-matches', label: 'My Matches', icon: '💘' },
        { path: '/preferences', label: 'Preferences', icon: '⚙️' },
    ];

    return (
        <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40 shadow-xl transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 group"
                >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform duration-300">
                        S
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 tracking-tight">
                            SettleIn
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase -mt-1 hidden sm:block">
                            Relocate Seamlessly
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-2">
                    {user && (
                        <nav className="flex items-center space-x-1 text-xs font-semibold">
                            {navLinks.map((link) => {
                                const active = isActive(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                                            active
                                                ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white font-bold border border-purple-500/40 shadow-sm'
                                                : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
                                        }`}
                                    >
                                        <span>{link.icon}</span>
                                        <span>{link.label}</span>
                                        {link.badge && (
                                            <span className="bg-pink-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                                                {link.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* User Profile Pill (Desktop) */}
                    {user && (
                        <div className="hidden sm:flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-700/80 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-gray-200 font-medium truncate max-w-[120px]">{user.name}</span>
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold border border-purple-500/30">
                                {user.role}
                            </span>
                        </div>
                    )}

                    {/* Owner Add Listing Button */}
                    {isOwnerOrProvider && (
                        <button
                            onClick={onOpenCreateModal}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1"
                        >
                            <span>➕</span>
                            <span className="hidden sm:inline">Add Listing</span>
                        </button>
                    )}

                    {/* Desktop Logout Button */}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="hidden lg:inline-flex text-gray-400 hover:text-white px-3 py-2 text-xs font-semibold rounded-xl hover:bg-gray-800 transition"
                        >
                            Logout
                        </button>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/login"
                                className="text-gray-300 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Hamburger Button */}
                    {user && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none border border-gray-700 transition"
                            aria-label="Toggle mobile navigation"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <div className="relative">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    {totalBadges > 0 && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping" />
                                    )}
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Dropdown Drawer */}
            {mobileMenuOpen && user && (
                <div className="lg:hidden border-t border-gray-800 bg-gray-900/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-fadeIn">
                    {/* User Profile Info in Mobile Menu */}
                    <div className="flex items-center justify-between bg-gray-800/80 p-3.5 rounded-2xl border border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{user.name}</h4>
                                <span className="text-[10px] text-gray-400 font-medium">Logged in via {user.email || 'account'}</span>
                            </div>
                        </div>
                        <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2.5 py-1 rounded-full uppercase font-black border border-purple-500/30">
                            {user.role}
                        </span>
                    </div>

                    {/* Navigation Links in Mobile Menu */}
                    <nav className="grid grid-cols-2 gap-2">
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition ${
                                        active
                                            ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/40 shadow-sm'
                                            : 'bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="flex items-center space-x-2">
                                        <span className="text-base">{link.icon}</span>
                                        <span>{link.label}</span>
                                    </span>
                                    {link.badge && (
                                        <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Action buttons inside mobile drawer */}
                    <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-3">
                        {isOwnerOrProvider && (
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    if (onOpenCreateModal) onOpenCreateModal();
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md"
                            >
                                ➕ Add Listing
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-red-300 font-bold py-2.5 px-4 rounded-xl text-xs border border-gray-700 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
