import React, { useState, useEffect, useRef } from 'react';
import { 
    Download, User, Calendar, Search, X, 
    FileText, Heart, Users, AlertCircle, 
    CheckCircle, Shield, Briefcase, FileBarChart, Filter
} from 'lucide-react';
import { getEmployeesApi } from '../apis/employee.api.jsx';

const DeathDonationReportWidget = () => {
    // --- STATE ---
    const [reportType, setReportType] = useState('summary'); // 'summary' or 'individual'
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const searchRef = useRef(null);

    // --- EFFECTS ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length < 2 || reportType === 'summary') {
                setSuggestions([]);
                return;
            }
            try {
                const data = await getEmployeesApi({ search: searchTerm });
                setSuggestions(data.data || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Error fetching employees:', err);
                setSuggestions([]);
            }
        };
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, reportType]);

    // --- HANDLERS ---
    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee);
        setSearchTerm(employee.name);
        setShowSuggestions(false);
        setError('');
    };

    const handleClearSelection = () => {
        setSelectedEmployee(null);
        setSearchTerm('');
        setSuggestions([]);
        setError('');
    };

    const handleDownload = async () => {
        if (reportType === 'individual' && !selectedEmployee) {
            setError('Please select an employee for the individual death donation report.');
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const yearParam = year ? year.trim() : 'ALL';
            const queryParams = new URLSearchParams();
            if (statusFilter && statusFilter !== 'ALL') {
                queryParams.append('status', statusFilter);
            }

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

            const url = reportType === 'individual' 
                ? `${baseUrl}/api/v1/reports/death-donation/individual/${selectedEmployee._id}/${yearParam}${queryString}`
                : `${baseUrl}/api/v1/reports/death-donation/summary/${yearParam}${queryString}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Death donation report generation failed server-side.');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            const filename = reportType === 'individual'
                ? `Death_Donation_Report_${selectedEmployee.name.replace(/\s+/g, '_')}_${yearParam}.pdf`
                : `Death_Donation_Master_Summary_${yearParam}.pdf`;
                
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            setSuccessMessage(`${reportType === 'individual' ? 'Individual' : 'Master Summary'} Death Donation report generated successfully.`);
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to generate report. Please verify connection and data availability.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-xl shadow-amber-100/50 border border-amber-100">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Death Donation Report Generator</h2>
                        <p className="text-amber-700 font-bold text-xs uppercase tracking-widest mt-1">Welfare & Death Benefit Analytics</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
                    <button 
                        onClick={() => { setReportType('summary'); handleClearSelection(); setError(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                            reportType === 'summary' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Users className="w-4 h-4" /> Company Summary
                    </button>
                    <button 
                        onClick={() => { setReportType('individual'); setError(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                            reportType === 'individual' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <User className="w-4 h-4" /> Individual Employee
                    </button>
                </div>
            </div>

            {/* Form & Controls Container */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-100 border border-slate-100 space-y-8">
                
                {/* Alerts */}
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3 text-green-700 text-sm font-bold animate-fadeIn">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left Column: Scope Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                            <Shield className="w-4 h-4 text-amber-600" /> 1. Report Configuration
                        </div>

                        {reportType === 'individual' ? (
                            <div className="space-y-2 relative" ref={searchRef}>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                                    Target Employee <span className="text-red-500">*</span>
                                </label>
                                
                                {selectedEmployee ? (
                                    <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center">
                                                {selectedEmployee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{selectedEmployee.name}</p>
                                                <p className="text-xs font-semibold text-amber-700">EPF: {selectedEmployee.epfNumber}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleClearSelection}
                                            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                                            placeholder="Type employee name or EPF number..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        />

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                                {suggestions.length > 0 ? (
                                                    suggestions.map((emp) => (
                                                        <div 
                                                            key={emp._id}
                                                            onClick={() => handleSelectEmployee(emp)}
                                                            className="p-3.5 hover:bg-amber-50 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-50 last:border-none"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <User className="w-4 h-4 text-amber-600" />
                                                                <span className="font-bold text-slate-800 text-sm">{emp.name}</span>
                                                            </div>
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                                                                {emp.epfNumber}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-xs font-bold text-slate-400">
                                                        No employees found matching "{searchTerm}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 text-amber-900 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                                    <Users className="w-5 h-5 text-amber-600" /> Master Company Report
                                </div>
                                <p className="text-xs text-amber-700/80 leading-relaxed">
                                    Generates a full organization statement of death benefit donations disbursed across all employees for the selected period.
                                </p>
                            </div>
                        )}

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-amber-600" /> Payment Status Filter
                            </label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            >
                                <option value="ALL">All Statuses (Paid, Pending, Cancelled)</option>
                                <option value="Paid">Paid Claims Only</option>
                                <option value="Pending">Pending Claims Only</option>
                                <option value="Cancelled">Cancelled Claims Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column: Time Horizon & Format */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                            <Calendar className="w-4 h-4 text-amber-600" /> 2. Report Year
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                                Target Year (Or type 'ALL')
                            </label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="text"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="e.g. 2026 or ALL"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                />
                                {['2026', '2025', 'ALL'].map(yr => (
                                    <button
                                        key={yr}
                                        type="button"
                                        onClick={() => setYear(yr)}
                                        className={`px-3.5 py-3 rounded-2xl text-xs font-black transition-all border ${
                                            year === yr ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {yr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Format Note */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-amber-600" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Output Format: PDF Document</p>
                                    <p className="text-[11px] text-slate-400 font-semibold">Includes SPC Header, Summary Stats & Signatures</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg uppercase">
                                Print-Ready
                            </span>
                        </div>
                    </div>
                </div>

                {/* Selected Summary Details Card */}
                {selectedEmployee && reportType === 'individual' && (
                    <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl text-white shadow-lg shadow-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100">Ready to Generate</span>
                            <h3 className="text-xl font-black">{selectedEmployee.name}</h3>
                            <p className="text-xs text-amber-100 font-semibold mt-0.5">
                                EPF: {selectedEmployee.epfNumber} | Target Period: {year}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold backdrop-blur-md">
                                {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
                            </span>
                        </div>
                    </div>
                )}

                {/* Submit Action Button */}
                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-amber-200 hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    )}
                    <span>{loading ? 'Generating PDF Report...' : 'Download Death Donation PDF Report'}</span>
                </button>
            </div>
        </div>
    );
};

export default DeathDonationReportWidget;
