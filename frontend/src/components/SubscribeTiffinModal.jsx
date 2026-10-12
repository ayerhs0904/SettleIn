import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';

const SubscribeTiffinModal = ({ provider, isOpen, onClose }) => {
    const { addSubscription } = useBookmarks();

    const [planType, setPlanType] = useState('Lunch & Dinner (30 Days)');
    const [dietaryOption, setDietaryOption] = useState(
        provider?.dietaryOptions?.[0] || 'Pure Veg'
    );
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('12:30 PM & 8:00 PM');
    const [specialNotes, setSpecialNotes] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen || !provider) return null;

    const basePrice = provider.pricePerMonth || 3500;
    const calculatedPrice = planType.includes('Single Meal') 
        ? Math.round(basePrice * 0.6) 
        : planType.includes('Trial') 
            ? Math.round(basePrice * 0.3) 
            : basePrice;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!deliveryAddress.trim()) {
            alert('Please enter your delivery address');
            return;
        }

        addSubscription({
            providerId: provider.id,
            providerName: provider.name,
            cuisineType: provider.cuisineType,
            area: `${provider.area}, ${provider.city}`,
            pricePerMonth: calculatedPrice,
            planType,
            mealTiming: deliveryTimeSlot,
            dietaryOption,
            deliveryAddress: deliveryAddress.trim(),
            specialNotes: specialNotes.trim(),
            contactPhone: provider.contactPhone || '+91 98765 43210',
            imageUrl: provider.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
        });

        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
        }, 1800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-800 border border-gray-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-purple-600/20 p-5 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">🍱</span>
                            <h2 className="text-xl font-bold text-white">Subscribe to Meal Plan</h2>
                        </div>
                        <p className="text-xs text-amber-300 font-medium mt-0.5">{provider.name} • {provider.city}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 p-2 rounded-xl transition"
                    >
                        ✕
                    </button>
                </div>

                {isSuccess ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                            ✓
                        </div>
                        <h3 className="text-xl font-bold text-emerald-400">Subscription Activated!</h3>
                        <p className="text-sm text-gray-300">
                            Your meal plan with <strong>{provider.name}</strong> has been added to your Dashboard.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                        {/* Plan selection */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                Choose Plan Duration & Cadence
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[
                                    { label: 'Lunch & Dinner (30 Days)', priceMultiplier: 1, sub: 'Daily 2 Meals' },
                                    { label: 'Single Meal (Lunch or Dinner)', priceMultiplier: 0.6, sub: 'Daily 1 Meal' },
                                    { label: '7-Day Trial Pack', priceMultiplier: 0.3, sub: 'Flex Trial' }
                                ].map((plan, idx) => {
                                    const cost = Math.round(basePrice * plan.priceMultiplier);
                                    const isSelected = planType === plan.label;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setPlanType(plan.label)}
                                            className={`p-3 rounded-xl border cursor-pointer transition text-center flex flex-col justify-between ${
                                                isSelected 
                                                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg' 
                                                    : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">{plan.sub}</div>
                                            <div className="text-sm font-extrabold text-amber-400 my-1">₹{cost}</div>
                                            <div className="text-[10px] opacity-75">{plan.label.includes('30') ? 'Per Month' : 'Total'}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dietary Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                Dietary Preference
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(provider.dietaryOptions && provider.dietaryOptions.length > 0
                                    ? provider.dietaryOptions
                                    : ['Pure Veg', 'Non-Veg', 'Jain', 'Vegan']
                                ).map((diet, idx) => (
                                    <button
                                        type="button"
                                        key={idx}
                                        onClick={() => setDietaryOption(diet)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                            dietaryOption === diet
                                                ? 'bg-green-600 border-green-400 text-white'
                                                : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        🌿 {diet}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Slots */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Preferred Delivery Slot
                            </label>
                            <select
                                value={deliveryTimeSlot}
                                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400"
                            >
                                <option value="12:30 PM & 8:00 PM">Standard: Lunch (12:30 PM) & Dinner (8:00 PM)</option>
                                <option value="1:00 PM & 8:30 PM">Late: Lunch (1:00 PM) & Dinner (8:30 PM)</option>
                                <option value="12:00 PM & 7:30 PM">Early: Lunch (12:00 PM) & Dinner (7:30 PM)</option>
                                <option value="1:00 PM Lunch Only">Lunch Only: 1:00 PM</option>
                                <option value="8:00 PM Dinner Only">Dinner Only: 8:00 PM</option>
                            </select>
                        </div>

                        {/* Delivery Address */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Delivery Address / Room No. *
                            </label>
                            <textarea
                                required
                                rows={2}
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="E.g., Flat 402, Sunshine Residency, 12th Cross, Indiranagar"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        {/* Special Instructions */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Special Dietary Note (Optional)
                            </label>
                            <input
                                type="text"
                                value={specialNotes}
                                onChange={(e) => setSpecialNotes(e.target.value)}
                                placeholder="E.g., Less spicy, no coriander, extra rotis"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        {/* Summary Price & Submit */}
                        <div className="pt-2 border-t border-gray-700 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-gray-400">Total Subscription Fee</span>
                                <div className="text-xl font-extrabold text-amber-400">
                                    ₹{calculatedPrice} <span className="text-xs font-normal text-gray-400">/ billing cycle</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                Confirm & Subscribe
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SubscribeTiffinModal;
