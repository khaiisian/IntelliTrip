import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getTripsByUser } from '../../api/trip.api.js';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.user_id) {
            const fetchTrips = async () => {
                try {
                    const res = await getTripsByUser(user.user_id);
                    const tripsData = res.data.data || res.data;
                    setTrips(tripsData || []);
                } catch (err) {
                    console.error('Error fetching trips:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchTrips();
        } else {
            setLoading(false);
        }
    }, [user]);

    const recentTrips = trips.slice(0, 3);
    const upcomingTrips = trips.filter(t => new Date(t.start_date) > new Date()).length;

    const stats = [
        { label: 'Total Trips', value: trips.length, icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', color: 'blue' },
        { label: 'Upcoming', value: upcomingTrips, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'amber' },
        { label: 'Completed', value: trips.filter(t => new Date(t.end_date) < new Date()).length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
    ];

    const features = [
        {
            title: 'Plan Your Trip',
            description: 'Create personalized travel itineraries tailored to your preferences',
            icon: 'M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z',
            color: 'blue',
            link: '/create-trip'
        },
        {
            title: 'View Itineraries',
            description: 'Access all your planned trips and schedules in one place',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
            color: 'amber',
            link: '/trips'
        },
        {
            title: 'Discover Places',
            description: 'Explore attractions and find your next adventure',
            icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
            color: 'cyan',
            link: '/trips'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            amber: 'bg-amber-100 text-amber-600',
            green: 'bg-green-100 text-green-600',
            cyan: 'bg-cyan-100 text-cyan-600',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-r from-[#1E3A8A]/5 to-[#F59E0B]/5 -z-10"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4">
                        <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-600">Welcome back</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-[#1E3A8A]">Hello, {user?.name || 'Traveler'}! </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Ready for your next adventure? Let's plan something amazing together.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div 
                            key={index}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? '...' : stat.value}
                                    </p>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl ${getColorClasses(stat.color)} flex items-center justify-center`}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(feature.link)}
                                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#1E3A8A]/20 transition-all duration-300 text-left"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${getColorClasses(feature.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#1E3A8A] transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.description}</p>
                                <div className="mt-4 flex items-center text-[#1E3A8A] font-medium text-sm group-hover:gap-2 transition-all">
                                    <span>Get started</span>
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Trips */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Trips</h2>
                        {trips.length > 0 && (
                            <button 
                                onClick={() => navigate('/trips')}
                                className="text-[#1E3A8A] hover:text-[#F59E0B] font-medium text-sm flex items-center gap-1 transition-colors"
                            >
                                View all trips
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse"></div>
                            ))}
                        </div>
                    ) : trips.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recentTrips.map((trip) => (
                                <div
                                    key={trip.trip_id}
                                    onClick={() => navigate(`/trips/${trip.trip_id}`)}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg cursor-pointer transition-all duration-300 group overflow-hidden"
                                >
                                    {/* Trip Image Placeholder */}
                                    <div className="h-32 bg-gradient-to-br from-[#1E3A8A]/10 to-[#F59E0B]/10 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-[#1E3A8A]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                new Date(trip.end_date) < new Date() 
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {new Date(trip.end_date) < new Date() ? 'Completed' : 'Upcoming'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#1E3A8A] transition-colors truncate">
                                            {trip.name}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>
                                                {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {trip.destination && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span className="truncate">{trip.destination}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
                            <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
                            <button
                                onClick={() => navigate('/create-trip')}
                                className="inline-flex items-center px-6 py-3 bg-[#1E3A8A] text-white font-medium rounded-xl hover:bg-[#1E3A8A]/90 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Trip
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
