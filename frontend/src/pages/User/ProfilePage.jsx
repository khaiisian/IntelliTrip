import React, { useEffect, useState, useRef } from 'react';
import { updateProfile } from '../../api/auth.api.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { ButtonSpinner } from '../../components/LoadingSpinner.jsx';

export const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        user_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [imagePreview, setImagePreview] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [removeImageFlag, setRemoveImageFlag] = useState(false);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!user) return;
        setForm({
            user_name: user.user_name || '',
            email: user.email || '',
            password: '',
            confirmPassword: '',
        });
        const getImageUrl = (img) => {
            if (!img) return '';
            if (img.startsWith('http')) return img;
            return `${import.meta.env.VITE_API_URL}${img}`;
        };
        setImagePreview(getImageUrl(user.profile_image || ''));
    }, [user]);

    const initials = (form.user_name || user?.user_name || 'U').charAt(0).toUpperCase();

    const validate = () => {
        const newErrors = {};
        if (!form.user_name.trim()) newErrors.user_name = 'Name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address';
        if (form.password && form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (form.password && form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setSuccessMessage('');
        setErrorMessage('');
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleImageClick = () => fileInputRef.current?.click();
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setErrorMessage('Image must be less than 2MB');
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
            setErrorMessage('Only JPG, PNG or WEBP images are allowed');
            return;
        }
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrorMessage('');
    };
    const removeImage = () => {
        setImagePreview('');
        setSelectedFile(null);
        setRemoveImageFlag(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const formData = new FormData();
            formData.append('user_name', form.user_name.trim());
            formData.append('email', form.email.trim());
            if (form.password) formData.append('password', form.password);
            if (selectedFile) formData.append('profile_image', selectedFile);
            if (removeImageFlag) formData.append('remove_image', 'true');

            await updateProfile(formData);
            await refreshUser();
            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setSuccessMessage('Profile updated successfully!');
        } catch (err) {
            setErrorMessage(err?.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                   
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] bg-clip-text text-transparent">
                        Profile Settings
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">Update your personal information and profile picture</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    {/* Avatar section */}
                    <div className="relative px-8 pt-10 pb-6 flex flex-col sm:flex-row items-center gap-8 border-b border-slate-100">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E3A8A]/20 to-[#2563EB]/20 shadow-md border-2 border-white flex items-center justify-center transition-all group-hover:scale-105">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-bold text-[#1E3A8A]/70">{initials}</span>
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-slate-800">{form.user_name || 'Traveler'}</h2>
                            <p className="text-slate-500">{form.email || 'your@email.com'}</p>
                            <button onClick={removeImage} className="mt-2 text-xs text-slate-400 hover:text-red-500 transition">Remove photo</button>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] rounded-full"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {errorMessage && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 flex items-start gap-2">
                                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>{errorMessage}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm text-emerald-700 flex items-start gap-2">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                                <input name="user_name" value={form.user_name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all" placeholder="Your name" />
                                {errors.user_name && <p className="text-xs text-red-500 mt-1">{errors.user_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                                <input name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all" placeholder="hello@example.com" />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20" placeholder="••••••" />
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
                                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20" placeholder="••••••" />
                                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold shadow-md hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                                {saving ? <ButtonSpinner text="Saving..." /> : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};