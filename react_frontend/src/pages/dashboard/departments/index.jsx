import React, { useEffect, useState, useMemo } from 'react';
import Tab from '../../../layout/Tab';
import DepartmentWFullCard from '../../../components/DepartmentWFullCard';
import { fetchDepartmentsApi } from '../../../apis/department.api';
import { getDepartmentStatsApi } from '../../../apis/stats.api';
import { useSearchParams } from 'react-router-dom';
import {
    Building2,
    Search,
    X,
    Filter,
    Users,
    TrendingUp,
    RefreshCw,
    SortAsc,
    SortDesc
} from 'lucide-react';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const DepartmentSkeleton = () => (
    <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden animate-pulse">
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div>
                        <div className="h-5 bg-gray-200 rounded-lg w-40 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-28" />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <div className="w-24 h-8 bg-gray-200 rounded-full" />
                    <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                    <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                </div>
            </div>
        </div>
        <div className="px-6 py-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-4 bg-gray-100 rounded w-3/5" />
            <div className="flex justify-between pt-2 border-t border-gray-100">
                <div className="h-3 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-28" />
            </div>
        </div>
    </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-white/70 text-[11px] font-medium uppercase tracking-wide">{label}</p>
            <p className="text-white text-xl font-bold leading-tight">{value}</p>
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const DepartmentsList = ({ currentPath }) => {
    const [departments, setDepartments] = useState([]);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const deptId = searchParams.get('dept');

    const loadData = async () => {
        try {
            setIsLoading(true);
            const query = deptId ? { _id: deptId } : {};
            const [departmentsRes, statsRes] = await Promise.all([
                fetchDepartmentsApi(query),
                getDepartmentStatsApi()
            ]);
            setDepartments(departmentsRes.data);
            setDepartmentStats(statsRes.data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [deptId]);

    const filteredDepartments = useMemo(() => {
        if (!searchTerm.trim()) return departments;
        return departments.filter(d =>
            d.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
    }, [departments, searchTerm]);

    const departmentsWithStats = useMemo(() =>
        filteredDepartments.map(department => {
            const stats = departmentStats.find(s => s.name === department.name);
            return { ...department, employeeCount: stats?.value || 0 };
        }),
        [filteredDepartments, departmentStats]
    );

    const sortedDepartments = useMemo(() => {
        const list = [...departmentsWithStats];
        return list.sort((a, b) => {
            let aValue, bValue;
            if (sortBy === 'name') {
                aValue = a.name?.toLowerCase() || '';
                bValue = b.name?.toLowerCase() || '';
                return sortOrder === 'asc' 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            } else if (sortBy === 'employeeCount') {
                aValue = a.employeeCount || 0;
                bValue = b.employeeCount || 0;
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            } else if (sortBy === 'createdAt') {
                aValue = new Date(a.createdAt || 0);
                bValue = new Date(b.createdAt || 0);
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [departmentsWithStats, sortBy, sortOrder]);

    const totalEmployees = useMemo(() =>
        departmentStats.reduce((sum, s) => sum + (s.value || 0), 0),
        [departmentStats]
    );

    return (
        <Tab>
            {/* ── Hero Header ───────────────────────────────────────── */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl overflow-hidden mb-6 shadow-xl">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/5 rounded-full" />

                <div className="relative px-6 pt-6 pb-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/15 border border-white/25 shadow-lg rounded-xl p-3">
                                <Building2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Department Management</h1>
                                <p className="text-blue-100 text-sm mt-0.5">Manage your organizational structure and teams</p>
                            </div>
                        </div>
                        <button
                            onClick={loadData}
                            disabled={isLoading}
                            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <StatCard icon={Building2} label="Total Departments" value={isLoading ? '—' : departments.length} />
                        <StatCard icon={Users} label="Total Employees" value={isLoading ? '—' : totalEmployees} />
                        <StatCard icon={TrendingUp} label="Showing" value={isLoading ? '—' : departmentsWithStats.length} />
                    </div>
                </div>
            </div>

            {/* ── Search / Filter bar ───────────────────────────────── */}
            <div className="mb-4">
                {deptId ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Filter className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-blue-800">Filtered by Department ID</p>
                                <p className="text-xs text-blue-500 font-mono mt-0.5">{deptId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSearchParams({})}
                            className="flex items-center space-x-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Clear Filter</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search departments by name…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Sort Controls */}
                        <div className="flex items-center space-x-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-sm border border-gray-200 bg-white rounded-2xl px-4 py-3 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="employeeCount">Sort by Employee Count</option>
                                <option value="createdAt">Sort by Date Created</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors duration-200 text-gray-600 flex items-center justify-center cursor-pointer"
                                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                            >
                                {sortOrder === 'asc' ? (
                                    <SortAsc className="w-5 h-5" />
                                ) : (
                                    <SortDesc className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Results label ─────────────────────────────────────── */}
            {!isLoading && (
                <div className="mb-3 px-1">
                    <p className="text-sm text-gray-500">
                        {searchTerm ? (
                            <><strong className="text-gray-700">{departmentsWithStats.length}</strong> result{departmentsWithStats.length !== 1 ? 's' : ''} for "<span className="text-blue-600 font-medium">{searchTerm}</span>"</>
                        ) : (
                            <><strong className="text-gray-700">{departmentsWithStats.length}</strong> department{departmentsWithStats.length !== 1 ? 's' : ''} found</>
                        )}
                    </p>
                </div>
            )}

            {/* ── Department List ───────────────────────────────────── */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <DepartmentSkeleton key={i} />)}
                </div>
            ) : sortedDepartments.length > 0 ? (
                <div className="space-y-4">
                    {sortedDepartments.map((department, index) => (
                        <div
                            key={department._id}
                            style={{ animation: 'fadeSlideIn 0.35s ease both', animationDelay: `${index * 60}ms` }}
                        >
                            <DepartmentWFullCard
                                initialDepartment={department}
                                employeeCount={department.employeeCount}
                                index={index}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                        <Building2 className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {searchTerm ? 'No Matching Departments' : 'No Departments Yet'}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-xs mb-5">
                        {searchTerm
                            ? `No departments match "${searchTerm}". Try a different search term.`
                            : 'There are no departments in the system at the moment.'}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md"
                        >
                            <X className="w-4 h-4" />
                            <span>Clear Search</span>
                        </button>
                    )}
                </div>
            )}

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Tab>
    );
};

export default DepartmentsList;