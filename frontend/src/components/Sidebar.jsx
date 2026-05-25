import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/AuthContext.jsx";
import { BrandLogo } from "./BrandLogo.jsx";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Updated link styling: active = white background, inactive = light neutral text
    const linkClass = (path) => {
        const isActive = location.pathname === path || 
            (path !== '/admin/dashboard' && location.pathname.startsWith(path));
        
        return `px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 text-sm font-medium
            ${isActive 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
            }`;
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getUserInitials = () => {
        if (user?.user_name) {
            return user.user_name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <aside 
            className="w-64 min-w-[16rem] max-w-[16rem] h-screen bg-gradient-to-b from-indigo-800 to-indigo-700 flex flex-col shadow-xl sticky top-0 overflow-y-auto"
            style={{ width: '16rem', flexShrink: 0 }}
        >
            {/* Header Section */}
            <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
                <BrandLogo
                    size="sm"
                    textSize="text-xl"
                    dotBorder="border-indigo-800"
                    light
                />
                <p className="text-xs text-indigo-200 mt-1 uppercase tracking-wider">
                    Admin Panel
                </p>

                {user && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            {/* Avatar – glass style, not solid indigo */}
                            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {getUserInitials()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">
                                    {user?.user_name || 'User'}
                                </p>
                                <p className="text-indigo-200 text-xs truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-medium">
                                    ADMIN
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-grow overflow-y-auto px-3 py-5">
                <nav className="flex flex-col gap-1">
                    <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>

                    <Link to="/admin/attractions" className={linkClass('/admin/attractions')}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657 13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Attractions
                    </Link>

                    <Link to="/admin/categories" className={linkClass('/admin/categories')}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Categories
                    </Link>

                    <Link to="/admin/users" className={linkClass('/admin/users')}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Users
                    </Link>
                </nav>
            </div>

            {/* Footer Section */}
            <div className="flex-shrink-0">
                <div className="px-3 py-3 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 rounded-lg text-indigo-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>

                <div className="px-5 py-3 border-t border-white/10 text-xs text-indigo-300">
                    © {new Date().getFullYear()} IntelliTrip
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
