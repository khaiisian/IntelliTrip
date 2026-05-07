import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getCategories } from "../../api/category.api.js";
import { getTripByCode } from "../../api/trip.api.js";
import { createPreference } from "../../api/tripPreference.api.js";
import { PageLoader, ButtonSpinner } from "../../components/LoadingSpinner.jsx";
import { ErrorMessage } from "../../components/ErrorMessage.jsx";
import { InfoBox } from "../../components/InfoBox.jsx";

export const TripPreferencePage = () => {
    const navigate = useNavigate();
    const { tripCode } = useParams();
    const { user } = useAuth();

    const [trip, setTrip] = useState(null);
    const [categories, setCategories] = useState([]);
    const [preferences, setPreferences] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!tripCode) {
                setError("No trip code provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log("Fetching trip with code:", tripCode);
                const tripRes = await getTripByCode(tripCode);
                const tripData = tripRes.data.data || tripRes.data;
                console.log("Trip fetched:", tripData);
                setTrip(tripData);

                const categoriesRes = await getCategories();
                console.log("Categories fetched:", categoriesRes.data);
                const categoriesData = categoriesRes.data.data || categoriesRes.data;
                setCategories(categoriesData);

                const initialPrefs = {};
                categoriesData.forEach(cat => {
                    initialPrefs[cat.category_id] = 0.5;
                });
                setPreferences(initialPrefs);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err?.response?.data?.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tripCode]);

    const handlePreferenceChange = (categoryId, value) => {
        setPreferences(prev => ({
            ...prev,
            [categoryId]: parseFloat(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!trip?.id) {
            setError("Trip information not available");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const results = [];
            for (const [categoryId, weight] of Object.entries(preferences)) {
                const payload = {
                    trip_id: trip.id,
                    category_id: parseInt(categoryId),
                    preference_weight: parseFloat(weight)
                };
                console.log("Saving preference:", payload);
                const res = await createPreference(payload);
                console.log("Saved:", res.data);
                results.push(res);
            }
            console.log("All preferences saved successfully:", results.map(r => r.data));
            navigate(`/home`);
        } catch (err) {
            console.error("Error saving preferences:", err);
            setError(err?.response?.data?.message || "Error saving preferences");
        } finally {
            setSaving(false);
        }
    };

    const getPreferenceColor = (value) => {
        if (value >= 0.7) return "text-[#1E3A8A]";
        if (value >= 0.4) return "text-[#06B6D4]";
        return "text-gray-500";
    };

    const getSliderBackground = (value) => {
        return `linear-gradient(90deg, #1E3A8A 0%, #06B6D4 ${value * 100}%, #e5e7eb ${value * 100}%)`;
    };

    if (loading) {
        return <PageLoader message="Loading trip details and categories..." tripCode={tripCode} />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header with decorative element */}
                <div className="relative mb-12 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#1E3A8A]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">Final Step</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        Your Travel Preferences
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Tell us what you love – we'll personalize every recommendation
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
                        <div className="w-20 h-0.5 bg-gradient-to-r from-[#1E3A8A] to-[#F59E0B] mx-2"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F59E0B] to-amber-500 text-white flex items-center justify-center font-bold shadow-lg relative">
                                3
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <span className="mt-2 text-xs font-semibold text-[#F59E0B]">Preferences</span>
                        </div>
                    </div>
                </div>

                {/* Trip Summary Card - Enhanced glass effect */}
                {trip && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8 transition-all hover:shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl blur-md opacity-50"></div>
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{trip.trip_name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-md">{trip.code}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span className="text-xs text-gray-500">Set your interests</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form Card with glass effect */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">What interests you?</h2>
                                <p className="text-blue-100 text-sm mt-0.5">Adjust each slider to tell us how much you like each category</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Categories List with Enhanced Sliders */}
                        <div className="space-y-7">
                            {categories.map((category) => (
                                <div key={category.category_id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-base font-semibold text-gray-700">
                                            {category.category_name}
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-sm font-bold ${getPreferenceColor(preferences[category.category_id])}`}>
                                                {(preferences[category.category_id] * 10).toFixed(1)}
                                            </span>
                                            <span className="text-xs text-gray-400">/10</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        {/* Slider Background with Gradient */}
                                        <div className="absolute inset-0 h-2 rounded-full"
                                             style={{
                                                 background: getSliderBackground(preferences[category.category_id]),
                                                 top: '50%',
                                                 transform: 'translateY(-50%)'
                                             }}
                                        />

                                        {/* Custom Slider */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={preferences[category.category_id] || 0.5}
                                            onChange={(e) => handlePreferenceChange(category.category_id, e.target.value)}
                                            className="w-full h-2 appearance-none bg-transparent rounded-full relative z-10
                                                [&::-webkit-slider-thumb]:appearance-none
                                                [&::-webkit-slider-thumb]:w-6
                                                [&::-webkit-slider-thumb]:h-6
                                                [&::-webkit-slider-thumb]:rounded-full
                                                [&::-webkit-slider-thumb]:bg-white
                                                [&::-webkit-slider-thumb]:border-2
                                                [&::-webkit-slider-thumb]:border-[#1E3A8A]
                                                [&::-webkit-slider-thumb]:shadow-lg
                                                [&::-webkit-slider-thumb]:cursor-pointer
                                                [&::-webkit-slider-thumb]:hover:scale-110
                                                [&::-webkit-slider-thumb]:transition-transform
                                                [&::-moz-range-thumb]:w-6
                                                [&::-moz-range-thumb]:h-6
                                                [&::-moz-range-thumb]:rounded-full
                                                [&::-moz-range-thumb]:bg-white
                                                [&::-moz-range-thumb]:border-2
                                                [&::-moz-range-thumb]:border-[#1E3A8A]
                                                [&::-moz-range-thumb]:shadow-lg
                                                [&::-moz-range-thumb]:cursor-pointer
                                                [&::-moz-range-thumb]:hover:scale-110
                                                [&::-moz-range-thumb]:transition-transform"
                                        />
                                    </div>

                                    {/* Quick Selection Buttons - Styled */}
                                    <div className="flex gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => handlePreferenceChange(category.category_id, 0)}
                                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            Not Interested
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreferenceChange(category.category_id, 0.5)}
                                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            Neutral
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreferenceChange(category.category_id, 1)}
                                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            Very Interested
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Card - Enhanced */}
                        <div className="bg-gradient-to-r from-[#1E3A8A]/5 to-[#06B6D4]/5 rounded-xl p-6 border border-[#1E3A8A]/10 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Your Preferences Summary</h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {categories.map((category) => (
                                    <div key={category.category_id} className="bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/50">
                                        <p className="text-xs text-gray-500 truncate">{category.category_name}</p>
                                        <p className={`text-lg font-bold ${getPreferenceColor(preferences[category.category_id])}`}>
                                            {(preferences[category.category_id] * 10).toFixed(1)}/10
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Card */}
                        <InfoBox
                            title="Why this matters:"
                            icon="tip"
                            items={[
                                "Higher scores = more recommendations in that category",
                                "Your preferences help us find the perfect attractions",
                                "You can always update these later from trip settings"
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
                                disabled={saving || categories.length === 0 || !trip}
                                className="group/next relative flex-1 bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/next:opacity-100 transition-opacity duration-300"></div>
                                {saving ? (
                                    <ButtonSpinner text="Saving Preferences..." />
                                ) : (
                                    <>
                                        <span className="relative z-10">Complete Setup</span>
                                        <svg className="w-5 h-5 relative z-10 group-hover/next:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};