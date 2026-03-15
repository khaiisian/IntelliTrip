// components/common/InfoBox.jsx
import React from 'react';

export const InfoBox = ({ title, items, icon = 'info' }) => {
    const icons = {
        info: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
        tip: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        ),
        warning: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        )
    };

    const bgColors = {
        info: 'bg-blue-50 border-blue-200',
        tip: 'bg-green-50 border-green-200',
        warning: 'bg-yellow-50 border-yellow-200'
    };

    const textColors = {
        info: 'text-[#06B6D4]',
        tip: 'text-green-500',
        warning: 'text-yellow-500'
    };

    return (
        <div className={`${bgColors[icon]} border ${bgColors[icon].replace('bg-', 'border-')} rounded-xl p-4`}>
            <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 ${textColors[icon]} mt-0.5 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icons[icon]}
                </svg>
                <div>
                    <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1 list-disc list-inside">
                        {items.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};