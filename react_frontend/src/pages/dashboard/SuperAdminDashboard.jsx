import React, { useState, useEffect } from 'react';
import {
    Users,
    Building2,
    Shield,
    UserCog,
    Activity,
    Zap,
    TrendingUp,
    ShieldCheck,
    Lock,
    Key,
    UserPlus,
    Settings,
    Database,
    Bell,
    Cpu,
    Server,
    Globe,
    Terminal,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Tab from '../../layout/Tab';
import TabHeader from '../../components/TabHeader';
import { getStatsApi } from '../../apis/stats.api';

const SuperAdminDashboard = ({ currentPath }) => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getStatsApi();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Error fetching super admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
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
                subtitle="High-level system overview and administrative controls"
                currentPath={currentPath}
            />

            <div className="p-1 space-y-8 animate-fadeIn">
                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card group bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-xl">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">System Guardians</p>
                            <h2 className="text-5xl font-black tracking-tighter font-outfit mb-4">{loading ? '...' : stats.adminUsersCount}</h2>
                            <div className="inline-flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Security</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card group rounded-[2.5rem] p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 opacity-5 rounded-full blur-3xl -mr-24 -mt-24"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-400 shadow-xl">
                                <Users className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Grid Population</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter font-outfit mb-4">{loading ? '...' : stats.employees?.totalEmployees}</h2>
                            <div className="flex items-center text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4 mr-1.5" />
                                <span>Global Data Set</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card group rounded-[2.5rem] p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 opacity-5 rounded-full blur-3xl -mr-24 -mt-24"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 text-indigo-400 shadow-xl">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">System Nodes</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter font-outfit mb-4">{loading ? '...' : stats.departmentCount}</h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Core Mapped Clusters</span>
                        </div>
                    </div>

                    <div className="glass-card group bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 hover:-translate-y-1 border border-white/5">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 opacity-10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-110 duration-1000"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
                                <Zap className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Core Integrity</p>
                            <h2 className="text-3xl font-black text-emerald-400 tracking-tight uppercase mb-4">Optimal</h2>
                            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-emerald-500' : 'bg-emerald-500/20'}`}></div>
                                    ))}
                                </div>
                                <span>Latency 12ms</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exclusive Super Admin Actions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center">
                            <Lock className="w-6 h-6 mr-3 text-indigo-500" />
                            Administrative Protocols
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <QuickAction 
                            icon={UserPlus} 
                            label="Provision Root" 
                            description="Forge new administrative credentials with full system entropy access."
                            colorGradient="from-blue-600 to-indigo-600"
                            onClick={() => window.location.href = '/admins/add'}
                        />
                        <QuickAction 
                            icon={Terminal} 
                            label="Security Log" 
                            description="Stream live authentication events and system-wide state changes."
                            colorGradient="from-indigo-600 to-purple-600"
                            onClick={() => {}}
                        />
                         <QuickAction 
                            icon={Database} 
                            label="Node Backup" 
                            description="Serialize master database state to encrypted cold storage."
                            colorGradient="from-purple-600 to-pink-600"
                            onClick={() => window.location.href = '/backup'}
                        />
                        <QuickAction 
                            icon={Cpu} 
                            label="Core Kernel" 
                            description="Configure system-wide parameters and medical contribution logic."
                            colorGradient="from-slate-700 to-slate-900"
                            onClick={() => window.location.href = '/settings/epf'}
                        />
                    </div>
                </div>

                {/* Security Insights */}
                <div className="glass-card p-10 rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-3xl -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-indigo-600/10"></div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
                        <div>
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Real-time Stream</div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Security Insights</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Cross-network administrative action monitoring</p>
                        </div>
                        <button className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 active:scale-95 shadow-2xl">
                            Export Master Log
                        </button>
                    </div>

                    <div className="relative group/log">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-hover/log:opacity-100 transition duration-1000"></div>
                        <div className="relative h-80 flex items-center justify-center bg-slate-950/40 rounded-[2rem] border border-white/5 border-dashed overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                            <div className="text-center relative z-10">
                                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-white/5 shadow-2xl">
                                    <Activity className="w-10 h-10 text-slate-700 animate-pulse" />
                                </div>
                                <p className="text-white font-black uppercase tracking-[0.2em] mb-2">Audit Stream Active</p>
                                <p className="text-slate-500 text-sm font-medium italic">Monitoring system entropy and peer-to-peer data sync...</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4 relative z-10">
                        <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center space-x-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-outfit tracking-widest">Master Node: Verified</span>
                        </div>
                        <div className="bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 flex items-center space-x-3">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Network Latency: 4ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </Tab>
    );
};

export default SuperAdminDashboard;
