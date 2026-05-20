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

    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("18:00");
    const [dailyHours, setDailyHours] = useState(10);
    const [timeError, setTimeError] = useState("");

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

    useEffect(() => {
        const aiScheduleRaw = sessionStorage.getItem("aiSchedule");
        if (!aiScheduleRaw) return;

        try {
            const aiSchedule = JSON.parse(aiScheduleRaw);
            if (aiSchedule.day_start_time) setStartTime(aiSchedule.day_start_time);
            if (aiSchedule.day_end_time) setEndTime(aiSchedule.day_end_time);
            sessionStorage.removeItem("aiSchedule");
        } catch (err) {
            console.error("Failed to parse AI schedule data", err);
        }
    }, []);

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
            const payload = {
                trip_id: trip.id,
                day_start_time: startTime,
                day_end_time: endTime
            };

            console.log("Creating schedule with payload:", payload);
            const res = await createSchedule(payload);
            console.log("Schedule created:", res.data);

            navigate(`/tripPreference/${tripCode}`);
        } catch (err) {
            console.error("Error saving schedule:", err);
            setError(err?.response?.data?.message || "Error saving schedule");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageLoader message="Loading trip details..." tripCode={tripCode} />;
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={() => window.location.reload()}
                actions={
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                        <button
                            onClick={() => navigate("/tripLists")}
                            className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            Back to Trips
                        </button>
                    </div>
                }
            />
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
                    <p className="text-gray-500 mb-6">No trip found with code: {tripCode}</p>
                    <button
                        onClick={() => navigate("/createTrip")}
                        className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        Create New Trip
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header with decorative element */}
                <div className="relative mb-12 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#1E3A8A]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">Step 2 of 3</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        Set Your Daily Schedule
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Define your travel hours for each day of the trip
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
                        <div className="w-20 h-0.5 bg-gradient-to-r from-[#1E3A8A] to-[#1E3A8A] mx-2"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white flex items-center justify-center font-bold shadow-lg relative">
                                2
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="mt-2 text-xs font-semibold text-[#1E3A8A]">Daily Schedule</span>
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

                {/* Trip Summary Card - Enhanced glass effect */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8 transition-all hover:shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl blur-md opacity-50"></div>
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{trip.trip_name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-md">{trip.code}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span className="text-xs text-gray-500">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#06B6D4]/10 rounded-full px-3 py-1.5 text-xs font-medium text-[#06B6D4] self-start sm:self-center">
                            {Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1} days
                        </div>
                    </div>
                </div>

                {/* Main Form Card with glass effect */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="relative bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Daily Schedule Settings</h2>
                                <p className="text-blue-100 text-sm mt-0.5">Configure your daily travel hours</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Time Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            timeError ? 'border-red-500' : 'border-gray-200'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none bg-white/50 focus:bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

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
                                            timeError ? 'border-red-500' : 'border-gray-200'
                                        } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none bg-white/50 focus:bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Hours Calculator - Enhanced */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center shadow-md">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Daily available time</p>
                                        <p className={`text-4xl font-bold ${dailyHours > 0 ? 'text-[#1E3A8A]' : 'text-red-500'}`}>
                                            {dailyHours.toFixed(1)} <span className="text-base font-normal text-gray-500">hours</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">You will travel</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {Math.floor(dailyHours)}h {Math.round((dailyHours % 1) * 60)}m <span className="text-sm font-normal text-gray-500">per day</span>
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#06B6D4] to-[#1E3A8A] rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${Math.min((dailyHours / 24) * 100, 100)}%` }}
                                ></div>
                            </div>

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
                                className="group/back flex-1 px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5 group-hover/back:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !!timeError || !trip}
                                className="group/next relative flex-1 bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/next:opacity-100 transition-opacity duration-300"></div>
                                {saving ? (
                                    <ButtonSpinner text="Saving..." />
                                ) : (
                                    <>
                                        <span className="relative z-10">Next: Select Preferences</span>
                                        <svg className="w-5 h-5 relative z-10 group-hover/next:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Card - Enhanced */}
                <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Day 1 Schedule Preview</h3>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-gray-500">Daily Schedule:</span>
                        <span className="font-mono font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{startTime} — {endTime}</span>
                        <span className="text-[#1E3A8A] font-semibold bg-[#1E3A8A]/5 px-3 py-1 rounded-full">{dailyHours.toFixed(1)} hrs available</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
