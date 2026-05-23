import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: "Dashboard", to: "/" },
        { label: "My Trips", to: "/tripLists" },
        { label: "Create Trip", to: "/createTrip" },
        { label: "Itineraries", to: "/itineraries" },
    ];

    return (
        <footer className="relative bg-slate-900 border-t border-slate-800 shadow-inner mt-7">
            {/* Simple solid accent bar instead of gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#2563EB]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <div className="relative">
                                <div className="w-10 h-10 bg-[#1E3A8A] rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-md"></div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F59E0B] rounded-full border-2 border-slate-900"></div>
                            </div>
                            <span className="text-2xl font-bold text-white">
                                IntelliTrip
                            </span>
                        </Link>
                        <p className="text-sm leading-6 text-gray-300 max-w-sm">
                            Plan smarter routes, organize trip details, and keep every itinerary ready for your next Myanmar adventure.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            {/* Badges now use subtle neutral styling with colored dots only */}
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                AI-Powered
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                                Real-time Routing
                            </span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-white border-l-3 border-[#F59E0B] pl-3">
                            Quick Links
                        </h2>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200 hover:translate-x-0.5 inline-block"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-white border-l-3 border-[#06B6D4] pl-3">
                            Travel Support
                        </h2>
                        <div className="mt-4 space-y-3 text-sm text-gray-300">
                            <div className="flex items-center gap-3 group">
                                <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-[#67E8F9] flex items-center justify-center group-hover:bg-[#06B6D4] group-hover:text-white transition-all duration-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                                    </svg>
                                </span>
                                <span>Keep schedules clear from morning to night.</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-[#F59E0B] flex items-center justify-center group-hover:bg-[#F59E0B] group-hover:text-white transition-all duration-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657 13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </span>
                                <span>Discover attractions that match your route.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
                    <p>© {currentYear} IntelliTrip. All rights reserved.</p>
                    <p>Built for easier, calmer trip planning.</p>
                </div>
            </div>
        </footer>
    );
};