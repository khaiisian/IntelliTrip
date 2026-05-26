import React, { useState, useEffect, useRef } from "react";

const emptyForm = {
    user_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "user",
    profile_image: ""
};

export const UserForm = ({
    title,
    description,
    submitLabel,
    submittingLabel,
    initialValues,
    loading = false,
    error,
    onSubmit
}) => {
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const merged = { ...emptyForm, ...(initialValues || {}) };
        merged.password = "";
        merged.confirm_password = "";
        setForm(merged);
        if (merged.profile_image) {
            const getImageUrl = (img) => {
                if (!img) return null;
                if (img.startsWith('http')) return img;
                return `${import.meta.env.VITE_API_URL}${img}`;
            };

            setImagePreview(getImageUrl(merged.profile_image));
        } else {
            setImagePreview(null);
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear password error when user types
        if (name === "password" || name === "confirm_password") {
            setPasswordError("");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        // We do not store base64 in form; will upload file on submit when selectedFile is present
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordProvided = form.password.trim() !== "";
        const confirmPasswordProvided = form.confirm_password.trim() !== "";

        // On edit, password is optional. Only validate matching when changing it.
        if ((passwordProvided || confirmPasswordProvided) && form.password !== form.confirm_password) {
            setPasswordError("Passwords do not match");
            return;
        }

        setSubmitting(true);

        // Prepare payload - remove password if empty (for edit)
        // If an image file was selected, send FormData; otherwise send JSON payload
        const payload = {
            user_name: form.user_name.trim(),
            email: form.email.trim(),
            role: form.role,
        };

        // Only include password if it's provided (not empty)
        if (passwordProvided) {
            payload.password = form.password;
        }

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('user_name', payload.user_name);
                formData.append('email', payload.email);
                formData.append('role', payload.role);
                if (payload.password) formData.append('password', payload.password);
                formData.append('profile_image', selectedFile);
                await onSubmit(formData);
            } else {
                // preserve existing profile_image path if present
                payload.profile_image = form.profile_image || null;
                await onSubmit(payload);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[800px] mx-auto">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-8">
                        <div className="mb-6">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                            <p className="text-gray-500 mt-1">{description}</p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Image Upload - Modern Circular Design */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-100 to-gray-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200 shadow-md">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg
                                                className="w-12 h-12 text-indigo-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M5.121 17.804A9 9 0 1118.879 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={triggerFileUpload}
                                        className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 border-2 border-white"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="user_name"
                                    value={form.user_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                                    placeholder="Enter full name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                                    placeholder="Enter email address"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password {!initialValues && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required={!initialValues}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                                    placeholder={initialValues ? "Leave blank to keep current" : "Enter password"}
                                />
                                {!initialValues && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Password is required for new users
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password {!initialValues && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={form.confirm_password}
                                    onChange={handleChange}
                                    required={!initialValues}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                                    placeholder={initialValues ? "Leave blank to keep current" : "Confirm password"}
                                />
                                {passwordError && (
                                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-5 py-3 rounded-xl border border-gray-300 text-center font-semibold text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 rounded-xl bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? submittingLabel : submitLabel}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
