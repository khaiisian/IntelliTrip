import React, { useState } from "react";
import MapPicker from "../../../components/MapPicker.jsx";
import { createAttraction } from "../../../api/attraction.api.js";

export const CreateAttractionPage = () => {
    const [attractionName, setAttractionName] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [placeName, setPlaceName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [cost, setCost] = useState("");
    const [duration, setDuration] = useState("");
    const [openTime, setOpenTime] = useState("");
    const [closeTime, setCloseTime] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!attractionName || !lat || !lng) {
            alert("Please enter a name and select a location on the map!");
            return;
        }

        setLoading(true);
        const payload = {
            attraction_name: attractionName,
            latitude: Number(lat),
            longitude: Number(lng),
            category_id: Number(categoryId),
            cost: Number(cost),
            duration_minutes: Number(duration),
            open_time: openTime,
            close_time: closeTime
        };

        try {
            const res = await createAttraction(payload);
            console.log("Saved!", res.data);

            // Reset form on success
            setAttractionName("");
            setLat("");
            setLng("");
            setPlaceName("");
            setCategoryId("");
            setCost("");
            setDuration("");
            setOpenTime("");
            setCloseTime("");

            alert("Attraction created successfully");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Error saving attraction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Attraction</h1>
                    <p className="text-lg text-gray-600">Add a new attraction to your platform with location details and operating hours</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Section - 40% width */}
                    <div className="lg:w-2/5 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                            Attraction Details
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Attraction Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Attraction Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={attractionName}
                                    onChange={(e) => setAttractionName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none"
                                    placeholder="E.g., Eiffel Tower, Grand Canyon"
                                    required
                                />
                            </div>

                            {/* Category ID and Cost - Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Category ID
                                    </label>
                                    <input
                                        type="number"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none"
                                        placeholder="1, 2, 3..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Cost ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none"
                                    placeholder="120"
                                />
                            </div>

                            {/* Open/Close Time - Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Open Time
                                    </label>
                                    <input
                                        type="time"
                                        value={openTime}
                                        onChange={(e) => setOpenTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Close Time
                                    </label>
                                    <input
                                        type="time"
                                        value={closeTime}
                                        onChange={(e) => setCloseTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-200 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1E3A8A] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Attraction...
                                        </span>
                                    ) : (
                                        "Create Attraction"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Map Section - 60% width */}
                    <div className="lg:w-3/5 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                            Location Details
                        </h2>

                        <div className="space-y-4">
                            {/* Selected Location Info */}
                            {(lat || lng) && (
                                <div className="bg-gradient-to-r from-[#1E3A8A]/5 to-[#06B6D4]/5 p-4 rounded-xl border border-[#1E3A8A]/10">
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-gray-700 font-medium">Selected Location:</span>
                                    </div>
                                    <p className="mt-2 text-gray-600">
                                        {placeName || "Coordinates selected"}
                                    </p>
                                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                                        <span>Lat: {lat}</span>
                                        <span>Lng: {lng}</span>
                                    </div>
                                </div>
                            )}

                            {/* Map Container */}
                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                <MapPicker
                                    lat={lat}
                                    setLat={setLat}
                                    lng={lng}
                                    setLng={setLng}
                                    placeName={placeName}
                                    setPlaceName={setPlaceName}
                                />
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Click on the map to set the attraction location
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};