import React, { useEffect, useState } from "react";

const WEIGHT_OPTIONS = [
    { label: 'Very High', value: 1.0 },
    { label: 'High', value: 0.8 },
    { label: 'Medium', value: 0.5 },
    { label: 'Low', value: 0.3 }
];

export const ExperienceForm = ({ initialValues = {}, onSubmit, onCancel, submitting }) => {
    const [form, setForm] = useState({
        experience_type: '',
        description: '',
        best_time_start: '',
        best_time_end: '',
        experience_score_weight: 0.5,
        time_bonus_multiplier: 1.0,
        ...initialValues
    });

    useEffect(() => setForm((prev) => ({ ...prev, ...(initialValues || {}) })), [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            experience_score_weight: Number(form.experience_score_weight),
            time_bonus_multiplier: Number(form.time_bonus_multiplier)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Experience Type <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="experience_type"
                            value={form.experience_type}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            placeholder="E.g., Sunset View"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            placeholder="Brief description for admins"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Recommended Visit Start</label>
                            <input
                                type="time"
                                name="best_time_start"
                                value={form.best_time_start}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Recommended Visit End</label>
                            <input
                                type="time"
                                name="best_time_end"
                                value={form.best_time_end}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Priority</label>
                            <select
                                name="experience_score_weight"
                                value={form.experience_score_weight}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            >
                                {WEIGHT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Time Bonus Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                name="time_bonus_multiplier"
                                value={form.time_bonus_multiplier}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-3 rounded-xl border border-gray-300 text-center font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ExperienceForm;