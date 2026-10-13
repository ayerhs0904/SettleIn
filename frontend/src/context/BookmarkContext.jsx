import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const BookmarkContext = createContext(null);

const DEFAULT_BOOKMARKED_LISTINGS = [
    {
        id: 101,
        title: "Modern 2BHK Near Tech Park",
        description: "Fully furnished 2BHK apartment with high-speed WiFi, power backup, and gym access.",
        rent: 24000,
        location: "Koramangala, 5th Block",
        city: "Bangalore",
        listingType: "FLAT",
        amenities: ["WiFi", "AC", "Power Backup", "Gym", "Gated Security"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
        trustScore: 98,
        trustBadge: "VERIFIED",
        trustFlags: ["Verified Owner", "Rent Matches Market Average", "Clean Image Metadata"],
        viewCount: 142
    },
    {
        id: 102,
        title: "Cozy Private Studio PG for Professionals",
        description: "Spacious private PG room with attached balcony, daily housekeeping, and 3-time meals included.",
        rent: 14500,
        location: "Indiranagar, 100ft Road",
        city: "Bangalore",
        listingType: "PG",
        amenities: ["Attached Washroom", "Food Included", "Balcony", "Laundry", "24/7 CCTV"],
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
        trustScore: 92,
        trustBadge: "VERIFIED",
        trustFlags: ["Verified Electricity Bill", "Owner Phone Active"],
        viewCount: 289
    }
];

const DEFAULT_BOOKMARKED_PROVIDERS = [
    {
        id: 201,
        name: "Annapurna Homestyle Kitchen",
        cuisineType: "North Indian / Ghar Ka Khana",
        dietaryOptions: ["Pure Veg", "Jain Option Available"],
        pricePerMonth: 3800,
        area: "Koramangala",
        city: "Bangalore",
        description: "Warm, non-oily homely rotis, dal tadka, seasonal vegetables, and jeera rice delivered twice daily.",
        contactPhone: "+91 98765 43210",
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        averageRating: 4.8,
        reviewCount: 34
    },
    {
        id: 202,
        name: "Dakshin Delights Daily Tiffin",
        cuisineType: "South Indian & Chettinad",
        dietaryOptions: ["Pure Veg", "Non-Veg Sundays"],
        pricePerMonth: 3500,
        area: "HSR Layout",
        city: "Bangalore",
        description: "Authentic sambar, rasam, curd rice, variety poriyal and weekend special biryani packs.",
        contactPhone: "+91 91234 56789",
        imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
        averageRating: 4.7,
        reviewCount: 28
    }
];

const DEFAULT_SUBSCRIPTIONS = [
    {
        id: "sub-1",
        providerId: 201,
        providerName: "Annapurna Homestyle Kitchen",
        cuisineType: "North Indian / Ghar Ka Khana",
        area: "Koramangala, Bangalore",
        pricePerMonth: 3800,
        planType: "Lunch & Dinner (30 Days)",
        mealTiming: "Lunch: 12:30 PM | Dinner: 8:00 PM",
        dietaryOption: "Pure Veg",
        deliveryAddress: "Flat 302, Palm Meadows, Koramangala 4th Block",
        status: "ACTIVE",
        startDate: "2026-10-01",
        nextRenewal: "2026-10-31",
        contactPhone: "+91 98765 43210",
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
    }
];

export const BookmarkProvider = ({ children }) => {
    const { user } = useAuth();
    const toast = useToast();
    const userKey = user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'guest';

    // State for bookmarked listings
    const [bookmarkedListings, setBookmarkedListings] = useState(() => {
        try {
            const saved = localStorage.getItem(`settlein_b_listings_${userKey}`);
            return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKED_LISTINGS;
        } catch {
            return DEFAULT_BOOKMARKED_LISTINGS;
        }
    });

    // State for bookmarked tiffin providers
    const [bookmarkedProviders, setBookmarkedProviders] = useState(() => {
        try {
            const saved = localStorage.getItem(`settlein_b_providers_${userKey}`);
            return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKED_PROVIDERS;
        } catch {
            return DEFAULT_BOOKMARKED_PROVIDERS;
        }
    });

    // State for active tiffin subscriptions
    const [subscriptions, setSubscriptions] = useState(() => {
        try {
            const saved = localStorage.getItem(`settlein_subscriptions_${userKey}`);
            return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTIONS;
        } catch {
            return DEFAULT_SUBSCRIPTIONS;
        }
    });

    // Sync to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(`settlein_b_listings_${userKey}`, JSON.stringify(bookmarkedListings));
        } catch (e) {
            console.error("Failed to persist listing bookmarks", e);
        }
    }, [bookmarkedListings, userKey]);

    useEffect(() => {
        try {
            localStorage.setItem(`settlein_b_providers_${userKey}`, JSON.stringify(bookmarkedProviders));
        } catch (e) {
            console.error("Failed to persist provider bookmarks", e);
        }
    }, [bookmarkedProviders, userKey]);

    useEffect(() => {
        try {
            localStorage.setItem(`settlein_subscriptions_${userKey}`, JSON.stringify(subscriptions));
        } catch (e) {
            console.error("Failed to persist subscriptions", e);
        }
    }, [subscriptions, userKey]);

    // Helpers
    const isListingBookmarked = (id) => {
        return bookmarkedListings.some(item => String(item.id) === String(id));
    };

    const toggleBookmarkListing = (listing) => {
        if (!listing || !listing.id) return;
        const exists = bookmarkedListings.some(item => String(item.id) === String(listing.id));
        if (exists) {
            setBookmarkedListings(prev => prev.filter(item => String(item.id) !== String(listing.id)));
            toast.bookmark(listing.title, false);
        } else {
            setBookmarkedListings(prev => [listing, ...prev]);
            toast.bookmark(listing.title, true);
        }
    };

    const isProviderBookmarked = (id) => {
        return bookmarkedProviders.some(item => String(item.id) === String(id));
    };

    const toggleBookmarkProvider = (provider) => {
        if (!provider || !provider.id) return;
        const exists = bookmarkedProviders.some(item => String(item.id) === String(provider.id));
        if (exists) {
            setBookmarkedProviders(prev => prev.filter(item => String(item.id) !== String(provider.id)));
            toast.bookmark(provider.name, false);
        } else {
            setBookmarkedProviders(prev => [provider, ...prev]);
            toast.bookmark(provider.name, true);
        }
    };

    // Subscriptions management
    const addSubscription = (subscriptionData) => {
        const newSub = {
            id: `sub-${Date.now()}`,
            status: 'ACTIVE',
            startDate: new Date().toISOString().split('T')[0],
            nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            ...subscriptionData
        };
        setSubscriptions(prev => [newSub, ...prev]);
        toast.success(`Subscribed to ${subscriptionData.providerName}!`, 'Meal Plan Activated');
        return newSub;
    };

    const toggleSubscriptionStatus = (id) => {
        setSubscriptions(prev => prev.map(sub => {
            if (sub.id === id) {
                const nextStatus = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
                if (nextStatus === 'PAUSED') {
                    toast.info(`Deliveries paused for ${sub.providerName}. Resume whenever you're ready!`, 'Plan Paused');
                } else {
                    toast.success(`Deliveries resumed for ${sub.providerName}!`, 'Plan Resumed');
                }
                return { ...sub, status: nextStatus };
            }
            return sub;
        }));
    };

    const cancelSubscription = (id) => {
        const target = subscriptions.find(s => s.id === id);
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
        toast.info(target ? `Cancelled meal plan for ${target.providerName}.` : 'Subscription cancelled.', 'Plan Cancelled');
    };

    return (
        <BookmarkContext.Provider value={{
            bookmarkedListings,
            bookmarkedProviders,
            subscriptions,
            isListingBookmarked,
            toggleBookmarkListing,
            isProviderBookmarked,
            toggleBookmarkProvider,
            addSubscription,
            toggleSubscriptionStatus,
            cancelSubscription
        }}>
            {children}
        </BookmarkContext.Provider>
    );
};

export const useBookmarks = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarks must be used within a BookmarkProvider');
    }
    return context;
};
