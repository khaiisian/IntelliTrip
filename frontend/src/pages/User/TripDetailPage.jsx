import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getTripByCode } from '../../api/trip.api.js';
import { getCategories } from '../../api/category.api.js';
import { generateItinerary } from '../../api/itinerary.api.js';

export const TripDetailPage = () => {
    const { tripCode } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [trip, setTrip] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    // Fetch trip details and categories
    useEffect(() => {
        const fetchData = async () => {
            if (!tripCode) {
                setError('No trip code provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch trip details
                const tripRes = await getTripByCode(tripCode);
                const tripData = tripRes.data.data || tripRes.data;
                setTrip(tripData);

                // Fetch categories for preference names
                const catRes = await getCategories();
                const catData = catRes.data.data || catRes.data;
                setCategories(catData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err?.response?.data?.message || 'Failed to load trip details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tripCode]);

    // Helper to get category name from id
    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.category_id === categoryId);
        return cat ? cat.category_name : `Category ${categoryId}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Format budget
    const formatBudget = (budget) => {
        if (!budget) return '0';
        return Number(budget).toLocaleString();
    };

    // Determine if itinerary exists
    const hasItinerary = trip?.itineraries?.length > 0;

    // Handle generate itinerary
    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // await generateItinerary(tripCode);
            // After generation, navigate to the itinerary page
            navigate(`/itinerary/${tripCode}`);
        } catch (err) {
            console.error('Error generating itinerary:', err);
            alert(err?.response?.data?.message || 'Failed to generate itinerary');
        } finally {
            setGenerating(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-[#1E3A8A] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Loading trip details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || 'Trip not found'}</p>
                    <button
                        onClick={() => navigate('/trips')}
                        className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#2563EB] transition-colors"
                    >
                        Back to Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Trip Details</h1>
                    <p className="text-lg text-gray-600">View your trip information and preferences</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Gradient Header with Trip Code */}
                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">{trip.name}</h2>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                {trip.code}
              </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Trip Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="font-semibold text-gray-800">{formatDate(trip.start_date)}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">End Date</p>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="font-semibold text-gray-800">{formatDate(trip.end_date)}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Budget</p>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="font-semibold text-gray-800">Ks {formatBudget(trip.budget)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        {trip.preferences && trip.preferences.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Your Preferences
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {trip.preferences.map((pref) => {
                                        const weight = pref.preference_weight;
                                        const percentage = weight * 100;
                                        // Color based on weight
                                        let barColor = 'bg-gray-400';
                                        if (weight >= 0.7) barColor = 'bg-[#1E3A8A]';
                                        else if (weight >= 0.4) barColor = 'bg-[#06B6D4]';

                                        return (
                                            <div key={pref.trip_pref_id} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{getCategoryName(pref.category_id)}</span>
                                                    <span className="font-semibold text-[#1E3A8A]">{(weight * 10).toFixed(1)}/10</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${barColor} transition-all duration-300`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-xl">
                                <p className="text-gray-500">No preferences set for this trip.</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-4">
                            {hasItinerary ? (
                                <button
                                    onClick={() => navigate(`/trip/${tripCode}/itinerary`)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-bold rounded-xl hover:from-[#2563EB] hover:to-[#1E3A8A] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Itinerary
                                </button>
                            ) : (
                                <div className="relative group">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                                    >
                                        {generating ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating Itinerary...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                Generate Itinerary
                                            </>
                                        )}
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-center">
                                        Generate a personalized daily plan based on your preferences and available time.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Back to Trips Link */}
                        <div className="text-center">
                            <button
                                onClick={() => navigate('/trips')}
                                className="text-sm text-gray-500 hover:text-[#1E3A8A] transition-colors"
                            >
                                ← Back to My Trips
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};