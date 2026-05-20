import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MapPicker from "../../../components/MapPicker.jsx";
import { getCategories } from "../../../api/category.api.js";

const emptyForm = {
    attraction_name: "",
    latitude: "",
    longitude: "",
    place_name: "",
    category_id: "",
    cost: "",
    duration_minutes: "",
    open_time: "",
    close_time: ""
};

export const AttractionForm = ({
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
    const [categories, setCategories] = useState([]);
    const [categoryError, setCategoryError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setForm({ ...emptyForm, ...(initialValues || {}) });
    }, [initialValues]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                setCategories(res.data.data || []);
            } catch (err) {
                console.error(err);
                setCategoryError("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const setLat = (value) => setForm((prev) => ({ ...prev, latitude: value }));
    const setLng = (value) => setForm((prev) => ({ ...prev, longitude: value }));
    const setPlaceName = (value) => setForm((prev) => ({ ...prev, place_name: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            attraction_name: form.attraction_name.trim(),
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            category_id: Number(form.category_id),
            cost: Number(form.cost),
            duration_minutes: Number(form.duration_minutes),
            open_time: form.open_time,
            close_time: form.close_time
        };

        try {
            await onSubmit(payload);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attraction...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500 mt-2">{description}</p>
                </div>
                <Link
                    to="/admin/attractions"
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to List
                </Link>
            </div>

            {(error || categoryError) && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error || categoryError}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <form onSubmit={handleSubmit} className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Attraction Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="attraction_name"
                                value={form.attraction_name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                                placeholder="E.g., Shwedagon Pagoda"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="cost"
                                    value={form.cost}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                                <input
                                    type="number"
                                    min="1"
                                    name="duration_minutes"
                                    value={form.duration_minutes}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                                    placeholder="90"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Open Time</label>
                                <input
                                    type="time"
                                    name="open_time"
                                    value={form.open_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Close Time</label>
                                <input
                                    type="time"
                                    name="close_time"
                                    value={form.close_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-gray-100">
                        <Link
                            to="/admin/attractions"
                            className="px-5 py-3 rounded-xl border border-gray-300 text-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 rounded-xl bg-[#1E3A8A] text-white font-semibold hover:bg-[#2563EB] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? submittingLabel : submitLabel}
                        </button>
                    </div>
                </form>

                <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                    {(form.latitude || form.longitude) && (
                        <div className="mb-4 rounded-xl border border-[#1E3A8A]/10 bg-[#1E3A8A]/5 px-4 py-3 text-sm text-gray-700">
                            <p className="font-medium">{form.place_name || "Selected coordinates"}</p>
                            <p className="mt-1 text-gray-500">
                                Lat: {form.latitude || "-"} | Lng: {form.longitude || "-"}
                            </p>
                        </div>
                    )}
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                        <MapPicker
                            lat={form.latitude}
                            setLat={setLat}
                            lng={form.longitude}
                            setLng={setLng}
                            placeName={form.place_name}
                            setPlaceName={setPlaceName}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
