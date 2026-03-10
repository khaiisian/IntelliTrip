import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/AuthContext.jsx";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const linkClass = path =>
        `px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3
        ${location.pathname === path
            ? 'bg-[#1E3A8A] text-white shadow-lg'
            : 'text-gray-300 hover:bg-[#1E3A8A]/10 hover:text-[#06B6D4]'
        }`;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Function to get user initials
    const getUserInitials = () => {
        if (user?.user_name) {
            return user.user_name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <aside className="w-64 h-screen bg-gray-900 flex flex-col shadow-2xl border-r border-gray-800 sticky top-0 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className="px-6 py-6 border-b border-gray-800 flex-shrink-0">
                <h1 className="text-3xl font-extrabold text-[#06B6D4] tracking-wide">
                    BrandName
                </h1>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">
                    Admin Panel
                </p>

                {user && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {getUserInitials()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">
                                    {user?.user_name || 'User'}
                                </p>
                                <p className="text-gray-400 text-xs truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                                <p className="text-xs mt-1 px-2 py-1 rounded-full inline-block bg-[#F59E0B]/20 text-[#F59E0B]">
                                    ADMIN
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation - Scrollable Area */}
            <div className="flex-grow overflow-y-auto px-4 py-6 custom-scrollbar">
                <nav className="flex flex-col gap-2 text-base font-semibold pr-2">
                    <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>

                    <Link to="/admin/attractions/create" className={linkClass('/admin/attractions/create')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Create Attractions
                    </Link>
                </nav>
            </div>

            {/* Footer Section - Fixed at bottom */}
            <div className="flex-shrink-0">
                {/* Logout Button */}
                <div className="px-4 py-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Copyright */}
                <div className="px-6 py-4 border-t border-gray-800 text-sm text-gray-500">
                    © {new Date().getFullYear()} BrandName
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;