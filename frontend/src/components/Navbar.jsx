import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenCreateModal }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isOwnerOrProvider = user?.role === 'OWNER' || user?.role === 'PROVIDER';

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
                        S
                    </div>
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                        SettleIn
                    </span>
                </Link>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    {user && (
                        <div className="hidden lg:flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600/50 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-gray-200 font-medium">{user.name}</span>
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-purple-400/30">
                                {user.role}
                            </span>
                        </div>
                    )}

                    {user && (
                        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-xl transition ${isActive('/') ? 'bg-gray-700 text-white font-bold' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                🏠 Listings
                            </Link>

                            <Link
                                to="/tiffin-services"
                                className={`px-3 py-2 rounded-xl transition flex items-center space-x-1 ${isActive('/tiffin-services') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                <span>🍱</span>
                                <span>Tiffin Services</span>
                            </Link>

                            <Link
                                to="/find-flatmates"
                                className={`px-3 py-2 rounded-xl transition flex items-center space-x-1 ${isActive('/find-flatmates') || isActive('/matches') ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/40 font-bold' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                <span>🎴</span>
                                <span>Find Flatmates</span>
                            </Link>

                            <Link
                                to="/my-matches"
                                className={`px-3 py-2 rounded-xl transition flex items-center space-x-1 ${isActive('/my-matches') ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                <span>💘</span>
                                <span>My Matches</span>
                            </Link>

                            <Link
                                to="/preferences"
                                className={`px-3 py-2 rounded-xl transition flex items-center space-x-1 ${isActive('/preferences') ? 'bg-gray-700 text-white font-bold' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                <span>⚙️</span>
                                <span className="hidden sm:inline">Preferences</span>
                            </Link>
                        </nav>
                    )}

                    {isOwnerOrProvider && (
                        <button
                            onClick={onOpenCreateModal}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-1"
                        >
                            <span>+</span>
                            <span className="hidden sm:inline">Add Listing</span>
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white px-2.5 py-2 text-xs sm:text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
