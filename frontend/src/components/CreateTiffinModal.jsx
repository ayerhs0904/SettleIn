import React, { useState } from 'react';
import api from '../services/api';

const CreateTiffinModal = ({ isOpen, onClose, onProviderCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        cuisineType: 'North Indian',
        dietaryOptions: ['Pure Veg'],
        pricePerMonth: '',
        area: '',
        city: 'Noida',
        description: '',
        contactPhone: '',
        imageUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const availableDietaryOptions = ['Pure Veg', 'Jain', 'Non-Veg', 'Eggitarian', 'Vegan'];

    const handleDietaryToggle = (option) => {
        setFormData(prev => {
            const current = prev.dietaryOptions;
            if (current.includes(option)) {
                return { ...prev, dietaryOptions: current.filter(item => item !== option) };
            } else {
                return { ...prev, dietaryOptions: [...current, option] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                pricePerMonth: parseFloat(formData.pricePerMonth)
            };
            const response = await api.post('/tiffin-providers', payload);
            onProviderCreated(response.data);
            onClose();
        } catch (err) {
            console.error("Failed to create tiffin service", err);
            setError(err.response?.data?.message || "Failed to create tiffin provider.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h3 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                        <span>🍱</span>
                        <span>List a Tiffin Service</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
                </div>

                {error && (
                    <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-xl text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                    <div>
                        <label className="block text-gray-300 font-semibold mb-1">Service Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Annapurna Ghar Ka Khana"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 font-semibold mb-1">Cuisine Type *</label>
                            <select
                                value={formData.cuisineType}
                                onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                            >
                                <option value="North Indian">North Indian</option>
                                <option value="South Indian">South Indian</option>
                                <option value="Gujarati">Gujarati</option>
                                <option value="Maharashtrian">Maharashtrian</option>
                                <option value="Bengali">Bengali</option>
                                <option value="Multi-Cuisine">Multi-Cuisine</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-300 font-semibold mb-1">Monthly Price (₹) *</label>
                            <input
                                type="number"
                                required
                                placeholder="3500"
                                value={formData.pricePerMonth}
                                onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 font-semibold mb-1">Area / Suburb *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Sector 62"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 font-semibold mb-1">City *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Noida"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 font-semibold mb-1">Dietary Options *</label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {availableDietaryOptions.map((option) => {
                                const selected = formData.dietaryOptions.includes(option);
                                return (
                                    <button
                                        type="button"
                                        key={option}
                                        onClick={() => handleDietaryToggle(option)}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                                            selected
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        {selected ? '✓ ' : ''}{option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 font-semibold mb-1">Contact Phone *</label>
                        <input
                            type="text"
                            required
                            placeholder="+91 98765 43210"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 font-semibold mb-1">Image URL</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 font-semibold mb-1">Description</label>
                        <textarea
                            rows="3"
                            placeholder="Fresh homemade thali delivered daily for breakfast, lunch & dinner..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
                        >
                            {loading ? 'Creating...' : 'Create Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTiffinModal;
