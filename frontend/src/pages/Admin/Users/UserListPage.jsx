import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, deleteUser } from "../../../api/user.api.js";

const formatMoney = (value) => Number(value || 0).toLocaleString();

export const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getUsers();
            setUsers(res.data || []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const value = searchTerm.trim().toLowerCase();
        if (!value) return users;
        return users.filter((user) => {
            return [
                user.user_code,
                user.user_name,
                user.email,
                user.role
            ].some((field) => String(field || "").toLowerCase().includes(value));
        });
    }, [users, searchTerm]);

    const lastPage = Math.max(1, Math.ceil(filteredUsers.length / pagination.per_page));
    const currentPage = Math.min(pagination.current_page, lastPage);
    const start = (currentPage - 1) * pagination.per_page;
    const visibleUsers = filteredUsers.slice(start, start + pagination.per_page);

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage || page === currentPage) return;
        setPagination((prev) => ({ ...prev, current_page: page }));
    };

    const handleDelete = async (code) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await deleteUser(code);
            await fetchUsers();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to delete user");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1600px] mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Users</h1>
                        <p className="text-gray-500 mt-1">
                            Showing {filteredUsers.length ? start + 1 : 0}-
                            {Math.min(start + pagination.per_page, filteredUsers.length)} of {filteredUsers.length} users
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
                            placeholder="Search users..."
                        />
                        <Link
                            to="/admin/users/create"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add User
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
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleUsers.map((user) => (
                                    <tr key={user.user_code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-5 px-6">
                                            <span className="font-mono font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded text-sm">
                                                {user.user_code}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="font-medium text-gray-900">{user.user_name}</div>
                                        </td>
                                        <td className="py-5 px-6 text-gray-700">
                                            {user.email}
                                        </td>
                                        <td className="py-5 px-6 text-gray-700">
                                            {user.role || "-"}
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/admin/users/${user.user_code}/edit`}
                                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.user_code)}
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

                    {visibleUsers.length === 0 && (
                        <div className="py-12 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657 13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">Add your first user to get started.</p>
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
            </div>
        </div>
    );
};