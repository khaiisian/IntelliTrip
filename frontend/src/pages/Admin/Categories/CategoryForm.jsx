import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const empty = { category_name: "" };

export const CategoryForm = ({
    title,
    description,
    submitLabel,
    submittingLabel,
    initialValues,
    loading = false,
    error,
    onSubmit
}) => {
    const [form, setForm] = useState(empty);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setForm({ ...empty, ...(initialValues || {}) });
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({ category_name: form.category_name.trim() });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                        <p className="text-gray-500 mt-1">{description}</p>
                    </div>
                    <Link to="/admin/categories" className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition">
                        Back to List
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="category_name"
                                value={form.category_name}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                                placeholder="E.g., Historical"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                            <Link to="/admin/categories" className="px-5 py-3 rounded-xl border border-gray-300 text-center font-semibold text-gray-700 hover:bg-gray-50 transition">
                                Cancel
                            </Link>
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
    );
};

export default CategoryForm;