import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getUserItineraries } from '../../api/itinerary.api.js';

export const ItineraryListingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [itineraries, setItineraries] = useState([]);
    const [filteredItineraries, setFilteredItineraries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch itineraries on mount
    useEffect(() => {
        if (!user?.user_code) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        const fetchItineraries = async () => {
            try {
                setLoading(true);
                const res = await getUserItineraries(user.user_code);
                const itinerariesData = res.data.data || res.data;
                console.log('User itineraries fetched:', itinerariesData);
                setItineraries(itinerariesData);
                setFilteredItineraries(itinerariesData);
            } catch (err) {
                console.error('Error fetching itineraries:', err);
                setError(err?.response?.data?.message || 'Failed to load itineraries');
            } finally {
                setLoading(false);
            }
        };

        fetchItineraries();
    }, [user]);

    // Filter itineraries based on search term
    useEffect(() => {
        const lowercased = searchTerm.toLowerCase();
        setFilteredItineraries(
            itineraries.filter(itinerary =>
                itinerary.trip.trip_name.toLowerCase().includes(lowercased) ||
                itinerary.trip.trip_code.toLowerCase().includes(lowercased)
            )
        );
    }, [searchTerm, itineraries]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'MMK',
            minimumFractionDigits: 0
        }).format(amount);
    };

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
                        <p className="text-gray-600 font-medium">Loading your itineraries...</p>
                        <p className="text-xs text-gray-400 mt-2">Retrieving saved journeys</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="relative mb-12 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1E3A8A]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">My Saved Itineraries</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        Your Travel Plans
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        View and manage your saved itineraries
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-8 max-w-md mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search itineraries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Itineraries Grid */}
                {filteredItineraries.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchTerm ? 'No itineraries found' : 'No saved itineraries yet'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'Generate and save your first itinerary to get started'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => navigate('/tripLists')}
                                className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                            >
                                Browse Trips
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItineraries.map((itinerary) => (
                            <div
                                key={itinerary.itinerary_id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#1E3A8A]/20 hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg leading-tight">
                                                {itinerary.trip.trip_name}
                                            </h3>
                                            <p className="text-white/80 text-sm font-mono">
                                                {itinerary.trip.trip_code}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Dates */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(itinerary.trip.start_date)} - {formatDate(itinerary.trip.end_date)}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#1E3A8A]">{itinerary.attraction_count}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">Attractions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#10B981]">{formatCurrency(itinerary.total_cost)}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Cost</div>
                                        </div>
                                    </div>

                                    {/* Generated Date */}
                                    <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Generated {new Date(itinerary.generated_at).toLocaleDateString()}
                                    </div>

                                    {/* View Button */}
                                    <button
                                        onClick={() => navigate(`/trip/${itinerary.trip.trip_code}/itinerary?mode=view`)}
                                        className="w-full group relative px-4 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="relative z-10">View Itinerary</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};