import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Users, UserCheck, Globe, Bell } from 'lucide-react';
import { sendNotificationApi } from '../apis/notification.api';

const TARGET_OPTIONS = [
    {
        value: 'all',
        label: 'Everyone',
        description: 'Employees & HR Admins',
        icon: Globe,
        gradient: 'from-indigo-500 to-purple-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        check: 'bg-indigo-600',
    },
    {
        value: 'employee',
        label: 'Employees Only',
        description: 'All employee accounts',
        icon: Users,
        gradient: 'from-blue-500 to-cyan-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        check: 'bg-blue-600',
    },
    {
        value: 'admin',
        label: 'HR Admins Only',
        description: 'HR officer accounts',
        icon: UserCheck,
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        check: 'bg-emerald-600',
    },
];

const NotificationModal = ({ isOpen, onClose, onSent }) => {
    const [form, setForm] = useState({ title: '', message: '', targetRole: 'all' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleTarget = (val) => {
        setForm((f) => ({ ...f, targetRole: val }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            setError('Title and message are required.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await sendNotificationApi(form);
            setSuccess(true);
            setForm({ title: '', message: '', targetRole: 'all' });
            setTimeout(() => {
                setSuccess(false);
                onClose();
                if (onSent) onSent();
            }, 1200);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-indigo-200/40 border border-slate-200 animate-fadeIn my-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Send Notification</h2>
                                <p className="text-indigo-200 text-sm font-medium mt-1">Broadcast a message to users</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Notification Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="e.g. System Maintenance Tonight"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-base font-semibold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                        />
                        <div className="text-right text-xs text-slate-300 mt-1">{form.title.length}/100</div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            maxLength={500}
                            rows={6}
                            placeholder="Write your notification message here..."
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-base font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all resize-none"
                        />
                        <div className="text-right text-xs text-slate-300 mt-1">{form.message.length}/500</div>
                    </div>

                    {/* Target Role */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Send To
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {TARGET_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const selected = form.targetRole === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleTarget(opt.value)}
                                        className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                                            selected
                                                ? `${opt.border} ${opt.bg} shadow-md`
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <p className={`text-sm font-black leading-tight ${selected ? opt.text : 'text-slate-700'}`}>
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 leading-tight">{opt.description}</p>
                                        {selected && (
                                            <div className={`absolute top-3 right-3 w-4 h-4 rounded-full ${opt.check} flex items-center justify-center`}>
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600 font-medium">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-600 font-bold text-center">
                            ✓ Notification sent successfully!
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl border border-slate-200 text-base font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base font-black flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Send Now</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    , document.body);
};

export default NotificationModal;
