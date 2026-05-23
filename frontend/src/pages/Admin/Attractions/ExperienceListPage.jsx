import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getExperiencesByAttraction, createExperience, updateExperience, deleteExperience } from "../../../api/experience.api.js";
import { getAttractionByCode, getAttractions } from "../../../api/attraction.api.js";
import ExperienceForm from "./ExperienceForm.jsx";

// Helper: extract HH:MM from a time value
const formatTime = (value) => {
  if (!value) return '-';
  if (value.includes('T')) {
    return value.slice(11, 16);
  }
  return value.slice(0, 5);
};

export const ExperienceListPage = () => {
    const { id, code } = useParams();
    const attractionId = id || null;
    const navigate = useNavigate();

    const [attraction, setAttraction] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                let aid = attractionId;
                if (code) {
                    const res = await getAttractionByCode(code);
                    setAttraction(res.data.data);
                    aid = res.data.data?.id;
                }
                if (!aid) return;
                if (attractionId && !attraction) {
                    try {
                        const all = await getAttractions();
                        const found = (all.data.data || []).find(a => a.id === Number(attractionId));
                        if (found) setAttraction(found);
                    } catch (e) {
                        // ignore
                    }
                }
                const res2 = await getExperiencesByAttraction(aid);
                setExperiences(res2.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, code, attractionId, attraction?.id]);

    const openAdd = () => { setEditing(null); setShowForm(true); };
    const openEdit = (exp) => {
        setEditing({
            experience_type: exp.type,
            description: exp.description,
            best_time_start: exp.best_time_start ? formatTime(exp.best_time_start) : '',
            best_time_end: exp.best_time_end ? formatTime(exp.best_time_end) : '',
            experience_score_weight: exp.score_weight,
            time_bonus_multiplier: exp.time_bonus_multiplier,
            experience_code: exp.code
        });
        setShowForm(true);
    };

    const handleSubmit = async (payload) => {
        try {
            setSubmitting(true);
            const aid = attractionId || attraction?.id;
            if (!aid) throw new Error('Attraction id missing');
            const body = { ...payload, attraction_id: Number(aid) };
            if (editing && editing.experience_code) {
                await updateExperience(editing.experience_code, body);
            } else if (editing && editing.experience_code === undefined && payload.experience_code) {
                await updateExperience(payload.experience_code, body);
            } else {
                await createExperience(body);
            }
            const res = await getExperiencesByAttraction(aid);
            setExperiences(res.data.data || []);
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || err.message || 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (code) => {
        if (!confirm('Delete this experience?')) return;
        try {
            await deleteExperience(code);
            const aid = attractionId || attraction?.id;
            const res = await getExperiencesByAttraction(aid);
            setExperiences(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Failed to delete');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading experiences...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1600px] mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Experiences for {attraction?.name || 'Attraction'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage experiences that define this attraction
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/admin/attractions"
                            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Attractions
                        </Link>
                        <button
                            onClick={openAdd}
                            className="inline-flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Experience
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Experience Type</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Best Time</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Priority</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experiences.map((exp) => (
                                    <tr key={exp.code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-5 px-6">
                                            <span className="font-medium text-gray-900">{exp.type}</span>
                                        </td>
                                        <td className="py-5 px-6 text-gray-700">{exp.description || '-'}</td>
                                        <td className="py-5 px-6 text-gray-700">
                                            {exp.best_time_start && exp.best_time_end 
                                                ? `${formatTime(exp.best_time_start)} – ${formatTime(exp.best_time_end)}` 
                                                : '-'}
                                        </td>
                                        <td className="py-5 px-6 text-gray-700">{exp.score_weight}</td>
                                        <td className="py-5 px-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(exp)}
                                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exp.code)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {experiences.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center">
                                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <p className="text-gray-500">No experiences found</p>
                                            <p className="text-sm text-gray-400 mt-1">Add your first experience to get started.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal - Updated to match dashboard theme */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editing ? 'Edit Experience' : 'Add Experience'}
                            </h2>
                        </div>
                        <div className="p-6">
                            <ExperienceForm
                                initialValues={editing || {}}
                                onSubmit={handleSubmit}
                                onCancel={() => setShowForm(false)}
                                submitting={submitting}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExperienceListPage;