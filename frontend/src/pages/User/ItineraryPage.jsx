import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { generateItinerary, saveItinerary } from '../../api/itinerary.api';
import { getRouteGeometry } from '../../api/route.api';

const createNumberedIcon = (number) => {
    return L.divIcon({
        className: 'custom-number-icon',
        html: `
            <div style="
                background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
                color: white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                backdrop-filter: blur(2px);
            ">
                ${number}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

const GroupedPopup = ({ attractions }) => {
    return (
        <div className="p-3 max-w-xs rounded-xl bg-white/95 backdrop-blur-sm shadow-xl">
            <div className="font-bold mb-2 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
                📍 {attractions.length} attraction{attractions.length > 1 ? 's' : ''} at this location
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scroll">
                {attractions.map((att, idx) => (
                    <div key={idx} className="border-t border-gray-100 pt-2 text-xs first:border-t-0 first:pt-0">
                        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-bold">
                                {att.originalIndex + 1}
                            </span>
                            {att.attraction_name}
                        </div>
                        <div className="text-gray-500 ml-6 mt-0.5">
                            {att.visit_start_time} – {att.visit_end_time}
                            {att.duration_minutes && ` (${att.duration_minutes} min)`}
                        </div>
                        {att.final_score > 0 && (
                            <div className="text-gray-500 ml-6 mt-0.5">
                                Score: {att.final_score.toFixed(2)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const createStartIcon = () => {
    return L.divIcon({
        className: 'custom-start-icon',
        html: `
            <div style="
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ">
                S
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const createEndIcon = () => {
    return L.divIcon({
        className: 'custom-end-icon',
        html: `
            <div style="
                background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                color: white;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ">
                E
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component for stat cards
const StatCard = ({ label, value, icon, gradient = 'from-[#1E3A8A] to-[#2563EB]' }) => (
    <div className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-[#1E3A8A]/20 hover:-translate-y-1">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                </svg>
            </div>
        </div>
        <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#1E3A8A]/20 to-transparent transition-all duration-300 rounded-full"></div>
    </div>
);

// Helper component for day tabs
const DayTab = ({ day, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            isActive
                ? 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-lg shadow-[#1E3A8A]/20'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white border border-gray-200'
        }`}
    >
        Day {day}
        {isActive && (
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/60"></span>
        )}
    </button>
);

export const TripItineraryPage = () => {
    const { tripCode } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [itineraryData, setItineraryData] = useState(null);
    const [selectedDay, setSelectedDay] = useState('1');
    const [routeGeometry, setRouteGeometry] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    // 1. Fetch the generated itinerary
    useEffect(() => {
        const fetchItinerary = async () => {
            try {
                setLoading(true);
                const res = await generateItinerary(tripCode);
                setItineraryData(res.data.data);
            } catch (err) {
                console.error('Error fetching itinerary:', err);
                setError(err?.response?.data?.message || 'Failed to generate itinerary');
            } finally {
                setLoading(false);
            }
        };
        fetchItinerary();
    }, [tripCode]);

    useEffect(() => {
        if (!itineraryData) {
            setRouteGeometry([]);
            return;
        }

        const currentDayAttractions = itineraryData.byDay?.[selectedDay] || [];
        const startLat = parseFloat(itineraryData.trip?.start_lat);
        const startLng = parseFloat(itineraryData.trip?.start_lng);
        const endLat = parseFloat(itineraryData.trip?.end_lat);
        const endLng = parseFloat(itineraryData.trip?.end_lng);

        const hasValidStart = !isNaN(startLat) && !isNaN(startLng);
        const hasValidEnd = !isNaN(endLat) && !isNaN(endLng);

        const polylinePositions = currentDayAttractions
            .filter(att => {
                const lat = parseFloat(att.latitude);
                const lng = parseFloat(att.longitude);
                return !isNaN(lat) && !isNaN(lng);
            })
            .map(att => [parseFloat(att.latitude), parseFloat(att.longitude)]);

        let fullPolylinePositions = [];
        if (hasValidStart) {
            fullPolylinePositions.push([startLat, startLng]);
        }
        fullPolylinePositions.push(...polylinePositions);

        if (hasValidEnd) {
            const lastAttraction = polylinePositions.length > 0
                ? polylinePositions[polylinePositions.length - 1]
                : null;
            const isEndSameAsLast = lastAttraction &&
                Math.abs(lastAttraction[0] - endLat) < 0.000001 &&
                Math.abs(lastAttraction[1] - endLng) < 0.000001;
            if (!isEndSameAsLast) {
                fullPolylinePositions.push([endLat, endLng]);
            }
        }

        const uniquePolyline = [];
        for (let i = 0; i < fullPolylinePositions.length; i++) {
            if (i === 0) {
                uniquePolyline.push(fullPolylinePositions[i]);
            } else {
                const prev = fullPolylinePositions[i - 1];
                const curr = fullPolylinePositions[i];
                if (prev[0] !== curr[0] || prev[1] !== curr[1]) {
                    uniquePolyline.push(curr);
                }
            }
        }

        const fetchRoute = async () => {
            if (uniquePolyline.length < 2) {
                setRouteGeometry([]);
                return;
            }

            const coords = uniquePolyline.map(p => [p[1], p[0]]);
            const result = await getRouteGeometry(coords);
            setRouteGeometry(result || []);
        };

        fetchRoute();
    }, [selectedDay, itineraryData]);

    // Helper functions
    const getDuration = (start, end) => {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    };

    const handleSaveItinerary = async () => {
        if (!itineraryData) return;

        setSaving(true);
        setSaveError('');
        setSaveSuccess('');

        try {
            const itinerary = Object.keys(itineraryData.byDay).flatMap((day) => {
                const dayNumber = Number(day);
                return itineraryData.byDay[day].map((att) => ({
                    day_number: dayNumber,
                    attraction_id: att.attraction_id ?? att.id ?? null,
                    visit_start_time: att.visit_start_time ?? '',
                    visit_end_time: att.visit_end_time ?? '',
                    distance_from_previous: Number(att.distance_from_previous) || 0,
                    final_score: Number(att.final_score) || 0,
                    cost: Number(att.cost) || 0,
                }));
            });

            if (itinerary.length === 0) {
                setSaveError('No itinerary items available to save.');
                return;
            }

            const payload = {
                itinerary,
                total_cost: Number(itineraryData.summary?.totalCost) || 0,
            };

            await saveItinerary(tripCode, payload);
            setSaveSuccess('Itinerary saved successfully.');
        } catch (err) {
            console.error('Error saving itinerary:', err);
            setSaveError(err?.response?.data?.message || 'Failed to save itinerary');
        } finally {
            setSaving(false);
        }
    };

    const formatDistance = (dist) => {
        if (dist === undefined || dist === null) return '-';
        return `${dist.toFixed(2)} km`;
    };

    const formatScore = (score) => score?.toFixed(2) ?? '0.00';

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
                        <p className="text-gray-600 font-medium">Crafting your perfect itinerary...</p>
                        <p className="text-xs text-gray-400 mt-2">Optimizing routes and schedules</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !itineraryData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-500 mb-6">{error || 'No itinerary data available'}</p>
                    <button
                        onClick={() => navigate(`/trip/${tripCode}`)}
                        className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                        Back to Trip
                    </button>
                </div>
            </div>
        );
    }

    const { trip, summary, byDay } = itineraryData;
    const days = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));
    const currentDayAttractions = byDay[selectedDay] || [];

    const startLat = parseFloat(trip.start_lat);
    const startLng = parseFloat(trip.start_lng);
    const endLat = parseFloat(trip.end_lat);
    const endLng = parseFloat(trip.end_lng);

    const hasValidStart = !isNaN(startLat) && !isNaN(startLng);
    const hasValidEnd = !isNaN(endLat) && !isNaN(endLng);

    // Group attractions by coordinates (rounded to 6 decimals)
    const coordGroups = new Map();

    currentDayAttractions.forEach((att, idx) => {
        const lat = parseFloat(att.latitude);
        const lng = parseFloat(att.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        if (!coordGroups.has(key)) {
            coordGroups.set(key, { lat, lng, attractions: [] });
        }
        coordGroups.get(key).attractions.push({ ...att, originalIndex: idx });
    });

    // Build markers: one per coordinate group
    const groupedMarkers = Array.from(coordGroups.values()).map(group => ({
        lat: group.lat,
        lng: group.lng,
        attractions: group.attractions,
    }));

    // For polyline: use original sequence (keep all original points, even duplicates)
    const polylinePositions = currentDayAttractions
        .filter(att => {
            const lat = parseFloat(att.latitude);
            const lng = parseFloat(att.longitude);
            return !isNaN(lat) && !isNaN(lng);
        })
        .map(att => [parseFloat(att.latitude), parseFloat(att.longitude)]);

    // -------- Build full polyline including start and end points --------
    let fullPolylinePositions = [];

    // Add start point if valid
    if (hasValidStart) {
        fullPolylinePositions.push([startLat, startLng]);
    }

    // Add all attraction points
    fullPolylinePositions.push(...polylinePositions);

    // Add end point if valid and not already the same as the last attraction
    if (hasValidEnd) {
        const lastAttraction = polylinePositions.length > 0
            ? polylinePositions[polylinePositions.length - 1]
            : null;
        const isEndSameAsLast = lastAttraction &&
            Math.abs(lastAttraction[0] - endLat) < 0.000001 &&
            Math.abs(lastAttraction[1] - endLng) < 0.000001;
        if (!isEndSameAsLast) {
            fullPolylinePositions.push([endLat, endLng]);
        }
    }

    // Remove consecutive duplicate points
    const uniquePolyline = [];
    for (let i = 0; i < fullPolylinePositions.length; i++) {
        if (i === 0) {
            uniquePolyline.push(fullPolylinePositions[i]);
        } else {
            const prev = fullPolylinePositions[i - 1];
            const curr = fullPolylinePositions[i];
            if (prev[0] !== curr[0] || prev[1] !== curr[1]) {
                uniquePolyline.push(curr);
            }
        }
    }
    // --------------------------------------------------------------

    const mapCenter = groupedMarkers.length > 0
        ? [groupedMarkers[0].lat, groupedMarkers[0].lng]
        : hasValidStart
        ? [startLat, startLng]
        : [21.1702, 94.8679];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with decorative elements */}
                <div className="relative mb-12 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1E3A8A]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">AI-Powered Journey</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        Your Personalized Itinerary
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Optimized daily schedule based on your preferences and travel style
                    </p>
                </div>

                {/* Trip Summary Card - Enhanced */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                                <h2 className="text-2xl font-bold text-gray-800">{trip.trip_name}</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-md text-xs">{trip.trip_code}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-green-50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-xs font-medium text-green-700">{days.length} Days</span>
                            </div>
                            <div className="bg-blue-50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <span className="text-xs font-medium text-blue-700">{summary.totalAttractions} Attractions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats - Enhanced Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
                    <StatCard 
                        label="Attractions" 
                        value={summary.totalAttractions} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />}
                        gradient="from-[#1E3A8A] to-[#2563EB]"
                    />
                    <StatCard 
                        label="Total Cost" 
                        value={`${summary.totalCost} Ks`} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        gradient="from-[#10B981] to-[#059669]"
                    />
                    <StatCard 
                        label="Total Distance" 
                        value={summary.totalDistance} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />}
                        gradient="from-[#F59E0B] to-[#D97706]"
                    />
                    <StatCard 
                        label="Travel Time" 
                        value={summary.totalTravelTime} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                        gradient="from-[#06B6D4] to-[#0891B2]"
                    />
                    <StatCard 
                        label="Visit Time" 
                        value={summary.totalVisitTime} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        gradient="from-[#8B5CF6] to-[#6D28D9]"
                    />
                </div>

                {/* Day Tabs + Actions */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
                        {days.map(day => (
                            <DayTab 
                                key={day} 
                                day={day} 
                                isActive={selectedDay === day} 
                                onClick={() => setSelectedDay(day)} 
                            />
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Save button removed from here */}
                    </div>
                </div>

                {/* Map + List Grid - Enhanced */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[500px] flex flex-col group">
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-5 py-3.5 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Day {selectedDay} Route Map
                            </h3>
                            <div className="text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded-full">
                                {groupedMarkers.length} locations
                            </div>
                        </div>
                        <div className="flex-1 relative bg-gray-50">
                            {groupedMarkers.length > 0 || hasValidStart || hasValidEnd ? (
                                <MapContainer
                                    center={mapCenter}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    className="z-0"
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />

                                    {/* Start location marker */}
                                    {hasValidStart && (
                                        <Marker position={[startLat, startLng]} icon={createStartIcon()}>
                                            <Popup>
                                                <div className="font-medium text-sm text-emerald-700">🚩 Trip Start</div>
                                                <div className="text-xs text-gray-500">{trip.trip_name} begins here</div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* End location marker */}
                                    {hasValidEnd && (
                                        <Marker position={[endLat, endLng]} icon={createEndIcon()}>
                                            <Popup>
                                                <div className="font-medium text-sm text-red-700">🏁 Trip End</div>
                                                <div className="text-xs text-gray-500">Final destination</div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* Attraction markers (grouped) */}
                                    {groupedMarkers.map((marker, idx) => (
                                        <Marker
                                            key={idx}
                                            position={[marker.lat, marker.lng]}
                                            icon={createNumberedIcon(
                                                marker.attractions.length > 1
                                                    ? `${marker.attractions.length}x`
                                                    : marker.attractions[0].originalIndex + 1
                                            )}
                                        >
                                            <Popup>
                                                <GroupedPopup attractions={marker.attractions} />
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Polyline for the complete route */}
                                    {routeGeometry.length > 1 && (
                                        <Polyline
                                            positions={routeGeometry}
                                            color="#F59E0B"
                                            weight={4}
                                            opacity={0.8}
                                            dashArray="8, 8"
                                        />
                                    )}
                                </MapContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <p className="text-sm">No coordinates available for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* List Section (Cards) - Enhanced */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[500px] flex flex-col">
                        <div className="bg-gradient-to-r from-[#06B6D4] to-[#1E3A8A] px-5 py-3.5 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Day {selectedDay} Itinerary
                            </h3>
                            <div className="text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded-full">
                                {currentDayAttractions.length} stops
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scroll">
                            <div className="space-y-3">
                                {currentDayAttractions.map((att, idx) => {
                                    const duration = getDuration(att.visit_start_time, att.visit_end_time);
                                    return (
                                        <div 
                                            key={idx} 
                                            className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-[#1E3A8A]/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E3A8A] to-[#2563EB] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    <h4 className="font-bold text-gray-800 group-hover:text-[#1E3A8A] transition-colors">
                                                        {att.attraction_name}
                                                    </h4>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                                    att.final_score >= 1 ? 'bg-green-100 text-green-700' :
                                                        att.final_score >= 0.7 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    Score: {formatScore(att.final_score)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <svg className="w-4 h-4 text-[#1E3A8A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-xs">{att.visit_start_time} – {att.visit_end_time}</span>
                                                    <span className="text-xs text-gray-400">({duration} min)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <svg className="w-4 h-4 text-[#1E3A8A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                    <span className="text-xs">{formatDistance(att.distance_from_previous)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <svg className="w-4 h-4 text-[#1E3A8A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <span className="text-xs">Travel: {att.travel_minutes} min</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {att.is_best_time && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Best Time
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons at bottom – Save Itinerary + Back to Trip Details */}
                <div className="mt-10 flex justify-end gap-4">
                    <button
                        onClick={handleSaveItinerary}
                        disabled={saving}
                        className="relative group px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Save Itinerary
                                </>
                            )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    <button
                        onClick={() => navigate(`/tripDetail/${tripCode}`)}
                        className="group relative px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="relative z-10">Back to Trip Details</span>
                    </button>
                </div>

                {/* Success/Error messages – placed below buttons for clarity */}
                <div className="mt-4 flex justify-end">
                    {saveSuccess && (
                        <span className="text-sm font-medium text-green-700 bg-green-100/80 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {saveSuccess}
                        </span>
                    )}
                    {saveError && (
                        <span className="text-sm font-medium text-red-700 bg-red-100/80 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {saveError}
                        </span>
                    )}
                </div>
            </div>

            {/* Add custom scrollbar styles */}
            <style jsx>{`
                .custom-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #1E3A8A;
                    border-radius: 4px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #2563EB;
                }
            `}</style>
        </div>
    );
};