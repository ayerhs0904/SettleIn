import React from 'react';

// Base generic shimmer box
export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton-shimmer rounded-xl ${className}`} />
);

// Listing Card Skeleton
export const ListingCardSkeleton = () => (
    <div className="bg-gray-800/90 rounded-2xl overflow-hidden border border-gray-700/60 shadow-lg flex flex-col">
        {/* Photo Area */}
        <div className="relative h-48 w-full bg-gray-900">
            <Skeleton className="w-full h-full rounded-none" />
            <div className="absolute top-3 left-3 flex space-x-2">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
            </div>
            <div className="absolute bottom-3 right-3">
                <Skeleton className="w-24 h-7 rounded-xl" />
            </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>

            {/* Amenity Pills */}
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-14 rounded-lg" />
            </div>
        </div>
    </div>
);

// Tiffin Provider Card Skeleton
export const TiffinCardSkeleton = () => (
    <div className="bg-gray-800/90 border border-gray-700/70 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
        <div>
            <div className="relative h-44 w-full bg-gray-900">
                <Skeleton className="w-full h-full rounded-none" />
                <div className="absolute top-3 left-3">
                    <Skeleton className="w-24 h-6 rounded-full" />
                </div>
            </div>
            <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1 mr-4">
                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                    <Skeleton className="w-12 h-6 rounded-lg shrink-0" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full rounded-md" />
            </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-gray-700/60 flex items-center justify-between">
            <Skeleton className="w-24 h-8 rounded-lg" />
            <Skeleton className="w-28 h-9 rounded-xl" />
        </div>
    </div>
);

// Roommate Card Skeleton (Swipe/Match Discovery)
export const RoommateCardSkeleton = () => (
    <div className="bg-gray-800/90 border border-gray-700/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-5">
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-36 rounded-lg" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                </div>
            </div>
            <Skeleton className="w-20 h-7 rounded-xl" />
        </div>

        {/* Bio */}
        <Skeleton className="h-14 w-full rounded-2xl" />

        {/* 4 Lifestyle attribute boxes */}
        <div className="grid grid-cols-2 gap-2.5">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-6 pt-2">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="w-14 h-14 rounded-full" />
        </div>
    </div>
);

// Listing Detail Skeleton
export const ListingDetailSkeleton = () => (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
        <Skeleton className="h-8 w-32 rounded-xl" />

        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between gap-4 pb-6 border-b border-gray-800">
            <div className="space-y-3 flex-1">
                <div className="flex space-x-2">
                    <Skeleton className="w-16 h-6 rounded-full" />
                    <Skeleton className="w-28 h-6 rounded-full" />
                </div>
                <Skeleton className="h-9 w-3/4 rounded-xl" />
                <Skeleton className="h-5 w-1/3 rounded-lg" />
            </div>
            <div className="space-y-3 flex flex-col md:items-end">
                <Skeleton className="h-9 w-36 rounded-xl" />
                <Skeleton className="h-10 w-44 rounded-xl" />
            </div>
        </div>

        {/* Hero Image Carousel */}
        <Skeleton className="h-96 sm:h-[420px] w-full rounded-2xl" />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

// Dashboard KPI & Chart Skeleton
export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-fadeIn">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700/60 space-y-2">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                    <Skeleton className="h-8 w-12 rounded-lg" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                </div>
            ))}
        </div>

        {/* Charts Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 p-6 rounded-3xl border border-gray-700/60 h-80 space-y-4">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-56 w-full rounded-2xl" />
            </div>
            <div className="bg-gray-800/80 p-6 rounded-3xl border border-gray-700/60 h-80 space-y-4">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-56 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);
