import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteCategory, getCategories } from "../../../api/category.api.js";
import { DeleteConfirmationModal } from "../../../components/DeleteConfirmationModal.jsx";

export const CategoryListPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [pagination, setPagination] = useState({ current_page: 1, per_page: 10 });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getCategories();
            setCategories(res.data.data || []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filtered = useMemo(() => {
        const value = searchTerm.trim().toLowerCase();
        if (!value) return categories;
        return categories.filter((c) =>
            [c.category_code, c.category_name].some(f =>
                String(f || "").toLowerCase().includes(value)
            )
        );
    }, [categories, searchTerm]);

    const lastPage = Math.max(1, Math.ceil(filtered.length / pagination.per_page));
    const currentPage = Math.min(pagination.current_page, lastPage);
    const start = (currentPage - 1) * pagination.per_page;
    const visible = filtered.slice(start, start + pagination.per_page);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await deleteCategory(deleteTarget.category_code);
            await fetchCategories();
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to delete category');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading categories...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Categories</h1>
                        <p className="text-gray-500 mt-1">Showing {filtered.length} categories</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, current_page: 1 })); }}
                            className="w-full sm:w-72 rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                            placeholder="Search categories..."
                        />
                        <Link
                            to="/admin/categories/create"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Category
                        </Link>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Table Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Code</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((c) => (
                                    <tr key={c.category_code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-5 px-6">
                                            <span className="font-mono font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded text-sm">
                                                {c.category_code}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="font-medium text-gray-900">{c.category_name}</div>
                                        </td>
                                        <td className="py-5 px-6 text-gray-600 text-sm">
                                            {new Date(c.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/admin/categories/${c.category_code}/edit`}
                                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
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

                    {visible.length === 0 && (
                        <div className="py-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                            <p className="text-gray-500">Create a category to get started.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 px-4 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {lastPage}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(p => ({ ...p, current_page: currentPage - 1 }))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(p => ({ ...p, current_page: currentPage + 1 }))}
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
                    title="Delete Category"
                    itemName={deleteTarget?.category_name}
                    confirmLabel="Delete Category"
                    loading={deleting}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={confirmDelete}
                />
            </div>
        </div>
    );
};

export default CategoryListPage;
