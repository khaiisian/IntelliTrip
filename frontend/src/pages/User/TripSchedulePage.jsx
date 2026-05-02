import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getTripByCode } from "../../api/trip.api.js";
import { createSchedule } from "../../api/tripSchedule.api.js";
import { PageLoader, ButtonSpinner } from "../../components/LoadingSpinner.jsx";
import { ErrorMessage, FormErrorMessage } from "../../components/ErrorMessage.jsx";
import { InfoBox } from "../../components/InfoBox.jsx";

export const TripSchedulePage = () => {
    const navigate = useNavigate();
    const { tripCode } = useParams();
    const { user } = useAuth();

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Schedule state
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("18:00");
    const [dailyHours, setDailyHours] = useState(10);
    const [timeError, setTimeError] = useState("");

    // Fetch trip details using tripCode
    useEffect(() => {
        const fetchTrip = async () => {
            if (!tripCode) {
                setLoading(false);
                setError("No trip code provided");
                return;
            }

            try {
                setLoading(true);
                setError("");
                console.log("Fetching trip with code:", tripCode);

                const res = await getTripByCode(tripCode);
                console.log("Trip Fetched.");
                console.log(res.data.data);

                setTrip(res.data.data);
            } catch (err) {
                console.error("Error fetching trip:", err);
                setError(err?.response?.data?.message || "Failed to load trip details");
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [tripCode]);

    // Calculate daily hours whenever start or end time changes
    useEffect(() => {
        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}:00`);
            const end = new Date(`2000-01-01T${endTime}:00`);

            if (start >= end) {
                setTimeError("End time must be after start time");
                setDailyHours(0);
            } else {
                const diffMs = end - start;
                const diffHours = diffMs / (1000 * 60 * 60);
                setDailyHours(diffHours);
                setTimeError("");
            }
        }
    }, [startTime, endTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (dailyHours <= 0) {
            setTimeError("Please set valid start and end times");
            return;
        }

        if (!trip?.id) {
            setError("Trip information not available");
            return;
        }

        setSaving(true);
        setError("");

        try {
            // Prepare payload for createSchedule API with correct backend model
            const payload = {
                trip_id: trip.id,
                day_start_time: startTime,  // Changed from start_time to day_start_time
                day_end_time: endTime        // Changed from end_time to day_end_time
            };

            console.log("Creating schedule with payload:", payload);
            const res = await createSchedule(payload);
            console.log("Schedule created:", res.data);

            // Navigate to next step (e.g., add attractions to schedule)
            // navigate(`/trip/${tripCode}/add-attractions`);
            navigate(`/tripPreference/${tripCode}`);

        } catch (err) {
            console.error("Error saving schedule:", err);
            setError(err?.response?.data?.message || "Error saving schedule");
        } finally {
            setSaving(false);
        }
    };

    // Show loading state
    if (loading) {
        return <PageLoader message="Loading trip details..." tripCode={tripCode} />;
    }

    // Show error state
    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={() => window.location.reload()}
                actions={
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                        <button
                            onClick={() => navigate("/trips")}
                            className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#2563EB] transition-colors"
                        >
                            Back to Trips
                        </button>
                    </div>
                }
            />
        );
    }

    // Show if no trip found
    if (!trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
                    <p className="text-gray-600 mb-6">No trip found with code: {tripCode}</p>
                    <button
                        onClick={() => navigate("/create-trip")}
                        className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#2563EB] transition-colors"
                    >
                        Create New Trip
                    </button>
                </div>
            </div>
        );
    }

    // Format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Set Your Daily Schedule</h1>
                    <p className="text-lg text-gray-600">Define your travel hours for each day of the trip</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex justify-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold shadow-lg">
                                1
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-500">Trip Details</span>
                        </div>
                        <div className="w-16 h-0.5 bg-[#1E3A8A]"></div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold shadow-lg">
                                2
                            </div>
                            <span className="ml-3 font-semibold text-[#1E3A8A]">Daily Schedule</span>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300"></div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                                3
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-500">Select Preferences</span>
                        </div>
                    </div>
                </div>

                {/* Trip Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{trip.trip_name}</h2>
                                <p className="text-sm text-gray-500">
                                    Trip Name: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{trip.name}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-sm text-gray-600">
                                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">Daily Schedule Settings</h2>
                        <p className="text-blue-100 mt-1">Configure your daily travel hours</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Time Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Time */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Day Start Time <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            timeError ? 'border-red-500' : 'border-gray-300'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* End Time */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Day End Time <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            timeError ? 'border-red-500' : 'border-gray-300'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Hours Calculator */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#06B6D4] flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Daily available time:</p>
                                        <p className={`text-3xl font-bold ${dailyHours > 0 ? 'text-[#1E3A8A]' : 'text-red-500'}`}>
                                            {dailyHours.toFixed(1)} hours
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">You will travel</p>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {Math.floor(dailyHours)}h {Math.round((dailyHours % 1) * 60)}m per day
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#06B6D4] to-[#1E3A8A] transition-all duration-300"
                                    style={{ width: `${Math.min((dailyHours / 24) * 100, 100)}%` }}
                                ></div>
                            </div>

                            {/* Error Message */}
                            <FormErrorMessage message={timeError} />
                        </div>

                        {/* Info Card */}
                        <InfoBox
                            title="Schedule Tips:"
                            icon="tip"
                            items={[
                                "This sets the schedule for Day 1 of your trip",
                                "You can customize each day's schedule later",
                                "End time can be next day for overnight activities",
                                "Available hours will be used to plan attractions"
                            ]}
                        />

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !!timeError || !trip}
                                className="flex-1 bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <ButtonSpinner text="Saving..." />
                                ) : (
                                    <>
                                        Next: Select Preferences
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Card */}
                <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Day 1 Schedule Preview
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Daily Schedule:</span>
                        <span className="font-medium text-gray-800">{startTime} - {endTime}</span>
                        <span className="text-[#1E3A8A] font-semibold">{dailyHours.toFixed(1)} hrs available</span>
                    </div>
                </div>
            </div>
        </div>
    );
};