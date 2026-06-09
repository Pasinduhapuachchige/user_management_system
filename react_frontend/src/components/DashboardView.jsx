import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    DollarSign,
    Wallet,
    UserPlus,
    UserMinus,
    Shield,
    Baby,
    Plus,
    Settings,
    FileText,
    Calendar,
    Clock,
    AlertTriangle,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Search,
    Bell,
    Star,
    Award,
    Zap,
    Target,
    MoreHorizontal,
    ChevronRight,
    Gift,
    MapPin,
    Phone,
    Mail,
    UserCheck,
    Heart,
    GraduationCap,
    Filter,
    ArrowUpDown,
    Grid,
    List,
    Layers,
    Share2,
    Database,
    HardDrive,
    ShieldCheck,
    Trophy
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { getStatsApi, getDepartmentStatsApi, getEpfMonthlyContributionApi } from '../apis/stats.api';

const DashboardView = () => {
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState({});
    const [departmentData, setDepartmentData] = useState([]);
    const [loading, setLoading] = useState({
        stats: true,
        departments: true,
        epf: true
    });

    const [departmentViewMode, setDepartmentViewMode] = useState('pie');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('count');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsResponse = await getStatsApi();
                if (statsResponse.success) {
                    setStats({
                        totalEmployees: statsResponse.data.employees.totalEmployees,
                        employeeChange: statsResponse.data.employees.change,
                        employeeChangeType: statsResponse.data.employees.type,
                        departmentCount: statsResponse.data.departmentCount,
                        totalEpfThisYear: statsResponse.data.epfThisYear.totalEpfThisYear,
                        epfChange: statsResponse.data.epfThisYear.change,
                        epfChangeType: statsResponse.data.epfThisYear.type,
                        adminUsersCount: statsResponse.data.adminUsersCount
                    });
                }
            } catch (error) {
                console.error('Error fetching stats data:', error);
            } finally {
                setLoading(prev => ({ ...prev, stats: false }));
            }

            try {
                const departmentResponse = await getDepartmentStatsApi();
                if (departmentResponse.success) {
                    setDepartmentData(departmentResponse.data);
                }
            } catch (error) {
                console.error('Error fetching department data:', error);
            } finally {
                setLoading(prev => ({ ...prev, departments: false }));
            }

            try {
                const epfResponse = await getEpfMonthlyContributionApi();
                if (epfResponse.success) {
                    setChartData({ epfTrend: epfResponse.data });
                }
            } catch (error) {
                console.error('Error fetching EPF data:', error);
            } finally {
                setLoading(prev => ({ ...prev, epf: false }));
            }
        };

        fetchDashboardData();
    }, []);

    const filteredDepartmentData = departmentData
        .filter(dept => dept.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'name') {
                return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            } else {
                return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
            }
        });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-black text-white">
                        LKR {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const GlassStatCard = ({ icon: Icon, title, value, change, changeType, colorGradient, link }) => (
        <div
            onClick={() => link && (window.location.href = link)}
            className={`glass-card group p-6 rounded-[2rem] border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-${colorGradient.split('-')[1]}/10 cursor-pointer`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorGradient} opacity-5 group-hover:opacity-10 transition-opacity blur-3xl rounded-full -mr-16 -mt-16`}></div>

            <div className="flex items-start justify-between relative z-10 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorGradient} p-0.5 shadow-lg group-hover:scale-110 transition-all duration-500`}>
                    <div className="w-full h-full bg-slate-900/40 backdrop-blur-md rounded-[0.9rem] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                </div>
                {change && (
                    <div className={`flex items-center space-x-1 text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md border ${changeType === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {changeType === 'positive' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
                <div className="flex items-baseline space-x-2">
                    <h3 className="text-3xl font-black text-white tracking-tighter font-outfit">
                        {loading.stats ? '...' : value}
                    </h3>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Context Audit</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
            </div>
        </div>
    );

    const QuickActionItem = ({ icon: Icon, label, color, link, desc }) => (
        <div
            onClick={() => window.location.href = link}
            className="group flex flex-col items-center p-4 rounded-[2rem] bg-slate-950/20 border border-white/5 hover:border-white/10 hover:bg-slate-950/40 transition-all duration-300 cursor-pointer text-center"
        >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow-lg shadow-${color.split('-')[1]}/20 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon className="w-full h-full" />
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{label}</span>
            <span className="text-[9px] font-bold text-slate-500 tracking-wide line-clamp-1">{desc}</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-12">


            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <QuickActionItem icon={Layers} label="New Intel" color="from-blue-500 to-indigo-600" link="/epf/add" desc="Medical Record" />
                <QuickActionItem icon={UserPlus} label="Draft Entry" color="from-emerald-500 to-teal-600" link="/employees/add" desc="New Employee" />
                <QuickActionItem icon={Building2} label="Node Add" color="from-purple-500 to-indigo-600" link="/departments/add" desc="Department" />
                <QuickActionItem icon={Settings} label="System Config" color="from-orange-500 to-amber-600" link="/settings/epf" desc="Medical Rules" />
                <QuickActionItem icon={ShieldCheck} label="Vault Sync" color="from-rose-500 to-pink-600" link="/settings/backup" desc="System Backup" />
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassStatCard
                    icon={Users}
                    title="Total Population"
                    value={stats.totalEmployees?.toLocaleString()}
                    change={stats.employeeChange}
                    changeType={stats.employeeChangeType}
                    colorGradient="from-blue-600 to-indigo-600"
                    link="/employees"
                />
                <GlassStatCard
                    icon={Wallet}
                    title="Vault Payouts"
                    value={stats.totalEpfThisYear ? `${(stats.totalEpfThisYear / 1000000).toFixed(2)}M` : '0.00M'}
                    change={stats.epfChange}
                    changeType={stats.epfChangeType}
                    colorGradient="from-emerald-600 to-teal-600"
                    link="/epf"
                />
                <GlassStatCard
                    icon={Building2}
                    title="Logic Sections"
                    value={stats.departmentCount}
                    colorGradient="from-amber-600 to-orange-600"
                    link="/departments"
                />
                <GlassStatCard
                    icon={Shield}
                    title="Node Guardians"
                    value={stats.adminUsersCount}
                    colorGradient="from-rose-600 to-pink-600"
                    link="/admins"
                />
            </div>

            {/* Middle Section - Analytics & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* EPF Chart */}
                <div className="lg:col-span-8 glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Financial Analysis</div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Medical Outflow</h3>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Yearly Cycle</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.epfTrend || []}>
                                <defs>
                                    <linearGradient id="epfGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="rgba(255,255,255,0.3)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.3)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${(value / 1000)}K`}
                                    tick={{ fill: '#64748b', fontWeight: 900 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#epfGradient)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="bg-slate-950/40 px-4 py-2 rounded-xl border border-white/5 flex items-center space-x-3">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Growth Peak Identified</span>
                        </div>
                        <div className="bg-slate-950/40 px-4 py-2 rounded-xl border border-white/5 flex items-center space-x-3">
                            <Database className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Real-time Sync Active</span>
                        </div>
                    </div>
                </div>

                {/* Dept Distribution */}
                <div className="lg:col-span-4 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Human Resources</div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Population Grid</h3>
                        </div>
                        <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setDepartmentViewMode('pie')}
                                className={`p-2 rounded-lg transition-all ${departmentViewMode === 'pie' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDepartmentViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${departmentViewMode === 'list' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {departmentViewMode === 'pie' ? (
                            <div className="relative flex-1 flex flex-col justify-center">
                                <div className="h-[240px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={departmentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={95}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {departmentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#f59e0b'} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3 mt-6 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                    {departmentData.map((dept, index) => (
                                        <div key={index} className="flex items-center justify-between group cursor-default">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color || '#f59e0b' }}></div>
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{dept.name}</span>
                                            </div>
                                            <span className="text-sm font-black text-white">{dept.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                                {filteredDepartmentData.map((dept, index) => (
                                    <div key={index} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-sm font-black text-white uppercase group-hover:scale-110 transition-transform">
                                                {dept.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-white uppercase tracking-widest">{dept.name}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department Node</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-white font-outfit">{dept.value}</div>
                                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Assets</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;