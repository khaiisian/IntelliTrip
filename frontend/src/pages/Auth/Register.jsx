import React from 'react'
import {useState} from "react";
import {register} from "../../api/auth.api.js";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../auth/AuthContext.jsx";

const Register = () => {
    const [form, setForm] = useState({
        user_name: "",
        email: "",
        password: "",
    })

    const {login} = useAuth();

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

        try{
            const res = await register(form);
            // console.log(res)
            // console.log(res.data.data)
            // localStorage.setItem("token", res.data.data.token);

            login(res.data.data)
            navigate("/home");
        } catch (err){
            console.log("Error occurs!")
            console.log(err.response.data.message);
            setError(err?.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-8 text-[#1E3A8A]">Create Account</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            id="user_name"
                            name="user_name"
                            type="text"
                            placeholder="Enter your full name"
                            value={form.user_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </span>
                        ) : "Sign Up"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="text-[#1E3A8A] hover:text-indigo-800 font-semibold transition">
                            Sign in
                        </a>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-[#06B6D4] hover:text-cyan-700 transition">Terms</a>
                        {' '}and{' '}
                        <a href="#" className="text-[#06B6D4] hover:text-cyan-700 transition">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
export default Register