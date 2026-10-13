import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token, { name: response.data.name, role: response.data.role });
            toast.success(`Welcome back, ${response.data.name || 'Explorer'}!`);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoFill = (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        toast.info(`Filled credentials for ${demoEmail}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-fadeIn">
                {/* Brand Header */}
                <div className="text-center mb-8 space-y-2">
                    <Link to="/" className="inline-flex items-center space-x-2.5 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-xl shadow-purple-900/40 group-hover:scale-105 transition-transform duration-300">
                            🏡
                        </div>
                        <span className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 bg-clip-text text-transparent font-display tracking-tight">
                            SettleIn
                        </span>
                    </Link>
                    <h2 className="text-2xl font-extrabold text-white">Welcome back</h2>
                    <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto">
                        Sign in to your verified home, flatmate matching & tiffin dashboard.
                    </p>
                </div>

                {/* Glass Container */}
                <div className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm p-3.5 rounded-xl flex items-center space-x-2 animate-fadeIn">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    ✉️
                                </span>
                                <input
                                    type="email"
                                    placeholder="you@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/90 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500 transition text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    🔒
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-gray-800/90 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500 transition text-sm font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 text-sm mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In to Account →</span>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Fills */}
                    <div className="pt-2 border-t border-gray-800 space-y-2">
                        <div className="text-[11px] font-semibold text-gray-400 text-center uppercase tracking-wider">
                            ⚡ Quick Demo Fill
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => handleDemoFill('seeker@settlein.com', 'password123')}
                                className="bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white py-2 px-3 rounded-xl border border-gray-700/60 transition text-center"
                            >
                                👤 Seeker Demo
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoFill('owner@settlein.com', 'password123')}
                                className="bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white py-2 px-3 rounded-xl border border-gray-700/60 transition text-center"
                            >
                                🏢 Owner Demo
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center text-xs text-gray-400 pt-2">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold hover:underline">
                            Create one now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
