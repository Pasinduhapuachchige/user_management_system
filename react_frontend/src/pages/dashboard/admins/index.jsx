import React from 'react';
import { Users, UserX, Shield } from 'lucide-react';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import AdminWFullCard from '../../../components/AdminWFullCard';
import { getAdmins } from '../../../apis/admin.api';

// Skeleton loading component
const AdminSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-4">
                <div className="bg-gray-300 rounded-full h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                    <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-3 rounded w-1/2"></div>
                </div>
                <div className="bg-gray-300 h-8 w-24 rounded"></div>
            </div>
        </div>
        <div className="bg-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-4">
                <div className="bg-gray-300 rounded-full h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                    <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                    <div className="bg-gray-300 h-3 rounded w-1/3"></div>
                </div>
                <div className="bg-gray-300 h-8 w-24 rounded"></div>
            </div>
        </div>
        <div className="bg-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-4">
                <div className="bg-gray-300 rounded-full h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                    <div className="bg-gray-300 h-4 rounded w-4/5"></div>
                    <div className="bg-gray-300 h-3 rounded w-2/5"></div>
                </div>
                <div className="bg-gray-300 h-8 w-24 rounded"></div>
            </div>
        </div>
    </div>
);

// Empty state component
const EmptyAdminsState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="bg-gray-100 rounded-full p-4 mb-6">
            <UserX className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Administrators Found
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
            There are currently no administrators in the system. You may need to add administrators to manage the platform effectively.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Add Administrator
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
                Refresh
            </button>
        </div>
    </div>
);

const AdminsList = ({ currentPath }) => {
    const [admins, setAdmins] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('admins'); // 'admins' or 'employees'

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAdmins();
            setAdmins(res);
        } catch (err) {
            console.log(err);
            setError(err.message || 'Failed to fetch administrators');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAdmins();
    }, []);

    // Categorize accounts
    const systemAdmins = (Array.isArray(admins) ? admins : []).filter(
        a => a.role !== 'employee'
    );
    const employeeAccounts = (Array.isArray(admins) ? admins : []).filter(
        a => a.role === 'employee'
    );

    const activeList = activeTab === 'admins' ? systemAdmins : employeeAccounts;

    // Show loading skeleton
    if (loading) {
        return (
            <Tab>
                <TabHeader
                    title="Account Management"
                    subtitle="Manage system guardians and employee digital credentials"
                    currentPath={currentPath}
                />
                <div className="space-y-4">
                    <AdminSkeleton />
                </div>
            </Tab>
        );
    }

    // Show error state
    if (error) {
        return (
            <Tab>
                <TabHeader
                    title="Account Management"
                    subtitle="Manage system guardians and employee digital credentials"
                    currentPath={currentPath}
                />
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="bg-red-100 rounded-full p-4 mb-6">
                        <UserX className="h-12 w-12 text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Error Loading Accounts
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                        {error}
                    </p>
                    <button
                        onClick={fetchAdmins}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </Tab>
        );
    }

    return (
        <Tab>
            <TabHeader
                title="Account Management"
                subtitle="High-level orchestration of system access and employee credentials"
                currentPath={currentPath}
            />
            
            <div className="mb-8">
                <div className="flex p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl w-fit border border-slate-200/60 shadow-inner">
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center space-x-2 ${
                            activeTab === 'admins'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-slate-500 hover:bg-white/80 hover:text-indigo-600'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>System Guardians</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === 'admins' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                            {systemAdmins.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center space-x-2 ${
                            activeTab === 'employees'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                : 'text-slate-500 hover:bg-white/80 hover:text-emerald-600'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Staff Access Hub</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === 'employees' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                            {employeeAccounts.length}
                        </span>
                    </button>
                </div>
            </div>

            {activeList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 shadow-xl border-dashed">
                    <div className={`p-6 rounded-full ${activeTab === 'admins' ? 'bg-indigo-50 text-indigo-400' : 'bg-emerald-50 text-emerald-400'} mb-6`}>
                        {activeTab === 'admins' ? <Shield className="w-12 h-12" /> : <Users className="w-12 h-12" />}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                        {activeTab === 'admins' ? 'No Guardians Registered' : 'No Staff Accounts Provisioned'}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium max-w-xs text-center leading-relaxed">
                        The secure enclave is currently empty for this sector. Please synchronize or add new credentials.
                    </p>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <AdminWFullCard 
                        adminRecords={activeList} 
                        type={activeTab}
                    />
                </div>
            )}
        </Tab>
    );
};

export default AdminsList;