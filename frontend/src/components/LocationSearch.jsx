import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import AsyncSelect from 'react-select/async';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to handle map clicks
const MapClickHandler = ({ setLat, setLng, setPlaceName, setSearchValue }) => {
    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            setLat(lat);
            setLng(lng);

            // Reverse geocoding to get place name
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                const data = await res.json();
                const placeName = data.display_name;
                setPlaceName(placeName);

                // Update the search input value
                setSearchValue({
                    value: { lat, lng },
                    label: placeName
                });
            } catch (err) {
                console.error("Reverse geocoding error:", err);
                setPlaceName("Selected location");
                setSearchValue({
                    value: { lat, lng },
                    label: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
                });
            }
        },
    });
    return null;
};

// Component for draggable marker
const DraggableMarker = ({ lat, lng, setLat, setLng, setPlaceName, setSearchValue }) => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (lat && lng) {
            setPosition([lat, lng]);
        }
    }, [lat, lng]);

    const markerRef = React.useRef(null);

    const eventHandlers = {
        dragend: async () => {
            const marker = markerRef.current;
            if (marker) {
                const newPos = marker.getLatLng();
                setLat(newPos.lat);
                setLng(newPos.lng);

                // Reverse geocoding for new position
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${newPos.lat}&lon=${newPos.lng}&format=json`
                    );
                    const data = await res.json();
                    const placeName = data.display_name;
                    setPlaceName(placeName);

                    setSearchValue({
                        value: { lat: newPos.lat, lng: newPos.lng },
                        label: placeName
                    });
                } catch (err) {
                    console.error("Reverse geocoding error:", err);
                }
            }
        },
    };

    return position ? (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    ) : null;
};

const LocationSearch = ({
                            lat,
                            setLat,
                            lng,
                            setLng,
                            placeName,
                            setPlaceName,
                            placeholder
                        }) => {
    const [searchValue, setSearchValue] = useState(null);
    const [mapCenter, setMapCenter] = useState([21.1702, 94.8679]); // Default: Bagan
    const [showMap, setShowMap] = useState(false);

    // Update map center when location is selected
    useEffect(() => {
        if (lat && lng) {
            setMapCenter([lat, lng]);
        }
    }, [lat, lng]);

    // Initialize search value from existing placeName
    useEffect(() => {
        if (placeName && lat && lng && !searchValue) {
            setSearchValue({
                value: { lat, lng },
                label: placeName
            });
        }
    }, [placeName, lat, lng]);

    // Search for locations using Nominatim
    const loadOptions = async (inputValue) => {
        if (inputValue.length < 3) return [];

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5`
            );
            const data = await response.json();

            return data.map(item => ({
                value: {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                },
                label: item.display_name
            }));
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    };

    const handleSearchChange = (selectedOption) => {
        if (selectedOption) {
            setSearchValue(selectedOption);
            setLat(selectedOption.value.lat);
            setLng(selectedOption.value.lng);
            setPlaceName(selectedOption.label);
            setMapCenter([selectedOption.value.lat, selectedOption.value.lng]);
        } else {
            setSearchValue(null);
            setLat("");
            setLng("");
            setPlaceName("");
        }
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '45px',
            borderRadius: '0.75rem',
            borderColor: state.isFocused ? '#1E3A8A' : '#e5e7eb',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(30, 58, 138, 0.1)' : 'none',
            '&:hover': {
                borderColor: '#1E3A8A'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#1E3A8A'
                : state.isFocused
                    ? 'rgba(30, 58, 138, 0.1)'
                    : 'white',
            color: state.isSelected ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '14px'
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            zIndex: 50
        })
    };

    return (
        <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
                <AsyncSelect
                    cacheOptions
                    loadOptions={loadOptions}
                    onChange={handleSearchChange}
                    value={searchValue}
                    placeholder={placeholder || "Search for a location..."}
                    styles={customStyles}
                    noOptionsMessage={({ inputValue }) =>
                        inputValue.length < 3
                            ? "Type at least 3 characters to search"
                            : "No locations found"
                    }
                    loadingMessage={() => "Searching..."}
                    isClearable
                />

                {/* Toggle Map Button */}
                <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="absolute right-2 top-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {showMap ? 'Hide Map' : 'Show Map'}
                </button>
            </div>

            {/* Map Container */}
            {showMap && (
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg transition-all duration-300">
                    <div className="relative" style={{ height: '300px' }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />

                            {/* Handle map clicks */}
                            <MapClickHandler
                                setLat={setLat}
                                setLng={setLng}
                                setPlaceName={setPlaceName}
                                setSearchValue={setSearchValue}
                            />

                            {/* Draggable marker for selected location */}
                            {lat && lng && (
                                <DraggableMarker
                                    lat={lat}
                                    lng={lng}
                                    setLat={setLat}
                                    setLng={setLng}
                                    setPlaceName={setPlaceName}
                                    setSearchValue={setSearchValue}
                                />
                            )}
                        </MapContainer>

                        {/* Map Instructions Overlay */}
                        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-xs text-gray-700 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                            <span>Click map to set location • Drag marker to adjust</span>
                        </div>

                        {/* Coordinates Display */}
                        {lat && lng && (
                            <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-xs font-mono text-gray-700">
                                {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Selected Location Summary */}
            {placeName && (
                <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-[#1E3A8A]/5 to-[#06B6D4]/5 rounded-lg border border-[#1E3A8A]/10">
                    <svg className="w-5 h-5 text-[#06B6D4] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-gray-800 font-medium">Selected Location:</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{placeName}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSearch;