import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { generateItinerary } from '../../api/itinerary.api';

const createNumberedIcon = (number) => {
    return L.divIcon({
        className: 'custom-number-icon',
        html: `
            <div style="
                background-color: #1E3A8A;
                color: white;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 0 4px rgba(0,0,0,0.3);
            ">
                ${number}
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};

const GroupedPopup = ({ attractions }) => {
    return (
        <div className="p-2 max-w-xs">
            <div className="font-bold mb-2 text-sm">
                📍 {attractions.length} attraction{attractions.length > 1 ? 's' : ''} at this location
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {attractions.map((att, idx) => (
                    <div key={idx} className="border-t pt-1 text-xs first:border-t-0 first:pt-0">
                        <div className="font-semibold">
                            <span className="inline-block w-5 text-[#1E3A8A] font-bold">
                                {att.originalIndex + 1}.
                            </span>
                            {att.attraction_name}
                        </div>
                        <div className="text-gray-600 ml-5">
                            {att.visit_start_time} – {att.visit_end_time}
                            {att.duration_minutes && ` (${att.duration_minutes} min)`}
                        </div>
                        {att.final_score > 0 && (
                            <div className="text-gray-500 ml-5">
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
                background-color: #10B981;
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
                box-shadow: 0 0 4px rgba(0,0,0,0.3);
            ">
                S
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

const createEndIcon = () => {
    return L.divIcon({
        className: 'custom-end-icon',
        html: `
            <div style="
                background-color: #EF4444;
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
                box-shadow: 0 0 4px rgba(0,0,0,0.3);
            ">
                E
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const TripItineraryPage = () => {
    const { tripCode } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [itineraryData, setItineraryData] = useState(null);
    const [selectedDay, setSelectedDay] = useState('1');

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

    // Helper functions
    const getDuration = (start, end) => {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    };

    const formatDistance = (dist) => {
        if (dist === undefined || dist === null) return '-';
        return `${dist.toFixed(2)} km`;
    };

    const formatScore = (score) => score?.toFixed(2) ?? '0.00';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-[#1E3A8A] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Crafting your perfect itinerary...</p>
                </div>
            </div>
        );
    }

    if (error || !itineraryData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || 'No itinerary data available'}</p>
                    <button
                        onClick={() => navigate(`/trip/${tripCode}`)}
                        className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#2563EB] transition-colors"
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

    console.log('Day', selectedDay, 'itinerary attractions:', currentDayAttractions.map(att => ({
        name: att.attraction_name,
        attraction_code: att.attraction_code,
        latitude: att.latitude,
        longitude: att.longitude,
        validCoords: !isNaN(parseFloat(att.latitude)) && !isNaN(parseFloat(att.longitude)),
    })));

    const mapCenter = groupedMarkers.length > 0
        ? [groupedMarkers[0].lat, groupedMarkers[0].lng]
        : hasValidStart
        ? [startLat, startLng]
        : [21.1702, 94.8679];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Personalized Itinerary</h1>
                    <p className="text-lg text-gray-600">Optimized daily schedule based on your preferences</p>
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
                                    Code: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{trip.trip_code}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Attractions</p>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{summary.totalAttractions}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Cost</p>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{summary.totalCost} Ks</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Distance</p>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{summary.totalDistance}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Travel Time</p>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{summary.totalTravelTime}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Visit Time</p>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{summary.totalVisitTime}</p>
                    </div>
                </div>

                {/* Day Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                                selectedDay === day
                                    ? 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            Day {day}
                        </button>
                    ))}
                </div>

                {/* Map + List Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[500px]">
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 py-3">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Day {selectedDay} Route Map
                            </h3>
                        </div>
                        <div className="h-full p-2">
                            {groupedMarkers.length > 0 || hasValidStart || hasValidEnd ? (
                                <MapContainer
                                    center={mapCenter}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    className="rounded-lg"
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />

                                    {/* Start location marker */}
                                    {hasValidStart && (
                                        <Marker position={[startLat, startLng]} icon={createStartIcon()}>
                                            <Popup>
                                                <strong>🚩 Trip Start</strong><br />
                                                {trip.trip_name} begins here
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* End location marker */}
                                    {hasValidEnd && (
                                        <Marker position={[endLat, endLng]} icon={createEndIcon()}>
                                            <Popup>
                                                <strong>🏁 Trip End</strong><br />
                                                Final destination
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

                                    {/* Polyline for the complete route (start → attractions → end) */}
                                    {uniquePolyline.length > 1 && (
                                        <Polyline
                                            positions={uniquePolyline}
                                            color="#F59E0B"
                                            weight={4}
                                            opacity={0.7}
                                        />
                                    )}
                                </MapContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No coordinates available for this day.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* List Section (Cards) */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[500px] flex flex-col">
                        <div className="bg-gradient-to-r from-[#06B6D4] to-[#1E3A8A] px-6 py-3">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Day {selectedDay} Itinerary
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {currentDayAttractions.map((att, idx) => {
                                    const duration = getDuration(att.visit_start_time, att.visit_end_time);
                                    return (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-gray-800">{att.attraction_name}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    att.final_score >= 1 ? 'bg-green-100 text-green-800' :
                                                        att.final_score >= 0.7 ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                          Score: {formatScore(att.final_score)}
                        </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {att.visit_start_time} – {att.visit_end_time} ({duration} min)
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                    {formatDistance(att.distance_from_previous)}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Travel: {att.travel_minutes} min
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {att.is_best_time && (
                                                        <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold">
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

                {/* Back Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => navigate(`/tripDetail/${tripCode}`)}
                        className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold rounded-xl hover:from-[#2563EB] hover:to-[#1E3A8A] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Trip Details
                    </button>
                </div>
            </div>
        </div>
    );
};