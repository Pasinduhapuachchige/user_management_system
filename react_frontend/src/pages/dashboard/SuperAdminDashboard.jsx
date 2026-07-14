import React, { useState, useEffect } from 'react';
import {
    Users, Building2, Shield, UserCog, Activity, Zap, TrendingUp,
    ShieldCheck, Lock, Key, UserPlus, Settings, Database, Bell,
    Cpu, Server, Globe, Terminal, ChevronRight, AlertCircle,
    Download, PieChart as PieIcon, BarChart3, Clock, Share2,
    RefreshCw, HardDrive, FileBarChart, Upload
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
    Legend
} from 'recharts';
import Tab from '../../layout/Tab';
import TabHeader from '../../components/TabHeader';
import { useNavigate } from 'react-router-dom';
import { 
    getStatsApi, 
    getSystemHealthApi, 
    getRecentActivityApi,
    getDepartmentStatsApi,
    getEpfMonthlyContributionApi
} from '../../apis/stats.api';

const SuperAdminDashboard = ({ currentPath }) => {
    const navigate = useNavigate();
    // --- State ---
    const [stats, setStats] = useState({});
    const [health, setHealth] = useState(null);
    const [activities, setActivities] = useState([]);
    const [deptData, setDeptData] = useState([]);
    const [epfTrends, setEpfTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    // --- Fetch Logic ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [statsRes, healthRes, activityRes, deptRes, epfRes] = await Promise.all([
                    getStatsApi(),
                    getSystemHealthApi(),
                    getRecentActivityApi(),
                    getDepartmentStatsApi(),
                    getEpfMonthlyContributionApi()
                ]);

                if (statsRes.success) setStats(statsRes.data);
                if (healthRes.success) setHealth(healthRes.data);
                if (activityRes.success) setActivities(activityRes.data);
                if (deptRes.success) setDeptData(deptRes.data);
                if (epfRes.success) setEpfTrends(epfRes.data);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const QuickAction = ({ icon: Icon, label, description, onClick, colorGradient }) => (
        <button
            onClick={onClick}
            className="group relative glass-card p-6 rounded-[2rem] border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all duration-500 text-left overflow-hidden bg-slate-900/40 backdrop-blur-3xl"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorGradient} opacity-5 group-hover:opacity-10 transition-opacity blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 duration-700`}></div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorGradient} p-0.5 shadow-lg group-hover:rotate-6 transition-all duration-500 mb-6`}>
                <div className="w-full h-full bg-slate-900/60 backdrop-blur-md rounded-[0.9rem] flex items-center justify-center text-white">
                    <Icon className="w-7 h-7" />
                </div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{label}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{description}</p>
            <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                <span>Execute Protocol</span>
                <ChevronRight className="w-3 h-3 ml-1" />
            </div>
        </button>
    );

    return (
        <Tab>
            <TabHeader
                title="Super Admin Control Center"
                subtitle="High-level system overview and administrative protocols"
                currentPath={currentPath}
            />

            <div className="p-1 space-y-8 animate-fadeIn pb-20">
                {/* 1. Hero Hub (Main Stats) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Admin Count */}
                    <div className="glass-card group rounded-[2.5rem] p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500 opacity-5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-110 duration-1000"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20 text-amber-400">
                                <Shield className="w-8 h-8 text-amber-400" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Guardians</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter font-outfit mb-4">{loading ? '...' : stats.adminUsersCount}</h2>
                            <div className="inline-flex items-center space-x-2 bg-amber-500/10 px-3 py-1 rounded-full backdrop-blur-md border border-amber-500/20 text-amber-400">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Auth Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Employee Count */}
                    <div className="glass-card group rounded-[2.5rem] p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 opacity-5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-110 duration-1000"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-400">
                                <Users className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Staff Density</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter font-outfit mb-4">{loading ? '...' : stats.employees?.totalEmployees}</h2>
                            <div className="flex items-center text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4 mr-1.5" />
                                <span>Core Population</span>
                            </div>
                        </div>
                    </div>

                    {/* Spending Summary */}
                    <div className="glass-card group rounded-[2.5rem] p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 opacity-5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-110 duration-1000"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 text-indigo-400">
                                <Activity className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Yearly Spending</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter font-outfit mb-4">
                                {loading ? '...' : (stats.epfThisYear?.totalEpfThisYear / 1000).toFixed(0)}K
                            </h2>
                            <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4 mr-1.5" />
                                <span>Total Medical Claims</span>
                            </div>
                        </div>
                    </div>

                    {/* Health Status Dashboard */}
                    <div className="glass-card group rounded-[2.5rem] p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500 opacity-5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-110 duration-1000"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 text-cyan-400">
                                <Zap className="w-8 h-8 text-cyan-400" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Cluster Integrity</p>
                            <h2 className={`text-3xl font-black tracking-tight uppercase mb-4 ${
                                loading ? 'text-slate-400' : (health?.database === 'connected' ? 'text-cyan-400' : 'text-rose-400')
                            }`}>
                                {loading ? 'Checking...' : (health?.database === 'connected' ? 'Optimal' : 'Degraded')}
                            </h2>
                            <div className="flex items-center space-x-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                <Globe className="w-3 h-3 text-cyan-400" />
                                <span>DB Node: {health?.database || 'Pending'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Advanced Analytics Layer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Monthly Trends Chart */}
                    <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Financial Velocity</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Medical Spending (Last 12 Months)</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={epfTrends}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                    <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                                        itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Distribution Pie */}
                    <div className="glass-card p-10 rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 flex flex-col items-center">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 self-start">Grid Allocation</h3>
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deptData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={10}
                                        dataKey="value"
                                    >
                                        {deptData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-white">{stats.employees?.totalEmployees}</span>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Staff Members</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-8">
                            {deptData.slice(0, 4).map((dept, index) => (
                                <div key={dept.name} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <span className="text-[10px] font-bold text-slate-400 truncate uppercase">{dept.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Action Protocol Hub */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center">
                            <Shield className="w-6 h-6 mr-3 text-indigo-500" />
                            Security Protocol Nexus
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <QuickAction 
                            icon={UserPlus} 
                            label="Auth Provision" 
                            description="Forge new high-level administrative credentials."
                            colorGradient="from-blue-600 to-indigo-600"
                            onClick={() => navigate('/admins/add')}
                        />
                        <QuickAction 
                            icon={Upload} 
                            label="Force Import" 
                            description="Execute mass data synchronization via legacy grid protocols."
                            colorGradient="from-emerald-600 to-teal-600"
                            onClick={() => navigate('/reports')}
                        />
                         <QuickAction 
                            icon={Database} 
                            label="State Backup" 
                            description="Serialize master database state to encrypted cold storage."
                            colorGradient="from-indigo-600 to-purple-600"
                            onClick={() => navigate('/settings/epf')}
                        />
                        <QuickAction 
                            icon={FileBarChart} 
                            label="Master Ledger" 
                            description="Generate Organization-wide medical spending analytics."
                            colorGradient="from-slate-700 to-slate-900"
                            onClick={() => navigate('/reports')}
                        />
                    </div>
                </div>

                {/* 4. Live Stream (Recent Activity) */}
                <div className="glass-card p-10 rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
                        <div>
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Audit Pipeline</div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Activity Stream</h2>
                        </div>
                        <div className="flex items-center space-x-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Watching 104 Nodes</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center text-slate-500">
                                <RefreshCw className="w-8 h-8 animate-spin" />
                            </div>
                        ) : activities.map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/item">
                                <div className="flex items-center space-x-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        activity.type === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                    } border border-white/5`}>
                                        {activity.type === 'admin' ? <Shield className="w-6 h-6" /> : <UserCog className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white group-hover/item:text-indigo-400 transition-colors uppercase">{activity.title}</p>
                                        <p className="text-xs text-slate-500 font-bold">{activity.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(activity.time).toLocaleDateString()}</p>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Tab>
    );
};

export default SuperAdminDashboard;
