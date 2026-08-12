import React, { useState, useEffect } from 'react';
import { X, Search, Heart, User, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getEmployeesApi } from '../apis/employee.api';
import { createDeathBenefitApi, updateDeathBenefitApi, getDeathBenefitConfigApi } from '../apis/deathBenefit.api';

const AddDeathBenefitModal = ({ isOpen, onClose, onSuccess, initialRecord = null }) => {
    const isEditMode = !!initialRecord;

    const [epfSearch, setEpfSearch] = useState('');
    const [searchingEmp, setSearchingEmp] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [defaultAmount, setDefaultAmount] = useState(50000);

    const [formData, setFormData] = useState({
        epfNumber: '',
        relationship: 'Spouse',
        deceasedName: '',
        amount: 50000,
        issuedDate: new Date().toISOString().split('T')[0],
        status: 'Paid',
        voucherNumber: '',
        notes: ''
    });

    const [familyOptions, setFamilyOptions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch default config amount when modal opens
    useEffect(() => {
        if (isOpen) {
            getDeathBenefitConfigApi()
                .then(res => {
                    if (res?.data?.defaultAmount) {
                        setDefaultAmount(res.data.defaultAmount);
                        if (!isEditMode) {
                            setFormData(prev => ({ ...prev, amount: res.data.defaultAmount }));
                        }
                    }
                })
                .catch(err => console.error('Failed to load death benefit config:', err));
        }
    }, [isOpen, isEditMode]);

    // Populate data if Editing or Reset if Adding
    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (initialRecord) {
                setFormData({
                    epfNumber: initialRecord.epfNumber || '',
                    relationship: initialRecord.relationship || 'Spouse',
                    deceasedName: initialRecord.deceasedName || '',
                    amount: initialRecord.amount || 50000,
                    issuedDate: initialRecord.issuedDate ? new Date(initialRecord.issuedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    status: initialRecord.status || 'Paid',
                    voucherNumber: initialRecord.voucherNumber || '',
                    notes: initialRecord.notes || ''
                });
                if (initialRecord.employee) {
                    setSelectedEmployee(initialRecord.employee);
                    extractFamilyOptions(initialRecord.employee);
                }
            } else {
                setEpfSearch('');
                setSelectedEmployee(null);
                setFamilyOptions([]);
                setFormData({
                    epfNumber: '',
                    relationship: 'Spouse',
                    deceasedName: '',
                    amount: defaultAmount,
                    issuedDate: new Date().toISOString().split('T')[0],
                    status: 'Paid',
                    voucherNumber: '',
                    notes: ''
                });
            }
        }
    }, [isOpen, initialRecord, defaultAmount]);

    // Helper to extract family members from employee record
    const extractFamilyOptions = (emp) => {
        if (!emp) return;
        const options = [];

        // Spouse
        if (emp.spouseName) {
            options.push({ label: `Spouse: ${emp.spouseName}`, relation: 'Spouse', name: emp.spouseName });
        }

        // Parents
        if (emp.parents && Array.isArray(emp.parents)) {
            emp.parents.forEach(p => {
                if (p.name) {
                    options.push({ label: `${p.relationship}: ${p.name}`, relation: p.relationship === 'Father' ? 'Father' : 'Mother', name: p.name });
                }
            });
        }

        // Spouse Parents
        if (emp.spouseParents && Array.isArray(emp.spouseParents)) {
            emp.spouseParents.forEach(sp => {
                if (sp.name) {
                    const rel = sp.relationship?.includes('Father') ? "Spouse's Father" : "Spouse's Mother";
                    options.push({ label: `${rel}: ${sp.name}`, relation: rel, name: sp.name });
                }
            });
        }

        // Children
        if (emp.children && Array.isArray(emp.children)) {
            emp.children.forEach(c => {
                if (c.name) {
                    options.push({ label: `Child: ${c.name}`, relation: 'Child', name: c.name });
                }
            });
        }

        setFamilyOptions(options);
    };

    // Handle Employee Search by EPF Number
    const handleSearchEmployee = async (searchVal) => {
        const queryEpf = searchVal || epfSearch;
        if (!queryEpf.trim()) return;

        try {
            setSearchingEmp(true);
            setError(null);
            const res = await getEmployeesApi({ epfNumber: queryEpf.trim() });
            const list = res?.data || [];

            if (list.length > 0) {
                const emp = list[0];
                setSelectedEmployee(emp);
                setFormData(prev => ({ ...prev, epfNumber: emp.epfNumber }));
                extractFamilyOptions(emp);
            } else {
                setSelectedEmployee(null);
                setFamilyOptions([]);
                setError(`No active employee found with EPF Number: ${queryEpf}`);
            }
        } catch (err) {
            console.error('Error searching employee:', err);
            setError('Failed to fetch employee details. Please try again.');
        } finally {
            setSearchingEmp(false);
        }
    };

    // Handle selection from extracted family options dropdown
    const handleFamilyOptionSelect = (e) => {
        const index = e.target.value;
        if (index === '') return;

        const opt = familyOptions[index];
        if (opt) {
            setFormData(prev => ({
                ...prev,
                relationship: opt.relation,
                deceasedName: opt.name
            }));
        }
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.epfNumber.trim()) {
            setError('EPF Number is required.');
            return;
        }

        if (!formData.deceasedName.trim()) {
            setError('Deceased person name is required.');
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setError('Please enter a valid positive benefit amount.');
            return;
        }

        try {
            setSubmitting(true);
            if (isEditMode) {
                await updateDeathBenefitApi(initialRecord._id, formData);
            } else {
                await createDeathBenefitApi(formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error saving death benefit record:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save death benefit record.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden transform transition-all animate-fadeIn">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-8 py-6 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                            <Heart className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{isEditMode ? 'Edit Dead Donation Record' : 'Issue Dead Donation'}</h2>
                            <p className="text-xs text-slate-300">Manage dead donation grants for employee family members</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* EPF Search Header (Only if creating) */}
                    {!isEditMode && (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                                Step 1: Find Employee by EPF Number
                            </label>
                            <div className="flex space-x-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter Employee EPF Number (e.g. 1001)"
                                        value={epfSearch}
                                        onChange={(e) => setEpfSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchEmployee(); } }}
                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSearchEmployee()}
                                    disabled={searchingEmp}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {searchingEmp ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Searching...</span>
                                        </>
                                    ) : (
                                        <span>Find</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Selected Employee Info Box */}
                    {selectedEmployee && (
                        <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                {selectedEmployee.name?.charAt(0) || 'E'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 text-base truncate">{selectedEmployee.name}</h4>
                                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                                    <span>EPF: <strong>{selectedEmployee.epfNumber}</strong></span>
                                    <span>•</span>
                                    <span>Dept: <strong>{selectedEmployee.department?.name || 'N/A'}</strong></span>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-full">
                                Verified Employee
                            </span>
                        </div>
                    )}

                    {/* Family Members Quick Selection (If Available) */}
                    {familyOptions.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Quick Select Recorded Family Member
                            </label>
                            <select
                                onChange={handleFamilyOptionSelect}
                                defaultValue=""
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="" disabled>-- Select from employee's registered family members --</option>
                                {familyOptions.map((opt, idx) => (
                                    <option key={idx} value={idx}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Relationship Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Beneficiary Relationship <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.relationship}
                                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Spouse">Spouse</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Spouse's Father">Spouse's Father (Father-in-law)</option>
                                <option value="Spouse's Mother">Spouse's Mother (Mother-in-law)</option>
                                <option value="Child">Child</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Deceased Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Deceased Person Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                value={formData.deceasedName}
                                onChange={(e) => setFormData(prev => ({ ...prev, deceasedName: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Benefit Amount */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Benefit Amount (LKR) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-xs">LKR</span>
                                <input
                                    type="number"
                                    placeholder="50000"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Issued Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Grant / Issued Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.issuedDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Payment Status */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Payment Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Voucher / Ref Number */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Voucher / Check / Ref No.
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. V-2026-081"
                                value={formData.voucherNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, voucherNumber: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Remarks / Notes
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Add optional notes or remarks regarding this death benefit grant..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        />
                    </div>

                    {/* Modal Footer Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center space-x-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving Record...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{isEditMode ? 'Update Record' : 'Issue Death Benefit'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDeathBenefitModal;
