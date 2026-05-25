import React from 'react';

export const LogoMark = ({ size = 'md', dotBorder = 'border-white', className = '' }) => {
    const sizeClass = size === 'lg'
        ? 'w-10 h-10'
        : size === 'sm'
            ? 'w-8 h-8'
            : 'w-9 h-9';

    const iconSizeClass = size === 'lg'
        ? 'w-6 h-6'
        : 'w-5 h-5';

    return (
        <div className={`relative ${className}`}>
            <div className={`${sizeClass} bg-[#1E3A8A] rounded-lg flex items-center justify-center shadow-sm`}>
                <svg
                    className={iconSizeClass}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M4.5 11.2L19.5 4.5L12.8 19.5L10.9 13.1L4.5 11.2Z"
                        fill="white"
                    />
                </svg>
            </div>
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F59E0B] rounded-full border-2 ${dotBorder}`}></div>
        </div>
    );
};

export const BrandLogo = ({
    size = 'md',
    textSize = 'text-2xl',
    dotBorder = 'border-white',
    light = false,
    className = '',
    markClassName = ''
}) => {
    const firstText = light ? 'text-white' : 'text-[#1E3A8A]';

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <LogoMark size={size} dotBorder={dotBorder} className={markClassName} />
            <span className={`${textSize} font-bold tracking-tight`}>
                <span className={firstText}>Intelli</span>
                <span className="text-[#F59E0B]">Trip</span>
            </span>
        </div>
    );
};
