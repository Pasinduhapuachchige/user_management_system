import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Building2,
    Edit3,
    Trash2,
    X,
    AlertTriangle,
    Calendar,
    FileText,
    Users,
    CheckCircle,
    Hash,
    Clock,
} from 'lucide-react';
import { deleteDepartment, updateDepartment, toggleDepartmentStatus } from '../apis/department.api';

/* ─── colour palettes (cycle per index) ─────────────────────────────── */
const PALETTES = [
    { accent: 'from-blue-500 to-indigo-600',   badge: 'bg-blue-100 text-blue-800',     text: 'text-blue-700'   },
    { accent: 'from-violet-500 to-purple-600', badge: 'bg-violet-100 text-violet-800', text: 'text-violet-700' },
    { accent: 'from-emerald-500 to-teal-600',  badge: 'bg-emerald-100 text-emerald-800',text: 'text-emerald-700'},
    { accent: 'from-orange-500 to-amber-500',  badge: 'bg-orange-100 text-orange-800', text: 'text-orange-700' },
    { accent: 'from-rose-500 to-pink-600',     badge: 'bg-rose-100 text-rose-800',     text: 'text-rose-700'   },
];

/* ─── keyframes injected once ────────────────────────────────────────── */
const MODAL_STYLE = `
    @keyframes modalPop {
        from { opacity:0; transform:scale(0.93) translateY(12px); }
        to   { opacity:1; transform:scale(1)    translateY(0);    }
    }
`;

const DepartmentWFullCard = ({ initialDepartment, employeeCount = 0, index = 0 }) => {
    const [department, setDepartment]       = useState(initialDepartment);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast]                 = useState(null);
    const [editData, setEditData]           = useState({
        _id: department._id,
        name: department.name,
        description: department.description,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const palette = PALETTES[index % PALETTES.length];

    const fmt = (d) =>
        new Date(d).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const openEdit = () => {
        setEditData({ _id: department._id, name: department.name, description: department.description });
        setShowEditModal(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateDepartment(editData);
            setDepartment({ ...department, ...editData, updatedAt: new Date().toISOString() });
            setShowEditModal(false);
            showToast('Department updated successfully!');
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteDepartment(department._id);
            setIsDeleted(true);
            setShowDeleteModal(false);
            showToast('Department deleted!');
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleToggleStatus = async () => {
        setIsToggling(true);
        try {
            const res = await toggleDepartmentStatus(department._id);
            if (res?.data) {
                setDepartment(prev => ({ ...prev, isActive: res.data.isActive }));
                showToast(res.data.isActive ? 'Department enabled!' : 'Department disabled!');
            }
        } catch (e) { console.error(e); }
        finally { setIsToggling(false); }
    };

    /* ── deleted state ───────────────────────────────────────────────── */
    if (isDeleted) return (
        <div className="flex items-center space-x-4 bg-red-50 border border-red-200 rounded-2xl px-6 py-5">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
                <p className="font-semibold text-red-800">Department Deleted</p>
                <p className="text-sm text-red-500 mt-0.5">Removed from the system successfully.</p>
            </div>
        </div>
    );

    /* ── card ────────────────────────────────────────────────────────── */
    return (
        <>
            {/* Toast — rendered via portal so it's always on top */}
            {toast && createPortal(
                <div className="fixed top-5 right-5 z-[9999] flex items-center space-x-2 bg-white border border-green-300 text-green-700 shadow-xl rounded-2xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{toast}</span>
                </div>,
                document.body
            )}

            {/* Card */}
            <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 flex">
                {/* Left colour accent bar */}
                <div className={`w-1.5 flex-shrink-0 bg-gradient-to-b ${palette.accent} rounded-l-2xl`} />

                {/* Content */}
                <div className="flex-1 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">

                        {/* Icon + info */}
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                            {/* Icon badge */}
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${palette.accent} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                <Building2 className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Name + active dot */}
                                <div className="flex items-center space-x-2 mb-0.5">
                                    <h3 className={`text-lg font-bold text-gray-900 group-hover:${palette.text} transition-colors duration-200 truncate`}>
                                        {department.name}
                                    </h3>
                                    <span className="flex items-center space-x-1 flex-shrink-0">
                                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${department.isActive !== false ? 'bg-green-400' : 'bg-gray-400'}`} />
                                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${department.isActive !== false ? 'text-green-600' : 'text-gray-400'}`}>
                                            {department.isActive !== false ? 'Active' : 'Disabled'}
                                        </span>
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                                    {department.description || <span className="italic text-gray-400">No description provided.</span>}
                                </p>

                                {/* Meta chips */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${palette.badge}`}>
                                        <Users className="w-3 h-3" />
                                        <span>{employeeCount} {employeeCount === 1 ? 'Employee' : 'Employees'}</span>
                                    </span>
                                    <span className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                                        <Calendar className="w-3 h-3" />
                                        <span>Created {fmt(department.createdAt)}</span>
                                    </span>
                                    <span className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                                        <Clock className="w-3 h-3" />
                                        <span>Updated {fmt(department.updatedAt)}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 flex-shrink-0 pt-0.5">
                            <button
                                onClick={openEdit}
                                className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105"
                                title="Edit Department"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                disabled={isToggling}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${
                                    department.isActive !== false
                                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200'
                                        : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
                                }`}
                                title={department.isActive !== false ? 'Disable Department' : 'Enable Department'}
                            >
                                {isToggling ? (
                                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    department.isActive !== false
                                        ? <AlertTriangle className="w-3.5 h-3.5" />
                                        : <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                <span>{department.isActive !== false ? 'Disable' : 'Enable'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Edit Modal (portal — always centred over the page) ── */}
            {showEditModal && createPortal(
                <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4 py-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <style>{MODAL_STYLE}</style>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-950/40 to-black/60 backdrop-blur-sm"
                        onClick={() => setShowEditModal(false)}
                    />
                    {/* Panel */}
                    <div
                        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        style={{ animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
                    >
                        {/* Gradient header */}
                        <div className={`bg-gradient-to-r ${palette.accent} px-5 pt-4 pb-5`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Edit Department</p>
                                        <h2 className="text-lg font-bold text-white leading-tight">{editData.name}</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-1.5 bg-white/10 hover:bg-white/25 border border-white/20 rounded-lg transition-all duration-200"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                                <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-2.5 py-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <span className="text-white/80 text-[11px] font-medium">Active</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-2.5 py-1">
                                    <Users className="w-3 h-3 text-white/80" />
                                    <span className="text-white/80 text-[11px] font-medium">{employeeCount} {employeeCount === 1 ? 'Employee' : 'Employees'}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-white/10 rounded-lg px-2.5 py-1">
                                    <Calendar className="w-3 h-3 text-white/80" />
                                    <span className="text-white/80 text-[11px] font-medium">{fmt(department.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* White body */}
                        <div className="bg-white px-5 py-4 space-y-3">
                            <div>
                                <label className="flex items-center space-x-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                                    <Hash className="w-3 h-3" /><span>Department Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter department name"
                                />
                            </div>

                            <div>
                                <label className="flex items-center space-x-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                                    <FileText className="w-3 h-3" /><span>Description</span>
                                </label>
                                <textarea
                                    value={editData.description}
                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Enter department description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                                    <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Created</p>
                                    <p className="text-indigo-800 text-xs font-medium">{fmt(department.createdAt)}</p>
                                </div>
                                <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
                                    <p className="text-violet-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Last Updated</p>
                                    <p className="text-violet-800 text-xs font-medium">{fmt(department.updatedAt)}</p>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-1">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || !editData.name.trim() || !editData.description.trim()}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Delete Modal (portal) ──────────────────────────────── */}
            {showDeleteModal && createPortal(
                <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4 py-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <style>{MODAL_STYLE}</style>
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                        style={{ animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
                    >
                        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
                        <div className="px-6 py-5">
                            <div className="flex items-start space-x-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Delete Department</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                                <p className="text-sm text-red-800">
                                    Are you sure you want to delete <strong>"{department.name}"</strong>?
                                    This will permanently remove the department and all associated data.
                                </p>
                                {employeeCount > 0 && (
                                    <p className="text-sm text-red-700 font-semibold mt-2">
                                        ⚠️ {employeeCount} active {employeeCount === 1 ? 'employee is' : 'employees are'} assigned.
                                    </p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={true}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default DepartmentWFullCard;