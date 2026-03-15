import React from 'react';
import { useState } from "react";
import { register } from "../../api/auth.api.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { ButtonSpinner } from "../../components/LoadingSpinner.jsx";
import { FormErrorMessage } from "../../components/ErrorMessage.jsx";

const Register = () => {
    const [form, setForm] = useState({
        user_name: "",
        email: "",
        password: "",
    })

    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await register(form);
            login(res.data.data)
            navigate("/home");
        } catch (err) {
            console.log("Error occurs!")
            console.log(err.response?.data?.message);
            setError(err?.response?.data?.message || "Registration failed");
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

            <div className="max-w-5xl w-full grid md:grid-cols-5 gap-6">
                {/* Left Side - Benefits */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-800">Plan Your Trips</h3>
                        </div>
                        <p className="text-sm text-gray-500 pl-13">Create detailed itineraries for any destination</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-800">Track Budget</h3>
                        </div>
                        <p className="text-sm text-gray-500 pl-13">Manage your travel expenses easily</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#06B6D4]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-800">Save Favorites</h3>
                        </div>
                        <p className="text-sm text-gray-500 pl-13">Bookmark places you love</p>
                    </div>

                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl shadow-lg p-6 text-white">
                        <p className="text-sm font-medium mb-1">Join 10,000+ travelers</p>
                        <p className="text-2xl font-bold">Start Your Journey Today</p>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-8 py-6">
                            <h2 className="text-2xl font-bold text-white">Create Account</h2>
                            <p className="text-blue-100 mt-1">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-5">
                            {/* Error Message */}
                            <FormErrorMessage message={error} />

                            {/* Name Field with icon */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    <input
                                        name="user_name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={form.user_name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all duration-200 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Field with icon */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all duration-200 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field with icon */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all duration-200 outline-none"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Minimum 8 characters</p>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                                    required
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600">
                                    I agree to the <a href="#" className="text-[#1E3A8A] font-medium">Terms</a> and <a href="#" className="text-[#F59E0B] font-medium">Privacy Policy</a>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-500 hover:to-[#F59E0B] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <ButtonSpinner text="Creating account..." />
                                ) : (
                                    "Create Free Account"
                                )}
                            </button>

                            {/* Sign In Link */}
                            <div className="text-center pt-2">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-[#1E3A8A] font-semibold hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;