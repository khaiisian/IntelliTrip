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
                const tripRes = await getTripByCode(tripCode);
                const tripData = tripRes.data.data || tripRes.data;
                setTrip(tripData);

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

    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.category_id === categoryId);
        return cat ? cat.category_name : `Category ${categoryId}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatBudget = (budget) => {
        if (!budget) return '0';
        return Number(budget).toLocaleString();
    };

    const hasItinerary = trip?.itineraries?.length > 0;

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            navigate(`/trip/${tripCode}/itinerary?mode=generate`, { state: { fromTripDetail: true } });
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/20 to-[#2563EB]/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
                        <svg className="animate-spin h-12 w-12 text-[#1E3A8A] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 font-medium">Loading trip details...</p>
                        <p className="text-xs text-gray-400 mt-2">Please wait a moment</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-500 mb-6">{error || 'Trip not found'}</p>
                    <button
                        onClick={() => navigate('/tripLists')}
                        className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        Back to Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header with decorative elements */}
                <div className="relative mb-12 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1E3A8A]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">Trip Overview</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        {trip.name}
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Explore your personalized travel plan and preferences
                    </p>
                </div>

                {/* Main Card with glass effect */}
                <div className="group relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Header with trip code badge */}
                    <div className="relative px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100/80">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl blur-md opacity-50"></div>
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Trip Code</p>
                                <p className="text-xl font-mono font-bold text-gray-800">{trip.code}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-green-50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-xs font-medium text-green-700">
                                    {Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1} Days
                                </span>
                            </div>
                            <div className="bg-blue-50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <span className="text-xs font-medium text-blue-700">
                                    {trip.preferences?.length || 0} Preferences
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Trip Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white/50 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Start Date</p>
                                        <p className="font-semibold text-gray-800">{formatDate(trip.start_date)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/50 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">End Date</p>
                                        <p className="font-semibold text-gray-800">{formatDate(trip.end_date)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/50 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Budget</p>
                                        <p className="font-semibold text-gray-800">Ks {formatBudget(trip.budget)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        {trip.preferences && trip.preferences.length > 0 ? (
                            <div className="space-y-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Travel Preferences</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {trip.preferences.map((pref) => {
                                        const weight = pref.preference_weight;
                                        const percentage = weight * 100;
                                        let barColor = 'bg-gray-300';
                                        let badgeColor = 'gray';
                                        if (weight >= 0.7) {
                                            barColor = 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB]';
                                            badgeColor = 'blue';
                                        } else if (weight >= 0.4) {
                                            barColor = 'bg-[#06B6D4]';
                                            badgeColor = 'cyan';
                                        } else {
                                            barColor = 'bg-gray-400';
                                            badgeColor = 'gray';
                                        }
                                        return (
                                            <div key={pref.trip_pref_id} className="bg-white/60 rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-gray-700">{getCategoryName(pref.category_id)}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${badgeColor === 'blue' ? '[#1E3A8A]/10 text-[#1E3A8A]' : badgeColor === 'cyan' ? '[#06B6D4]/10 text-[#06B6D4]' : 'gray-100 text-gray-600'}`}>
                                                        {Math.round(weight * 10)}/10
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white/50 rounded-2xl border border-gray-100">
                                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <p className="text-gray-500">No preferences set for this trip.</p>
                                <p className="text-xs text-gray-400 mt-1">Add preferences to get a personalized itinerary.</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4">
                            {hasItinerary ? (
                                <button
                                    onClick={() => navigate(`/trip/${tripCode}/itinerary?mode=view`, { state: { fromTripDetail: true } })}
                                    className="group relative w-full px-6 py-4 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="relative z-10">View Itinerary</span>
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
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                    {/* Enhanced tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-center shadow-lg">
                                        Generate a personalized daily plan based on your preferences and available time.
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Back to Trips Link */}
                        <div className="text-center pt-2">
                            <button
                                onClick={() => navigate('/tripLists')}
                                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#1E3A8A] transition-colors group"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to My Trips
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
