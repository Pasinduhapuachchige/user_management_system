import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Menu,
    Bell,
    Search,
    User,
    ChevronDown,
    UserCircle,
    LogOut,
    Filter,
    X,
    Clock,
    Users,
    Building2,
    FileText,
    Settings,
    BarChart3,
    AlertCircle,
    Command,
    Send,
    Check,
    CheckCheck,
    Trash2,
    Plus
} from 'lucide-react';
import { logoutApi } from '../apis/logout.api';
import { getEmployeesApi } from '../apis/employee.api';
import { fetchDepartmentsApi } from '../apis/department.api';
import { getEmpEpf } from '../apis/epf.api';
import { useUserStore } from '../tools/user.zustand';
import { useNavigate } from 'react-router-dom';
import { getNotificationsApi, markReadApi, markAllReadApi, deleteNotificationApi } from '../apis/notification.api';
import NotificationModal from './NotificationModal';
import { createPortal } from 'react-dom';

const SearchModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [recentSearches, setRecentSearches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [epfRecords, setEpfRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const searchInputRef = useRef(null);
    const debounceRef = useRef(null);

    const systemNavigation = [
        { title: 'Dashboard', url: '/dashboard', description: 'Main dashboard with overview and key metrics', keywords: ['dashboard', 'home', 'overview', 'main', 'metrics', 'summary'] },
        { title: 'Employees', url: '/employees', description: 'Complete employee directory with profiles and information', keywords: ['employees', 'staff', 'workers', 'personnel', 'team members', 'directory', 'profiles'] },
        { title: 'Departments', url: '/departments', description: 'Manage organizational departments and their structure', keywords: ['departments', 'divisions', 'sections', 'units', 'organization', 'structure', 'teams'] },
        { title: 'EPF Entries', url: '/epf', description: 'View and manage all EPF contribution records and history', keywords: ['epf', 'provident', 'fund', 'entries', 'records', 'contributions', 'history', 'payments'] },
        { title: 'Admins', url: '/admins', description: 'System administrators and their access permissions', keywords: ['admins', 'administrators', 'users', 'management', 'permissions', 'access', 'system'] },
    ];

    const filters = [
        { id: 'all', label: 'All', icon: Search, color: 'text-indigo-400' },
        { id: 'navigation', label: 'Navigation', icon: BarChart3, color: 'text-purple-400' },
        { id: 'employees', label: 'Employees', icon: Users, color: 'text-blue-400' },
        { id: 'departments', label: 'Departments', icon: Building2, color: 'text-green-400' },
    ];

    const fetchEmployees = async (query) => {
        if (!query || query.trim().length < 2) {
            setEmployees([]);
            return;
        }
        setLoading(true);
        try {
            const response = await getEmployeesApi({ search: query.trim() });
            setEmployees(response.data || response || []);
        } catch (err) {
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async (query) => {
        if (!query || query.trim().length < 2) {
            setDepartments([]);
            return;
        }
        setLoading(true);
        try {
            const response = await fetchDepartmentsApi({ search: query.trim() });
            setDepartments(response.data || response || []);
        } catch (err) {
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (searchQuery) {
            debounceRef.current = setTimeout(() => {
                if (selectedFilter === 'all') {
                    fetchEmployees(searchQuery);
                    fetchDepartments(searchQuery);
                } else if (selectedFilter === 'employees') {
                    fetchEmployees(searchQuery);
                } else if (selectedFilter === 'departments') {
                    fetchDepartments(searchQuery);
                }
            }, 300);
        }
    }, [searchQuery, selectedFilter]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
                        <Search className="text-slate-400 w-6 h-6" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search employees, departments..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-800 text-lg placeholder-slate-400"
                            autoFocus
                        />
                        <div className="flex items-center space-x-2 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Command className="w-3 h-3" />
                            <span>ESC</span>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-slate-400 text-sm">Searching records...</p>
                            </div>
                        ) : searchQuery ? (
                            <div className="space-y-6">
                                {employees.length > 0 && (
                                    <div>
                                        <h4 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Employees</h4>
                                        <div className="space-y-1">
                                            {employees.map(emp => (
                                                <button key={emp._id} onClick={() => { window.location.href = `/employees?emp=${emp._id}`; onClose(); }} className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-all group flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">{emp.name?.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                                                        <p className="text-xs text-slate-400">{emp.epfNo} • {emp.department?.name || 'No Dept'}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {departments.length > 0 && (
                                    <div>
                                        <h4 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Departments</h4>
                                        <div className="space-y-1">
                                            {departments.map(dept => (
                                                <button key={dept._id} onClick={() => { window.location.href = `/departments?dept=${dept._id}`; onClose(); }} className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-all group flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all"><Building2 className="w-5 h-5" /></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                                                        <p className="text-xs text-slate-400">{dept.description?.substring(0, 50)}...</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <Search className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                <p className="text-slate-400 text-sm">Start searching for records...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Notification Bell Dropdown ───────────────────────────────────────────────
const NotificationBell = ({ user }) => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [bellPos, setBellPos] = useState({ top: 0, right: 0 });
    const bellRef = useRef(null);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const fetchNotifs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getNotificationsApi();
            setNotifications(res.data || []);
        } catch { }
        finally { setLoading(false); }
    }, []);

    // Fetch on mount and every 30s
    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifs]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkOne = async (id) => {
        await markReadApi(id);
        setNotifications((prev) =>
            prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
        );
    };

    const handleMarkAll = async () => {
        await markAllReadApi();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        await deleteNotificationApi(id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    };

    const formatTime = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const getRoleBadge = (role) => {
        if (role === 'all') return { label: 'Everyone', color: 'bg-purple-100 text-purple-600' };
        if (role === 'employee') return { label: 'Employees', color: 'bg-blue-100 text-blue-600' };
        return { label: 'HR Admins', color: 'bg-emerald-100 text-emerald-600' };
    };

    return (
        <div className="relative" ref={bellRef}>
            {/* Bell Button */}
            <button
                id="notification-bell-btn"
                onClick={() => {
                    if (!open && bellRef.current) {
                        const rect = bellRef.current.getBoundingClientRect();
                        setBellPos({
                            top: rect.bottom + 8,
                            right: window.innerWidth - rect.right,
                        });
                        fetchNotifs();
                    }
                    setOpen(!open);
                }}
                className="p-3 text-slate-400 hover:text-indigo-600 rounded-2xl hover:bg-white transition-all relative group"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-rose-500 rounded-full border-2 border-slate-50 flex items-center justify-center text-[9px] font-black text-white group-hover:scale-110 transition-transform">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {unreadCount === 0 && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-50 opacity-0" />
                )}
            </button>

            {/* Dropdown */}
            {open && createPortal(
                <div
                    className="fixed w-96 bg-white rounded-3xl shadow-2xl shadow-indigo-200/40 border border-slate-200 overflow-hidden z-[1000] animate-fadeIn"
                    style={{ top: `${bellPos.top}px`, right: `${bellPos.right}px` }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-black text-slate-900">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    className="flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>All read</span>
                                </button>
                            )}
                            {user?.role === 'superadmin' && (
                                <button
                                    id="send-notification-btn"
                                    onClick={() => { setOpen(false); setShowModal(true); }}
                                    className="flex items-center space-x-1 text-[11px] font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 rounded-xl hover:shadow-md transition-all"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Send</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs text-slate-400">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-14 text-center px-6">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">No notifications yet</p>
                                <p className="text-xs text-slate-300 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => {
                                    const badge = getRoleBadge(notif.targetRole);
                                    return (
                                        <div
                                            key={notif._id}
                                            onClick={() => !notif.isRead && handleMarkOne(notif._id)}
                                            className={`group flex items-start space-x-3 px-5 py-4 cursor-pointer transition-all hover:bg-slate-50 ${!notif.isRead ? 'bg-indigo-50/40' : ''
                                                }`}
                                        >
                                            {/* Unread dot */}
                                            <div className="flex-shrink-0 mt-1.5">
                                                {notif.isRead ? (
                                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm leading-tight ${notif.isRead ? 'font-medium text-slate-600' : 'font-black text-slate-900'
                                                        }`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notif.isRead && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMarkOne(notif._id); }}
                                                                className="p-1 rounded-lg hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-all"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        {user?.role === 'superadmin' && (
                                                            <button
                                                                onClick={(e) => handleDelete(notif._id, e)}
                                                                className="p-1 rounded-lg hover:bg-rose-100 text-rose-300 hover:text-rose-500 transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-100 text-center">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            , document.body)}

            {/* Send Notification Modal (superadmin) */}
            <NotificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSent={fetchNotifs}
            />
        </div>
    );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar = ({ setSidebarOpen, currentPage }) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user } = useUserStore();
    const navigate = useNavigate();

    const getPageTitle = (path) => {
        const titles = {
            'dashboard': 'Control Center',
            'employees': 'Staff Directory',
            'employees/add': 'Add Employee',
            'departments': 'Organization',
            'departments/add': 'New Department',
            'epf': 'Claim History',
            'epf/add': 'New Medical Entry',
            'admins': 'Access Control',
            'admins/add': 'New Admin',
            'settings/epf': 'Limit Enhancement',
            'reports': 'Performance Hub',
            'profile': 'My Workspace'
        };
        return titles[path] || 'Dashboard';
    };

    const handleLogout = async () => {
        await logoutApi();
        navigate('/login');
    };

    return (
        <>
            <div className="h-24 px-6 flex items-center justify-center sticky top-0 z-40 bg-slate-50/50 backdrop-blur-xl border-b border-slate-200/40">
                <div className="w-full flex items-center justify-between max-w-[1600px]">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all hover:scale-105 active:scale-95"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                                <span>{getPageTitle(currentPage)}</span>
                            </h2>
                            <div className="flex items-center space-x-2 mt-1 px-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search Action */}
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="hidden md:flex items-center space-x-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 transition-all group hover:shadow-lg shadow-indigo-100"
                        >
                            <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-600">Quick search...</span>
                            <div className="flex items-center space-x-1 px-2 py-0.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-300">
                                <Command className="w-2.5 h-2.5" />
                                <span>F</span>
                            </div>
                        </button>

                        <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 ml-4">
                            <NotificationBell user={user} />

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="p-1 px-2 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all flex items-center space-x-3 shadow-sm"
                                >
                                    <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="hidden sm:block text-left pr-2">
                                        <p className="text-[12px] font-black text-slate-900 leading-none">{user?.name || 'Staff Member'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role || 'Member'}</p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-indigo-200/40 border border-slate-200 p-2 animate-fadeIn z-50">
                                        <div className="p-4 border-b border-slate-50 mb-1">
                                            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                            <p className="text-xs text-slate-400">{user?.email}</p>
                                        </div>
                                        <button onClick={() => { navigate('/profile'); setIsProfileDropdownOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                                            <UserCircle className="w-5 h-5 text-slate-400" />
                                            <span className="font-semibold">My Profile</span>
                                        </button>

                                        {user?.role !== 'employee' && (
                                            <button onClick={() => { navigate('/settings/epf'); setIsProfileDropdownOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                                                <Settings className="w-5 h-5 text-slate-400" />
                                                <span className="font-semibold">System Preferences</span>
                                            </button>
                                        )}
                                        <div className="h-px bg-slate-50 my-1 mx-4"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                                            <LogOut className="w-5 h-5" />
                                            <span className="font-black">Secure Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        </>
    );
};

export default Topbar;