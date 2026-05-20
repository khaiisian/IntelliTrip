import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAttraction, getAttractions } from "../../../api/attraction.api.js";

const formatTime = (value) => {
    if (!value) return "-";
    if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toISOString().slice(11, 16);
};

const formatMoney = (value) => Number(value || 0).toLocaleString();

export const AttractionListPage = () => {
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10
    });

    const fetchAttractions = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getAttractions();
            setAttractions(res.data.data || []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to load attractions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttractions();
    }, []);

    const filteredAttractions = useMemo(() => {
        const value = searchTerm.trim().toLowerCase();
        if (!value) return attractions;
        return attractions.filter((attraction) => {
            return [
                attraction.code,
                attraction.name,
                attraction.category?.category_name
            ].some((field) => String(field || "").toLowerCase().includes(value));
        });
    }, [attractions, searchTerm]);

    const lastPage = Math.max(1, Math.ceil(filteredAttractions.length / pagination.per_page));
    const currentPage = Math.min(pagination.current_page, lastPage);
    const start = (currentPage - 1) * pagination.per_page;
    const visibleAttractions = filteredAttractions.slice(start, start + pagination.per_page);

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage || page === currentPage) return;
        setPagination((prev) => ({ ...prev, current_page: page }));
    };

    const handleDelete = async (code) => {
        if (!confirm("Are you sure you want to delete this attraction?")) return;

        try {
            await deleteAttraction(code);
            await fetchAttractions();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to delete attraction");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attractions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attractions</h1>
                    <p className="text-gray-600 mt-1">
                        Showing {filteredAttractions.length ? start + 1 : 0}-
                        {Math.min(start + pagination.per_page, filteredAttractions.length)} of {filteredAttractions.length} attractions
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPagination((prev) => ({ ...prev, current_page: 1 }));
                        }}
                        className="w-full sm:w-72 rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20"
                        placeholder="Search attractions..."
                    />
                    <Link
                        to="/admin/attractions/create"
                        className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-semibold transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Attraction
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-900 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-4 px-6 font-semibold text-white">Code</th>
                            <th className="text-left py-4 px-6 font-semibold text-white">Name</th>
                            <th className="text-left py-4 px-6 font-semibold text-white">Category</th>
                            <th className="text-left py-4 px-6 font-semibold text-white">Cost</th>
                            <th className="text-left py-4 px-6 font-semibold text-white">Duration</th>
                            <th className="text-left py-4 px-6 font-semibold text-white">Hours</th>
                            <th className="text-left py-4 px-6 font-semibold text-white">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {visibleAttractions.map((attraction) => (
                            <tr key={attraction.code} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-5 px-6">
                                    <span className="font-mono font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded text-sm">
                                        {attraction.code}
                                    </span>
                                </td>
                                <td className="py-5 px-6">
                                    <div className="font-medium text-gray-900">{attraction.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {Number(attraction.latitude).toFixed(5)}, {Number(attraction.longitude).toFixed(5)}
                                    </div>
                                </td>
                                <td className="py-5 px-6 text-gray-700">
                                    {attraction.category?.category_name || "-"}
                                </td>
                                <td className="py-5 px-6 text-gray-700">Ks {formatMoney(attraction.cost)}</td>
                                <td className="py-5 px-6 text-gray-700">{attraction.duration_minutes} min</td>
                                <td className="py-5 px-6 text-gray-700">
                                    {formatTime(attraction.open_time)} - {formatTime(attraction.close_time)}
                                </td>
                                <td className="py-5 px-6">
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/admin/attractions/${attraction.code}/edit`}
                                            className="bg-[#06B6D4] hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(attraction.code)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {visibleAttractions.length === 0 && (
                    <div className="py-12 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657 13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No attractions found</h3>
                        <p className="text-gray-500">Add your first attraction to get started.</p>
                    </div>
                )}
            </div>

            {lastPage > 1 && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 px-4 py-4">
                    <div className="text-sm text-gray-600">
                        Page {currentPage} of {lastPage}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === lastPage}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
