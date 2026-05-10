import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import LocationSearch from "../../components/LocationSearch.jsx";
import { createTrip } from "../../api/trip.api.js";
import { FieldError, DateRangeError } from "../../components/ErrorMessage.jsx";
import { ButtonSpinner } from "../../components/LoadingSpinner.jsx";
import { InfoBox } from "../../components/InfoBox.jsx";

export const CreateTripPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tripName, setTripName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budget, setBudget] = useState("");

    const [startLat, setStartLat] = useState("");
    const [startLng, setStartLng] = useState("");
    const [startPlaceName, setStartPlaceName] = useState("");

    const [endLat, setEndLat] = useState("");
    const [endLng, setEndLng] = useState("");
    const [endPlaceName, setEndPlaceName] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const aiDataRaw = sessionStorage.getItem("aiTripData");
        if (!aiDataRaw) return;

        sessionStorage.removeItem("aiTripData");

        try {
            const aiData = JSON.parse(aiDataRaw);
            if (aiData.trip) {
                if (aiData.trip.trip_name) setTripName(aiData.trip.trip_name);
                if (aiData.trip.start_date) setStartDate(aiData.trip.start_date);
                if (aiData.trip.end_date) setEndDate(aiData.trip.end_date);
                if (aiData.trip.budget) setBudget(aiData.trip.budget.toString());
                if (aiData.trip.start_location_name) setStartPlaceName(aiData.trip.start_location_name);
                if (aiData.trip.end_location_name) setEndPlaceName(aiData.trip.end_location_name);
            }

            sessionStorage.setItem("aiSchedule", JSON.stringify(aiData.schedule || {}));
            sessionStorage.setItem("aiPreferences", JSON.stringify(aiData.preferences || {}));
        } catch (err) {
            console.error("Failed to parse AI trip data", err);
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!tripName.trim()) newErrors.tripName = "Trip name is required";
        if (!startDate) newErrors.startDate = "Start date is required";
        if (!endDate) newErrors.endDate = "End date is required";
        if (!budget) newErrors.budget = "Budget is required";
        if (budget && (isNaN(Number(budget)) || Number(budget) < 5000)) newErrors.budget = "Budget must be at least 5000";
        if (!startLat || !startLng) newErrors.startLocation = "Please select a start location";
        if (!endLat || !endLng) newErrors.endLocation = "Please select an end location";

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
            navigate(`/tripSchedule/${res.data.data.code}`);
            alert("Trip created successfully!");
        } catch (err) {
            console.error("Error creating trip:", err);
            alert(err?.response?.data?.message || "Error creating trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with decorative element */}
                <div className="relative mb-12 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#1E3A8A]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">Start Your Journey</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        Create New Trip
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Plan your adventure by filling in the trip details below
                    </p>
                </div>

                {/* Progress Steps - Enhanced */}
                <div className="mb-10 flex justify-center">
                    <div className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white flex items-center justify-center font-bold shadow-lg relative">
                                1
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="mt-2 text-xs font-semibold text-[#1E3A8A]">Trip Details</span>
                        </div>
                        <div className="w-20 h-0.5 bg-gradient-to-r from-[#1E3A8A] to-gray-300 mx-2"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold border-2 border-gray-200">
                                2
                            </div>
                            <span className="mt-2 text-xs font-medium text-gray-400">Daily Schedule</span>
                        </div>
                        <div className="w-20 h-0.5 bg-gray-200 mx-2"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold border-2 border-gray-200">
                                3
                            </div>
                            <span className="mt-2 text-xs font-medium text-gray-400">Preferences</span>
                        </div>
                    </div>
                </div>

                {/* Main Form Card with glass effect */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Card Header */}
                    <div className="relative bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Trip Information</h2>
                                <p className="text-blue-100 text-sm mt-0.5">Fill in the basic details of your trip</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Trip Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                                Trip Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={tripName}
                                    onChange={(e) => setTripName(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${
                                        errors.tripName ? 'border-red-500' : 'border-gray-200'
                                    } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none bg-white/50 focus:bg-white`}
                                    placeholder="E.g., Bagan Adventure, Yangon City Tour"
                                />
                            </div>
                            <FieldError error={errors.tripName} />
                        </div>

                        {/* Date Range - Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            errors.startDate || errors.dateRange ? 'border-red-500' : 'border-gray-200'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none bg-white/50 focus:bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <FieldError error={errors.startDate} />
                            </div>

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
                                            errors.endDate || errors.dateRange ? 'border-red-500' : 'border-gray-200'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none bg-white/50 focus:bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <FieldError error={errors.endDate} />
                            </div>
                        </div>

                        <DateRangeError error={errors.dateRange} />

                        {/* Location Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <div className="w-6 h-6 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Trip Locations</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
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
                                    <FieldError error={errors.startLocation} />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
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
                                    <FieldError error={errors.endLocation} />
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Budget (MMK) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-md text-sm">Ks</span>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className={`w-full pl-16 pr-4 py-3 rounded-xl border ${
                                        errors.budget ? 'border-red-500' : 'border-gray-200'
                                    } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none bg-white/50 focus:bg-white`}
                                    placeholder="200000"
                                    min="0"
                                />
                            </div>
                            <FieldError error={errors.budget} />
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Estimated total budget for the trip in Myanmar Kyat
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group/btn relative w-full bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                {loading ? (
                                    <ButtonSpinner text="Creating Trip..." />
                                ) : (
                                    <>
                                        <span className="relative z-10">Next: Add Schedule</span>
                                        <svg className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Card - Enhanced */}
                <div className="mt-8">
                    <InfoBox
                        title="How to set locations:"
                        items={[
                            "Type in the search box and select from suggestions",
                            "Or click \"Show Map\" and click directly on the map",
                            "You can drag the marker to fine-tune the location",
                            "Both start and end locations are required"
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};
