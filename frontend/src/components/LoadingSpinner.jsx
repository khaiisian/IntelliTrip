// components/common/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = ({ size = 'h-12 w-12', message = 'Loading...', subMessage }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
                <svg
                    className={`animate-spin ${size} text-[#1E3A8A] mx-auto mb-4`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">{message}</p>
                {subMessage && (
                    <p className="text-xs text-gray-400 mt-2">{subMessage}</p>
                )}
            </div>
        </div>
    );
};

// Inline loading spinner for buttons
export const ButtonSpinner = ({ text = 'Loading...' }) => {
    return (
        <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {text}
        </span>
    );
};

// Page loader with optional trip code
export const PageLoader = ({ message = 'Loading...', tripCode }) => {
    return (
        <LoadingSpinner
            message={message}
            subMessage={tripCode ? `Trip Code: ${tripCode}` : null}
        />
    );
};