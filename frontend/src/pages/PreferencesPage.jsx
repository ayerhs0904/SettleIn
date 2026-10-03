import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const PreferencesPage = () => {
    const [formData, setFormData] = useState({
        sleepSchedule: 'Early Bird (10 PM - 6 AM)',
        cookingHabit: 'Cook Daily',
        cleanliness: 'Moderate & Neat',
        workSchedule: 'Standard 9-5',
        dietaryPreference: 'Vegetarian',
        smokingDrinking: 'Non-Smoker / Non-Drinker',
        guestsFrequency: 'Weekends Only',
        budget: '15000',
        preferredArea: 'Koramangala, Bangalore',
        aboutMe: 'Software engineer looking for a peaceful, clean place with like-minded roommates.'
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState('');
    const [embeddingInfo, setEmbeddingInfo] = useState(null);

    useEffect(() => {
        const fetchPreferences = async () => {
            setFetching(true);
            try {
                const response = await api.get('/preferences/me');
                if (response.data) {
                    setFormData({
                        sleepSchedule: response.data.sleepSchedule || 'Early Bird (10 PM - 6 AM)',
                        cookingHabit: response.data.cookingHabit || 'Cook Daily',
                        cleanliness: response.data.cleanliness || 'Moderate & Neat',
                        workSchedule: response.data.workSchedule || 'Standard 9-5',
                        dietaryPreference: response.data.dietaryPreference || 'Vegetarian',
                        smokingDrinking: response.data.smokingDrinking || 'Non-Smoker / Non-Drinker',
                        guestsFrequency: response.data.guestsFrequency || 'Weekends Only',
                        budget: response.data.budget?.toString() || '15000',
                        preferredArea: response.data.preferredArea || '',
                        aboutMe: response.data.aboutMe || ''
                    });
                    if (response.data.hasEmbedding) {
                        setEmbeddingInfo(`Saved with ${response.data.embeddingDimension}-dimensional vector embedding in pgvector.`);
                    }
                }
                setFetching(false);
            } catch (err) {
                // If 404, user doesn't have preferences yet, keep default form values
                setFetching(false);
            }
        };

        fetchPreferences();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const payload = {
                ...formData,
                budget: parseFloat(formData.budget) || 0
            };

            const response = await api.post('/preferences', payload);
            setLoading(false);
            setMessage('Preferences saved successfully!');
            if (response.data?.hasEmbedding) {
                setEmbeddingInfo(`Generated & saved ${response.data.embeddingDimension}-dimensional text vector embedding to PostgreSQL (pgvector).`);
            }
        } catch (err) {
            setLoading(false);
            setMessage('Failed to save preferences. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Navbar />

            <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
                <div className="border-b border-gray-800 pb-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                        Roommate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Preferences</span> Profile
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Configure your lifestyle habits to generate an AI text vector embedding for smart roommate matching.
                    </p>
                </div>

                {fetching ? (
                    <div className="bg-gray-800/60 p-8 rounded-2xl border border-gray-700 animate-pulse text-center">
                        Loading preferences...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-gray-800/80 p-6 sm:p-8 rounded-3xl border border-gray-700/70 shadow-2xl space-y-6">
                        {message && (
                            <div className={`p-4 rounded-xl border text-sm font-semibold ${
                                message.includes('successfully') ? 'bg-green-950/50 border-green-800/50 text-green-300' : 'bg-red-950/50 border-red-800/50 text-red-300'
                            }`}>
                                {message}
                            </div>
                        )}

                        {embeddingInfo && (
                            <div className="bg-blue-950/50 border border-blue-800/50 p-4 rounded-xl text-xs sm:text-sm text-blue-300 flex items-center space-x-2">
                                <span className="text-lg">🧬</span>
                                <span><strong>pgvector Status:</strong> {embeddingInfo}</span>
                            </div>
                        )}

                        {/* Lifestyle Select Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Sleep Schedule</label>
                                <select
                                    value={formData.sleepSchedule}
                                    onChange={(e) => handleChange('sleepSchedule', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="Early Bird (10 PM - 6 AM)">Early Bird (10 PM - 6 AM)</option>
                                    <option value="Night Owl (2 AM - 10 AM)">Night Owl (2 AM - 10 AM)</option>
                                    <option value="Flexible / Irregular">Flexible / Irregular</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Cooking Habit</label>
                                <select
                                    value={formData.cookingHabit}
                                    onChange={(e) => handleChange('cookingHabit', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="Cook Daily">Cook Daily</option>
                                    <option value="Occasionally Cook">Occasionally Cook</option>
                                    <option value="Order Out / Hire Cook">Order Out / Hire Cook</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Cleanliness Standard</label>
                                <select
                                    value={formData.cleanliness}
                                    onChange={(e) => handleChange('cleanliness', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="Strict Clean Freak">Strict Clean Freak</option>
                                    <option value="Moderate & Neat">Moderate & Neat</option>
                                    <option value="Casual / Laid-back">Casual / Laid-back</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Work Schedule</label>
                                <select
                                    value={formData.workSchedule}
                                    onChange={(e) => handleChange('workSchedule', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="Standard 9-5">Standard 9-5</option>
                                    <option value="Night Shift / US Hours">Night Shift / US Hours</option>
                                    <option value="Flexible / Work From Home">Flexible / Work From Home</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Dietary Preference</label>
                                <select
                                    value={formData.dietaryPreference}
                                    onChange={(e) => handleChange('dietaryPreference', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                                    <option value="Eggetarian">Eggetarian</option>
                                    <option value="Vegan">Vegan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Smoking / Drinking</label>
                                <select
                                    value={formData.smokingDrinking}
                                    onChange={(e) => handleChange('smokingDrinking', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="Non-Smoker / Non-Drinker">Non-Smoker / Non-Drinker</option>
                                    <option value="Social Drinker / Non-Smoker">Social Drinker / Non-Smoker</option>
                                    <option value="Regular">Regular</option>
                                </select>
                            </div>
                        </div>

                        {/* Location & Budget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Monthly Budget (₹)</label>
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => handleChange('budget', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Preferred Area / Locality</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Koramangala, Bangalore"
                                    value={formData.preferredArea}
                                    onChange={(e) => handleChange('preferredArea', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* About Me */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">About Me / Additional Preferences</label>
                            <textarea
                                rows="3"
                                placeholder="Describe yourself, hobbies, expectations from a roommate..."
                                value={formData.aboutMe}
                                onChange={(e) => handleChange('aboutMe', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition"
                            >
                                {loading ? 'Computing Embedding...' : 'Save & Compute Vector'}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default PreferencesPage;
