// components/common/ErrorMessage.jsx
import React from 'react';

export const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#2563EB] transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

// For inline form errors
export const FormErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-red-600">{message}</span>
        </div>
    );
};

// For field-level errors
export const FieldError = ({ error }) => {
    if (!error) return null;

    return (
        <p className="text-sm text-red-500 mt-1">{error}</p>
    );
};

// For date range errors (special case)
export const DateRangeError = ({ error }) => {
    if (!error) return null;

    return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
        </div>
    );
};