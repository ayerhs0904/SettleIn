import React, { useState } from 'react';
import api from '../services/api';

const CreateListingModal = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rent, setRent] = useState('');
    const [location, setLocation] = useState('');
    const [city, setCity] = useState('');
    const [listingType, setListingType] = useState('PG');
    const [amenitiesInput, setAmenitiesInput] = useState('WiFi, AC, Laundry, Food');
    const [imagesInput, setImagesInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const amenities = amenitiesInput.split(',').map(s => s.trim()).filter(Boolean);
            const images = imagesInput ? imagesInput.split(',').map(s => s.trim()).filter(Boolean) : [];

            await api.post('/listings', {
                title,
                description,
                rent: parseFloat(rent),
                location,
                city,
                listingType,
                amenities,
                images
            });

            setLoading(false);
            onSuccess();
            onClose();
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to create listing');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <h2 className="text-2xl font-bold text-white">Create New Listing</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl font-bold p-1"
                    >
                        ✕
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm bg-red-950/40 p-3 rounded-xl border border-red-800/40">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Title *</label>
                            <input
                                type="text"
                                placeholder="Cozy Single Room PG..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Property Type *</label>
                            <select
                                value={listingType}
                                onChange={(e) => setListingType(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="PG">PG (Paying Guest)</option>
                                <option value="FLAT">FLAT (Apartment)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Monthly Rent (₹) *</label>
                            <input
                                type="number"
                                placeholder="12000"
                                value={rent}
                                onChange={(e) => setRent(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">City *</label>
                            <input
                                type="text"
                                placeholder="Bangalore"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Location / Locality *</label>
                            <input
                                type="text"
                                placeholder="Koramangala, 5th Block"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                        <textarea
                            rows="3"
                            placeholder="Describe your property, rules, features..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Amenities (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="WiFi, AC, Laundry, Parking, Food"
                            value={amenitiesInput}
                            onChange={(e) => setAmenitiesInput(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Image URLs (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..., https://..."
                            value={imagesInput}
                            onChange={(e) => setImagesInput(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-semibold text-gray-400 hover:text-white bg-gray-700 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg transition"
                        >
                            {loading ? 'Creating...' : 'Publish Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListingModal;
