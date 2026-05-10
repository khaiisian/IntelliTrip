import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseFullTrip } from "../api/trip.api.js";
import { ButtonSpinner } from "./LoadingSpinner.jsx";

export const AIAssistantModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [step, setStep] = useState("input");

    const handleParse = async () => {
        if (!userInput.trim()) return;

        setLoading(true);
        try {
            const res = await parseFullTrip(userInput);
            setParsedData(res.data.data);
            setStep("review");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to parse trip details");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setStep("input");
        setParsedData(null);
        setUserInput("");
        onClose();
    };

    const handleConfirm = () => {
        sessionStorage.setItem("aiTripData", JSON.stringify(parsedData));
        handleClose();
        navigate("/createTrip?ai=true");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#1E3A8A]">AI Trip Assistant</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        aria-label="Close AI assistant"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {step === "input" && (
                        <>
                            <p className="text-gray-600">
                                Describe your trip in natural language.
                                <span className="block text-sm italic text-gray-500 mt-2">
                                    "I want a 3-day trip to Bagan from May 10 to May 12, budget 1000000 Ks. I love temples, dislike crowds, prefer morning hours."
                                </span>
                            </p>
                            <textarea
                                rows="5"
                                className="w-full border border-gray-200 rounded-xl p-3 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none resize-none"
                                placeholder="Type your trip description here..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={handleParse}
                                disabled={loading || !userInput.trim()}
                                className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <ButtonSpinner text="Parsing..." /> : "Generate my trip plan"}
                            </button>
                        </>
                    )}

                    {step === "review" && parsedData && (
                        <>
                            <h3 className="font-bold text-lg text-gray-800">Review your trip details</h3>
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                                <p><strong>Trip name:</strong> {parsedData.trip?.trip_name || "-"}</p>
                                <p><strong>Dates:</strong> {parsedData.trip?.start_date || "?"} to {parsedData.trip?.end_date || "?"}</p>
                                <p><strong>Budget:</strong> {parsedData.trip?.budget ? `${Number(parsedData.trip.budget).toLocaleString()} Ks` : "-"}</p>
                                <p><strong>Start location:</strong> {parsedData.trip?.start_location_name || "- (you will pick it later)"}</p>
                                <p><strong>End location:</strong> {parsedData.trip?.end_location_name || "- (you will pick it later)"}</p>
                                <p><strong>Schedule:</strong> {parsedData.schedule?.day_start_time || "09:00"} to {parsedData.schedule?.day_end_time || "17:00"}</p>
                                <p><strong>Travel pace:</strong> {parsedData.preferences?.travel_pace || "moderate"}</p>
                                <p><strong>Budget style:</strong> {parsedData.preferences?.budget_style || "mid-range"}</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep("input")}
                                    className="flex-1 border border-gray-300 py-2 rounded-xl hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="flex-1 bg-gradient-to-r from-[#F59E0B] to-amber-500 text-white font-semibold py-2 rounded-xl hover:shadow-lg"
                                >
                                    Use these details
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
