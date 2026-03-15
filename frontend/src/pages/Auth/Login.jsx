import React, { useEffect } from 'react';
import { useState } from "react";
import { loginApi } from "../../api/auth.api.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { ButtonSpinner } from "../../components/LoadingSpinner.jsx";
import { FormErrorMessage } from "../../components/ErrorMessage.jsx";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) navigate("/");
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try{
            const res = await loginApi({email, password});
            login(res.data.data);
            console.log("login success");
            navigate("/");
        } catch (error) {
            console.log(error.response?.data?.message);
            setError(error.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center p-4">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-[#1E3A8A]/10 to-[#F59E0B]/10 -z-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-20 left-20 w-64 h-64 bg-[#F59E0B]/5 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="hidden md:block space-y-6 pr-12">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                        <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-600">Welcome back to</span>
                    </div>

                    <h1 className="text-5xl font-bold">
                        <span className="text-[#1E3A8A]">Wander</span>
                        <span className="text-[#F59E0B]">Plan</span>
                    </h1>

                    <p className="text-xl text-gray-600 leading-relaxed">
                        Your personal travel companion. Plan amazing journeys, discover hidden gems, and create unforgettable memories.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">Smart itinerary planning</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">Personalized recommendations</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">Budget tracking & management</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
                        {/* Header with Wave Pattern */}
                        <div className="relative bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-10 overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="white" />
                                </svg>
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back! 👋</h2>
                                <p className="text-blue-100">Sign in to continue your journey</p>
                            </div>
                            {/* Decorative Circles */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Error Message */}
                            <FormErrorMessage message={error} />

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all duration-200 outline-none bg-gray-50/50 focus:bg-white"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all duration-200 outline-none bg-gray-50/50 focus:bg-white"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-[#06B6D4] hover:text-[#1E3A8A] transition-colors font-medium flex items-center gap-1"
                                >
                                    Forgot password?
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <ButtonSpinner text="Signing in..." />
                                ) : (
                                    <>
                                        Sign In
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">New to WanderPlan?</span>
                                </div>
                            </div>

                            {/* Sign Up Link */}
                            <Link
                                to="/register"
                                className="w-full block text-center mb-5 px-6 py-3 border-2 border-[#1E3A8A] text-[#1E3A8A] font-semibold rounded-xl hover:bg-[#1E3A8A] hover:text-white transition-all duration-200"
                            >
                                Create an Account
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}