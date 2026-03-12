import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useNavigate, NavLink } from 'react-router-dom'

export const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleBrandClick = () => {
        navigate('/');
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
                : 'bg-white border-b border-gray-200'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    {/* Left side - Brand with animated dot */}
                    <div className="flex items-center space-x-8">
                        <div
                            onClick={handleBrandClick}
                            className="flex items-center space-x-2 cursor-pointer group"
                        >
                            <div className="relative">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-lg transform group-hover:rotate-6 transition-all duration-300"></div>
                                <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-[#F59E0B] rounded-full border-2 border-white"></div>
                            </div>
                            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] bg-clip-text text-transparent">
                                BrandName
                            </span>
                        </div>

                        {/* Desktop Navigation - Minimal but elegant */}
                        <div className="hidden md:flex items-center space-x-1">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `
                                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive
                                    ? 'text-[#1E3A8A]'
                                    : 'text-gray-600 hover:text-[#1E3A8A]'
                                }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        Dashboard
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] rounded-full"></span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </div>
                    </div>

                    {/* Right side - User menu */}
                    {isAuthenticated && user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-3 group focus:outline-none"
                            >
                                {/* User avatar with status indicator */}
                                <div className="relative">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center ring-2 ring-offset-2 ring-[#1E3A8A]/20 group-hover:ring-[#1E3A8A] transition-all duration-300">
                                        <span className="text-white font-semibold text-sm lg:text-base">
                                            {user.user_name ? user.user_name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                                </div>

                                {/* User info - hidden on mobile */}
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-semibold text-gray-700">
                                        {user.user_name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user.email || 'user@example.com'}
                                    </p>
                                </div>

                                {/* Chevron icon with animation */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 text-gray-400 transition-all duration-300 ${
                                        showDropdown ? 'rotate-180' : 'group-hover:text-[#1E3A8A]'
                                    }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {/* Premium dropdown menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 transform origin-top-right transition-all duration-200 animate-fadeIn">
                                    {/* User info header */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {user.user_name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {user.email || 'user@example.com'}
                                        </p>
                                    </div>

                                    {/* Mobile-only navigation items */}
                                    <div className="md:hidden px-2 py-2 border-b border-gray-100">
                                        <NavLink
                                            to="/"
                                            onClick={() => setShowDropdown(false)}
                                            className={({ isActive }) => `
                                                block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                ${isActive
                                                ? 'bg-[#1E3A8A] text-white'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#1E3A8A]'
                                            }
                                            `}
                                        >
                                            Dashboard
                                        </NavLink>
                                    </div>

                                    {/* Logout button with icon */}
                                    <div className="px-2 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center space-x-3 transition-all duration-200 group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                                <svg
                                                    className="w-4 h-4 text-red-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="font-medium">Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile bottom navigation - iOS style */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 z-50">
                <div className="flex justify-around items-center">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `
                            flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200
                            ${isActive ? 'text-[#1E3A8A]' : 'text-gray-500 hover:text-[#1E3A8A]'}
                        `}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs mt-1 font-medium">Home</span>
                    </NavLink>

                    {/* Add more bottom nav items here later */}
                </div>
            </div>

            {/* Add padding to bottom of page for mobile navigation */}
            <div className="md:hidden h-16"></div>
        </nav>
    );
};

// const styles = `
//     @keyframes fadeIn {
//         from {
//             opacity: 0;
//             transform: scale(0.95);
//         }
//         to {
//             opacity: 1;
//             transform: scale(1);
//         }
//     }
//     .animate-fadeIn {
//         animation: fadeIn 0.2s ease-out;
//     }
// `;