import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SearchControl from "./SearchControl.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationMarker = ({ setLat, setLng, setPlaceName }) => {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            setLat(lat);
            setLng(lng);

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                const data = await res.json();
                setPlaceName(data.display_name);
            } catch (err) {
                console.error("Reverse geocoding error:", err);
                setPlaceName("");
            }
        },
    });

    return position === null ? null : <Marker position={position} />;
};

export default function MapPicker({ lat, setLat, lng, setLng, placeName, setPlaceName }) {
    return (
        <div className="space-y-4">
            {/* Map Container with Custom Styling */}
            <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                <MapContainer
                    center={[21.1702, 94.8679]} // default center: Bagan
                    zoom={13}
                    style={{ height: "450px", width: "100%" }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <LocationMarker setLat={setLat} setLng={setLng} setPlaceName={setPlaceName} />
                    <SearchControl />
                </MapContainer>

                {/* Map Overlay Instructions */}
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200 pointer-events-none">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        <span>Click anywhere on the map to set location</span>
                    </div>
                </div>
            </div>

            {/* Location Details Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Selected Location Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Latitude Display */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Latitude
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                                <span className="text-[#1E3A8A] font-bold">L</span>
                            </div>
                            <div className="flex-1 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 font-mono text-sm">
                                {lat ? Number(lat).toFixed(6) : '—'}
                            </div>
                        </div>
                    </div>

                    {/* Longitude Display */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Longitude
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#06B6D4]/10 flex items-center justify-center">
                                <span className="text-[#06B6D4] font-bold">G</span>
                            </div>
                            <div className="flex-1 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 font-mono text-sm">
                                {lng ? Number(lng).toFixed(6) : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Place Name Display */}
                <div className="mt-4 space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Place Name
                    </label>
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                        </div>
                        <div className="flex-1 bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 text-sm min-h-[50px]">
                            {placeName || (
                                <span className="text-gray-400 italic">
                                    Click on the map to get the place name
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Coordinates Status */}
                {lat && lng ? (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-700">
                            Location successfully selected
                        </span>
                    </div>
                ) : (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm text-yellow-700">
                            Please select a location on the map
                        </span>
                    </div>
                )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You can also use the search bar to find a specific location</span>
            </div>
        </div>
    );
}