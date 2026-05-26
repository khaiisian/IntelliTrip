import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAttraction, getAttractions } from "../../../api/attraction.api.js";
import { DeleteConfirmationModal } from "../../../components/DeleteConfirmationModal.jsx";

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
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
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

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await deleteAttraction(deleteTarget.code);
            await fetchAttractions();
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to delete attraction");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attractions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1600px] mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Attractions</h1>
                        <p className="text-gray-500 mt-1">
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
                            className="w-full sm:w-72 rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            placeholder="Search attractions..."
                        />
                        <Link
                            to="/admin/attractions/create"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition"
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

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Code</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Cost</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Duration</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Hours</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleAttractions.map((attraction) => (
                                    <tr key={attraction.code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-5 px-6">
                                            <span className="font-mono font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded text-sm">
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
                                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    to={`/admin/attractions/${attraction.id}/experiences`}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                                >
                                                    Experiences
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(attraction)}
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 px-4 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {lastPage}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                <DeleteConfirmationModal
                    isOpen={Boolean(deleteTarget)}
                    title="Delete Attraction"
                    itemName={deleteTarget?.name}
                    confirmLabel="Delete Attraction"
                    loading={deleting}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDelete}
                />
            </div>
        </div>
    );
};
