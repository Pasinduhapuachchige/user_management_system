import React, { useState, useEffect } from 'react';
import {
    Heart, Plus, Search, Filter, RefreshCw, Edit3, Trash2,
    DollarSign, Calendar, FileText, CheckCircle2, Clock, XCircle,
    UserCheck, ShieldAlert
} from 'lucide-react';
import Tab from '../../../layout/Tab';
import TabHeader from '../../../components/TabHeader';
import AddDeathBenefitModal from '../../../components/AddDeathBenefitModal';
import { getDeathBenefitsApi, deleteDeathBenefitApi, getDeathBenefitConfigApi } from '../../../apis/deathBenefit.api';
import { useUserStore } from '../../../tools/user.zustand';

const DeathBenefitList = ({ currentPath }) => {
    const { user } = useUserStore();
    const isSuperAdmin = user?.role === 'superadmin';

    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [config, setConfig] = useState({ defaultAmount: 50000 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [relationshipFilter, setRelationshipFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Load Death Benefit records and Configuration
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [recordsRes, configRes] = await Promise.all([
                getDeathBenefitsApi(),
                getDeathBenefitConfigApi()
            ]);

            const list = recordsRes?.data || [];
            setRecords(list);
            setFilteredRecords(list);

            if (configRes?.data) {
                setConfig(configRes.data);
            }
        } catch (err) {
            console.error('Failed to load death benefit data:', err);
            setError('Failed to load death benefit records. Please check connection and retry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = [...records];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(rec => {
                const empName = rec.employee?.name?.toLowerCase() || '';
                const epf = rec.epfNumber?.toLowerCase() || '';
                const decName = rec.deceasedName?.toLowerCase() || '';
                const voucher = rec.voucherNumber?.toLowerCase() || '';
                return empName.includes(term) || epf.includes(term) || decName.includes(term) || voucher.includes(term);
            });
        }

        if (statusFilter) {
            result = result.filter(rec => rec.status === statusFilter);
        }

        if (relationshipFilter) {
            result = result.filter(rec => rec.relationship === relationshipFilter);
        }

        setFilteredRecords(result);
    }, [searchTerm, statusFilter, relationshipFilter, records]);

    // Handle Delete Record
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this death benefit record?')) return;

        try {
            setDeletingId(id);
            await deleteDeathBenefitApi(id);
            setRecords(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            console.error('Delete Death Benefit Error:', err);
            alert(err.response?.data?.message || 'Failed to delete record.');
        } finally {
            setDeletingId(null);
        }
    };

    // Calculate Summary Metrics
    const totalClaims = records.length;
    const totalPaidAmount = records
        .filter(r => r.status === 'Paid')
        .reduce((sum, r) => sum + (r.amount || 0), 0);
    const pendingClaims = records.filter(r => r.status === 'Pending').length;

    return (
        <Tab>
            <TabHeader
                title="Dead Donation Management"
                subtitle="Issue, track, and manage welfare dead donations for employee family members"
                currentPath={currentPath}
            />

            <div className="space-y-6">
                {/* KPI Metrics Header Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Total Claims Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Heart className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Claims</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalClaims}</h3>
                        </div>
                    </div>

                    {/* Total Paid Amount */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid Amount</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">LKR {totalPaidAmount.toLocaleString()}</h3>
                        </div>
                    </div>

                    {/* Pending Claims */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Claims</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{pendingClaims}</h3>
                        </div>
                    </div>

                    {/* Configured Default Limit */}
                    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Standard Amount</p>
                            <h3 className="text-xl font-black mt-1">LKR {(config.defaultAmount || 50000).toLocaleString()}</h3>
                        </div>
                        {isSuperAdmin && (
                            <button
                                onClick={() => window.setCurrentPage ? window.setCurrentPage('settings/death-benefit') : window.location.href = '/settings/death-benefit'}
                                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                            >
                                Edit Config
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter and Action Header */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
                            <input
                                type="text"
                                placeholder="Search by EPF Number, Employee Name, Deceased Person..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                            />
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                        </div>

                        {/* Relationship Filter */}
                        <select
                            value={relationshipFilter}
                            onChange={(e) => setRelationshipFilter(e.target.value)}
                            className="w-full lg:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Beneficiaries</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Spouse's Father">Spouse's Father</option>
                            <option value="Spouse's Mother">Spouse's Mother</option>
                            <option value="Child">Child</option>
                            <option value="Other">Other</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full lg:w-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        {/* Refresh & Issue Buttons */}
                        <div className="flex items-center space-x-3 w-full lg:w-auto">
                            <button
                                onClick={loadData}
                                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-colors"
                                title="Refresh data"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedRecord(null);
                                    setIsModalOpen(true);
                                }}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2 whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Issue Dead Donation</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Death Benefits Table List */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                            <p className="font-semibold text-sm">Loading death benefit records...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">
                            <ShieldAlert className="w-10 h-10 mx-auto mb-3" />
                            <p className="font-bold text-base">{error}</p>
                            <button
                                onClick={loadData}
                                className="mt-4 px-5 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                            <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <h4 className="font-bold text-slate-700 text-base mb-1">No Death Benefit Records Found</h4>
                            <p className="text-xs text-slate-400">Issue a new benefit record or adjust your search filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                        <th className="px-6 py-4">Employee Details</th>
                                        <th className="px-6 py-4">Deceased Beneficiary</th>
                                        <th className="px-6 py-4">Benefit Amount</th>
                                        <th className="px-6 py-4">Issued Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredRecords.map((record) => {
                                        const emp = record.employee;
                                        const statusBadge = record.status === 'Paid'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : record.status === 'Pending'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-red-50 text-red-700 border-red-200';

                                        return (
                                            <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">
                                                {/* Employee Column */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                                                            {emp?.name?.charAt(0) || 'E'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{emp?.name || 'Unknown Employee'}</p>
                                                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                                                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">EPF: {record.epfNumber}</span>
                                                                {emp?.department?.name && <span>• {emp.department.name}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Deceased Beneficiary */}
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">{record.deceasedName}</p>
                                                    <span className="inline-block mt-0.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                        {record.relationship}
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-6 py-4">
                                                    <p className="font-extrabold text-slate-900 text-base">
                                                        LKR {(record.amount || 0).toLocaleString()}
                                                    </p>
                                                    {record.voucherNumber && (
                                                        <p className="text-xs text-slate-400 font-mono">Ref: {record.voucherNumber}</p>
                                                    )}
                                                </td>

                                                {/* Issued Date */}
                                                <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                                                    {record.issuedDate ? new Date(record.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadge}`}>
                                                        {record.status === 'Paid' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                                                        {record.status === 'Pending' && <Clock className="w-3.5 h-3.5 mr-1" />}
                                                        {record.status === 'Cancelled' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                                                        {record.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRecord(record);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                            title="Edit record"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(record._id)}
                                                            disabled={deletingId === record._id}
                                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                                            title="Delete record"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Death Benefit Modal */}
            <AddDeathBenefitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
                initialRecord={selectedRecord}
            />
        </Tab>
    );
};

export default DeathBenefitList;
