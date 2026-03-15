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

    // Fetch trip details and categories
    useEffect(() => {
        const fetchData = async () => {
            if (!tripCode) {
                setError("No trip code provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch trip details first
                console.log("Fetching trip with code:", tripCode);
                const tripRes = await getTripByCode(tripCode);
                const tripData = tripRes.data.data || tripRes.data;
                console.log("Trip fetched:", tripData);
                setTrip(tripData);

                // Then fetch categories
                const categoriesRes = await getCategories();
                console.log("Categories fetched:", categoriesRes.data);

                const categoriesData = categoriesRes.data.data || categoriesRes.data;
                setCategories(categoriesData);

                // Initialize preferences with default value 0.5 for each category
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

    // Handle slider change
    const handlePreferenceChange = (categoryId, value) => {
        setPreferences(prev => ({
            ...prev,
            [categoryId]: parseFloat(value)
        }));
    };

    // Handle form submission
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

                const res = await createPreference(payload); // wait for insert
                console.log("Saved:", res.data);

                results.push(res);
            }

            console.log(
                "All preferences saved successfully:",
                results.map(r => r.data)
            );

            navigate(`/home`);

        } catch (err) {
            console.error("Error saving preferences:", err);
            setError(err?.response?.data?.message || "Error saving preferences");
        } finally {
            setSaving(false);
        }
    };

    // Get color based on preference value
    const getPreferenceColor = (value) => {
        if (value >= 0.7) return "text-[#1E3A8A]";
        if (value >= 0.4) return "text-[#06B6D4]";
        return "text-gray-500";
    };

    // Get background gradient based on preference value
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Trip Preferences</h1>
                    <p className="text-lg text-gray-600">Select your interests to personalize your trip recommendations</p>
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
                            <span className="ml-3 text-sm font-medium text-gray-500">Daily Schedule</span>
                        </div>
                        <div className="w-16 h-0.5 bg-[#1E3A8A]"></div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold shadow-lg">
                                3
                            </div>
                            <span className="ml-3 font-semibold text-[#1E3A8A]">Select Preferences</span>
                        </div>
                    </div>
                </div>

                {/* Trip Summary Card - Show trip details if available */}
                {trip && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{trip.trip_name}</h2>
                                <p className="text-sm text-gray-500">
                                    Setting preferences for your trip
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">Your Interests</h2>
                        <p className="text-blue-100 mt-1">Adjust the sliders to set your preference level for each category</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Categories List */}
                        <div className="space-y-6">
                            {categories.map((category) => (
                                <div key={category.category_id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-base font-semibold text-gray-700">
                                            {category.category_name}
                                        </label>
                                        <div className="flex items-center gap-2">
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
                                                [&::-moz-range-thumb]:cursor-pointer"
                                        />
                                    </div>

                                    {/* Quick Selection Buttons */}
                                    <div className="flex gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => handlePreferenceChange(category.category_id, 0)}
                                            className="px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            Not Interested
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreferenceChange(category.category_id, 0.5)}
                                            className="px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            Neutral
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePreferenceChange(category.category_id, 1)}
                                            className="px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            Very Interested
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-[#1E3A8A]/5 to-[#06B6D4]/5 rounded-xl p-6 border border-[#1E3A8A]/10">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Your Preferences Summary
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {categories.map((category) => (
                                    <div key={category.category_id} className="bg-white rounded-lg p-3 shadow-sm">
                                        <p className="text-xs text-gray-500">{category.category_name}</p>
                                        <p className={`text-lg font-bold ${getPreferenceColor(preferences[category.category_id])}`}>
                                            {(preferences[category.category_id] * 10).toFixed(1)}/10
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Card */}
                        <InfoBox
                            title="About Preferences:"
                            icon="tip"
                            items={[
                                "Higher values mean you're more interested in that category",
                                "Preferences help us recommend the best attractions for you",
                                "You can always adjust these later in your trip settings"
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
                                disabled={saving || categories.length === 0 || !trip}
                                className="flex-1 bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                            >
                                {saving ? (
                                    <ButtonSpinner text="Saving Preferences..." />
                                ) : (
                                    <>
                                        Complete Trip Setup
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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