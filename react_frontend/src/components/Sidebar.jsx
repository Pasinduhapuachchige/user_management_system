import React, { useState, useEffect } from 'react';
import {
    Home,
    Users,
    Building2,
    Shield,
    UserCog,
    Settings,
    BarChart3,
    X,
    ChevronDown,
    LayoutDashboard
} from 'lucide-react';
import { useUserStore } from '../tools/user.zustand';

const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) => {
    const { user } = useUserStore();

    const isEmployee = user?.role === 'employee';

    const menuItems = [
        ...(!isEmployee ? [{ id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: 'dashboard' }] : []),
        { id: 'profile', label: 'My Profile', icon: Shield, path: 'profile' },
        ...(!isEmployee ? [
            {
                id: 'employees',
                label: 'Teams',
                icon: Users,
                path: 'employees',
                subItems: [
                    { id: 'employees-list', label: 'Directory', path: 'employees' },
                    { id: 'employees-add', label: 'Onboard New', path: 'employees/add' }
                ]
            },
            {
                id: 'departments',
                label: 'Structure',
                icon: Building2,
                path: 'departments',
                subItems: [
                    { id: 'departments-list', label: 'Departments', path: 'departments' },
                    { id: 'departments-add', label: 'Create New', path: 'departments/add' }
                ]
            },
            {
                id: 'epf',
                label: 'Healthcare',
                icon: Shield,
                path: 'epf',
                subItems: [
                    { id: 'epf-list', label: 'Medical Logs', path: 'epf' },
                    { id: 'epf-add', label: 'New Entry', path: 'epf/add' }
                ]
            },
            ...(user?.role === 'superadmin' ? [{
                id: 'admins',
                label: 'System Access',
                icon: UserCog,
                path: 'admins',
                subItems: [
                    { id: 'admins-list', label: 'Administrators', path: 'admins' },
                    { id: 'admins-add', label: 'Provision New', path: 'admins/add' }
                ]
            }] : []),
            {
                id: 'settings',
                label: 'Preferences',
                icon: Settings,
                path: 'settings',
                subItems: [
                    { id: 'settings-epf', label: 'Config Panel', path: 'settings/epf' }
                ]
            },
            { id: 'reports', label: 'Analytics', icon: BarChart3, path: 'reports' }
        ] : [])
    ];

    const [expandedItems, setExpandedItems] = useState({});

    useEffect(() => {
        menuItems.forEach(item => {
            if (item.subItems) {
                const hasActiveSubItem = item.subItems.some(subItem => subItem.path === currentPage);
                if (hasActiveSubItem) {
                    setExpandedItems(prev => ({
                        ...prev,
                        [item.id]: true
                    }));
                }
            }
        });
    }, [currentPage]);

    const toggleExpanded = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleItemClick = (item, subItem = null) => {
        const targetPath = subItem ? subItem.path : item.path;
        setCurrentPage(targetPath);
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <>
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                    }`}
            >
                {/* Brand Header */}
                <div className="flex items-center justify-between h-24 px-8 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group transition-transform hover:scale-105">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                                UMS <span className="text-indigo-600">Pro</span>
                            </h1>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Enterprise</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-8">
                    {/* Menu Section */}
                    <div>
                        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
                            {isEmployee ? 'Service Portal' : 'Core Platform'}
                        </p>
                        <div className="space-y-1.5">
                            {menuItems.map((item) => (
                                <div key={item.id}>
                                    <button
                                        onClick={() => {
                                            if (item.subItems) {
                                                toggleExpanded(item.id);
                                            } else {
                                                handleItemClick(item);
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 text-[14px] font-semibold rounded-2xl transition-all duration-200 group ${currentPage === item.path || (item.subItems && item.subItems.some(si => si.path === currentPage))
                                            ? 'bg-indigo-50/50 text-indigo-700'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon
                                                className={`w-5 h-5 mr-3.5 transition-transform group-hover:scale-110 ${currentPage === item.path || (item.subItems && item.subItems.some(si => si.path === currentPage))
                                                    ? 'text-indigo-600'
                                                    : 'text-slate-400'
                                                    }`}
                                            />
                                            {item.label}
                                        </div>
                                        {item.subItems && (
                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform duration-300 ${expandedItems[item.id] ? 'rotate-180' : ''}`}
                                            />
                                        )}
                                    </button>

                                    {/* Submenu */}
                                    {item.subItems && expandedItems[item.id] && (
                                        <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-1 animate-fadeIn">
                                            {item.subItems.map((subItem) => (
                                                <button
                                                    key={subItem.id}
                                                    onClick={() => handleItemClick(item, subItem)}
                                                    className={`w-full text-left px-4 py-2.5 text-[13px] font-medium rounded-xl transition-all ${currentPage === subItem.path
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                                        }`}
                                                >
                                                    {subItem.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support / Help Section Card */}
                    <div className="px-4">
                        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all"></div>
                            <h3 className="text-white font-bold text-sm mb-1 relative z-10">Need Assistance?</h3>
                            <p className="text-slate-400 text-xs mb-4 relative z-10 leading-relaxed">Access our documentation or contact the technical team.</p>
                            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all relative z-10 border border-white/10">
                                Get Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer User Profile (Mini) */}
                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Staff Member'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.role || 'Member'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;