import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import LocationSearch from "../../components/LocationSearch.jsx";
import { createTrip } from "../../api/trip.api.js";

export const CreateTripPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tripName, setTripName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budget, setBudget] = useState("");

    // Start location
    const [startLat, setStartLat] = useState("");
    const [startLng, setStartLng] = useState("");
    const [startPlaceName, setStartPlaceName] = useState("");

    // End location
    const [endLat, setEndLat] = useState("");
    const [endLng, setEndLng] = useState("");
    const [endPlaceName, setEndPlaceName] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!tripName.trim()) newErrors.tripName = "Trip name is required";
        if (!startDate) newErrors.startDate = "Start date is required";
        if (!endDate) newErrors.endDate = "End date is required";
        if (!budget) newErrors.budget = "Budget is required";
        if (budget && Number(budget) <= 0) newErrors.budget = "Budget must be greater than 0";
        if (!startLat || !startLng) newErrors.startLocation = "Please select a start location";
        if (!endLat || !endLng) newErrors.endLocation = "Please select an end location";

        // Date validation
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                newErrors.dateRange = "End date must be after start date";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (!user?.user_id) {
            alert("User not authenticated");
            return;
        }

        setLoading(true);

        const payload = {
            trip_name: tripName,
            start_lat: Number(startLat),
            start_lng: Number(startLng),
            end_lat: Number(endLat),
            end_lng: Number(endLng),
            start_date: startDate,
            end_date: endDate,
            budget: Number(budget),
            user_id: user.user_id
        };

        console.log("Submitting payload:", payload);

        try {
            const res = await createTrip(payload);
            console.log("Trip created:", res.data);

            // Navigate to trip details or add attractions page
            // navigate(`/trip/${res.data.trip_id}/add-attractions`);
            navigate(`/tripSchedule/${res.data.trip_code}`);

            alert("Trip created successfully!");
        } catch (err) {
            console.error("Error creating trip:", err);
            alert(err?.response?.data?.message || "Error creating trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Trip</h1>
                    <p className="text-lg text-gray-600">Plan your adventure by filling in the trip details below</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex justify-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold shadow-lg">
                                1
                            </div>
                            <span className="ml-3 font-semibold text-[#1E3A8A]">Trip Details</span>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300"></div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                                2
                            </div>
                            <span className="ml-3 text-gray-500">Add Attractions</span>
                        </div>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">Trip Information</h2>
                        <p className="text-blue-100 mt-1">Fill in the basic details of your trip</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Trip Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Trip Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={tripName}
                                onChange={(e) => setTripName(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    errors.tripName ? 'border-red-500' : 'border-gray-300'
                                } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none`}
                                placeholder="E.g., Bagan Adventure, Yangon City Tour"
                            />
                            {errors.tripName && (
                                <p className="text-sm text-red-500 mt-1">{errors.tripName}</p>
                            )}
                        </div>

                        {/* Date Range - Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            errors.startDate || errors.dateRange ? 'border-red-500' : 'border-gray-300'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.startDate && (
                                    <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            errors.endDate || errors.dateRange ? 'border-red-500' : 'border-gray-300'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.endDate && (
                                    <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                                )}
                            </div>
                        </div>

                        {/* Date Range Error */}
                        {errors.dateRange && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{errors.dateRange}</p>
                            </div>
                        )}

                        {/* Location Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                                Trip Locations
                            </h3>

                            {/* Start Location */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Start Location <span className="text-red-500">*</span>
                                </label>
                                <LocationSearch
                                    lat={startLat}
                                    setLat={setStartLat}
                                    lng={startLng}
                                    setLng={setStartLng}
                                    placeName={startPlaceName}
                                    setPlaceName={setStartPlaceName}
                                    placeholder="Search for starting point..."
                                />
                                {errors.startLocation && (
                                    <p className="text-sm text-red-500 mt-1">{errors.startLocation}</p>
                                )}
                            </div>

                            {/* End Location */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    End Location <span className="text-red-500">*</span>
                                </label>
                                <LocationSearch
                                    lat={endLat}
                                    setLat={setEndLat}
                                    lng={endLng}
                                    setLng={setEndLng}
                                    placeName={endPlaceName}
                                    setPlaceName={setEndPlaceName}
                                    placeholder="Search for ending point..."
                                />
                                {errors.endLocation && (
                                    <p className="text-sm text-red-500 mt-1">{errors.endLocation}</p>
                                )}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Budget (MMK) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-500 font-medium">Ks</span>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                                        errors.budget ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none`}
                                    placeholder="200000"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            {errors.budget && (
                                <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Estimated total budget for the trip in Myanmar Kyat
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Trip...
                                    </span>
                                ) : (
                                    <>
                                        Next: Add Schedule
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-[#06B6D4] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800">How to set locations:</h4>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1 list-disc list-inside">
                                <li>Type in the search box and select from suggestions</li>
                                <li>Or click "Show Map" and click directly on the map</li>
                                <li>You can drag the marker to fine-tune the location</li>
                                <li>Both start and end locations are required</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};