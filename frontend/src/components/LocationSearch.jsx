import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';

const LocationSearch = ({ lat, setLat, lng, setLng, placeName, setPlaceName, placeholder }) => {
    const [searchValue, setSearchValue] = useState(null);

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

    const handleChange = (selectedOption) => {
        if (selectedOption) {
            setSearchValue(selectedOption);
            setLat(selectedOption.value.lat);
            setLng(selectedOption.value.lng);
            setPlaceName(selectedOption.label);
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
            minHeight: '50px',
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
            overflow: 'hidden'
        })
    };

    return (
        <div className="space-y-2">
            <AsyncSelect
                cacheOptions
                loadOptions={loadOptions}
                onChange={handleChange}
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
        </div>
    );
};

export default LocationSearch;