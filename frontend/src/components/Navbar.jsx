import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenCreateModal }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isOwnerOrProvider = user?.role === 'OWNER' || user?.role === 'PROVIDER';

    return (
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
                        S
                    </div>
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        SettleIn
                    </span>
                </Link>

                <div className="flex items-center space-x-4">
                    {user && (
                        <div className="hidden sm:flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600/50 text-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-gray-200 font-medium">{user.name}</span>
                            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full uppercase font-bold border border-blue-400/30">
                                {user.role}
                            </span>
                        </div>
                    )}

                    {isOwnerOrProvider && (
                        <button
                            onClick={onOpenCreateModal}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5"
                        >
                            <span>+</span>
                            <span>Add Listing</span>
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
